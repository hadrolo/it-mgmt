export interface FwAuthentication{
    login: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'login',
        i18n: null,
        description: null,
        access: null
    },
    logout: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'logout',
        i18n: null,
        description: null,
        access: null
    },
    isLoggedIn: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'isLoggedIn',
        i18n: null,
        description: null,
        access: null
    },
    resetPassword: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'resetPassword',
        i18n: null,
        description: null,
        access: null
    },
    updatePassword: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'updatePassword',
        i18n: null,
        description: null,
        access: null
    },
    checkHash:  {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'checkHash',
        i18n: null,
        description: null,
        access: null
    },
    registerLookup: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'registerLookup',
        i18n: null,
        description: null,
        access: null
    },
    register: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'register',
        i18n: null,
        description: null,
        access: null
    },
    checkValueExists: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'checkValueExists',
        i18n: null,
        description: null,
        access: null
    },
    checkRegistrationHash: {
        type: FwRightType.API,
        class: 'Auth',
        methode: 'checkRegistrationHash',
        i18n: null,
        description: null,
        access: null
    },
}
enum FwRightType{
    API = 'api',
    CLIENT = 'client',
    ALIAS = 'alias'
}

interface FwDashboard{
    openSettings: boolean;
}

export interface FwRight{
    authentication: FwAuthentication;
    dashboard: FwDashboard;
}


