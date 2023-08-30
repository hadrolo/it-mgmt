import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {LogService} from './log.service';
import * as StackTrace from 'stacktrace-js';
import {SettingsService} from './settings.service';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../modules/auth/user.service';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    constructor(
        private http: HttpClient,
        private logService: LogService,
        private translateService: TranslateService,
        private settingsService: SettingsService,
        private userService: UserService,
    ) {
    }

    request(action: string, dataObject: object = null): Observable<any> {
        const stackFrames = StackTrace.getSync();

        console.log(action);
        console.log(dataObject);

        let componentName = null;
        let methodName = null;

        if (stackFrames[1].functionName) {
            const parts = stackFrames[1].functionName.split('.');
            componentName = parts[parts.length - 2] + '.ts';
            methodName = parts[parts.length - 1] + '()';
        }

        return this.http
            .post(this.settingsService.frameworkSettings.apiUrl, {
                action,
                data: dataObject,
                componentName,
                methodName
            })
            .pipe(
                map((response: any) => {
                    if(response?.overrideUserType){
                        this.userService.currentUser.usertype = response?.overrideUserType;
                    }


                    if (response?.errors) {
                        response.errors.forEach(error => {
                          // ToDo: !! Material !! ToasterService
                          //  this.toastrService.error(error === 'FW.ERRORS.DB' ? this.translateService.instant('FW.ERRORS.DB') : error, this.translateService.instant('FW.ERRORS.TITLE'));
                        });
                    }

                    if (response?.warnings) {
                        response.warnings.forEach(error => {
                          // ToDo: !! Material !! ToasterService
                          //  this.toastrService.warning(error);
                        });
                    }

                    if (response?.output_update) {
                        if (response.updatedFields.length > 0) {
                          // ToDo: !! Material !! ToasterService
                          //  this.toastrService.success(this.translateService.instant('FW.FORM.MSG_UPDATE_OK') + ' ' + response.updatedFields.join(', '), this.translateService.instant('FW.FORM.MSG_UPDATE_TITLE'));
                        } else {
                          // ToDo: !! Material !! ToasterService
                          //  this.toastrService.info(this.translateService.instant('FW.FORM.MSG_UPDATE_NOCHANGES'), this.translateService.instant('FW.FORM.MSG_UPDATE_NOCHANGES_TITLE'));
                        }
                    }

                    if (response?.output_insert) {
                        if (response.insert) {
                          // ToDo: !! Material !! ToasterService
                          //  this.toastrService.success(response.index_name + ': ' + response.index + ' ' + this.translateService.instant('FW.FORM.MSG_INSERT_OK'), this.translateService.instant('FW.FORM.MSG_INSERT_TITLE'));
                        }
                    }

                    if (response?.output_delete) {
                        if (response.delete) {
                          // ToDo: !! Material !! ToasterService
                          //  this.toastrService.success(response.index_name + ': ' + response.index + ' ' + this.translateService.instant('FW.FORM.MSG_DELETE'), this.translateService.instant('FW.FORM.MSG_DELETE_TITLE'));
                        }
                    }

                    return response;
                })
            );
    }
}




