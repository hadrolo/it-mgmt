<?php
// ERROR REPORTING
const FW_LOG_DEBUG = true; //show php error_log()
const FW_LOG_QUERIES = true; //show php api querys
const WRITE_APACHE_ERROR_LOG = true;

error_reporting(E_ALL);
ini_set('display_errors', 0);  // must set to 0

// APP SETTINGS//
const APP_NAME = 'IT-Mgmt';   // MUST SET TO APP_NAME (app table)

define("SERVER_ROOT", $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR);
error_reporting(E_ALL);

// DATABASE SETTINGS
$parts = explode(DIRECTORY_SEPARATOR, $_SERVER['DOCUMENT_ROOT']);
$path = end($parts);

switch ($path) {
    case 'it-mgmt':
        define('DB', [
            'APP' => ['HOST' => 'localhost', 'USER' => 'root', 'PASS' => '!D3tl3f!', 'DB_NAME' => 'it-mgmt', 'PORT' => 33009],
            'FRAMEWORK' => ['HOST' => 'localhost', 'USER' => 'root', 'PASS' => '!D3tl3f!', 'DB_NAME' => 'it-mgmt', 'PORT' => 33009],
            'UNIVERSE' => ['HOST' => '127.0.0.1', 'USER' => 'universe-app', 'PASS' => 'd3tl3fd3tl3f', 'DB_NAME' => 'universe', 'PORT' => 33009],
        ]);
        define("ENVIRONMENT", "local");
        define("ASSET_ROOT", SERVER_ROOT . "src/assets/");
        define("URL", "http://localhost:4556" . DIRECTORY_SEPARATOR);
        define("SMTP_SERVER", "localhost");
        define("API_ERROR", true);
        define("API_ERROR_MISSING_VARIABLES", true);
        break;
    default:
        define('DB', [
            'APP' => ['HOST' => 'localhost', 'USER' => 'it-mgmt', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'it-mgmt', 'PORT' => 33009],
            'FRAMEWORK' => ['HOST' => 'localhost', 'USER' => 'it-mgmt', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'it-mgmt', 'PORT' => 33009],
            'UNIVERSE' => ['HOST' => '127.0.0.1', 'USER' => 'universe-app', 'PASS' => 'd3tl3fd3tl3f', 'DB_NAME' => 'universe', 'PORT' => 33009],
        ]);
        define("ENVIRONMENT", "production");
        define("ASSET_ROOT", SERVER_ROOT . "assets/");
        define("URL", "https://it-mgmt.sih.co.at" . DIRECTORY_SEPARATOR);
        define("SMTP_SERVER", "192.168.50.11");
        define("API_ERROR", true);
        define("API_ERROR_MISSING_VARIABLES", false);
        break;
}

// FRAMEWORK SETTINGS
const FRAMEWORK = [
    'CRYPTO_KEY' => 'c301a186-daa7-4d5b-b35d-6472234ef950',
    'CONTROLLER' => [
        'RIGHTS_ENABLED' => true,
        'DIRECTORIES' => [
            'FRAMEWORK' => 'controller-framework',
            'APP' => 'controller-app',
            'UNIVERSE' => 'controller-universe',
        ]
    ],
    'MODULES' => [
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
            'JWT_KEY' => 'e2b55787-8581-4d54-8000-3a73481d9cf0',
            'ACCESS_TOKEN_TIME' => 60 . 12,   // Sekunden
            'REFRESH_TOKEN_TIME' => 60 . 10, // Sekunden
            'PASSWORD_RESET' => [
                'FIELD_CHECK' => 'email',
                'EXPIRATION_TIME' => 600, // Sekunden
                'ROUTERLINK' => 'reset-password'
            ],
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'users',
            'FIELD_LOGIN' => 'username',
            'RESPONSE_FIELDS' => [
                'username' => null,
                'firstname' => null,
                'lastname' => null,
                'email' => null,
                'language' => null,
            ],
            'USERTYPE' => [
                'NAME' => 'usertype',
                'ROLES' => ['SYSADMIN', 'ADMIN', 'USER']
            ]
        ],
        'HISTORY' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'history',
            'USERNAME' => ['username']
        ],
        'FILE' => [
            'GLOBAL' => [
                'DB' => 'FRAMEWORK',
                'PATH' => SERVER_ROOT . 'data' . DIRECTORY_SEPARATOR,
                'PATH_MIME_PICS' => SERVER_ROOT . 'data' . DIRECTORY_SEPARATOR . 'mime-pics' . DIRECTORY_SEPARATOR,
                'MAX_FOLDER_ITEMS' => 100,
                'TABLE_NAME' => 'files',
                'ENCRYPT_KEY' => 'b5168d3d-6726-490d-83d1-ba7be3d35107'
            ],
            'RESIZE' => [
                'THUMB' => ['X' => 150, 'Y' => 150],
                'S' => 600,
                'M' => 1024,
                'L' => 1280,
                'XL' => 1600
            ],
            'DOCTYPES' => [
                'user' => [
                    'PATH' => 'user' . DIRECTORY_SEPARATOR,
                    'IMAGE_RESIZE' => ['orig', 'm', 'thumb'], /* 'orig', 'thumb' ,'s', 'm', 'l', 'xl' */
                    'ENCRYPT_FILES' => true
                ],
            ]
        ],
        'TAG' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'sys_tag',
            'TABLE_NAME_GROUP' => 'sys_tag_group'
        ],
        'STORAGE' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'storage',
        ],
        'FAVORITE' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'favorite',
        ],
        'INTRO' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'intro_data',
        ],
        'LOG' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'log',
            'FIELD_APP_INDEX' => ''
        ],
        'EMAIL' => [
            'DB' => 'FRAMEWORK',
            'TABLE_NAME' => 'mail_log',
            'SMTP_SERVER' => SMTP_SERVER,
            'SMTP_AUTH' => false,
            'SMTP_USER' => 'noreply@weev.at',
            'SMTP_PASS' => null,
            'SMTPAutoTLS' => false,
            'SMTP_SECURE' => false,
            'SMTP_PORT' => 25,
            'ENABLE_LOG' => true
        ],
    ]
];
