<?php

class Rates extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create('UNIVERSE');
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function getLatest() {
        $this->response->rates = $this->db->query("SELECT * FROM rates ORDER BY date DESC LIMIT 1")['data'][0];
    }
}
