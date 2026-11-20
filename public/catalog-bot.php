<?php
// Telegram and MAX bots that send the catalog PDF. The catalog form opens a bot,
// the person presses "Start" and the bot replies with the file.
//
// The bots also connect people with a manager: whatever a person writes to a bot
// goes to the manager's chat with that bot, under a line with the person's name, and
// the manager's reply to that line goes back to the person. The manager joins once
// by sending "/manager <code>" to each bot (the code is managerCode() of the bot
// token); the manager chats are kept in catalog-bot-managers.json next to
// send-config.php.
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
const CAPTION_ASK = 'Если появятся вопросы, напишите их здесь: менеджер ответит.';
const MANAGER_JOINED = 'Готово! Сюда будут приходить сообщения клиентов из этого бота. Чтобы ответить клиенту, ответьте на сообщение с его именем (свайп влево или «Ответить»): бот передаст ответ.';
const MANAGER_WRONG_CODE = 'Неверный код.';
const MANAGER_SAVE_FAILED = 'Не удалось сохранить, сообщите разработчику сайта.';
const MANAGER_HINT = 'Чтобы ответить клиенту, ответьте на сообщение с его именем (свайп влево или «Ответить»).';
const REPLY_FAILED = 'Не удалось доставить ответ: клиент мог удалить чат с ботом.';
// Longer texts go to the manager as a copy under the name line, not inside it:
// the name line plus the text must fit the messengers' 4000 character limit
const INLINE_TEXT_BYTES = 3500;

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

/** A string field of an update, '' when missing. */
function value($array, $key)
{
    return is_array($array) && isset($array[$key]) && is_scalar($array[$key]) ? (string) $array[$key] : '';
}

/** Calls a Telegram method with JSON; returns its result, or null on failure. */
function telegramApi($token, $method, $params)
{
    list($status, $result, $raw) = post(
        TELEGRAM_API . $token . '/' . $method,
        json_encode($params, JSON_UNESCAPED_UNICODE),
        ['Content-Type: application/json']
    );
    if (empty($result['ok'])) {
        error_log("catalog-bot.php: Telegram $method failed ($status): $raw");
        return null;
    }
    return $result['result'];
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

/** Sends a MAX message; returns whether it went through. */
function maxSend($token, $chatId, $message)
{
    list($status, $sent, $raw) = maxApi($token, '/messages?chat_id=' . rawurlencode($chatId), $message);
    if ($status === 200 && isset($sent['message'])) {
        return true;
    }
    error_log("catalog-bot.php: MAX send failed ($status): $raw");
    return false;
}

/** Webhook secret: derived from the bot token, so there is nothing more to configure. */
function webhookSecret($token)
{
    return hash_hmac('sha256', 'catalog-bot-webhook', $token);
}

/** The code a manager sends to a bot as "/manager <code>": derived from the bot token. */
function managerCode($token)
{
    return substr(hash_hmac('sha256', 'catalog-bot-manager', $token), 0, 10);
}

function managersFile()
{
    return dirname(__DIR__) . '/catalog-bot-managers.json';
}

/** The manager's chat with each bot: ['telegram' => chat id, 'max' => chat id]. */
function managers()
{
    $file = managersFile();
    $data = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
    return is_array($data) ? $data : [];
}

function managerChat($bot)
{
    return value(managers(), $bot);
}

/** The answer to "/manager <code>"; a right code makes this chat the manager's. */
function joinManager($bot, $token, $chatId, $text)
{
    $words = preg_split('/\s+/', trim($text));
    $code = isset($words[1]) ? $words[1] : '';
    if (!hash_equals(managerCode($token), $code)) {
        return MANAGER_WRONG_CODE;
    }
    $data = managers();
    $data[$bot] = $chatId;
    return file_put_contents(managersFile(), json_encode($data), LOCK_EX) !== false
        ? MANAGER_JOINED
        : MANAGER_SAVE_FAILED;
}

/** The line above a person's message to the manager; it ends with their chat id. */
function clientHeader($firstName, $lastName, $username, $chatId)
{
    $name = trim(str_replace(["\r", "\n"], ' ', $firstName . ' ' . $lastName));
    if ($name === '') {
        $name = 'Клиент';
    }
    if ($username !== '') {
        $name .= ' (@' . $username . ')';
    }
    return '💬 ' . $name . ' · #' . $chatId;
}

/** The person's chat id from the message the manager replied to, or null. */
function clientFromHeader($text)
{
    $firstLine = strtok((string) $text, "\n");
    return $firstLine !== false && preg_match('/ · #(-?\d+)$/u', $firstLine, $m) ? $m[1] : null;
}

/** The catalog caption invites questions only when a manager will read them. */
function catalogCaption($bot)
{
    return CAPTION . (managerChat($bot) !== '' ? "\n" . CAPTION_ASK : '');
}

function pdf($file, $name)
{
    return new CURLFile($file, 'application/pdf', $name);
}

function sendTelegramCatalog($token, $chatId, $file, $name)
{
    list($status, $result, $raw) = post(TELEGRAM_API . $token . '/sendDocument', [
        'chat_id' => $chatId,
        'caption' => catalogCaption('telegram'),
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
        'text' => catalogCaption('max'),
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

/** A message in a private chat with the Telegram bot. */
function onTelegramMessage($token, $message, $catalogFile, $catalogName)
{
    $chatId = value($message['chat'], 'id');
    $text = value($message, 'text');
    $say = function ($chat, $text) use ($token) {
        return telegramApi($token, 'sendMessage', ['chat_id' => $chat, 'text' => $text]);
    };

    // "/start" comes with the "Start" button, also from a link with ?start=...
    if (strpos($text, '/start') === 0) {
        sendTelegramCatalog($token, $chatId, $catalogFile, $catalogName);
        return;
    }
    if (strpos($text, '/manager') === 0) {
        $say($chatId, joinManager('telegram', $token, $chatId, $text));
        return;
    }
    $manager = managerChat('telegram');
    if ($manager === '') {
        return;
    }

    if ($chatId === $manager) {
        $repliedTo = isset($message['reply_to_message']) ? value($message['reply_to_message'], 'text') : '';
        $client = clientFromHeader($repliedTo);
        if ($client === null) {
            $say($manager, MANAGER_HINT);
            return;
        }
        // A copy carries any reply (text, photo, file) without the "forwarded" mark
        $copy = ['chat_id' => $client, 'from_chat_id' => $manager, 'message_id' => $message['message_id']];
        if (telegramApi($token, 'copyMessage', $copy) === null) {
            $say($manager, REPLY_FAILED);
        }
        return;
    }

    // A person wrote: pass it to the manager under a line with their name
    $from = isset($message['from']) ? $message['from'] : [];
    $header = clientHeader(value($from, 'first_name'), value($from, 'last_name'), value($from, 'username'), $chatId);
    $inline = isset($message['text']) && strlen($text) <= INLINE_TEXT_BYTES;
    $sent = $say($manager, $inline ? $header . "\n\n" . $text : $header);
    if (!$inline && is_array($sent)) {
        // a photo, file, voice or long text: its copy goes as a reply to the name line
        telegramApi($token, 'copyMessage', [
            'chat_id' => $manager,
            'from_chat_id' => $chatId,
            'message_id' => $message['message_id'],
            'reply_parameters' => ['message_id' => $sent['message_id']],
        ]);
    }
}

/** A message in a dialog with the MAX bot. */
function onMaxMessage($token, $message, $catalogFile, $catalogName)
{
    $chatId = value($message['recipient'], 'chat_id');
    $body = isset($message['body']) && is_array($message['body']) ? $message['body'] : [];
    $text = value($body, 'text');
    $say = function ($chat, $text) use ($token) {
        return maxSend($token, $chat, ['text' => $text]);
    };
    // MAX bots cannot re-send someone's attachments, so those go as a forward
    $forward = ['link' => ['type' => 'forward', 'mid' => value($body, 'mid')]];

    if (strpos($text, '/start') === 0) {
        sendMaxCatalog($token, $chatId, $catalogFile, $catalogName);
        return;
    }
    if (strpos($text, '/manager') === 0) {
        $say($chatId, joinManager('max', $token, $chatId, $text));
        return;
    }
    $manager = managerChat('max');
    if ($manager === '') {
        return;
    }

    if ($chatId === $manager) {
        $link = isset($message['link']) && is_array($message['link']) ? $message['link'] : [];
        $repliedTo = value($link, 'type') === 'reply' && isset($link['message']) ? value($link['message'], 'text') : '';
        $client = clientFromHeader($repliedTo);
        if ($client === null) {
            $say($manager, MANAGER_HINT);
            return;
        }
        $delivered = $text === '' || $say($client, $text);
        if (!empty($body['attachments'])) {
            $delivered = maxSend($token, $client, $forward) && $delivered;
        }
        if (!$delivered) {
            $say($manager, REPLY_FAILED);
        }
        return;
    }

    // A person wrote: pass it to the manager under a line with their name
    $sender = isset($message['sender']) ? $message['sender'] : [];
    $header = clientHeader(value($sender, 'first_name'), value($sender, 'last_name'), value($sender, 'username'), $chatId);
    $inline = $text !== '' && empty($body['attachments']) && !isset($message['link'])
        && strlen($text) <= INLINE_TEXT_BYTES;
    if ($say($manager, $inline ? $header . "\n\n" . $text : $header) && !$inline) {
        // attachments, a forwarded message or a long text: forward the whole message
        maxSend($token, $manager, $forward);
    }
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

    $managers = managers();
    echo 'Managers: telegram ' . (isset($managers['telegram']) ? 'joined' : 'not joined')
        . ', max ' . (isset($managers['max']) ? 'joined' : 'not joined')
        . (is_writable(dirname(managersFile())) ? '' : ', storage NOT writable') . "\n";
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
    acknowledge();
    $message = isset($update['message']) && is_array($update['message']) ? $update['message'] : [];
    $private = isset($message['chat']) && value($message['chat'], 'type') === 'private';
    if ($private && value($message['chat'], 'id') !== '' && empty($message['from']['is_bot'])) {
        onTelegramMessage($telegramToken, $message, $catalogFile, $catalogName);
    }
    exit;
}

if ($bot === 'max' && $maxToken !== '') {
    if (!hash_equals(webhookSecret($maxToken), header_value('HTTP_X_MAX_BOT_API_SECRET'))) {
        http_response_code(403);
        exit;
    }
    acknowledge();
    $type = value($update, 'update_type');
    if ($type === 'bot_started' && value($update, 'chat_id') !== '') {
        // the "Start" button
        sendMaxCatalog($maxToken, value($update, 'chat_id'), $catalogFile, $catalogName);
    } elseif ($type === 'message_created' && isset($update['message']) && is_array($update['message'])) {
        $message = $update['message'];
        $dialog = isset($message['recipient']) && value($message['recipient'], 'chat_type') === 'dialog'
            && value($message['recipient'], 'chat_id') !== '';
        if ($dialog && empty($message['sender']['is_bot'])) {
            onMaxMessage($maxToken, $message, $catalogFile, $catalogName);
        }
    }
    exit;
}

http_response_code(404);
