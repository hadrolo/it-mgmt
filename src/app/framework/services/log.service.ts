import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserService} from '../modules/auth/user.service';
import {SettingsService} from './settings.service';

export enum FwLogType {
    ERROR = 'error',
    LOGIN = 'login',
    LOGOUT = 'logout',
    LOGIN_ERROR = 'login-error',
    INFO = 'info',
    INSERT = 'insert',
    UPDATE = 'update',
    DELETE = 'delete',
    EXCEPTION = 'exception',
    ACCESS_VIOLATION = 'access-violation'
}

@Injectable({
    providedIn: 'root'
})
export class LogService {

    constructor(
        private http: HttpClient,
        private userService: UserService,
        private settingsService: SettingsService
    ) {
    }

    write(type: FwLogType, message: string, component: string = null, method: string = null): void {
        const currentUser = this.userService.currentUser;

        if (currentUser.universetype === 'sysadmin' && [FwLogType.EXCEPTION, FwLogType.ERROR].indexOf(type) > -1) {
          // ToDo: !! Material !! ToasterService
          //  this.toastrService.error(message, type);
        }

        this.http.post(this.settingsService.frameworkSettings.apiUrl, {
            action: 'framework.Logfile/write',
            data: {
                uid: currentUser.UID,
                type,
                component,
                method,
                message
            },
            componentName: 'LogService.ts',
            methodName: 'write()'
        }).subscribe((response: any) => {
            if (response.errors && currentUser.universetype === 'sysadmin') {
              // ToDo: !! Material !! ToasterService
              //  this.toastrService.error('Could not write log', 'Log');
            }
        });
    }
}
