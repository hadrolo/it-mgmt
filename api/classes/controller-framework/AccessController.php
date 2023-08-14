<?php

class Access extends Controller {

    public function listAPIs() {
        $this->response->apis = array_keys(CONTROLLER);

        if (count(FRAMEWORK['AUTH']['MODULES']) == 1) {
            $this->response->userTypes = FRAMEWORK['AUTH']['MODULES']['DEFAULT']['USERTYPE']['ROLES'];
        } else {
            $this->response->userTypes = [];

            foreach (FRAMEWORK['AUTH']['MODULES'] as $key => $module) {
                if ($key != 'DEFAULT') $this->response->userTypes = array_merge($this->response->userTypes, $module['USERTYPE']['ROLES']);
            }
        }
    }

    public function listAccessRules() {
        $dir = "classes/" . CONTROLLER[$this->data->api]['DIR'];
        $fileNames = array_diff(scandir($dir), ['..', '.']);
        require_once "classes/Controller.php";
        $controllers = [];
        foreach ($fileNames as $fileName) {
            require_once $dir . "/" . $fileName;
            $controllerName = str_replace("Controller.php", "", $fileName);
            $temp = [
                "name" => str_replace(".php", "", $fileName),
                "missing" => [],
                "rules" => []
            ];
            $methods = array_diff(get_class_methods($controllerName), ['__construct', 'getResponse']);
            foreach ($methods as $method) {
                if (!key_exists($method, CONTROLLER[$this->data->api]['ACCESS'][strtoupper($controllerName)])) {
                    $temp['missing'][] = $method;
                }
            }
            foreach (CONTROLLER[$this->data->api]['ACCESS'][strtoupper($controllerName)] as $key => $value) {
                $temp['rules'][] = [
                    "method" => $key,
                    "roles" => $value,
                    "exists" => method_exists($controllerName, $key)
                ];
            }
            $controllers[] = $temp;
        }
        $this->response->access = $controllers;
    }

}
