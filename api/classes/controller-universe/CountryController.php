<?php

class Country extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create('UNIVERSE');
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function listAll() {
        $this->response->countries = $this->db->query("SELECT * FROM countries")['data'];
    }

}
