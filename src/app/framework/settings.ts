import {FwLoginType, FwMode, FwSettingAuthType, FwSettings, FwUserDisplayStyle} from './services/settings.service';
import {environment} from '../../environments/environment';

interface FwLanguage {
    short: string;
    icon: string;
    text: string;
    iso3: string;
}

export const FwLanguages: FwLanguage[] = [
    {
        short: 'de',
        icon: 'flag-icon-de',
        text: 'Deutsch',
        iso3: 'aut'
    },
    {
        short: 'en',
        icon: 'flag-icon-gb',
        text: 'English',
        iso3: 'gbr'
    },
    {
        short: 'fr',
        icon: 'flag-icon-fr',
        text: 'Français',
        iso3: 'fra'
    },
];

export enum FwUserType {
    SYSADMIN = 'SYSADMIN',
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export interface FwUser {
    UID?: string;
    CID?: string;
    SAID?: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    language?: string|any;
    app_cid?: string;
    usertype?: FwUserType|any;
    loggedIn?: boolean;
    public_id?: string;
    jobTitle?: string;
}

export interface FwOpenData {
    ID: string;
    viewMode: any;
    formName?: string;
}

export enum FwApiUrl{
    'SSO' = 'api/api-sso.php',
    'STANDALONE' = 'api/api-standalone.php',

}

export const standaloneConfig: FwSettings = null;
/*export const standaloneConfig: FwSettings = {
    production: environment.production,
    apiUrl: FwApiUrl.SSO,
    frameworkMode: FwMode.SSO,
    appID: 'it-mgmt',
    appName: 'IT-Mgmt',
    urlDataFallbackLink: '/dashboard',
    cryptoKey: 'FbcCCFBwfY2yAL4UE9RBJxxjVC+6kJ4d',
    auth: {
        type: FwSettingAuthType.STANDALONE,
        loginType: FwLoginType.VIEW,
        loginField: 'FW.LOGIN.USERNAME',
        loginDestination: '/login',
        afterLoginDestination: '/dashboard',
        afterLogoutDestination: 'login',
        googleRecaptcha: false,
        googleRecaptchaSiteKey: '',
        jwtKeyName: '60ff6ae99f',
        jwtStorageCookie: {
            domain: environment.cookieDomain,
            expiresDays: null
        },
        translateUsertype: true,
        interceptorWhitelist: [],
        passwordReset: {
            modalTitle: 'FW.PASSWORD_RESET.MODAL_TITLE',
            modalText: 'FW.PASSWORD_RESET.MODAL_TEXT',
            modalPlaceholder: 'FW.PASSWORD_RESET.MODAL_PLACEHOLDER',
            modalConfirmation: 'FW.PASSWORD_RESET.MODAL_CONFIRMATION',
            buttonConfirm: 'FW.PASSWORD_RESET.BUTTON_CONFIRM',
            buttonCancel: 'FW.PASSWORD_RESET.BUTTON_CANCEL',
            errorMessage: 'FW.PASSWORD_RESET.MSG_ERROR'
        },
        logoutAutomatic: {
            enabled: true,
            inactivityTime: 300000,
            logoutCountDown: 10,
        },
        register: {
            config: {
                tableName: 'users',
                tableIndexName: 'UID',
                cancelRouterLink: '/',
                saveRouterLink: '/',
                saveLabel: 'USER.REGISTRATION_CONFIRMATION_MESSAGE',
                saveLabelFields: ['email', 'username']
            },
            buttons: [
                {
                    valueTrans: 'FW.REGISTER.BUTTON_REGISTER_NOW',
                    buttonClass: 'btn-success',
                    iconClass: 'fas fa-check',
                    type: 'confirm',
                    captcha: true
                },
                {
                    valueTrans: 'FW.BUTTON.CANCEL',
                    buttonClass: 'btn-dark ml-3',
                    iconClass: 'fas fa-times',
                    type: 'cancel',
                }
            ],
            rows: [
                {
                    valueTrans: 'USER.PASSWORD',
                    field: 'password',
                    type: 'password',
                    minLength: 8,
                },
                {
                    valueTrans: 'USER.PASSWORD',
                    field: 'password_confirm',
                    type: 'password',
                    minLength: 8,
                },
                {
                    valueTrans: 'USER.EMAIL',
                    field: 'email',
                    type: 'email',
                    required: true,
                    checkExists: true,
                },
                {
                    valueTrans: 'USER.LANGUAGE',
                    field: 'language',
                    type: 'enum',
                    required: true,
                    values: [
                        {key: 'de', value: 'LANGUAGE.DE'},
                        {key: 'en', value: 'LANGUAGE.EN'},
                    ],
                },
                {
                    valueTrans: 'FW.USER.USERNAME',
                    field: 'username',
                    type: 'text',
                    required: true,
                    checkExists: true,
                    checkExistsLabel: 'USER.USERNAME_ALREADY_EXISTS',
                },
                {
                    valueTrans: 'FW.USER.FIRSTNAME',
                    field: 'firstname',
                    type: 'text',
                    required: false,
                },
                {
                    valueTrans: 'FW.USER.LASTNAME',
                    field: 'lastname',
                    type: 'text',
                    required: false,
                },
                {
                    valueTrans: 'FW.USER.COUNTRY',
                    field: 'CID',
                    type: 'lookup',
                    required: false,
                    lookup: {
                        table: 'country',
                        value_de: 'staat',
                        value_en: 'staat_en'
                    },
                },
                {
                    valueTrans: 'FW.USER.POSTCODE',
                    field: 'postcode',
                    type: 'text',
                    required: false,
                }
            ]
        }
    },
    user: {displayStyle: FwUserDisplayStyle.FULLNAME},
    file: {
        fileViewerFileInfo: {
            classModule: 'framework.File/getFile',
            rows: [
                {
                    valueTrans: 'FW.FILE.NAME',
                    field: 'display_name'
                },
                {
                    valueTrans: 'FW.FILE.SIZE',
                    suffix: '(KB)',
                    field: 'size'
                },
                {
                    valueTrans: 'FW.FILE.ADD_BY',
                    field: 'create_UID'
                },
                {
                    valueTrans: 'FW.FILE.ADD_DATE',
                    field: 'create_date'
                }
            ]
        },
    },
    log: {
        logTableName: 'log',
        logTableIndexName: 'ULID',
        userTableName: 'users',
        userTableIndexName: 'UID',
        userTableUserName: 'lastname'
    },
    right: {
        dashboardLink: '/right/',
        exitLink: '/dashboard'
    },
    table: {
        imagePath: 'assets/img/framework/'
    },
    userAssignment: {
        usertypePrefix: 'USER_ROLE',
        usertypeList: {},
        assignFormFields: {
            UID: true,
            username: true,
            universetype: true,
            fullname: true,
            CID: true,
            language: true
        },
        unassignFormFields: {
            UID: true,
            username: true,
            fullname: true,
            CID: true,
        },
        useClientlistRole: [
            FwUserType.ADMIN,
            FwUserType.USER
        ]
    }
};*/
export const ssoConfig: FwSettings = {
    production: environment.production,
    apiUrl: FwApiUrl.SSO,
    frameworkMode: FwMode.SSO,
    appID: 'it-mgmt',
    appName: 'IT-Mgmt',
    urlDataFallbackLink: '/dashboard',
    cryptoKey: 'FbcCCFBwfY2yAL4UE9RBJxxjVC+6kJ4d',
    auth: {
        type: FwSettingAuthType.STANDALONE,
        loginType: FwLoginType.VIEW,
        loginField: 'FW.LOGIN.USERNAME',
        loginDestination: '/login',
        afterLoginDestination: '/dashboard',
        afterLogoutDestination: 'login',
        googleRecaptcha: false,
        googleRecaptchaSiteKey: '',
        jwtKeyName: '60ff6ae99f',
        jwtStorageCookie: {
            domain: environment.cookieDomain,
            expiresDays: null
        },
        translateUsertype: true,
        interceptorWhitelist: [],
        passwordReset: {
            modalTitle: 'FW.PASSWORD_RESET.MODAL_TITLE',
            modalText: 'FW.PASSWORD_RESET.MODAL_TEXT',
            modalPlaceholder: 'FW.PASSWORD_RESET.MODAL_PLACEHOLDER',
            modalConfirmation: 'FW.PASSWORD_RESET.MODAL_CONFIRMATION',
            buttonConfirm: 'FW.PASSWORD_RESET.BUTTON_CONFIRM',
            buttonCancel: 'FW.PASSWORD_RESET.BUTTON_CANCEL',
            errorMessage: 'FW.PASSWORD_RESET.MSG_ERROR'
        },
        logoutAutomatic: {
            enabled: true,
            inactivityTime: 300000,
            logoutCountDown: 10,
        },
        register: {
            config: {
                tableName: 'users',
                tableIndexName: 'UID',
                cancelRouterLink: '/',
                saveRouterLink: '/',
                saveLabel: 'USER.REGISTRATION_CONFIRMATION_MESSAGE',
                saveLabelFields: ['email', 'username']
            },
            buttons: [
                {
                    valueTrans: 'FW.REGISTER.BUTTON_REGISTER_NOW',
                    buttonClass: 'btn-success',
                    iconClass: 'fas fa-check',
                    type: 'confirm',
                    captcha: true
                },
                {
                    valueTrans: 'FW.BUTTON.CANCEL',
                    buttonClass: 'btn-dark ml-3',
                    iconClass: 'fas fa-times',
                    type: 'cancel',
                }
            ],
            rows: [
                {
                    valueTrans: 'USER.PASSWORD',
                    field: 'password',
                    type: 'password',
                    minLength: 8,
                },
                {
                    valueTrans: 'USER.PASSWORD',
                    field: 'password_confirm',
                    type: 'password',
                    minLength: 8,
                },
                {
                    valueTrans: 'USER.EMAIL',
                    field: 'email',
                    type: 'email',
                    required: true,
                    checkExists: true,
                },
                {
                    valueTrans: 'USER.LANGUAGE',
                    field: 'language',
                    type: 'enum',
                    required: true,
                    values: [
                        {key: 'de', value: 'LANGUAGE.DE'},
                        {key: 'en', value: 'LANGUAGE.EN'},
                    ],
                },
                {
                    valueTrans: 'FW.USER.USERNAME',
                    field: 'username',
                    type: 'text',
                    required: true,
                    checkExists: true,
                    checkExistsLabel: 'USER.USERNAME_ALREADY_EXISTS',
                },
                {
                    valueTrans: 'FW.USER.FIRSTNAME',
                    field: 'firstname',
                    type: 'text',
                    required: false,
                },
                {
                    valueTrans: 'FW.USER.LASTNAME',
                    field: 'lastname',
                    type: 'text',
                    required: false,
                },
                {
                    valueTrans: 'FW.USER.COUNTRY',
                    field: 'CID',
                    type: 'lookup',
                    required: false,
                    lookup: {
                        table: 'country',
                        value_de: 'staat',
                        value_en: 'staat_en'
                    },
                },
                {
                    valueTrans: 'FW.USER.POSTCODE',
                    field: 'postcode',
                    type: 'text',
                    required: false,
                }
            ]
        }
    },
    user: {displayStyle: FwUserDisplayStyle.FULLNAME},
    file: {
        fileViewerFileInfo: {
            classModule: 'framework.File/getFile',
            rows: [
                {
                    valueTrans: 'FW.FILE.NAME',
                    field: 'display_name'
                },
                {
                    valueTrans: 'FW.FILE.SIZE',
                    suffix: '(KB)',
                    field: 'size'
                },
                {
                    valueTrans: 'FW.FILE.ADD_BY',
                    field: 'create_UID'
                },
                {
                    valueTrans: 'FW.FILE.ADD_DATE',
                    field: 'create_date'
                }
            ]
        },
    },
    log: {
        logTableName: 'log',
        logTableIndexName: 'ULID',
        userTableName: 'users',
        userTableIndexName: 'UID',
        userTableUserName: 'lastname'
    },
    right: {
        dashboardLink: '/right/',
        exitLink: '/dashboard'
    },
    table: {
        imagePath: 'assets/img/framework/'
    },
    userAssignment: {
        usertypePrefix: 'USER_ROLE',
        usertypeList: {},
        assignFormFields: {
            UID: true,
            username: true,
            universetype: true,
            fullname: true,
            CID: true,
            language: true
        },
        unassignFormFields: {
            UID: true,
            username: true,
            fullname: true,
            CID: true,
        },
        useClientlistRole: [
            FwUserType.ADMIN,
            FwUserType.USER
        ]
    }
};

