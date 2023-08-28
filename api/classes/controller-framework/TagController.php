<?php

class Tag extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create(FRAMEWORK['TAG']['DB']);
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function listAll() {
        $this->response->tags = $this->db->query("SELECT * FROM " . FRAMEWORK['TAG']['TABLE_NAME'] . " t
                                                        LEFT JOIN " . FRAMEWORK['TAG']['TABLE_NAME_GROUP'] . " tg ON tg.TAGGID = t.TAGGID
                                                        WHERE t.FK_name = ?" .
                                                        ($this->data->config->FK_ID != null ? " AND t.FK_ID = " . $this->data->config->FK_ID : "" ), [
                                                            $this->data->config->FK_name
        ])['data'];
    }

    public function save() {
        // create tag group if it doesn't exist
        $tag_group = $this->db->query("SELECT TAGGID FROM " . FRAMEWORK['TAG']['TABLE_NAME_GROUP'] . " WHERE name = ?", [$this->data->name]);

        if ($tag_group['count'] == 0) {
            $insert = $this->db->query("INSERT INTO " . FRAMEWORK['TAG']['TABLE_NAME_GROUP'] . " (name) VALUES (?)", [$this->data->name]);
            $TAGGID = $insert['lastID'];
        } else {
            $TAGGID = $tag_group['data'][0]['TAGGID'];
        }

        // create tag if it doesn't exist
        $tag = $this->db->query("SELECT t.TAGID FROM " . FRAMEWORK['TAG']['TABLE_NAME'] . "t
                                       LEFT JOIN " . FRAMEWORK['TAG']['TABLE_NAME_GROUP'] . " tg ON tg.TAGGID = t.TAGGID
                                       WHERE t.FK_ID = ? AND t.FK_name = ? AND tg.name = ?", [
                                           $this->data->FK_ID, $this->data->FK_name, $this->data->name
        ]);

        if ($tag['count'] == 0) {
            $this->response->insert = $this->db->query("INSERT INTO " . FRAMEWORK['TAG']['TABLE_NAME'] . " (TAGGID, FK_ID, FK_name, create_UID) VALUES (?, ?, ?, ?)", [
                $TAGGID, $this->data->FK_ID, $this->data->FK_name, $this->currentUser->uid
            ]);
        } else {
            $this->response->warnings[] = "Tag wurde bereits zugewiesen";
        }
    }

    public function delete() {
        $this->response->delete = $this->db->query("DELETE FROM " . FRAMEWORK['TAG']['TABLE_NAME'] . " WHERE TAGID = ?", [
            $this->data->TAGID
        ]);
    }
}

