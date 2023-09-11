<?php

class Storage extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create(FRAMEWORK['MODULES']['STORAGE']['DB']);
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function setData() {
        $data = $this->db->query("SELECT s_value FROM ".FRAMEWORK['MODULES']['STORAGE']['TABLE_NAME']." WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
            'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key
        ]);

        if ($data['count'] === 0 ) {
            $this->response->userRows = $this->db->query("INSERT INTO ".FRAMEWORK['MODULES']['STORAGE']['TABLE_NAME']." (UID, s_type, s_key, s_value) VALUES (:UID, :TYPE, :KEY, :VALUE)", [
                'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key, 'VALUE' => $this->data->value
            ]);
        } else {
            $this->response->userRows = $this->db->query("UPDATE ".FRAMEWORK['MODULES']['STORAGE']['TABLE_NAME']." SET s_value = :VALUE WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
                'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key, 'VALUE' => $this->data->value
            ]);
        }
    }

    public function getData() {
        $this->response->row = $this->db->query("SELECT s_value FROM ".FRAMEWORK['MODULES']['STORAGE']['TABLE_NAME']." WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
            'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key
        ]);
    }

    public function getAuto() {

        $result = $this->db->query("SELECT s_value FROM ".FRAMEWORK['MODULES']['STORAGE']['TABLE_NAME']." WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
            'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key
        ]);

        if ($result['count'] == 0 ) {
            $result = $this->db->query("INSERT INTO ".FRAMEWORK['MODULES']['STORAGE']['TABLE_NAME']." (UID, s_type, s_key, s_value) VALUES (:UID, :TYPE, :KEY, :VALUE)", [
                'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key, 'VALUE' => $this->data->defaultValue
            ]);
            $this->response->key = $this->data->defaultValue;
        } else {
            $result = $this->db->query("SELECT s_value FROM ".FRAMEWORK['MODULES']['STORAGE']['TABLE_NAME']." WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
                'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key
            ]);

            if ($result['count'] == 1 ) {
                $this->response->key = $result['data'][0]['s_value'];
            } else {
                $this->response->key = 'ERROR';
            }
        }
    }
}
