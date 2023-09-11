<?php

class History extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create(FRAMEWORK['MODULES']['HISTORY']['DB']);
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function getData() {
        $count = 0;
        $userinfo = '';
        foreach (FRAMEWORK['MODULES']['HISTORY']['USERNAME'] AS $field) {
            $count = $count + 1;
            $userinfo .= ", u." . $field . " AS userinfo" . $count;
        }

        if (isset($this->data->dbname) ) {
            debug('dbname set to: ' . $this->data->dbname, DEBUGTYPE_SPECIAL);
            $this->response->history = $this->db->query("SELECT h.*" . $userinfo
                . " FROM " . $this->data->dbname . "." . FRAMEWORK['MODULES']['HISTORY']['TABLE_NAME'] . " AS h"
                . " LEFT JOIN universe." . FRAMEWORK['MODULES']['AUTH']['TABLE_NAME'] . " AS u ON u.UID = h.UID"
                . " WHERE FK_ID = :FK_ID AND FK_name = :FK_NAME AND FK_table = :FK_TABLE"
                . " ORDER BY created DESC", ['FK_ID' => $this->data->FK_ID, 'FK_NAME' => $this->data->FK_name, 'FK_TABLE' => $this->data->FK_table]);
        } else {
            debug('dbname not set', DEBUGTYPE_SPECIAL);
            $this->response->history = $this->db->query("SELECT h.*" . $userinfo
                . " FROM " . DB[FRAMEWORK['HISTORY']['DB']]['DB_NAME'] . "." . FRAMEWORK['MODULES']['HISTORY']['TABLE_NAME'] . " AS h"
                . " LEFT JOIN " . FRAMEWORK['MODULES']['AUTH']['DB'] . "." . FRAMEWORK['MODULES']['AUTH']['TABLE_NAME'] . " AS u ON u.UID = h.UID"
                . " WHERE FK_ID = :FK_ID AND FK_name = :FK_NAME AND FK_table = :FK_TABLE"
                . " ORDER BY created DESC", ['FK_ID' => $this->data->FK_ID, 'FK_NAME' => $this->data->FK_name, 'FK_TABLE' => $this->data->FK_table]);
        }


    }
}
