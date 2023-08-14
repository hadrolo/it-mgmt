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
            'DEFAULT' => ['HOST' => '127.0.0.1', 'USER' => 'universe-app', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'universe', 'PORT' => '33009'],
            'UNIVERSE' => ['HOST' => '127.0.0.1', 'USER' => 'universe-app', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'universe', 'PORT' => '33009'],
            'APP' => ['HOST' => 'localhost', 'USER' => 'universe-app', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'claim', 'PORT' => '33009']
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
            'DEFAULT' => ['HOST' => 'localhost', 'USER' => 'universe', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'universe'],
            'UNIVERSE' => ['HOST' => 'localhost', 'USER' => 'universe', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'universe'],
            'APP' => ['HOST' => 'localhost', 'USER' => 'claim', 'PASS' => 'gjjFiytz_w]j8IPR', 'DB_NAME' => 'claim']
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
    'LOG' => [
        'DB' => 'DEFAULT',
        'TABLE_NAME' => 'users_log',
    ],
    'AUTH' => [
        'JWT_KEY' => 'c5c979afcb0be8867e740eba557c792f22de0c333d8807dfddb8de81b65beea3',
        'ACCESS_TOKEN_TIME' => 300, // Sekunden
        'REFRESH_TOKEN_TIME' => 3600, // Sekunden
        'PASSWORD_RESET' => [
            'FIELD_CHECK' => 'username',
            'EXPIRATION_TIME' => 600, // Sekunden
            'ROUTERLINK' => 'reset-password'
        ],
        'MODULES' => [
            'DEFAULT' => [
                'DB' => 'universe',
                'TABLE_NAME' => 'users',
                'FIELD_LOGIN' => 'username',
                'RESPONSE_FIELDS' => ['firstname' => null, 'lastname' => null, 'username' => null, 'email' => null, 'language' => null],
                'USERTYPE' => [
                    'NAME' => 'universetype',
                    'ROLES' => ['SYSADMIN', 'INT', 'EXT']
                ]
            ],
            'APP' => [
                'DB' => 'claim',
                'TABLE_NAME' => 'M_users',
                'RESPONSE_FIELDS' => ['SAID' => null, 'CID' => 0],
                'USERTYPE' => [
                    'NAME' => 'usertype',
                    'ROLES' => [
                        'GROUP_ADMIN',
                        'ADMIN',
                        'ORDER_SERVICE',
                        'TEAM_LEADER',
                        'FIELD_STAFF',
                        'LABORATORY',
                        'PRODUCTION',
                        'INVOICING']
                ]
            ]
        ]
    ],
    'HISTORY' => [
        'DB' => 'APP',
        'TABLE_NAME' => 'history',
        'USERNAME' => ['firstname', 'lastname']
    ],
    'FILE' => [
        'GLOBAL' => [
            'DB' => 'APP',
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
        'SMTP_SERVER' => SMTP_SERVER,
        'SMTP_USER' => SMTP_USER,
        'SMTP_PORT' => 25,
        'SMTP_AUTH' => false,
        'SMTP_PASS' => '',
        'SMTP_SECURE' => '',
        'ENABLE_LOG' => true,
        'DB' => 'APP',
        'TABLE_NAME' => 'mail_log',
    ]
];

