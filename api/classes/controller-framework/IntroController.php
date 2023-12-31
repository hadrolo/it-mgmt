<?php

class Intro extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create(FRAMEWORK['MODULES']['INTRO']['DB']);

        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function getData() {
        if ($this->data->component) {
            $sql = [];
            $data = [];

            foreach($this->data->component as $key => $statement) {
                array_push($sql, 'component = :COMPONENT'.$key);
                $data['COMPONENT'.$key] = $statement;
            }

            $this->response->elements = $this->db->query("SELECT * FROM ".FRAMEWORK['MODULES']['INTRO']['DB']['TABLE_NAME']." WHERE " . join(' OR ', $sql)." ORDER BY id", $data);
        } else {
            $this->response->elements = false;
        }
    }
}

