<?php

class Logfile extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null) {
        $database = Database::create(FRAMEWORK['MODULES']['LOG']['DB']);
        parent::__construct($database, $data, $componentName, $methodName);
    }

    public function write() {
        Log::write(
            $this->data->uid,
            $this->data->type,
            $this->data->message,
            $this->data->component,
            $this->data->method,
            'Logfile',
            'write()'
        );
    }

    public function getEntry() {
        $this->response->log = $this->db->query("SELECT " . FRAMEWORK['MODULES']['LOG']['TABLE_NAME'] . ".*, " . FRAMEWORK['MODULES']['AUTH']['TABLE_NAME'] . "." . FRAMEWORK['MODULES']['AUTH']['FIELD_LOGIN']
            . " FROM " . FRAMEWORK['MODULES']['LOG']['TABLE_NAME']
            . " LEFT JOIN " . FRAMEWORK['MODULES']['AUTH']['TABLE_NAME'] . " ON " . FRAMEWORK['MODULES']['AUTH']['TABLE_NAME'] . ".UID = " . FRAMEWORK['MODULES']['LOG']['TABLE_NAME'] . ".UID"
            . " WHERE ULID = ?", [$this->data->ULID])['data'][0];
    }

}

