<?php

class User extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUID = null) {
        $database = Database::create('DEFAULT');
        parent::__construct($database, $data, $componentName, $methodName, $currentUID);
    }

    public function writeLanguage() {
        $this->response = $this->db->query("UPDATE " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " SET language = :LANGUAGE WHERE UID = :UID",
            ['LANGUAGE' => $this->data->language, 'UID' => $this->currentUID]);
    }

}
