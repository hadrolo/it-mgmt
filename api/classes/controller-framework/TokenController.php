<?php

require_once 'classes/TokenFactory.php';

class Token extends Controller {

    public function newAnonymous() {
        $this->response->jwt_token = TokenFactory::newToken(0);
        $this->nobodyUser();
    }

    public function refreshToken() {
        $this->response->jwt_token = TokenFactory::refreshToken($this->data->refreshToken);
        if ($this->response->jwt_token['anonymous']) {
            $this->nobodyUser();
        }
        debug('TOKEN REFRESHED', DEBUGTYPE_INFO);
    }

    // NOTE: This function also exists in AuthController
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
}
