<?php
require_once "libs/vendor/autoload.php";
require_once "classes/Debug.php";
require_once "config-sso.php.inc";
require_once "classes/Database.php";
require_once "classes/Log.php";
require_once "classes/Mail.php";
require_once "classes/Translation.php";

use Firebase\JWT\JWT;

register_shutdown_function("fatal_handler"); // ToDo: Nötig??

$request_info = [];

function fatal_handler() {
    global $request_info, $response;
    $error = error_get_last();

    if ($error !== null) {
        Log::write(
            $request_info['user']->uid ?? null,
            'error' ,
            json_encode(str_replace("'", '"', $error)) ,
            $request_info['component'],
            $request_info['method'] ,
            $request_info['controller'] ,
            $request_info['action']
        );
        debug($error, DEBUGTYPE_ERROR);
    }
}

$response = new stdClass();

$content_type = explode(';', $_SERVER["CONTENT_TYPE"])[0];
$database = Database::create('APP');


if ($database->getErrors()) {
    $response->errors[] = $database->getErrors();
} else {
    if ($content_type == 'multipart/form-data') {
        $request = new stdClass();
        $request->action = $_POST['apiController'] ?? "framework.File/upload";
        $request->data = (object)['upload_files' => $_FILES['files'], 'upload_post' => $_POST];
        $request->methodName = $_POST['infoMethod'] ?? "onUpload()";
        $request->componentName = $_POST['infoComponent'] ?? "UploadComponent.ts";
    } else {
        $request = json_decode(file_get_contents("php://input"));
    }

    // get controller APP, FRAMEWORK, UNIVERSE
    if (property_exists($request, "action")) {
        $parts = explode(".", $request->action);
        if (count($parts) > 1) {
            $module = strtoupper($parts[0]);
            $action = $parts[1];
        } else {
            $module = "APP"; // TODO: set to DEFAULT_MODULE
            $action = $parts[0];
        }
        list($class, $method) = explode("/", $action);

        if (isset($class) && isset($method)) {


            // require controller
            require_once "classes/Controller.php";
            $path = "classes/" . FRAMEWORK['CONTROLLER']['DIRECTORIES'][$module] . "/{$class}Controller.php";

            if (file_exists($path)) {
                require_once $path;
            }

            if (class_exists($class)) {
                if (method_exists($class, $method)) {
                    $request_info['controller'] = $class;
                    $request_info['action'] = $method;
                    $request_info['component'] = $request->componentName;
                    $request_info['method'] = $request->methodName;

                    if (!isset($request->data)) $request->data = new \stdClass();

                    $headers = apache_request_headers();
                    if (isset($headers['authorization']))
                        $token = $headers['authorization']; //windows version
                    if (isset($headers['Authorization']))
                        $token = $headers['Authorization']; //linux version

                    $decoded = null;

                    $string_microsoftPublicKeyURL = 'https://login.windows.net/common/discovery/keys';
                    $array_publicKeysWithKIDasArrayKey = loadKeysFromAzure($string_microsoftPublicKeyURL);

                    $token = explode(" ", $token)[1];
                    //debug($token, DEBUGTYPE_WARNING);

                    // USER CHECK USERTYPE & ACCESS RIGHTS
                    $allowAccess = false;

                    // READ TOKEN
                    try {
                        $decoded = JWT::decode($token, $array_publicKeysWithKIDasArrayKey, ['RS256']);
                        $user = new stdClass();
                        $user->uid = $decoded->oid;
                        $user->fw_mode = 'SSO';
                        $user->family_name = $decoded->family_name;
                        $user->given_name = $decoded->given_name;
                        $user->name = $decoded->name;
                        $user->ip = $decoded->ipaddr;
                        $user->unique_name = $decoded->unique_name;
                        $user->email = $decoded->unique_name;
                        $user->upn = $decoded->upn;
                        $user->uid = $decoded->oid;
                        $user->token_iat = $decoded->iat;
                        $user->token_nbf = $decoded->nbf;
                        $user->token_exp = $decoded->exp;
                        $request->user = $user;
                        $request_info['user'] = $user;

                        $data = ['API' => 'API', 'ALIAS' => 'ALIAS', 'CLASS' => $class, 'METHOD' => $method];
                        $usertype = str_replace('-', '_', strtoupper($decoded->roles[0]));
                        foreach(FRAMEWORK['AUTH']['SSO_USERS_OVERWRITE'] as $type => $users){
                            foreach ($users as $id) {
                                if ($id == $user->uid) $usertype = $type;
                            }
                        }
                        $user->usertype = $usertype;

                        debug($user, DEBUGTYPE_WARNING);

                        // PERMANENT_ALLOWED_API from config-sso.inc.php
                        foreach (FRAMEWORK['AUTH']['PERMANENT_ALLOWED_API'] as $right){
                            $x=explode('/', $right);
                            if ($class==$x[0] && $method==$x[1]){
                                debug('PERMANENT_ALLOWED_API | API: ' . $class . '/' . $method . '()', DEBUGTYPE_SUCCESS);
                                $allowAccess = true;
                            }
                        }


                        if ($usertype == 'SYSADMIN'){
                            debug('Allow Access - Usertype "sysadmin" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_SUCCESS);
                            $allowAccess = true;
                        }

                        // Check rights from database
                        if (!$allowAccess){
                            $database = Database::create('APP');
                            $result = $database->query("SELECT RGID, name, class, method FROM
                                (SELECT
                                r.RGID,
                                r.name,
                                r2.class,
                                r2.method
                                FROM rights AS r
                                LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID
                                LEFT JOIN rights_alias AS ra ON ra.RID_alias = r.RID
                                LEFT JOIN rights AS r2 ON r2.RID = ra.RID_client
                                WHERE ru.usertype = :USERTYPE AND r2.type = :API AND r.type = :ALIAS AND r2.class = :CLASS AND r2.method = :METHOD
                                UNION ALL
                                SELECT
                                r.RGID,
                                r.name,
                                r.class,
                                r.method
                                FROM rights AS r
                                LEFT JOIN rights_groups AS rg ON rg.RGID=r.RGID
                                LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID
                                WHERE ru.usertype = :USERTYPE AND r.type = :API  AND r.class = :CLASS AND r.method = :METHOD
                                ) t
                                GROUP BY name", [
                                    'USERTYPE' => $user->usertype,
                                    'API' => 'API',
                                    'ALIAS' => 'ALIAS',
                                    'CLASS' => $class,
                                    'METHOD' => $method
                            ]);

                            $count = $result['count'];
                            if ($count == 0) {
                                debug('No access rights defined for method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_WARNING);
                            } else {
                                debug('Allow Access - Usertype "'.$usertype.'" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_SUCCESS);
                            }
                            $allowAccess = $count > 0;
                        }

                        if ($allowAccess){
                            $object = new $class($database, $request->data, $request->componentName, $request->methodName, $user);
                            $object->$method();
                            $response = $object->getResponse();
                            $response->overrideUserType = $user->usertype;
                        }else{
                            debug('No access rights defined - Usertype "'.$usertype.'" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_ERROR);
                            $response = [];
                        }
                    } catch (UnexpectedValueException $e) {
                        $error = [$e->getMessage(), $e->getCode()];
                        $response->errors[] = $error;
                        debug($error, DEBUGTYPE_ERROR);
                    }

                } else {
                    $response->errors[] = 'Unknown method "' . $method . '" for class "' . $class . '"';
                }
            } else {
                $response->errors[] = 'Unknown class "' . $class . '"';
            }
        } else {
            $response->errors[] = 'Wrong controller/action "' . $request->action . '"';
        }
    } else {
        $response->errors[] = 'No controller/action submitted';
    }
}

echo json_encode($response);

function loadKeysFromAzure($string_microsoftPublicKeyURL)
{
    $array_keys = array();

    $jsonString_microsoftPublicKeys = file_get_contents($string_microsoftPublicKeyURL);
    $array_microsoftPublicKeys = json_decode($jsonString_microsoftPublicKeys, true);

    foreach ($array_microsoftPublicKeys['keys'] as $array_publicKey) {
        $string_certText = "-----BEGIN CERTIFICATE-----\r\n" . chunk_split($array_publicKey['x5c'][0], 64) . "-----END CERTIFICATE-----\r\n";
        $array_keys[$array_publicKey['kid']] = getPublicKeyFromX5C($string_certText);
    }

    return $array_keys;
}

function getPublicKeyFromX5C($string_certText)
{
    $object_cert = openssl_x509_read($string_certText);
    $object_pubkey = openssl_pkey_get_public($object_cert);
    $array_publicKey = openssl_pkey_get_details($object_pubkey);
    return $array_publicKey['key'];
}
