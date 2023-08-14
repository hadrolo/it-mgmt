<?php
require_once "../config-universe.inc.php";
require_once "DatabaseServices.php";

/* move files to folders */


set_time_limit(3600);

$db = new DatabaseServices(DB['default']['HOST'], DB['default']['USER'], DB['default']['PASS'], DB['APP']['DB_NAME']);
$existing_count = $this->db->query("select count(*) as sum from files where doctype = :DOCTYPE", ['DOCTYPE' => $this->data->doctype])['data'][0]['sum'];

echo $existing_count;
