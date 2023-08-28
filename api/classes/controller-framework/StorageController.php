<?php

class Storage extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create('APP');
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function setData() {
        $data = $this->db->query("SELECT s_value FROM storage WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
            'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key
        ]);

        if ($data['count'] === 0 ) {
            $this->response->userRows = $this->db->query("INSERT INTO storage (UID, s_type, s_key, s_value) VALUES (:UID, :TYPE, :KEY, :VALUE)", [
                'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key, 'VALUE' => $this->data->value
            ]);
        } else {
            $this->response->userRows = $this->db->query("UPDATE storage SET s_value = :VALUE WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
                'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key, 'VALUE' => $this->data->value
            ]);
        }
    }

    public function getData() {
        $this->response->row = $this->db->query("SELECT s_value FROM storage WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
            'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key
        ]);
    }

    public function getAuto() {

        $result = $this->db->query("SELECT s_value FROM storage WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
            'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key
        ]);

        if ($result['count'] == 0 ) {
            $result = $this->db->query("INSERT INTO storage (UID, s_type, s_key, s_value) VALUES (:UID, :TYPE, :KEY, :VALUE)", [
                'UID' => $this->currentUser->uid, 'TYPE' => $this->data->type, 'KEY' => $this->data->key, 'VALUE' => $this->data->defaultValue
            ]);
            $this->response->key = $this->data->defaultValue;
        } else {
            $result = $this->db->query("SELECT s_value FROM storage WHERE UID = :UID AND s_type = :TYPE AND s_key = :KEY", [
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
