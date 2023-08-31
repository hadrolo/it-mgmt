<?php
require_once "libs/vendor/autoload.php";
require_once "classes/Debug.php";
require_once "config-standalone.php.inc";
require_once "classes/Database.php";
require_once "classes/Log.php";
require_once "classes/Mail.php";
require_once "classes/Translation.php";

use \Firebase\JWT\JWT;
use \Firebase\JWT\ExpiredException;

register_shutdown_function("fatal_handler");

$request_info = [];

function fatal_handler()
{
    global $request_info, $response;

    $error = error_get_last();

    if ($error !== null) {
        Log::write(
            $request_info['currentUID'],
            'error',
            json_encode(str_replace("'", '"', $error)),
            $request_info['component'],
            $request_info['method'],
            $request_info['controller'],
            $request_info['action']
        );
        debug($error, DEBUGTYPE_ERROR);
    }
}

$response = new stdClass();

$content_type = explode(';', $_SERVER["CONTENT_TYPE"])[0];
if ($content_type == 'multipart/form-data') {
    $request = new stdClass();
    $request->action = $_POST['apiController'] ?? "framework.File/upload";
    $request->data = (object)['upload_files' => $_FILES['files'], 'upload_post' => $_POST];
    $request->methodName = $_POST['infoMethod'] ?? "onUpload()";
    $request->componentName = $_POST['infoComponent'] ?? "UploadComponent.ts";
} else {
    $request = json_decode(file_get_contents("php://input"));
}

if (property_exists($request, "action")) {

    // get controller
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

                // set empty object for data if not set
                if (!property_exists($request, "data")) {
                    $request->data = new stdClass();
                }

                if ($module == "FRAMEWORK") {
                    if ($class == 'Token') {
                        // FRAMEWORK MODULE WITHOUT TOKEN
                        debug('ACCESS (PERMANENT) - MODULE: ' . $module . ' | API: ' . $class . '/' . $method . '() | CLIENT: ' . $request->componentName . '/' . $request->methodName, DEBUGTYPE_SUCCESS);
                        $object = new $class(null, $request->data, $request->componentName, $request->methodName, null);
                        $object->$method();
                        $response = $object->getResponse();

                        // 'logout' is set to true when the refresh token has expired
                        // TODO: not used, remove?
                        if (isset($response->logout) && $response->logout == true) {
                            debug('HTTP/1.1 400 Bad Request', DEBUGTYPE_WARNING);
                            header('HTTP/1.1 400 Bad Request');
                        }
                    } else {
                        // FRAMEWORK MODULE WITH TOKEN
                        guard($module, $class, $method, $request);
                    }
                } else {
                    // OTHER MODULES WITH TOKEN
                    guard($module, $class, $method, $request);
                }
            } else {
                debug('Unknown method "' . $method . '" for class "' . $class . '" in module "' . $module . "'", DEBUGTYPE_ERROR);
                $response->errors[] = 'Unknown method "' . $method . '" for class "' . $class . '"';
            }
        } else {
            debug('Unknown class "' . $class . '" in module "' . $module . "'", DEBUGTYPE_ERROR);
            $response->errors[] = 'Unknown class "' . $class . '"';
        }
    } else {
        debug('Wrong controller/action "' . $request->action . '"', DEBUGTYPE_ERROR);
        $response->errors[] = 'Wrong controller/action "' . $request->action . '"';
    }

} else {
    debug('No controller/action submitted', DEBUGTYPE_ERROR);
    $response->errors[] = 'No controller/action submitted';
}

function guard($module, $class, $method, $request)
{
    global $response, $request_info;

    $headers = apache_request_headers();
    $auth = null;
    if (isset($headers['authorization'])) $auth = $headers['authorization']; // Windows
    if (isset($headers['Authorization'])) $auth = $headers['Authorization']; // Linux

    try {
        $decoded = $auth != null ? JWT::decode(explode(" ", $auth)[1], FRAMEWORK['AUTH']['JWT_KEY'], array('HS256')) : null;
        if ($decoded != null) {

            $request_info['currentUID'] = $decoded->data->UID;

            // USER CHECK USERTYPE & ACCESS RIGHTS
            $allowAccess = false;

            // get usertype for every module
            // $userData = [];

            $user = new stdClass();
            //$decoded->data->UID = 1; //todo: overwrite löschen! <----------------------------------------------------------------------------------------------------------------------------------------------------

            foreach (FRAMEWORK['AUTH']['MODULES'] as $key => $mod) {
                if (intval($decoded->data->UID) == 0) {
                    $user->uid = null;
                    $user->public_uid = null;
                    $user->fw_mode = 'STANDALONE';
                    $user->family_name = null;
                    $user->given_name = null;
                    $user->name = null;
                    $user->email = null;
                    $user->uid = null;
                    $user->usertype = 'NOBODY';
                    // $userData[$mod['USERTYPE']['NAME']] = 'nobody';
                    // $request_info[$mod['USERTYPE']['NAME']] = 'nobody';
                } else {
                    $database = Database::create($key);
                    $userRequest = $database->query("SELECT u.UID,
                        u.public_id,
                        u.CID,
                        u.language,
                        u.usertype,
                        u.username,
                        u.firstname,
                        u.lastname,
                        u.email
                        FROM " . $mod['TABLE_NAME'] . " as u WHERE UID = ?", [$decoded->data->UID]);

                    if ($userRequest['count'] > 0) {
                        $user->uid = $userRequest['data'][0]['UID'];
                        $user->cid = $userRequest['data'][0]['CID'];
                        $user->public_uid = $userRequest['data'][0]['public_id'];
                        $user->fw_mode = 'STANDALONE';
                        $user->family_name = $userRequest['data'][0]['lastname'];
                        $user->given_name = $userRequest['data'][0]['firstname'];
                        $user->name = $userRequest['data'][0]['lastname'] . ' ' . $userRequest['data'][0]['firstname'];
                        $user->email = $userRequest['data'][0]['email'];
                        $user->usertype = strtoupper($userRequest['data'][0]['usertype']);
                    } else {
                        debug('ACCESS DENIED - Token UID not found in Table', DEBUGTYPE_ERROR);
                        Log::write(
                            $decoded->data->UID,
                            'access-violation',
                            'Class: api.php | ACCESS DENIED - Token UID not found in Table',
                            $request->componentName,
                            $request->methodName,
                            $class . 'Controller.php',
                            $method . '()');
                        $response->errors[] = 'ACCESS DENIED';
                    }

                    // $userData[$mod['USERTYPE']['NAME']] = $user[$mod['USERTYPE']['NAME']];
                    // $request_info[$mod['USERTYPE']['NAME']] = $user[$mod['USERTYPE']['NAME']];
                }
            }

            debug($user, DEBUGTYPE_WARNING);

            // PERMANENT_ALLOWED_API from config-sso.inc.php
            foreach (FRAMEWORK['AUTH']['PERMANENT_ALLOWED_API'] as $right) {
                $x = explode('/', $right);
                if ($class == $x[0] && $method == $x[1]) {
                    debug('PERMANENT_ALLOWED_API | API: ' . $class . '/' . $method . '()', DEBUGTYPE_SUCCESS);
                    $allowAccess = true;
                }
            }

            // Usertype = SYSADMIN
            if ($user->usertype == 'SYSADMIN') {
                debug('Allow Access - Usertype "sysadmin" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_SUCCESS);
                $allowAccess = true;
            }

            if (!$allowAccess) {
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
                    debug('Allow Access - Usertype "' . $user->usertype . '" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_SUCCESS);
                }
                $allowAccess = $count > 0;
            }

            if ($allowAccess) {
                $object = new $class($database, $request->data, $request->componentName, $request->methodName, $user);
                $object->$method();
                $response = $object->getResponse();
                //$response->overrideUserType = $user->usertype;
            } else {
                debug('No access rights defined - Usertype "' . $user->usertype . '" - method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_ERROR);
                $response = [];
            }
        } else {
            debug('NO BEARER - HTTP/1.1 401 Unauthorized', DEBUGTYPE_ERROR);
            $response->errors[] = 'HTTP/1.1 401 Unauthorized';
            header('HTTP/1.1 401 Unauthorized');
        }
    } catch (ExpiredException $e) {
        debug('TOKEN EXPIRED - HTTP/1.1 401 Unauthorized', DEBUGTYPE_WARNING);
        $response->errors[] = 'HTTP/1.1 401 Unauthorized';
        header('HTTP/1.1 401 Unauthorized');
    } catch (UnexpectedValueException $e) {
        debug('INVALID TOKEN - HTTP/1.1 401 Unauthorized', DEBUGTYPE_ERROR);
        $response->errors[] = 'HTTP/1.1 401 Unauthorized';
        header('HTTP/1.1 401 Unauthorized');
    }
}

echo json_encode($response);

