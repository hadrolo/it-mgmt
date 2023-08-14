<?php
const DEBUGTYPE_SUCCESS = "1;36";
const DEBUGTYPE_ERROR = "1;31";
const DEBUGTYPE_WARNING = "1;35";
const DEBUGTYPE_INFO = "0;34";
const DEBUGTYPE_DEFAULT = "1;37";
const DEBUGTYPE_DB_QUERY = "1;37";
const DEBUGTYPE_SPECIAL = "1;32";

// https://joshtronic.com/2013/09/02/how-to-use-colors-in-command-line-output/
function debug($data, $type = DEBUGTYPE_DEFAULT) {
    if (FW_LOG_DEBUG) {
        $bt = debug_backtrace()[0];
        if (ENVIRONMENT == 'local') {
            // use color codes locally
            error_log("\e[" . $type . "m" . str_replace($_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR, '', $bt['file']) . ' (' . $bt['line'] . ') - '
                . (is_object($data) || is_array($data) ? print_r($data, true) : $data) . "\e[0m");
        } else {
            if (WRITE_APACHE_ERROR_LOG) {
                error_log(str_replace($_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR, '', $bt['file']) . ' (' . $bt['line'] . ') - '
                    . (is_object($data) || is_array($data) ? print_r($data, true) : $data));
            }
        }
    }
}
