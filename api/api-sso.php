<?php
require_once "libs/vendor/autoload.php";
require_once "classes/Debug.php";
require_once "config-sso.inc.php";
require_once "classes/Database.php";
require_once "classes/Log.php";
require_once "classes/Mail.php";
require_once "classes/Translation.php";

use Firebase\JWT\JWT;

register_shutdown_function("fatal_handler"); // ToDo: Nötig??

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

$database = Database::create('APP');
$request_info = []; // ToDo: Nötig??

if ($database->getErrors()) {
    $response['error'] = $database->getErrors();
} else {
    $request = json_decode(file_get_contents("php://input"));

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

        if (isset($class) && isset($action)) {


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
                    //ebug($token, DEBUGTYPE_WARNING);

                    try {
                        $decoded = JWT::decode($token, $array_publicKeysWithKIDasArrayKey, ['RS256']);
                        $user = new stdClass();
                        $user->uid = $decoded->oid;
                        $user->role = $decoded->roles[0];
                        $user->family_name = $decoded->family_name;
                        $user->given_name = $decoded->given_name;
                        $user->name = $decoded->name;
                        $user->ip = $decoded->ipaddr;
                        $user->unique_name = $decoded->unique_name;
                        $user->upn = $decoded->upn;
                        $user->uid = $decoded->oid;
                        $user->token_iat = $decoded->iat;
                        $user->token_nbf = $decoded->nbf;
                        $user->token_exp = $decoded->exp;
                        $request->user = $user;
                        $request_info['user'] = $user;

                        $data = ['API' => 'API', 'ALIAS' => 'ALIAS', 'CLASS' => $class, 'METHOD' => $method];
                        $usertype = null;
                        foreach(FRAMEWORK['AUTH']['USERS'] as $type => $users){
                            foreach ($users as $id) {
                                if ($id == $user->uid) $usertype = $type;
                            }
                        }

                        if ($usertype == 'SYSADMIN'){
                            debug('Allow Access - Usertype "sysadmin" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_SUCCESS);
                            $object = new $class($database, $request->data, $request->componentName, $request->methodName, $user);
                            $object->$method();
                            $response = $object->getResponse();
                            $response->overrideUserType = $usertype;
                        } else{
                            if ($usertype) {
                                $data['USERTYPE'] = $usertype;
                            } else {
                                $data['USERTYPE'] = $user->role;
                            }
                            $database = Database::create('APP');
                            $result = $database->query("SELECT RGID, name, class, method FROM
                            (SELECT
                            r.RGID,
                            r.name,
                            r2.class,
                            r2.method
                            FROM rights AS r
                            LEFT JOIN rights_usertypes AS ru ON ru.RID=r.RID
                            LEFT JOIN users AS u ON u.usertype = ru.usertype
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
                            LEFT JOIN users AS u ON u.usertype = ru.usertype
                            WHERE ru.usertype = :USERTYPE AND r.type = :API  AND r.class = :CLASS AND r.method = :METHOD
                            ) t
                            GROUP BY name", $data);

                            $count = $result['count'];
                            if ($count > 0){
                                debug('Allow Access - Usertype "'.$usertype.'" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_SUCCESS);
                                $object = new $class($database, $request->data, $request->componentName, $request->methodName, $user);
                                $object->$method();
                                $response = $object->getResponse();
                                $response->overrideUserType = $data['USERTYPE'];
                                debug($response, DEBUGTYPE_ERROR);
                            } else{
                                debug('No access rights defined - Usertype "'.$usertype.'" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_ERROR);
                                $response = [];
                            }
                        }
                    } catch (UnexpectedValueException $e) {
                        $error = [$e->getMessage(), $e->getCode()];
                    }

                } else {
                    $response['warning'] = 'Unknown method "' . $method . '" for class "' . $class . '"';
                }
            } else {
                $response['warning'] = 'Unknown class "' . $class . '"';
            }
        } else {
            $response['warning'] = 'Wrong controller/action "' . $request->action . '"';
        }
    } else {
        $response['warning'] = 'No controller/action submitted';
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
