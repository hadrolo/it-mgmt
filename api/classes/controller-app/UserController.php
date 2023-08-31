<?php

//ToDo: Change API from UID to public_id

class User extends Controller
{

    public function getOwnUserProfile()
    {
        $this->response->user = $this->db->query('SELECT
            public_id,
            CID,
            username,
            firstname,
            lastname,
            email,
            language,
            usertype,
            last_login,
            active,
            postcode,
            info
            FROM users WHERE UID=:UID', ['UID' => $this->currentUser->uid])['data'][0];

        if (isset($this->data->getCountries) && $this->data->getCountries==1){
            $this->response->countrys = $this->db->query("SELECT CID, IF(:LANG = 'de' ,staat, staat_en) AS country FROM country", ['LANG' => $this->data->LANG])['data'];
        }
    }

    public function getUserInfo()
    {
        $this->response->user = $this->db->query('SELECT
            UID,
            CID,
            username,
            firstname,
            lastname,
            email,
            language,
            usertype,
            last_login,
            active,
            postcode,
            info
            FROM users WHERE public_id=:PUBLIC_ID', ['PUBLIC_ID' => $this->data->public_id])['data'][0];

        $this->response->countrys = $this->db->query("SELECT
       CID,
       IF(:LANG = 'de' ,staat, staat_en) AS country
        FROM country", ['LANG' => $this->data->LANG])['data'];
    }

    public function insert()
    {
        debug($this->data, DEBUGTYPE_SPECIAL);
        $settings = [
            'field_list' => [
                'public_id' => $this->data->public_id,
                'CID' => $this->data->form->country->CID,
                'username' => $this->data->form->username,
                'usertype' => $this->data->form->usertype,
                'password' => (strlen($this->data->form->password) > 0) ? password_hash($this->data->form->password, PASSWORD_DEFAULT) : null,
                'firstname' => $this->data->form->firstname,
                'lastname' => $this->data->form->lastname,
                'email' => $this->data->form->email,
                'language' => $this->data->form->language,
                'active' => intval($this->data->form->active->db),
                'postcode' => $this->data->form->postcode,
                'info' => $this->data->form->info
            ],
            'table' => 'users',
            'index_name' => 'UID',
            'write_history' => true,
            'logIndexValue' => '',
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response->user = $this->db->insert($settings);
    }

    public function updateOwnUser()
    {
        if (isset($this->data->form->country->CID)) $field_list['CID'] = $this->data->form->country->CID;
        if (isset($this->data->form->firstname)) $field_list['firstname'] = $this->data->form->firstname;
        if (isset($this->data->form->lastname)) $field_list['lastname'] = $this->data->form->lastname;
        if (isset($this->data->form->email)) $field_list['email'] = $this->data->form->email;
        if (isset($this->data->form->language)) $field_list['language'] = $this->data->form->language;
        if (isset($this->data->form->postcode)) $field_list['postcode'] = $this->data->form->postcode;
        if (isset($this->data->form->info)) $field_list['info'] = $this->data->form->info;
       if (isset($this->data->form->password) && strlen($this->data->form->password) > 0) $field_list['password'] = password_hash($this->data->form->password, PASSWORD_DEFAULT);
        if (isset($this->data->form->active->db) && strlen($this->data->form->password) > 0) $field_list['active'] = $this->data->form->active->db;

        if (isset($field_list)) {
            $settings = [
                'field_list' => $field_list,
                'table' => 'users',
                'index_name' => 'UID',
                'index_value' => $this->currentUser->uid,
                'write_history' => true,
                'logUid' => $this->currentUser->uid,
                'logComponent' => $this->componentName,
                'logMethod' => $this->methodName
            ];
            $this->response = $this->db->update($settings);
            $this->response['debug_controller'] = $this->data;
        } else {
            $this->response->error = 'no data';
        }
    }

    public function updateUser()
    {
        $update = false;
        if (isset($this->data->form->country->CID)) {
            $field_list['CID'] = $this->data->form->country->CID;
            $update = true;
        }
        if (isset($this->data->form->usertype)) {
            $field_list['usertype'] = $this->data->form->usertype;
            $update = true;
        }
        if (isset($this->data->form->firstname)) {
            $field_list['firstname'] = $this->data->form->firstname;
            $update = true;
        }
        if (isset($this->data->form->lastname)) {
            $field_list['lastname'] = $this->data->form->lastname;
            $update = true;
        }
        if (isset($this->data->form->email)) {
            $field_list['email'] = $this->data->form->email;
            $update = true;
        }
        if (isset($this->data->form->language)) {
            $field_list['language'] = $this->data->form->language;
            $update = true;
        }
        if (isset($this->data->form->postcode)) {
            $field_list['postcode'] = $this->data->form->postcode;
            $update = true;
        }
        if (isset($this->data->form->info)) {
            $field_list['info'] = $this->data->form->info;
            $update = true;
        }
        if (isset($this->data->form->password) && strlen($this->data->form->password) > 0) {
            $field_list['password'] = password_hash($this->data->form->password, PASSWORD_DEFAULT);
            $update = true;
        }
        if (isset($this->data->form->active->db)) {
            $field_list['active'] = $this->data->form->active->db;
            $update = true;
        }

        if ($update == true) {
            $settings = [
                'field_list' => $field_list,
                'table' => 'users',
                'index_name' => 'public_id',
                'index_value' => $this->data->public_id,
                'write_history' => true,
                'logUid' => $this->currentUser->uid,
                'logComponent' => $this->componentName,
                'logMethod' => $this->methodName
            ];
            $this->response = $this->db->update($settings);
            $this->response['debug_controller'] = $this->data;
        }
    }

    public function delete()
    {
        // todo: use currentUID !!!!!!
        $settings = [
            'table' => 'users',
            'index_name' => 'public_id',
            'index_value' => $this->data->public_id,
            'write_history' => true,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->response = $this->db->delete($settings);
    }

    public function checkUserExist()
    {
        $userExist = $this->db->query("SELECT count(*) as count FROM users WHERE username='" . $this->data->username . "'")['data'][0]['count'];
        $this->response->userExist = $userExist == '1';
    }

    public function checkEmailExist()
    {
        if ($this->data->UID == null) {
            $userExist = $this->db->query("SELECT count(*) as count FROM users WHERE email='" . $this->data->email . "'")['data'][0]['count'];
        } else {
            $userExist = $this->db->query("SELECT count(*) as count FROM users WHERE email='" . $this->data->email . "' AND UID != ?", [$this->data->UID])['data'][0]['count'];
        }
        $this->response->emailExist = $userExist == '1';
    }
}
