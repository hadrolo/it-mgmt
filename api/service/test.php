<?php
#echo "1";
#exit;
require_once "../config-universe.inc.php";

echo '<pre>';
print_r($_SERVER);
echo '</pre>';
exit;


#echo DATA_CONFIG['global']['path_mime_pics'] . 'pdf.png';

echo 'data:image/png;base64,' . base64_encode(file_get_contents(DATA_CONFIG['global']['path_mime_pics'] . 'pdf.png'));

exit;

require_once "Database.php";
$environment='universe';
$database = new Database(DB[$environment]['HOST'], DB[$environment]['USER'], DB[$environment]['PASS'], DB[$environment]['DB_NAME'], DB[$environment]['PORT'] ?? 3306);
print_r($database);
exit;

phpinfo();
exit;
?>
