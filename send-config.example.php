<?php
// Copy to the hosting as send-config.php one level ABOVE the site root
// (next to public_html, not inside it). Never commit the real file.
return [
    // Where form requests go; several addresses separated by commas
    'to' => 'manager@example.com',
    // Sender shown in the email
    'from' => 'Modno Home <info@modnohome.ru>',

    // Catalog bots (catalog-bot.php); leave a token empty if there is no such bot.
    // Telegram: the token from @BotFather
    'telegram_bot_token' => '',
    // MAX: the token from business.max.ru → Чат-боты → bot → Настройки
    'max_bot_token' => '',
    // The PDF the bots send; it lies here too, outside the site, so it is not public
    'catalog_file' => __DIR__ . '/catalog.pdf',
    // File name the person sees in the messenger
    'catalog_name' => 'Каталог диванов MODNO HOME.pdf',
];
