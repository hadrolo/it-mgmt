<?php
// ERROR REPORTING
const FW_LOG_DEBUG = true; //show php error_log()
const FW_LOG_QUERIES = true; //show php api querys
const WRITE_APACHE_ERROR_LOG = true;

error_reporting(E_ALL);
ini_set('display_errors', 0);  // must set to 0

// APP SETTINGS
const APP_NAME = 'IT-Mgmt'; // MUST SET TO APP_NAME (app table)
define("SERVER_ROOT", $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR);

// DATABASE SETTINGS
$parts = explode(DIRECTORY_SEPARATOR, $_SERVER['DOCUMENT_ROOT']);
$path = end($parts);

switch ($path) {
    case 'it-mgmt':
        define("DB", [
            'APP' => ['HOST' => 'localhost', 'USER' => 'root', 'PASS' => '!D3tl3f!', 'DB_NAME' => 'it-mgmt', 'PORT' => 33009],
            'FRAMEWORK' => ['HOST' => 'localhost', 'USER' => 'root', 'PASS' => '!D3tl3f!', 'DB_NAME' => 'it-mgmt', 'PORT' => 33009],
            'UNIVERSE' => ['HOST' => '127.0.0.1', 'USER' => 'universe-app', 'PASS' => 'd3tl3fd3tl3f', 'DB_NAME' => 'universe', 'PORT' => 33009],
        ]);
        define("ENVIRONMENT", "local");
        define("ASSET_ROOT", SERVER_ROOT . "src/assets/");
        define("URL", "http://localhost:5460" . DIRECTORY_SEPARATOR);
        define("SMTP_SERVER", "localhost");
        define("SMTP_USER", "");
        define("API_ERROR", true);
        define("API_ERROR_MISSING_VARIABLES", true);
        break;
    default:
        define("DB", [
            'APP' => ['HOST' => 'localhost', 'USER' => 'it-mgmt', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'it-mgmt', 'PORT' => 33009],
            'FRAMEWORK' => ['HOST' => 'localhost', 'USER' => 'it-mgmt', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'it-mgmt', 'PORT' => 33009],
            'UNIVERSE' => ['HOST' => '127.0.0.1', 'USER' => 'universe-app', 'PASS' => 'd3tl3fd3tl3f', 'DB_NAME' => 'universe', 'PORT' => 33009],
        ]);
        define("ENVIRONMENT", "production");
        define("ASSET_ROOT", SERVER_ROOT . "assets/");
        define("URL", "https://claims2.sih.cloud" . DIRECTORY_SEPARATOR);
        define("SMTP_SERVER", "10.2.1.50");
        define("SMTP_USER", "e.hadrbolec@sih.co.at");
        define("API_ERROR", true);
        define("API_ERROR_MISSING_VARIABLES", false);
        break;
}

// FRAMEWORK SETTINGS
const FRAMEWORK = [
    'CONTROLLER' => [
        'RIGHTS_ENABLED' => true,
        'DIRECTORIES' => [
            'FRAMEWORK' => 'controller-framework',
            'APP' => 'controller-app',
            'UNIVERSE' => 'controller-universe',
        ]
    ],
    'MODULES' => [
        'LOG' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'log',
        ],
        'RIGHT' => [
            'DB' => 'FRAMEWORK',
            'PERMANENT_ALLOWED_API' => [
                /* FRAMEWORK -------------------- */
                'Token/newAnonymous',
                'Token/refreshToken',
                'Auth/isLoggedIn',
                'Auth/login',
                'Auth/logout',
                'Auth/register',
                'Auth/registerLookup',
                'Auth/checkRegistrationHash',
                'Auth/checkHash',
                'Storage/getAuto',
                'Storage/getData',
                'Storage/setData',
                'Logfile/write',
                'Country/listAll',
                'Email/send',
                'Table/groupAlpha',
                'Table/getTableInfo',
                'Table/listAll',
                'Table/exportXLS',
                'Right/loadCurrentRights',
                /* APP ---------------------------*/
                'User/getOwnUserProfile',
                'User/updateOwnUser',
            ]
        ],
        'AUTH' => [
            /* Hier kann die Azure User-Benutzergruppe zum testen mit der Benutzer OID überschrieben werden */
            /*
                eha '6e180a3d-6716-4a2c-9155-fafdd329e479'
                aze 'b13a37d7-a651-4125-b5e6-02fcc3de03bc'
            */
            'SSO_USERS_OVERWRITE' => [
                'SYSADMIN' => ['6e180a3d-6716-4a2c-9155-fafdd329e479'],
                'FIELD_STAFF' => [],
                'ADMIN' => []
            ],
        ],
        'STORAGE' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'storage',
        ],
        'HISTORY' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'history',
            'USERNAME' => ['firstname', 'lastname']
        ],
        'FILE' => [
            'GLOBAL' => [
                'DB' => 'FRAMEWORK',
                'PATH' => SERVER_ROOT . 'data' . DIRECTORY_SEPARATOR,
                'PATH_MIME_PICS' => SERVER_ROOT . 'data' . DIRECTORY_SEPARATOR . 'mime-pics' . DIRECTORY_SEPARATOR,
                'MAX_FOLDER_ITEMS' => 100,
                'TABLE_NAME' => 'files',
                'ENCRYPT_KEY' => 'a61c2eca2042a96013c1a8b464c36bf5d7ff0710408af37bb88a871305dc540a',
            ],
            'RESIZE' => [
                'THUMB' => ['X' => 150, 'Y' => 150],
                'S' => 600,
                'M' => 1024,
                'L' => 1280,
                'XL' => 1600
            ],
            'DOCTYPES' => [
                'claim' => [
                    'PATH' => 'claims' . DIRECTORY_SEPARATOR,
                    'IMAGE_RESIZE' => ['orig', 'thumb'], /* 'orig', 'thumb' ,'s', 'm', 'l', 'xl' */
                    'ENCRYPT_FILES' => true
                ],
                'claim-result' => [
                    'PATH' => 'claims-result' . DIRECTORY_SEPARATOR,
                    'IMAGE_RESIZE' => ['orig', 'thumb'], /* 'orig', 'thumb' ,'s', 'm', 'l', 'xl' */
                    'ENCRYPT_FILES' => true
                ],
                'task' => [
                    'PATH' => 'task' . DIRECTORY_SEPARATOR,
                    'IMAGE_RESIZE' => ['orig', 'thumb'], /* 'orig', 'thumb' ,'s', 'm', 'l', 'xl' */
                    'ENCRYPT_FILES' => true
                ],
            ],
        ],
        'EMAIL' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'mail_log',
            'SMTP_SERVER' => SMTP_SERVER,
            'SMTP_USER' => SMTP_USER,
            'SMTP_PORT' => 25,
            'SMTP_AUTH' => false,
            'SMTP_PASS' => '',
            'SMTP_SECURE' => '',
            'ENABLE_LOG' => true
        ]
    ]
];

