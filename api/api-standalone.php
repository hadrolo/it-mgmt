<?php
require_once "libs/vendor/autoload.php";
require_once "classes/Debug.php";
require_once "config-standalone.inc.php";
require_once "classes/Database.php";
require_once "classes/Log.php";
require_once "classes/Mail.php";
require_once "classes/Translation.php";

use \Firebase\JWT\JWT;
use \Firebase\JWT\ExpiredException;

register_shutdown_function("fatal_handler");

$request_info = [];

function fatal_handler() {
    global $request_info, $response;

    $error = error_get_last();

    if ($error !== null) {
        // $server_controller = array_reverse(explode('/', $error['file']))[0];
        //if ($error['type'] == 1){
        Log::write(
            $request_info['currentUID'],
            'error' ,
            json_encode(str_replace("'", '"', $error)) ,
            $request_info['component'],
            $request_info['method'] ,
            $request_info['controller'] ,
            $request_info['action']
        );
        debug($error, DEBUGTYPE_ERROR);
        //} else {
        //    debug( 'WARNING: ' . print_r($error, true), DEBUGTYPE_WARNING);
        //}
    }
}

$response = new stdClass();

$content_type = explode(';', $_SERVER["CONTENT_TYPE"])[0];
if ($content_type == 'multipart/form-data') {
    $request = new stdClass();
    $request->action = isset($_POST['apiController']) ? $_POST['apiController'] : "framework.File/upload";
    $request->data = (object)['upload_files' => $_FILES['files'], 'upload_post' => $_POST];
    $request->methodName = isset($_POST['infoMethod']) ? $_POST['infoMethod'] : "onUpload()";
    $request->componentName = isset($_POST['infoComponent']) ? $_POST['infoComponent'] : "UploadComponent.ts";
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

function guard($module, $class, $method, $request) {
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
            $userData = [];
            foreach (FRAMEWORK['AUTH']['MODULES'] as $key => $mod) {
                if ($decoded->data->UID == 0) {
                    $userData[$mod['USERTYPE']['NAME']] = 'nobody';

                    $request_info[$mod['USERTYPE']['NAME']] = 'nobody';
                } else {
                    $database = Database::create($key);
                    $user = $database->query("SELECT " . $mod['USERTYPE']['NAME'] . " FROM " . $mod['TABLE_NAME'] . " WHERE UID = ?", [$decoded->data->UID])['data'][0];
                    $userData[$mod['USERTYPE']['NAME']] = $user[$mod['USERTYPE']['NAME']];

                    $request_info[$mod['USERTYPE']['NAME']] = $user[$mod['USERTYPE']['NAME']];
                }
            }

            if (!FRAMEWORK['CONTROLLER']['RIGHTS_ENABLED'] ||
                (isset($request_info['universetype']) && strtoupper($request_info['universetype']) == 'SYSADMIN') ||
                (isset($request_info['usertype']) && strtoupper($request_info['usertype']) == 'SYSADMIN')) {
                $count = 1;

                if (!FRAMEWORK['CONTROLLER']['RIGHTS_ENABLED']) {
                    debug('RIGHTS CHECK IS NOT ENABLED!', DEBUGTYPE_WARNING);
                }
            } else {
                $data = ['API' => 'API', 'ALIAS' => 'ALIAS', 'CLASS' => $class, 'METHOD' => $method];
                if (intval($decoded->data->UID) > 0) {
                    $data['UID'] = $decoded->data->UID;
                } else {
                    $data['USERTYPE'] = 'NOBODY';
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
                    WHERE " . ( (intval($decoded->data->UID) > 0) ? "u.UID = :UID" : "ru.usertype = :USERTYPE" ) . " AND r2.type = :API AND r.type = :ALIAS AND r2.class = :CLASS AND r2.method = :METHOD
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
                    WHERE " . ( (intval($decoded->data->UID) > 0) ? "u.UID = :UID" : "ru.usertype = :USERTYPE" ) . " AND r.type = :API  AND r.class = :CLASS AND r.method = :METHOD
                    ) t
                    GROUP BY name", $data);

                $count = $result['count'];
                if ($count == 0) {
                    debug('No access rights defined for method "' . $method . '" in class "' . $class . '"', DEBUGTYPE_WARNING);
                }
            }

            $allowAccess = $count > 0;

            // aggregate roles - only used for debug output
            $roles = [];
            foreach(FRAMEWORK['AUTH']['MODULES'] as $key => $mod) {
                $roles[] = $mod['USERTYPE']['NAME'] . ": " . $userData[$mod['USERTYPE']['NAME']];
            }

            foreach (FRAMEWORK['AUTH']['PERMANENT_ALLOWED_API'] as $right){
                $x=explode('/', $right);
                if ($class==$x[0] && $method==$x[1]){
                    debug('PERMANENT_ALLOWED_API | API: ' . $class . '/' . $method . '()', DEBUGTYPE_SUCCESS);
                    $allowAccess = true;
                }
            }

            if (!$allowAccess) {
                debug('ACCESS DENIED - MODULE: ' . $module . ' | API: ' . $class . '/' . $method . '() | ' . join(", ", $roles) . ' | CLIENT: ' . $request->componentName . '/' . $request->methodName, DEBUGTYPE_ERROR);
                Log::write(
                    $decoded->data->UID,
                    'access-violation',
                    'Class: api.php | ' . join(", ", $roles),
                    $request->componentName,
                    $request->methodName,
                    $class . 'Controller.php',
                    $method . '()');
                $response->errors[] = 'ACCESS DENIED';
                if (ENVIRONMENT == 'production') header('HTTP/1.1 401 Unauthorized');
            } else {
                debug('ACCESS - MODULE: ' . $module . ' | API: ' . $class . '/' . $method . '() | ' . join(", ", $roles) . ' | CLIENT: ' . $request->componentName . '/' . $request->methodName, DEBUGTYPE_SUCCESS);

                if ($module == "FRAMEWORK") {
                    // don't instantiate a database for generic framework methods

                    $object = new $class(null, $request->data, $request->componentName, $request->methodName, $decoded->data->UID);
                    $object->$method();
                    $response = $object->getResponse();
                } else {
                    // instantiate database for module
                    $database = Database::create($module);

                    $object = new $class($database, $request->data, $request->componentName, $request->methodName, $decoded->data->UID);
                    $object->$method();
                    $response = $object->getResponse();

                    if ($database->getErrors()) {
                        $response->errors = $database->getErrors();
                    }
                }
            }
        } else {
            debug('NO BEARER - HTTP/1.1 401 Unauthorized', DEBUGTYPE_ERROR);
            header('HTTP/1.1 401 Unauthorized');
        }
    } catch (ExpiredException $e) {
        debug('TOKEN EXPIRED - HTTP/1.1 401 Unauthorized', DEBUGTYPE_WARNING);
        header('HTTP/1.1 401 Unauthorized');
    } catch (UnexpectedValueException $e) {
        debug('INVALID TOKEN - HTTP/1.1 401 Unauthorized', DEBUGTYPE_ERROR);
        header('HTTP/1.1 401 Unauthorized');
    }
}

echo json_encode($response);

