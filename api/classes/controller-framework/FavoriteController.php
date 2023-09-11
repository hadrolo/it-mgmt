<?php

class Favorite extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create(FRAMEWORK['MODULES']['FAVORITE']['DB']);
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function get() {
        $this->response->favorite = $this->db->query("SELECT * FROM ".FRAMEWORK['MODULES']['FAVORITE']['DB']['TABLE_NAME']." WHERE path = ?", [$this->data->path]);
    }

    public function listAll() {
        $this->response->favorites = $this->db->query("SELECT * FROM ".FRAMEWORK['MODULES']['FAVORITE']['DB']['TABLE_NAME']." WHERE UID = ? ORDER BY name", [$this->currentUser->uid]);
    }

    public function save() {
        $this->response->insert = $this->db->query("INSERT INTO ".FRAMEWORK['MODULES']['FAVORITE']['DB']['TABLE_NAME']." (UID, name, path) VALUES (?, ?, ?)",
            [$this->currentUser->uid, $this->data->name, $this->data->path]);
    }

    public function update() {
        $this->response->update = $this->db->query("UPDATE ".FRAMEWORK['MODULES']['FAVORITE']['DB']['TABLE_NAME']." SET name = ? WHERE FAVID = ?",
                [$this->data->name, $this->data->FAVID]);
    }

    public function delete() {
        $this->response->delete = $this->db->query("DELETE FROM ".FRAMEWORK['MODULES']['FAVORITE']['DB']['TABLE_NAME']." WHERE FAVID = ?", [$this->data->FAVID]);
    }
}
