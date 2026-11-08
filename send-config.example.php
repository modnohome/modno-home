<?php
// Copy to the hosting as send-config.php one level ABOVE the site root
// (next to public_html, not inside it). Never commit the real file.
return [
    // Where form requests go; several addresses separated by commas
    'to' => 'manager@example.com',
    // Sender shown in the email
    'from' => 'Modno Home <info@modnohome.ru>',
];
