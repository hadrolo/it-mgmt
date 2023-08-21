<?php

//ToDo: Change API from UID to public_id

class Ot extends Controller
{

    private $errors;

    public function createGroupLayer()
    {
        if (isset($this->data->LAYER)) {
            if (preg_match('/^[0-9 ]+$/', $this->data->LAYER)) {
                $tableName = 'ot_group_' . $this->data->LAYER;
                $tableExists = $this->checkIfTableExist($tableName);
                if (!$tableExists) {
                    $this->db->query("CREATE TABLE " . $tableName . " (
                    OTGID_" . $this->data->LAYER . " INT(11) NOT NULL AUTO_INCREMENT,
                    OTTID INT(11) NULL DEFAULT NULL,
                    PARENT INT(11) NULL DEFAULT NULL,
                    groupname VARCHAR(50) NULL DEFAULT NULL,
                    grouplevel INT(11) NULL DEFAULT NULL,
                    description VARCHAR(255) NULL DEFAULT NULL,
                    create_UID INT(11) NULL DEFAULT NULL,
                    create_data DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (OTGID_" . $this->data->LAYER . ") USING BTREE,
                    INDEX TEID (OTTID) USING BTREE,
                    INDEX create_UID (create_UID) USING BTREE)");
                    $tableExists = $this->checkIfTableExist($tableName);
                    if ($tableExists) {
                        $this->writeResponse("Table " . $tableName . " created");
                    } else {
                        $this->writeError("Error - Table " . $tableName . " not created");
                    }

                } else {
                    $this->writeError("Table " . $tableName . " already exist");
                }
            } else {
                $this->writeError("Error - LAYER virable '" . $this->data->LAYER . "' not allowed ");
            }
        } else {
            $this->writeError("Error - LAYER virable  not set");
        }
        $this->response->errors = $this->errors;
    }

    private function functiondeleteGroupLayer()
    {
        if (isset($this->data->LAYER)) {
            if (preg_match('/^[0-9 ]+$/', $this->data->LAYER)) {

            } else {
                $this->writeError("Error - LAYER virable '" . $this->data->LAYER . "' not allowed ");
            }

        } else {
            $this->writeError("Error - LAYER virable  not set");
        }
        $this->response->errors = $this->errors;

//        "DROP TABLE `ot_group_2`;"
    }

    private function checkIfTableExist($table_name)
    {
        return $this->db->query("
            SELECT
               TABLE_SCHEMA,
               TABLE_NAME,
               TABLE_TYPE
            FROM
               information_schema.TABLES
            WHERE
               TABLE_SCHEMA LIKE '" . DB['APP']['DB_NAME'] . "'    AND
                TABLE_TYPE LIKE 'BASE TABLE' AND
                TABLE_NAME = :LAYER", ['LAYER' => $table_name])['count'] == 1;

    }

    public
    function loadGroupsTree()
    {
        $treeBase = $this->db->query("SELECT 
            otg.*,
            ott.name as typename,
            otp.OTPID AS OTPID,
            otp.OTPGID AS OTPGID,
            otpg.name AS otp_positiongroupname,
            otp.ID AS otp_id,
            otp.name AS otp_name,
            otp.description AS otp_description,
            otf.OTFID,
            otf.ID AS otf_ID,
            otf.name AS otf_name,
            otf.type AS otf_type,
            otf.formular AS otf_formular,
            otf.description AS otf_description 
            FROM ot_group otg
            LEFT JOIN ot_type ott ON ott.OTTID = otg.OTTID
            LEFT JOIN ot_position otp ON otp.OTGID = otg.OTGID
            LEFT JOIN ot_position_group otpg ON otpg.OTPGID = otp.OTPGID
            LEFT JOIN ot_field otf ON otf.OTPID = otp.OTPID
            ORDER BY otg.OTGID DESC, otg.level, otg.grouplevel, otp.ID DESC, otf.ID DESC")['data'];

        $tree = null;
        foreach ($treeBase as $element) {
            $tree[$element['OTGID']]['OTGID'] = $element['OTGID'];
            $tree[$element['OTGID']]['OTTID'] = $element['OTTID'];
            $tree[$element['OTGID']]['typename'] = $element['typename'];
            $tree[$element['OTGID']]['level'] = $element['level'];
            $tree[$element['OTGID']]['groupname'] = $element['groupname'];
            $tree[$element['OTGID']]['grouplevel'] = $element['grouplevel'];
            $tree[$element['OTGID']]['description'] = $element['description'];
            if (isset($element['OTPID'])) {
                $tree[$element['OTGID']]['positions'][$element['OTPID']]['OTPID'] = $element['OTPID'];
                $tree[$element['OTGID']]['positions'][$element['OTPID']]['OTPGID'] = $element['OTPGID'];
                $tree[$element['OTGID']]['positions'][$element['OTPID']]['positiongroupname'] = $element['otp_positiongroupname'];
                $tree[$element['OTGID']]['positions'][$element['OTPID']]['ID'] = $element['otp_id'];
                $tree[$element['OTGID']]['positions'][$element['OTPID']]['name'] = $element['otp_name'];
                $tree[$element['OTGID']]['positions'][$element['OTPID']]['description'] = $element['otp_description'];
                if (isset($element['OTFID'])) {
                    $tree[$element['OTGID']]['positions'][$element['OTPID']]['fields'][$element['OTFID']]['OTFID'] = $element['OTFID'];
                    $tree[$element['OTGID']]['positions'][$element['OTPID']]['fields'][$element['OTFID']]['ID'] = $element['otf_ID'];
                    $tree[$element['OTGID']]['positions'][$element['OTPID']]['fields'][$element['OTFID']]['name'] = $element['otf_name'];
                    $tree[$element['OTGID']]['positions'][$element['OTPID']]['fields'][$element['OTFID']]['type'] = $element['otf_type'];
                    $tree[$element['OTGID']]['positions'][$element['OTPID']]['fields'][$element['OTFID']]['formular'] = $element['otf_formular'];
                    $tree[$element['OTGID']]['positions'][$element['OTPID']]['fields'][$element['OTFID']]['description'] = $element['otf_description'];
                } else {
                    $tree[$element['OTGID']]['positions'][$element['OTPID']]['fields'] = [];
                }

            } else {
                $tree[$element['OTGID']]['positions'] = [];
            }
        }

        // Sortierung & Object to Array mit Mulitsort
        foreach ($tree as &$group) {
            if ($group['positions'] > 0) {
                foreach ($group['positions'] as &$position) {
                    if ($position['fields'] > 0) {
                        array_multisort(array_column($position['fields'], 'ID'), SORT_ASC, $position['fields']);
                    }
                }
                unset($position);
                array_multisort(array_column($group['positions'], 'ID'), SORT_ASC, $group['positions']);
            }
        }
        unset($group);
        array_multisort(array_column($tree, 'level'), SORT_ASC, $tree);
        $this->response->tree = $tree;
    }

    public function loadGroupFormData()
    {
        if (isset($this->data->otgid)) {
            $this->response->otGroup = $this->db->query("SELECT * FROM ot_group WHERE OTGID=:OTGID", ['OTGID' => $this->data->otgid]);
        }
        $this->loadTypesData();
    }

    public function loadTypesData()
    {
        $this->response->otTypes = $this->db->query("SELECT * FROM ot_type ORDER BY name");
    }

    public function insertGroup()
    {
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

    public function updateGroup()
    {
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
            'output_update' => true,
            'index_value' => $this->data->otgid,
            'logUid' => $this->currentUID,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->update($settings);
    }

    public function deleteGroup()
    {
        $settings = [
            'table' => 'ot_group',
            'index_name' => 'OTGID',
            'index_value' => $this->data->otgid,
            'write_history' => true,
            'output_delete' => true,
            'logUid' => $this->currentUID,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->delete($settings);
    }

    public function insertType()
    {
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

    public function checkTypeExist()
    {
        if (isset($this->data->name)) {
            $this->response->otTypeExist = $this->db->query("SELECT * FROM ot_type WHERE name=:NAME", ['NAME' => $this->data->name]);
            $this->response->otTypeLike = $this->db->query("SELECT * FROM ot_type WHERE name LIKE :NAME", ['NAME' => '%' . $this->data->name . '%']);
        }
    }

    public function checkGroupnameExist()
    {
        if (isset($this->data->groupname)) {
            $this->response->otGroupnameExist = $this->db->query("SELECT * FROM ot_group WHERE groupname=:GROUPNAME", ['GROUPNAME' => $this->data->groupname]);
            $this->response->otGroupnameLike = $this->db->query("SELECT * FROM ot_group WHERE groupname LIKE :GROUPNAME", ['GROUPNAME' => '%' . $this->data->groupname . '%']);
        }
    }

    public function loadPositionFormData()
    {
        if (isset($this->data->otgid)) {
            $this->response->otGroup = $this->db->query("SELECT * FROM ot_position WHERE OTPID=:OTPID", ['OTPID' => $this->data->otpid]);
        }
        //$this->loadCountries();
    }

    public function loadPositionGroupData()
    {
        $this->response->otPositionGroups = $this->db->query("SELECT * FROM ot_position_group ORDER BY name");
    }

    public function loadCountries()
    {
        $this->response->countries = $this->db->query("SELECT * FROM country ORDER BY " . $this->data->LANG = "en" ? 'staat_en' : 'staat');
    }

    public function loadClients()
    {
        $this->response->clients = $this->db->query("SELECT * FROM clients ORDER BY name");
    }

    private function writeError($message){
        debug($message, DEBUGTYPE_ERROR);
        $this->errors[] = $message;
    }
    private function writeResponse($message){
        debug($message, DEBUGTYPE_SPECIAL);
    }

}
