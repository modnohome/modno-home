<?php
// Telegram and MAX bots that send the catalog PDF. The catalog form opens a bot,
// the person presses "Start" and the bot replies with the file.
//
// This file is the webhook of both bots. The bot tokens and the PDF path come from
// send-config.php one level above the site root (see send-config.example.php), the
// PDF itself lives there too, so it is not downloadable from the site.
// After setting the tokens open https://modnohome.ru/catalog-bot.php?setup once:
// it connects both bots to this file. Running it again is harmless.

const SITE_URL = 'https://modnohome.ru';
const TELEGRAM_API = 'https://api.telegram.org/bot';
const MAX_API = 'https://platform-api2.max.ru';
// platform-api2.max.ru is signed by the Russian Trusted Root CA,
// which the usual CA bundles do not have
const MAX_CA_FILE = __DIR__ . '/russian-trusted-root-ca.pem';
const CAPTION = 'Здравствуйте! Высылаем каталог диванов MODNO HOME с ценами и размерами.';

header('Content-Type: text/plain; charset=utf-8');

$configFile = dirname(__DIR__) . '/send-config.php';
$config = is_file($configFile) ? require $configFile : [];
$telegramToken = isset($config['telegram_bot_token']) ? (string) $config['telegram_bot_token'] : '';
$maxToken = isset($config['max_bot_token']) ? (string) $config['max_bot_token'] : '';
$catalogFile = isset($config['catalog_file']) ? $config['catalog_file'] : dirname(__DIR__) . '/catalog.pdf';
$catalogName = isset($config['catalog_name']) ? $config['catalog_name'] : 'Каталог диванов MODNO HOME.pdf';

/** POST to an API; returns [HTTP status, decoded JSON body, raw body or curl error]. */
function post($url, $body, $headers = [], $caFile = null)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body, // an array is sent as multipart/form-data
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60,
    ]);
    if ($caFile !== null) {
        curl_setopt($ch, CURLOPT_CAINFO, $caFile);
    }
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    return [$status, json_decode((string) $raw, true), $error !== '' ? $error : (string) $raw];
}

function maxApi($token, $path, $json)
{
    return post(
        MAX_API . $path,
        json_encode($json, JSON_UNESCAPED_UNICODE),
        ['Authorization: ' . $token, 'Content-Type: application/json'],
        MAX_CA_FILE
    );
}

/** Webhook secret: derived from the bot token, so there is nothing more to configure. */
function webhookSecret($token)
{
    return hash_hmac('sha256', 'catalog-bot-webhook', $token);
}

function pdf($file, $name)
{
    return new CURLFile($file, 'application/pdf', $name);
}

function sendTelegramCatalog($token, $chatId, $file, $name)
{
    list($status, $result, $raw) = post(TELEGRAM_API . $token . '/sendDocument', [
        'chat_id' => $chatId,
        'caption' => CAPTION,
        'document' => pdf($file, $name),
    ]);
    if (empty($result['ok'])) {
        error_log("catalog-bot.php: Telegram sendDocument failed ($status): $raw");
    }
}

function sendMaxCatalog($token, $chatId, $file, $name)
{
    // MAX attaches a file in three steps: get an upload URL, upload, send the token
    list($status, $endpoint, $raw) = maxApi($token, '/uploads?type=file', new stdClass());
    if (empty($endpoint['url'])) {
        error_log("catalog-bot.php: MAX upload URL failed ($status): $raw");
        return;
    }
    list($status, $uploaded, $raw) = post($endpoint['url'], ['data' => pdf($file, $name)]);
    if (empty($uploaded['token'])) {
        error_log("catalog-bot.php: MAX upload failed ($status): $raw");
        return;
    }
    $message = [
        'text' => CAPTION,
        'attachments' => [['type' => 'file', 'payload' => ['token' => $uploaded['token']]]],
    ];
    // Until MAX has processed the file the message is refused with 400: retry
    for ($try = 0; $try < 10; $try++) {
        list($status, $sent, $raw) = maxApi($token, '/messages?chat_id=' . rawurlencode($chatId), $message);
        if ($status === 200 && isset($sent['message'])) {
            return;
        }
        if ($status !== 400) {
            break;
        }
        sleep(1);
    }
    error_log("catalog-bot.php: MAX send failed ($status): $raw");
}

/** Answer the messenger right away; the upload takes a few seconds. */
function acknowledge()
{
    echo 'ok';
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    }
}

function header_value($name)
{
    return isset($_SERVER[$name]) ? (string) $_SERVER[$name] : '';
}

// One-time setup: point both bots at this file
if (isset($_GET['setup'])) {
    echo is_file($catalogFile) ? "Catalog: OK\n" : "Catalog: PDF not found, see catalog_file in send-config.php\n";

    if ($telegramToken === '') {
        echo "Telegram: no telegram_bot_token in send-config.php\n";
    } else {
        list($status, $result, $raw) = post(TELEGRAM_API . $telegramToken . '/setWebhook', [
            'url' => SITE_URL . '/catalog-bot.php?bot=telegram',
            'secret_token' => webhookSecret($telegramToken),
            'allowed_updates' => json_encode(['message']),
        ]);
        echo 'Telegram: ' . (!empty($result['ok']) ? 'OK' : "error ($status) $raw") . "\n";
    }

    if ($maxToken === '') {
        echo "MAX: no max_bot_token in send-config.php\n";
    } else {
        list($status, $result, $raw) = maxApi($maxToken, '/subscriptions', [
            'url' => SITE_URL . '/catalog-bot.php?bot=max',
            'secret' => webhookSecret($maxToken),
            'update_types' => ['bot_started', 'message_created'],
        ]);
        echo 'MAX: ' . (!empty($result['success']) ? 'OK' : "error ($status) $raw") . "\n";
    }
    exit;
}

$bot = isset($_GET['bot']) ? $_GET['bot'] : '';
$update = json_decode(file_get_contents('php://input'), true);
if (!is_array($update)) {
    $update = [];
}

if ($bot === 'telegram' && $telegramToken !== '') {
    if (!hash_equals(webhookSecret($telegramToken), header_value('HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'))) {
        http_response_code(403);
        exit;
    }
    $text = isset($update['message']['text']) ? (string) $update['message']['text'] : '';
    $chatId = isset($update['message']['chat']['id']) ? $update['message']['chat']['id'] : null;
    acknowledge();
    // "/start" comes with the "Start" button, also from a link with ?start=...
    if ($chatId !== null && strpos($text, '/start') === 0) {
        sendTelegramCatalog($telegramToken, $chatId, $catalogFile, $catalogName);
    }
    exit;
}

if ($bot === 'max' && $maxToken !== '') {
    if (!hash_equals(webhookSecret($maxToken), header_value('HTTP_X_MAX_BOT_API_SECRET'))) {
        http_response_code(403);
        exit;
    }
    $type = isset($update['update_type']) ? $update['update_type'] : '';
    $chatId = null;
    if ($type === 'bot_started' && isset($update['chat_id'])) {
        // the "Start" button
        $chatId = $update['chat_id'];
    } elseif (
        $type === 'message_created'
        && isset($update['message']['body']['text'], $update['message']['recipient']['chat_id'])
        && strpos((string) $update['message']['body']['text'], '/start') === 0
    ) {
        $chatId = $update['message']['recipient']['chat_id'];
    }
    acknowledge();
    if ($chatId !== null) {
        sendMaxCatalog($maxToken, $chatId, $catalogFile, $catalogName);
    }
    exit;
}

http_response_code(404);
