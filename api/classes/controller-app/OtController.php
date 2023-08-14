<?php

//ToDo: Change API from UID to public_id

class Ot extends Controller
{

    public function loadGroups()
    {
        $this->response->otGroups = $this->db->query("SELECT 
            otg.*,
            ott.name as typename
            FROM ot_group otg
            LEFT JOIN ot_type ott ON ott.OTTID = otg.OTTID");

    }

    public function loadGroupFormData(){
        if (isset($this->data->otgid)){
            $this->response->otGroup = $this->db->query("SELECT * FROM ot_group WHERE OTGID=:OTGID", ['OTGID' => $this->data->otgid]);
        }
        $this->loadTypesData();
    }

    public function loadTypesData(){
        $this->response->otTypes = $this->db->query("SELECT * FROM ot_type ORDER BY name");
    }

    public function insertGroup()
    {
        debug($this->data, DEBUGTYPE_SPECIAL);
        $settings = [
            'field_list' => [
                'OTTID' => $this->data->form->ottid,
                'level' => $this->data->form->level,
                'groupname' => $this->data->form->groupname,
                'grouplevel' => $this->data->form->grouplevel,
                'description' => $this->data->form->description,
                'create_UID' => $this->currentUID,
            ],
            'table' => 'ot_group',
            'index_name' => 'OTGID',
            'write_history' => false,
            'output_insert' => true,
            'logUid' => $this->currentUID,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->insert($settings);
    }

    public function insertType()
    {
        debug($this->data, DEBUGTYPE_SPECIAL);
        $settings = [
            'field_list' => [
                'name' => $this->data->form->ottype,
                'create_UID' => $this->currentUID,
            ],
            'table' => 'ot_type',
            'index_name' => 'OTTID',
            'write_history' => false,
            'output_insert' => true,
            'logUid' => $this->currentUID,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->insert($settings);
    }

    public function checkTypeExist(){
        if (isset($this->data->name)){
            $this->response->otTypeExist = $this->db->query("SELECT * FROM ot_type WHERE name=:NAME", ['NAME' => $this->data->name]);
            $this->response->otTypeLike = $this->db->query("SELECT * FROM ot_type WHERE name LIKE :NAME", ['NAME' => '%'.$this->data->name.'%']);
        }
    }

    public function checkGroupnameExist(){
        if (isset($this->data->groupname)){
            $this->response->otGroupnameExist = $this->db->query("SELECT * FROM ot_group WHERE groupname=:GROUPNAME", ['GROUPNAME' => $this->data->groupname]);
            $this->response->otGroupnameLike = $this->db->query("SELECT * FROM ot_group WHERE groupname LIKE :GROUPNAME", ['GROUPNAME' => '%'.$this->data->groupname.'%']);
        }
    }
}
