<?php
// Handles all site forms: emails the request to the addresses from send-config.php.
// send-config.php lives one level above the site root, so it is not web-accessible
// and the addresses stay out of the repository (see send-config.example.php).

header('Content-Type: application/json; charset=utf-8');

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

function esc($value)
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
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

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    respond(400, ['error' => 'Некорректный запрос']);
}

$phone = field($data, 'phone');
if ($phone === '') {
    respond(400, ['error' => 'Номер телефона обязателен']);
}
$formType = field($data, 'formType');
$sourcePage = field($data, 'sourcePage');
$formTitle = field($data, 'formTitle');

$subjects = [
    'callback' => 'Заявка на обратный звонок',
    'catalog' => 'Запрос каталога',
    'calculation' => 'Запрос расчёта стоимости',
    'colors' => 'Запрос о тканях и цветах',
];
$baseSubject = isset($subjects[$formType]) ? $subjects[$formType] : 'Новая заявка с сайта';
$subject = implode(' — ', array_filter([$baseSubject, $sourcePage]));

$date = new DateTime('now', new DateTimeZone('Europe/Moscow'));
$html = '<h2>' . esc($baseSubject) . '</h2>'
    . '<p><strong>Телефон:</strong> +7 ' . esc($phone) . '</p>'
    . ($formTitle !== '' ? '<p><strong>Запрос:</strong> ' . esc($formTitle) . '</p>' : '')
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
