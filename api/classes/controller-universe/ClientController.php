<?php

class Client extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create('UNIVERSE');
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function listClient() {
        $this->response->clientlist = $this->db->query("SELECT CID, name FROM clients WHERE CID IS NOT NULL ORDER BY CID, name")['data'];
    }

    public function listAppClients() {
        if (isset($this->data->CID) == true) {
            $this->response->clientlist = $this->db->query("SELECT c.CID, c.name FROM M_app_client AS mc
                                                                  LEFT JOIN clients AS c ON mc.CID = c.CID
                                                                  WHERE mc.APPID = ? AND c.CID = ? ORDER BY c.CID, c.name", [APP_NAME, $this->data->CID])['data'];
        } else {
            $this->response->clientlist = $this->db->query("SELECT c.CID, c.name FROM M_app_client AS mc
                                                                  LEFT JOIN clients AS c ON mc.CID = c.CID
                                                                  WHERE mc.APPID = ? ORDER BY c.CID, c.name", [APP_NAME])['data'];
        }
    }
}
