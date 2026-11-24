<?php
// Handles all site forms: emails the request to the addresses from send-config.php.
// send-config.php lives one level above the site root, so it is not web-accessible
// and the addresses stay out of the repository (see send-config.example.php).
//
// Callback bombers post strangers' numbers into site forms so that managers call
// them. Guards against that:
// - a form first takes a one-time token (GET send.php) and posts it back, so a bot
//   that doesn't run the page's JS, or replays a recorded request, is refused;
// - an IP may post IP_LIMIT requests an hour;
// - a number gets PHONE_LIMIT emails a day, further requests are accepted silently.
// The guard keeps its secret, counters and used tokens in send-guard.json next to
// send-config.php.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const TOKEN_TTL = 600;
const IP_LIMIT = 10;
const IP_WINDOW = 3600;
const PHONE_LIMIT = 2;
const PHONE_WINDOW = 86400;
const MAX_BODY = 2048;

function respond($status, $body)
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function field($data, $key)
{
    if (!isset($data[$key]) || !is_scalar($data[$key])) {
        return '';
    }
    // Single line only: the values go into the mail subject header
    return trim(preg_replace('/[\r\n]+/', ' ', (string) $data[$key]));
}

/** Valid UTF-8 of at most $max characters (no mbstring needed). */
function fits($value, $max)
{
    return preg_match('/^.{0,' . $max . '}$/su', $value) === 1;
}

function esc($value)
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/**
 * Runs $check(&$state, $now) on the guard state under an exclusive lock, saves the
 * state and returns what $check returned. Without the storage no request passes.
 */
function guard($check)
{
    $handle = @fopen(dirname(__DIR__) . '/send-guard.json', 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        error_log('send.php: send-guard.json is not writable');
        respond(500, ['error' => 'Сервер не настроен для приёма заявок']);
    }
    $state = json_decode(stream_get_contents($handle), true);
    if (!is_array($state) || empty($state['secret'])) {
        $state = ['secret' => bin2hex(random_bytes(32))];
    }
    $state += ['hits' => [], 'used' => []];
    $now = time();
    // Drop what no limit looks at any more
    foreach ($state['hits'] as $key => $times) {
        $times = array_values(array_filter($times, function ($time) use ($now) {
            return $time > $now - PHONE_WINDOW;
        }));
        if ($times) {
            $state['hits'][$key] = $times;
        } else {
            unset($state['hits'][$key]);
        }
    }
    $state['used'] = array_filter($state['used'], function ($expires) use ($now) {
        return $expires > $now;
    });

    $result = $check($state, $now);

    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode($state));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $result;
}

function issueToken($secret, $now)
{
    $payload = $now . '.' . bin2hex(random_bytes(8));
    return $payload . '.' . hash_hmac('sha256', $payload, $secret);
}

function tokenValid($token, $secret, $now)
{
    $parts = explode('.', $token);
    if (count($parts) !== 3 || !ctype_digit($parts[0])) {
        return false;
    }
    $age = $now - (int) $parts[0];
    return $age >= 0 && $age <= TOKEN_TTL
        && hash_equals(hash_hmac('sha256', $parts[0] . '.' . $parts[1], $secret), $parts[2]);
}

/** Requests from $key (an IP or a number) within the last $window seconds. */
function hitsSince($state, $key, $window, $now)
{
    $times = isset($state['hits'][$key]) ? $state['hits'][$key] : [];
    return count(array_filter($times, function ($time) use ($now, $window) {
        return $time > $now - $window;
    }));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(200, ['token' => guard(function (&$state, $now) {
        return issueToken($state['secret'], $now);
    })]);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed']);
}

$configFile = dirname(__DIR__) . '/send-config.php';
if (!is_file($configFile)) {
    error_log('send.php: send-config.php not found');
    respond(500, ['error' => 'Сервер не настроен для отправки писем']);
}
$config = require $configFile;

$body = file_get_contents('php://input', false, null, 0, MAX_BODY + 1);
if (strlen($body) > MAX_BODY) {
    respond(413, ['error' => 'Слишком большой запрос']);
}
$data = json_decode($body, true);
if (!is_array($data)) {
    respond(400, ['error' => 'Некорректный запрос']);
}

// The form takes Russian mobile numbers: 10 digits after +7, the first one 9
$digits = preg_replace('/\D/', '', field($data, 'phone'));
if (!preg_match('/^9\d{9}$/', $digits)) {
    respond(400, ['error' => 'Некорректный номер телефона']);
}
$subjects = [
    'callback' => 'Заявка на обратный звонок',
    'catalog' => 'Запрос каталога',
    'calculation' => 'Запрос расчёта стоимости',
    'colors' => 'Запрос о тканях и цветах',
];
$formType = field($data, 'formType');
// Catalog forms: the messenger whose bot the person was sent to for the PDF
$messengers = ['max' => 'MAX', 'telegram' => 'Telegram'];
$messenger = field($data, 'messenger');
$sourcePage = field($data, 'sourcePage');
$formTitle = field($data, 'formTitle');
if (!isset($subjects[$formType])
    || ($messenger !== '' && !isset($messengers[$messenger]))
    || !fits($sourcePage, 100)
    || !fits($formTitle, 200)) {
    respond(400, ['error' => 'Некорректный запрос']);
}

$token = field($data, 'token');
$verdict = guard(function (&$state, $now) use ($token, $digits) {
    $ip = 'ip:' . hash_hmac('sha256', $_SERVER['REMOTE_ADDR'], $state['secret']);
    if (hitsSince($state, $ip, IP_WINDOW, $now) >= IP_LIMIT) {
        return 'busy';
    }
    $state['hits'][$ip][] = $now;
    if (!tokenValid($token, $state['secret'], $now) || isset($state['used'][$token])) {
        return 'token';
    }
    $state['used'][$token] = $now + TOKEN_TTL;
    $phone = 'phone:' . hash_hmac('sha256', $digits, $state['secret']);
    if (hitsSince($state, $phone, PHONE_WINDOW, $now) >= PHONE_LIMIT) {
        return 'repeat';
    }
    $state['hits'][$phone][] = $now;
    return 'send';
});
if ($verdict === 'busy') {
    respond(429, ['error' => 'Слишком много заявок, попробуйте позже']);
}
if ($verdict === 'token') {
    respond(403, ['error' => 'Обновите страницу и отправьте заявку ещё раз']);
}
if ($verdict === 'repeat') {
    // The managers already have this number today; the person sees the usual success
    respond(200, ['success' => true]);
}

$baseSubject = $subjects[$formType];
$subject = implode(' — ', array_filter([$baseSubject, $sourcePage]));
$phone = sprintf('+7 (%s) %s-%s-%s', substr($digits, 0, 3), substr($digits, 3, 3), substr($digits, 6, 2), substr($digits, 8, 2));

$date = new DateTime('now', new DateTimeZone('Europe/Moscow'));
$html = '<h2>' . esc($baseSubject) . '</h2>'
    . '<p><strong>Телефон:</strong> ' . esc($phone) . '</p>'
    . ($formTitle !== '' ? '<p><strong>Запрос:</strong> ' . esc($formTitle) . '</p>' : '')
    . ($messenger !== '' ? '<p><strong>Каталог прислать в:</strong> ' . esc($messengers[$messenger]) . ' (бот)</p>' : '')
    . ($sourcePage !== '' ? '<p><strong>Страница:</strong> ' . esc($sourcePage) . '</p>' : '')
    . '<p><strong>Дата:</strong> ' . $date->format('d.m.Y, H:i') . '</p>';

$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'From: ' . $config['from'],
]);

$sent = mail(
    $config['to'],
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    $html,
    $headers
);

if (!$sent) {
    error_log('send.php: mail() failed');
    respond(500, ['error' => 'Не удалось отправить заявку']);
}

respond(200, ['success' => true]);
