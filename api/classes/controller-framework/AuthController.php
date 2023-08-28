<?php

use Carbon\Carbon;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;

require_once 'classes/TokenFactory.php';

class Auth extends Controller {

    public function __construct(Database $database = null, $data = null, $componentName = null, $methodName = null, $currentUser = null) {
        $database = Database::create('DEFAULT');
        parent::__construct($database, $data, $componentName, $methodName, $currentUser);
    }

    /**
     * Login user.
     * Creates a token and populates user data based on configuration.
     */
    public function login() {
        $default_module = FRAMEWORK['AUTH']['MODULES']['DEFAULT'];

        if (isset(DB['UNIVERSE'])) {
            // check if the user is assigned to the App
            $user = $this->db->query("SELECT * FROM " . $default_module['TABLE_NAME'] . " AS u
                LEFT JOIN universe.M_user_client_app AS muca ON muca.UID = u.UID AND muca.APPID = :APPID
                WHERE u." . $default_module['FIELD_LOGIN'] . " = :USERNAME", ['USERNAME' => $this->data->username, 'APPID' => APP_NAME]);

            if (is_null($user['data'][0]['APPID'])) {
                // User not found
                Log::write(null, 'login-error', 'User not in M_user_client_app ("'.$this->data->username.'")', 'UserService.ts', 'login()', 'AuthController.php', 'login()');

                $this->response->auth = [
                    "success" => false,
                    "message" => "user-not-found",
                ];
                return;
            }
        } else {
            $user = $this->db->query("SELECT * FROM " . $default_module['TABLE_NAME'] . " WHERE " . $default_module['FIELD_LOGIN'] . " = :USERNAME", ['USERNAME' => $this->data->username]);
        }

        if ($user['count'] == 0) {
            // User not found
            Log::write(null, 'login-error', 'User not found "' . $this->data->username . '"', 'UserService.ts', 'login()', 'AuthController.php', 'login()');

            $this->response->auth = [
                "success" => false,
                "message" => "user-not-found",
            ];
        } else {
            if (strtoupper($user['data'][0]['active']) != '1') {
                // User disabled
                Log::write($user['data'][0]['UID'], 'login-error', 'User disabled', 'UserService.ts', 'login()', 'AuthController.php', 'login()');

                $this->response->auth = [
                    "success" => false,
                    "message" => "user-disabled"
                ];
            } else {
                if (!password_verify($this->data->password, $user['data'][0]['password'])) {
                    // Password wrong
                    Log::write($user['data'][0]['UID'], 'login-error', 'Invalid credentials', 'UserService.ts', 'login()', 'AuthController.php', 'login()');

                    $this->response->auth = [
                        "success" => false,
                        "message" => "invalid-credentials"
                    ];
                } else {
                    Log::write($user['data'][0]['UID'], 'login', 'User logged in successfully', 'UserService.ts', 'login()', 'AuthController.php', 'login()');

                    $this->response->auth = [
                        "success" => true,
                        "message" => "successfully-logged-in",
                    ];

                    $this->response->jwt_token = TokenFactory::newToken($user['data'][0]['UID']);
                    $this->populateUserData($default_module, $user['data'][0]['UID']);
                }
            }
        }
    }

    public function logout() {
        try {
            $decoded = JWT::decode($this->data->accessToken, FRAMEWORK['AUTH']['JWT_KEY'], array('HS256'));
            Log::write($decoded->data->UID, 'logout', 'User logged out successfully', 'UserService.ts', 'logout()', 'AuthController.php', 'logout()');
        } catch (ExpiredException $e) {
            // do nothing, we are logging out anyway
        }

        $this->response->jwt_token = TokenFactory::newToken(0);
        $this->response->status = false;
        $this->nobodyUser();
    }

    // NOTE: This function also exists in TokenController
    private function nobodyUser() {
        $userData['UID'] = 0;
        foreach (FRAMEWORK['AUTH']['MODULES'] as $key => $module) {
            $userData[$module['USERTYPE']['NAME']] = 'nobody';
            foreach ($module['RESPONSE_FIELDS'] as $field => $value) {
                if ($value != null) {
                    $userData[$field] = $value;
                }
            }
        }
        $this->response->nobodyuser = $userData;
    }

    public function isLoggedIn() {
        $default_module = FRAMEWORK['AUTH']['MODULES']['DEFAULT'];

        if ($this->data->accessToken == null || $this->data->refreshToken == null) {
            $this->logout();
        } else {
            try {
                $decoded = JWT::decode($this->data->accessToken, FRAMEWORK['AUTH']['JWT_KEY'], array('HS256'));

                if ($decoded->data->UID !== 0) {
                    $this->response->anonymous = false;
                    $this->populateUserData($default_module, $decoded->data->UID);
                } else {
                    $this->response->anonymous = true;
                    $this->nobodyUser();
                }
            } catch (ExpiredException $e) {
                // if the access token is expired, try to decode the refresh token and if that works, generate new tokens
                try {
                    $decoded_refresh = JWT::decode($this->data->refreshToken, FRAMEWORK['AUTH']['JWT_KEY'], array('HS256'));

                    if ($decoded_refresh->data->UID !== 0) {
                        $this->response->anonymous = false;
                        $this->response->jwt_token = TokenFactory::newToken($decoded_refresh->data->UID);
                        $this->populateUserData($default_module, $decoded_refresh->data->UID);
                    } else {
                        $this->response->anonymous = true;
                        $this->response->jwt_token = TokenFactory::newToken(0);
                        $this->nobodyUser();
                    }
                } catch (ExpiredException $e) {
                    $this->logout();
                }
            }
        }
    }

    private function populateUserData($default_module, $UID): void {
        $this->db->query("UPDATE " . $default_module['TABLE_NAME'] . " SET last_login = NOW() WHERE UID = ?", [$UID]);

        // merge user data
        $this->response->user = $this->db->query("SELECT public_id,last_login,active,UID," . $default_module['USERTYPE']['NAME']
            . (count($default_module['RESPONSE_FIELDS']) > 0 ? "," . join(",", array_keys($default_module['RESPONSE_FIELDS'])) : "")
            . " FROM " . $default_module['TABLE_NAME'] . " WHERE UID = ?", [$UID])['data'][0];

        foreach (FRAMEWORK['AUTH']['MODULES'] as $key => $module) {
            if ($key != 'DEFAULT') {
                $database = Database::create($key);
                $userdata = $database->query("SELECT * FROM " . $module['TABLE_NAME'] . " WHERE UID = ?", [$UID])['data'][0];

                $userdata['active_app'] = $userdata['active'];
                unset($userdata['active']);

                foreach ($userdata as $dataname => $datavalue) {
                    if ($dataname !== "UID" && array_key_exists($dataname, $this->response->user))
                        debug('Merge user data: Key "' . $dataname . '" already exists!', DEBUGTYPE_WARNING);
                    $this->response->user[$dataname] = $datavalue;
                }
            }
        }

        // sort by key
        ksort($this->response->user);
    }

    public function resetPassword() {
        $hash = hash('sha256', mt_rand());

        $this->response->update = $this->db->query("UPDATE " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " SET reset_hash = ?, reset_date = NOW() WHERE " . FRAMEWORK['AUTH']['PASSWORD_RESET']['FIELD_CHECK'] . " = ?", [$hash, $this->data->field_check]);
        $email = $this->db->query("SELECT email FROM " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " WHERE " . FRAMEWORK['AUTH']['PASSWORD_RESET']['FIELD_CHECK'] . " = ?", [$this->data->field_check]);

        if ($email['count'] == 1) {
            $email = explode(",", $email['data'][0]['email'])[0];

            $translations = Translation::getAll($this->data->language);

            Mail::send($this->db, $this->currentUser->uid, FRAMEWORK['EMAIL']['SMTP_USER'], APP_NAME, [$email], $translations->FW->PASSWORD_RESET->MAIL_SUBJECT,
                "<p>" . $translations->FW->PASSWORD_RESET->MAIL_TEXT. "</p>" .
                "<p><a href='" . URL . FRAMEWORK['AUTH']['PASSWORD_RESET']['ROUTERLINK'] . DIRECTORY_SEPARATOR . $hash . "'>" . $translations->FW->PASSWORD_RESET->MAIL_SUBJECT . "</a></p>"
            );
        } else {
            $this->response->error = true;
        }
    }

    public function updatePassword() {
        $password = password_hash($this->data->password, PASSWORD_DEFAULT);

        $query = $this->db->query("UPDATE " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " SET reset_hash = null, reset_date = null, password = ? WHERE reset_hash = ? AND NOW() < DATE_ADD(reset_date, INTERVAL " . FRAMEWORK['AUTH']['PASSWORD_RESET']['EXPIRATION_TIME'] . " second)", [$password, $this->data->hash]);
        $this->response->error = $query['affectedRows'] == 0;
    }

    public function checkHash() {
        $hash = $this->db->query("SELECT reset_hash FROM " . FRAMEWORK['AUTH']['MODULES']['DEFAULT']['TABLE_NAME'] . " WHERE reset_hash = ? AND NOW() < DATE_ADD(reset_date, INTERVAL " . FRAMEWORK['AUTH']['PASSWORD_RESET']['EXPIRATION_TIME'] . " second)", [$this->data->hash]);
        $this->response->error = $hash['count'] == 0;
    }

    public function registerLookup() {
        foreach($this->data->config->rows as $key => $row) {
            if ($row->type == 'lookup') {
                $this->response->fields[$row->field] = $this->db->query("SELECT " . $row->field . ", IF (:LANG = 'de', " . $row->lookup->value_de . ", " .  $row->lookup->value_en . ") AS valueTrans FROM " . $row->lookup->table, ["LANG" => $this->data->lang])['data'];
            }
        }
    }

    public function checkValueExists() {
        $exists = $this->db->query("SELECT * FROM " . $this->data->config->tableName . " WHERE " . $this->data->field->field . " = ?", [$this->data->value]);

        $this->response->exists = $exists['count'] > 0;
    }

    public function register() {
        //debug($this->data, DEBUGTYPE_SPECIAL);
        $this->response->data = $this->data;

        unset($this->data->values->password_confirm);
        $this->data->values->active = 0;
        $this->data->values->reset_hash = substr(hash('sha256', mt_rand()), 20);
        $this->data->values->reset_date = Carbon::now()->add('hours', 3)->toDateTimeString();
        $this->data->values->password = password_hash($this->data->values->password, PASSWORD_DEFAULT);
        $this->data->values->public_id = vsprintf( '%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4) );

        $settings = [
            'field_list' => $this->data->values,
            'table' => $this->data->config->tableName,
            'index_name' => $this->data->config->tableIndexName,
            'write_history' => false,
            'output_insert' => false,
            'logUid' => $this->currentUser->uid,
            'logComponent' => $this->componentName,
            'logMethod' => $this->methodName
        ];
        $this->db->insert($settings);

        debug($this->data->values, DEBUGTYPE_SUCCESS);

        Mail::send($this->db, null, FRAMEWORK['EMAIL']['SMTP_USER'], FRAMEWORK['EMAIL']['SMTP_USER'], [$this->data->values->email, 'webmaster@river.guide'], "Registrierungsbestätigung", "
        <p>Hallo!<br>
           Es freut uns das du dir einen Zugang für river.guide erstellt hast, jetzt fehlt nur noch die Bestätigung deiner Emailadresse. Dann kannst du loslegen...
        </p>
        <p><a href='" . URL . "/home/" . $this->data->values->reset_hash . "'>Registrierung bestätigen</a></p>
        <br><br>
        <p>
            Hello!<br>
            We are pleased that you have created an account for river.guide, now all you have to do is confirm your email address. Then you can start...
        </p>
        <p><a href='" . URL . "/home/" . $this->data->values->reset_hash . "'>confirm registration</a></p>
        <br><br>");

        Mail::send($this->db, null, FRAMEWORK['EMAIL']['SMTP_USER'], FRAMEWORK['EMAIL']['SMTP_USER'], ['webmaster@river.guide'], "Neue Benutzerregistrierung durchgeführt", "
        <p>Folger Benutzer hat sich neu registriert:<br>
        </p>
        Public ID: <strong>". $this->data->values->public_id ."</strong></br>
        Benutzername: <strong>" . $this->data->values->username . "</strong></br>
        Email: <strong>" . $this->data->values->email . "</strong></br>
        REMOTE_HOST: <strong>". $this->get_client_ip() ."</strong></br>
        HTTP_USER_AGENT: <strong>". $_SERVER['HTTP_USER_AGENT'] ."</strong></br>
        HTTP_ACCEPT_LANGUAGE: <strong>". $_SERVER['HTTP_ACCEPT_LANGUAGE'] ."</strong></br>
        </table>");
    }

    public function checkRegistrationHash() {
        $this->response->loginField = FRAMEWORK['AUTH']['MODULES']['DEFAULT']['FIELD_LOGIN'];
        $result = $this->db->query("SELECT * FROM users WHERE reset_hash = ?", [$this->data->hash]);

        if ($result['count'] > 0) {
            if (Carbon::createFromFormat("Y-m-d H:i:s", $result['data'][0]['reset_date'])->greaterThan(Carbon::now())) {
                $this->db->query("UPDATE users SET active = 1, reset_hash = null, reset_date = null WHERE reset_hash = ?", [$this->data->hash]);
                $this->response->loginValue = $result['data'][0][FRAMEWORK['AUTH']['MODULES']['DEFAULT']['FIELD_LOGIN']];
                $this->response->checked = true;
            } else {
                Log::write(null, 'registration-error', 'Hash expired "' . $this->data->hash . '"', $this->componentName, $this->methodName, 'AuthController.php', 'checkRegistrationHash()');
            }
        } else {
            Log::write(null, 'registration-error', 'Hash not found "' . $this->data->hash . '"', $this->componentName, $this->methodName, 'AuthController.php', 'checkRegistrationHash()');
        }
    }

    private function get_client_ip() {
        $ipaddress = '';
        if (isset($_SERVER['HTTP_CLIENT_IP']))
            $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
        else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        else if(isset($_SERVER['HTTP_X_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
        else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
            $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
        else if(isset($_SERVER['HTTP_FORWARDED']))
            $ipaddress = $_SERVER['HTTP_FORWARDED'];
        else if(isset($_SERVER['REMOTE_ADDR']))
            $ipaddress = $_SERVER['REMOTE_ADDR'];
        else
            $ipaddress = 'UNKNOWN';
        return $ipaddress;
    }
}
