<?php

class LookupForm extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create('DEFAULT');
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function ListAll() {
        if (strlen($this->data->config->clientTable) > 0
            && strlen($this->data->config->clientFieldName) > 0
            && strlen($this->data->clientFieldValue) > 0) {
            $this->response->result = $this->db->query("SELECT * FROM " . $this->data->config->clientTable
                . " WHERE " . $this->data->config->clientFieldName . " like '" . $this->data->clientFieldValue . "%'"
                . " ORDER BY '" . $this->data->clientFieldValue . "'");
        }
    }

    public function insertData() {
        if (strlen($this->data->config->clientTable) > 0
            && strlen($this->data->config->clientIndexName) > 0
            && strlen($this->data->config->clientFieldName) > 0
            && strlen($this->data->clientFieldValue) > 0) {
            $settings = [
                'field_list' => [
                    $this->data->config->clientFieldName => $this->data->clientFieldValue,
                ],
                'table' => $this->data->config->clientTable,
                'index_name' => $this->data->config->clientIndexName,
                'write_history' => true,
                'logUid' => $this->currentUser->uid,
                'logComponent' => $this->data->logComponent,
                'logMethod' => $this->data->logMethod
            ];
            $this->response->insert = $this->db->insert($settings);
        }
    }

    public function getParentData() {
        if (strlen($this->data->config->parentTable) > 0
            && strlen($this->data->config->parentIndexName) > 0
            && strlen($this->data->config->clientTable) > 0
            && strlen($this->data->config->clientIndexName) > 0) {
            if (isset($this->data->config->multiSelect) && $this->data->config->multiSelect == '1') {
                $this->response->data = $this->db->query("SELECT
                    lt." . $this->data->config->lookupTableIndexName . ",
                    p." . $this->data->config->parentIndexName . ",
                    c.* FROM
                    " . $this->data->config->parentTable . " AS p
                    RIGHT JOIN " . $this->data->config->lookupTable . " AS lt ON lt." . $this->data->config->parentIndexName . "=p." . $this->data->config->parentIndexName . "
                    LEFT JOIN " . $this->data->config->clientTable . " AS c ON c." . $this->data->config->clientIndexName . "=lt." . $this->data->config->clientIndexName
                    . " WHERE p." . $this->data->config->parentIndexName . "=?", [$this->data->parentIndexValue])['data'];
            } else {
                $this->response->data = $this->db->query("SELECT
                    p." . $this->data->config->parentIndexName . ",
                    p." . $this->data->config->clientIndexName . ",
                    c.* FROM
                    " . $this->data->config->parentTable . " AS p
                    RIGHT JOIN " . $this->data->config->clientTable . " AS c ON c." . $this->data->config->clientIndexName . "=p." . $this->data->config->clientIndexName
                    . " WHERE " . $this->data->config->parentIndexName . "=?", [$this->data->parentIndexValue])['data'][0];
            }
        }
    }

    public function deleteData() {
        if (strlen($this->data->config->parentTable) > 0
            && strlen($this->data->config->parentIndexName) > 0
            && strlen($this->data->config->clientIndexName) > 0
            && strlen($this->data->parentIndexValue) > 0) {
            if (isset($this->data->config->multiSelect) && $this->data->config->multiSelect == '1') {
                $this->response->delete = $this->db->query("DELETE FROM " . $this->data->config->lookupTable . " WHERE " . $this->data->config->lookupTableIndexName . " = ?", [$this->data->index]);
            } else {
                $this->response->update = $this->db->query("UPDATE "
                    . $this->data->config->parentTable . " SET "
                    . $this->data->config->clientIndexName . " = NULL WHERE "
                    . $this->data->config->parentIndexName . " = ?", [$this->data->parentIndexValue]);
            }
        }
    }

    public function setData() {
        if (strlen($this->data->config->parentTable) > 0
            && strlen($this->data->config->parentIndexName) > 0
            && strlen($this->data->config->clientIndexName) > 0
            && strlen($this->data->clientIndexValue) > 0
            && strlen($this->data->parentIndexValue) > 0) {
            if (isset($this->data->config->multiSelect) && $this->data->config->multiSelect == '1') {
                $this->response->insert = $this->db->query("INSERT INTO " . $this->data->config->lookupTable . "(" . $this->data->config->parentIndexName . ", "
                    . $this->data->config->clientIndexName . ") VALUES (?,?)", [$this->data->parentIndexValue, $this->data->clientIndexValue]);
            } else {
                $this->response->update = $this->db->query("UPDATE "
                    . $this->data->config->parentTable . " SET " . $this->data->config->clientIndexName . " =? WHERE "
                    . $this->data->config->parentIndexName . " = ?", [$this->data->clientIndexValue, $this->data->parentIndexValue]);
            }
        }
    }

}
