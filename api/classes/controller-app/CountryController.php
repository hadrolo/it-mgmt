<?php

class Country extends Controller {

    public function listAll() {
        if ($this->data->LANG == 'de') {
            $this->response->countrys = $this->db->query("SELECT CID, staat AS country FROM country ORDER BY country")['data'];

        } else {
            $this->response->countrys = $this->db->query("SELECT CID, staat_en AS country FROM country ORDER BY country")['data'];
        }
    }
}
