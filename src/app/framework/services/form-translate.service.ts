import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';

export enum FwMessage {
    INSERT_OK = 'FW.FORM.MSG_INSERT_OK',
    INSERT_TITLE = 'FW.FORM.MSG_INSERT_TITLE',
    UPDATE_OK = 'FW.FORM.MSG_UPDATE_OK',
    UPDATE_TITLE = 'FW.FORM.MSG_UPDATE_TITLE',
    UPDATE_NOCHANGES = 'FW.FORM.MSG_UPDATE_NOCHANGES',
    UPDATE_NOCHANGES_TITLE = 'FW.FORM.MSG_UPDATE_NOCHANGES_TITLE',
    DELETE = 'FW.FORM.MSG_DELETE',
    DELETE_CONSTRAINT = 'FW.FORM.MSG_DELETE_CONSTRAINT',
    DELETE_TITLE = 'FW.FORM.MSG_DELETE_TITLE',
    QUERY_ERROR = 'FW.SERVICE.MSG_QUERY_ERROR',
    DUPLICATE_ERROR = 'FW.SERVICE.MSG_DUPLICATE_ERROR',
    EMAIL_SENT_ON = 'FW.EMAIL.SENT_ON',
    EMAIL_SENT_TITLE = 'FW.EMAIL.MSG_SENT_TITLE',
    EMAIL_SENT_TO = 'FW.EMAIL.MSG_SENT_TO'
}

@Injectable({
    providedIn: 'root'
})
/**
 * Provides translation data for forms
 */
export class FormTranslateService {

    constructor(
        private http: HttpClient,
        private translateService: TranslateService,
    ) {

    }

    message(message: FwMessage): string {
        return this.translateService.instant(message);
    }
}
