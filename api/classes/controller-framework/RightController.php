<?php

class Right extends Controller
{

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null)
    {
        $database = new Database(DB['APP']['HOST'], DB['APP']['USER'], DB['APP']['PASS'], DB['APP']['DB_NAME'], DB['APP']['PORT']);
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    public function loadCurrentRights()
    {
        $rights = $this->db->query("SELECT RGID, name FROM rights");
        debug($this->db->query("SELECT usertype FROM users WHERE UID=:UID", ['UID' => $this->currentUser->uid])['data'][0]['usertype'], DEBUGTYPE_SPECIAL);
        if ($this->db->query("SELECT usertype FROM users WHERE UID=:UID", ['UID' => $this->currentUser->uid])['data'][0]['usertype'] == 'SYSADMIN') {
            foreach ($rights['data'] as $key => $value) {
                $this->response->rights[strtolower($value['RGID'])][$value['name']] = true;
            }
        } else {
            if (isset(DB['UNIVERSE'])) {
                $rightAllowed = $this->db->query("SELECT RGID, name FROM
            (SELECT
            r2.RGID,
            r2.name
            FROM rights AS r
            LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID
            LEFT JOIN M_users AS mu ON mu.usertype = ru.usertype
            LEFT JOIN rights_alias AS ra ON ra.RID_alias = r.RID
            LEFT JOIN rights AS r2 ON r2.RID = ra.RID_client
            WHERE mu.UID = :UID AND r.type = :TYPE
            UNION ALL
            SELECT
            r.RGID,
            r.name
            FROM rights AS r
            LEFT JOIN rights_groups AS rg ON rg.RGID=r.RGID
            LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID
            LEFT JOIN M_users AS mu ON mu.usertype = ru.usertype
            WHERE mu.UID = :UID AND r.type != :TYPE
            ) t
            GROUP BY name", ['UID' => $this->currentUser->uid, 'TYPE' => 'ALIAS']);
            } else {
                $rightAllowed = $this->db->query("SELECT RGID, name FROM
            (SELECT
            r2.RGID,
            r2.name
            FROM rights AS r
            LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID
            LEFT JOIN " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " AS u ON u.usertype = ru.usertype
            LEFT JOIN rights_alias AS ra ON ra.RID_alias = r.RID
            LEFT JOIN rights AS r2 ON r2.RID = ra.RID_client
            WHERE u.UID = :UID AND r.type = :TYPE
            UNION ALL
            SELECT
            r.RGID,
            r.name
            FROM rights AS r
            LEFT JOIN rights_groups AS rg ON rg.RGID=r.RGID
            LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID
            LEFT JOIN " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " AS u ON u.usertype = ru.usertype
            WHERE u.UID = :UID AND r.type != :TYPE
            ) t
            GROUP BY name", ['UID' => $this->currentUser->uid, 'TYPE' => 'ALIAS']);
            }

            $this->response->rights = null;

            foreach ($rights['data'] as $key => $value) {
                $found = false;
                foreach ($rightAllowed['data'] as $right) {
                    if ($value['RGID'] == $right['RGID'] && $value['name'] == $right['name']) {
                        $this->response->rights[strtolower($value['RGID'])][$value['name']] = true;
                        $found = true;
                    }
                    if (!$found) {
                        $this->response->rights[strtolower($value['RGID'])][$value['name']] = false;
                    }
                }
            }
        }
    }

    public function listRightsAssigned()
    {
        $this->response->rights = $this->db->query("SELECT
            ru.RTID,
            r.RID,
            rg.RGID,
            ru.usertype,
            r.type,
            r.name,
            r.description
            FROM rights_usertypes AS ru
            LEFT JOIN rights AS r ON r.RID=ru.RID
            LEFT JOIN rights_groups AS rg ON rg.RGID=r.RGID
            WHERE ru.usertype=?
            ORDER BY rg.RGID, r.name", [$this->data->usertype]);
    }

    public function listRightGroupsUnassigned()
    {
        $this->response->groups = $this->db->query("SELECT
                rg.RGID
                FROM rights AS r
                LEFT JOIN rights_groups AS rg ON rg.RGID=r.RGID
                LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID AND ru.usertype=?
                WHERE ru.usertype IS NULL GROUP BY rg.RGID", [$this->data->usertype]);
    }

    public function listRightsUnassigned()
    {
        $this->response->rights = $this->db->query("SELECT
            r.*
            FROM rights AS r
            LEFT JOIN rights_groups AS rg ON rg.RGID=r.RGID
            LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID AND ru.usertype=?
            WHERE rg.RGID=? AND ru.usertype IS NULL", [$this->data->usertype, $this->data->RGID]);
    }

    public function assignUsertypeRight()
    {
        $settings = [
            'field_list' => [
                'RID' => $this->data->RID,
                'usertype' => $this->data->usertype,
            ],
            'table' => 'rights_usertypes',
            'index_name' => 'RTID',
            'write_history' => true,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->insert($settings);
    }

    public function unassignUsertypeRight()
    {
        $settings = [
            'table' => 'rights_usertypes',
            'index_name' => 'RTID',
            'index_value' => $this->data->RTID,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->delete($settings);
    }

    public function copyUsertypeRight()
    {
        $src_rights = $this->db->query("SELECT
            r.RID
            FROM rights AS r
            LEFT JOIN rights_groups AS rg ON rg.RGID=r.RGID
            LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID
            WHERE ru.usertype=?", [$this->data->src_usertype])['data'];

        foreach ($src_rights as $row) {
            $this->db->query("INSERT INTO rights_usertypes (RID, usertype) VALUES (?, ?)", [$row['RID'], $this->data->dst_usertype]);
            debug("INSERT INTO rights_usertypes (RID, usertype) VALUES (" . $row['RID'] . ", " . $this->data->dst_usertype . ")", DEBUGTYPE_DB_QUERY);
        }
    }

    public function deleteAllUsertypeRights()
    {
        $this->db->query("DELETE FROM rights_usertypes WHERE usertype=?", [$this->data->usertype]);
    }

    public function insertAllUsertypeRights()
    {
        $src_rights = $this->db->query("SELECT RID FROM rights")['data'];
        foreach ($src_rights as $row) {
            $this->db->query("INSERT INTO rights_usertypes (RID, usertype) VALUES (?, ?)", [$row['RID'], $this->data->usertype]);
            debug("INSERT INTO rights_usertypes (RID, usertype) VALUES (" . $row['RID'] . ", " . $this->data->usertype . ")", DEBUGTYPE_DB_QUERY);
        }
    }

    public function listUsers()
    {
        if (isset(FRAMEWORK['AUTH']['MODULES']['APP']) == true) {
            // UNIVERSE
            $this->response->users = $this->db->query("SELECT
                u.CID,
                u.UID,
                uu.username,
                uu.firstname,
                uu.lastname
                FROM " . FRAMEWORK['AUTH']['MODULES']['APP']['TABLE_NAME'] . " AS u
                LEFT JOIN " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['DB'] . "." . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " AS uu ON uu.UID=u.UID ORDER BY uu.lastname");
        } else {
            // OTHER
            $this->response->users = $this->db->query("SELECT
                UID,
                username,
                firstname,
                lastname
                FROM " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " ORDER BY lastname");
        }
    }

    public function loadRight()
    {
        $this->response->right = $this->db->query("SELECT * FROM rights WHERE RID = ?", [$this->data->RID])['data'][0];
        $this->response->rightGroupList = $this->db->query("SELECT * from rights_groups ORDER BY RGID");
    }

    public function loadRightList()
    {
        if (isset($this->data->RGID)) {
            $this->response->rightList = $this->db->query("SELECT * FROM rights WHERE RGID = ? ORDER BY name", [$this->data->RGID]);
        } else {
            $this->response->rightList = $this->db->query("SELECT * FROM rights ORDER BY name", [$this->data->RGID]);
        }
    }

    public function loadRightGroupList()
    {
        $this->response->rightGroupList = $this->db->query("SELECT * from rights_groups ORDER BY RGID");
    }

    public function loadRightAliases()
    {
        $allowPermanent = '';
        foreach (FRAMEWORK['AUTH']['PERMANENT_ALLOWED_API'] as $right) {
            $allowPermanent .= " AND NOT (class='" . explode('/', $right)[0] . "' and method='" . explode('/', $right)[1] . "')";
        }

        $this->response->rightAssignedList = $this->db->query("SELECT
            r.*,
            ra.RID_alias,
            ra.RID_client
            FROM rights_alias AS ra
            LEFT JOIN rights AS r ON r.RID=ra.RID_client
            WHERE ra.RID_alias = ?", [$this->data->RID]);

        $filter = [0];

        if ($this->response->rightAssignedList['count'] > 0) {
            foreach ($this->response->rightAssignedList['data'] as $row) {
                foreach ($row as $key => $value) {
                    if ($key == 'RID') {
                        if (!in_array($value, $filter))
                            array_push($filter, $value);
                    }
                }
            }
        }

        $this->response->rightUnassignedGroupsList = $this->db->query("SELECT
            rg.*
            FROM rights AS r
            LEFT JOIN rights_groups AS rg ON rg.RGID=r.RGID
            WHERE RID NOT IN (" . join(',', $filter) . ")
            AND r.type = ? AND r.RID != ?
            ".$allowPermanent."
            GROUP BY r.RGID
            ORDER BY r.RGID", [$this->data->selected->type, $this->data->RID]);


        $this->response->rightUnassignedList = $this->db->query("SELECT * FROM rights AS r
            WHERE r.RID NOT IN (" . join(',', $filter) . ") AND r.RGID = ? AND r.RID != ?".$allowPermanent, [$this->data->selected->RGID, $this->data->RID]);
    }

    public function assignRightAlias()
    {
        $this->db->query("INSERT INTO rights_alias (RID_alias, RID_client) VALUES (?, ?)", [$this->data->RID_alias, $this->data->RID_client]);
    }

    public function unassignRightAlias()
    {
        $this->db->query("DELETE FROM rights_alias WHERE RID_alias = ? AND RID_client = ?", [$this->data->RID_alias, $this->data->RID_client]);
    }

    public function insertRight()
    {
        $settings = [
            'field_list' => [
                'RGID' => $this->data->form->rightGroup,
                'type' => $this->data->form->type,
                'name' => $this->data->form->name,
                'module' => $this->data->form->module,
                'class' => $this->data->form->class,
                'method' => $this->data->form->method,
                'i18n' => $this->data->form->i18n,
                'description' => $this->data->form->description,
            ],
            'table' => 'rights',
            'index_name' => 'RID',
            'write_history' => true,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->insert($settings);
    }

    public function updateRight()
    {
        $settings = [
            'field_list' => [
                'RGID' => $this->data->form->rightGroup,
                'type' => $this->data->form->type,
                'name' => $this->data->form->name,
                'module' => $this->data->form->module,
                'class' => $this->data->form->class,
                'method' => $this->data->form->method,
                'i18n' => $this->data->form->i18n,
                'description' => $this->data->form->description,
            ],
            'table' => 'rights',
            'index_name' => 'RID',
            'write_history' => true,
            'index_value' => $this->data->RID,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->update($settings);
    }

    public function deleteRight()
    {
        $settings = [
            'table' => 'rights_alias',
            'index_name' => 'RID_alias',
            'index_value' => $this->data->RID,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->delete($settings);

        $settings = [
            'table' => 'rights_alias',
            'index_name' => 'RID_client',
            'index_value' => $this->data->RID,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->delete($settings);

        $settings = [
            'table' => 'rights',
            'index_name' => 'RID',
            'index_value' => $this->data->RID,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->delete($settings);
    }

    public function loadAllUsertypeRights()
    {
        //todo: alias(clients) in anderer farbe darstellen wenn aktiv


        $data['USERTYPE'] = $this->data->usertype;
        $sql = null;
        $RGID = null;
        $i = -1;

        if ($this->data->rightType !== 'alle') {
            $data['TYPE'] = $this->data->rightType;
            $sql = " WHERE r.type = :TYPE";
        }

        if ($this->data->rightGroup !== 'alle') {
            $data['RGID'] = $this->data->rightGroup;
            $sql .= " WHERE r.RGID = :RGID";
        }

        if (isset($this->data->rightFilter)) {
            $data['FILTER'] = '%' . $this->data->rightFilter . '%';
            $sql .= " WHERE r.name LIKE :FILTER";
        }


        $allRights = $this->db->query("SELECT
            r.*,
            rut.RTID
            FROM
            rights AS r
            LEFT JOIN rights_usertypes AS rut ON rut.RID = r.RID AND rut.usertype = :USERTYPE
            " . $sql . "
            ORDER BY r.RGID", $data)['data'];
        $out = [];

        foreach ($allRights as $row) {
            $allowPermanent = false;
            foreach (FRAMEWORK['AUTH']['PERMANENT_ALLOWED_API'] as $right_check) {
                $x = explode('/', $right_check);
                if ($row['class'] == $x[0] && $row['method'] == $x[1]) {
                    $allowPermanent = true;
                }
            }

            $right = [
                'RID' => $row['RID'],
                'type' => $row['type'],
                'name' => $row['name'],
                'module' => $row['module'],
                'class' => $row['class'],
                'method' => $row['method'],
                'i18n' => $row['i18n'],
                'description' => $row['description'],
                'assigned' => isset($row['RTID']),
                'allowPermanent' => $allowPermanent,
                'allowFromAlias' => false,
                'aliasBase' => null
            ];

            if ($row['RGID'] != $RGID) {
                $RGID = $row['RGID'];
                $i++;
                $out[$i] = ['RGID' => $row['RGID'], 'open' => $this->data->openAllItems, 'rights' => array($right)];
            } else {
                $out[$i]['rights'][] = $right;
            }
        }

        /* activation from alias */
        foreach ($out as $i => $value){
/*            debug($value, DEBUGTYPE_WARNING);*/
            foreach ($value['rights'] as $row){
                if ($row['type']=='ALIAS' && isset($row['assigned'])){
                    $aliases = $this->db->query("SELECT ra.RID_alias, ra.RID_client, r.RGID, r.name FROM rights_alias AS ra
                    LEFT JOIN rights AS r ON r.RID = ra.RID_alias
                    LEFT JOIN rights_usertypes AS ru ON ru.RID = ra.RID_alias
                    WHERE ra.RID_alias = :RID AND ru.usertype = :USERTYPE",
                        [
                            'RID' => $row['RID'],
                            'USERTYPE' => $this->data->usertype
                        ])['data'];
                    foreach ($aliases as $value){
                        debug($value, DEBUGTYPE_SUCCESS);
                        $found_key = array_search($value['RID_client'], array_column($out[$i]['rights'], 'RID'));
                        debug($out[$i]['rights'][$found_key], DEBUGTYPE_WARNING);
                        $out[$i]['rights'][$found_key]['allowFromAlias'] = true;
                        $out[$i]['rights'][$found_key]['aliasBase'] = $value['RGID'].'/'.$value['name'];
                    }
                }
            }
        }


        $this->response->rightGroups = $this->db->query("SELECT * FROM rights_groups ORDER BY RGID")['data'];
        $this->response->allRights = $out;
        $this->response->modules = $this->db->query("SELECT module FROM rights WHERE module IS NOT NULL GROUP BY module")['data'];
    }

    public function updateUsertypeRights()
    {
        $settings = [
            'table' => 'rights_usertypes',
            'index_name' => 'usertype',
            'index_value' => $this->data->usertype,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response->delete = $this->db->delete($settings);

        foreach ($this->data->rightList as $rightGroup) {
            foreach ($rightGroup->rights as $right) {

                if (!$right->assigned) continue;

                $settings = [
                    'field_list' => [
                        'RID' => $right->RID,
                        'usertype' => $this->data->usertype,
                    ],
                    'table' => 'rights_usertypes',
                    'index_name' => 'RTID',
                    'write_history' => false,
                    'logUid' => $this->currentUser->uid,
                    'logComponent' => $this->componentName,
                    'logMethod' => $this->methodName
                ];
                $this->db->insert($settings);
            }
        }

    }
}
