<?php

class Log
{

    public static function write($UID, $type, $text, $client_component, $client_method, $server_controller, $server_action): array
    {

        $db = Database::create(FRAMEWORK['MODULES']['LOG']['DB']);

        return $db->query("insert into " . FRAMEWORK['MODULES']['LOG']['TABLE_NAME'] . "
            (UID, APPID, type, text, environment, c_component, c_method, s_controller, s_action, ip, browser, created) values (
            :UID, :APPID, :type, :text, :environment, :c_component, :c_method, :s_controller, :s_action, :ip, :browser, NOW())", [
            'UID' => $UID,
            'APPID' => APP_NAME,
            'type' => $type,
            'text' => $text,
            'environment' => ENVIRONMENT,
            'c_component' => $client_component,
            'c_method' => $client_method,
            's_controller' => $server_controller,
            's_action' => $server_action,
            'ip' => $_SERVER['REMOTE_ADDR'],
            'browser' => $_SERVER['HTTP_USER_AGENT']
        ]);
    }

}
