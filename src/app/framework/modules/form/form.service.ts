import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {FwOpenData} from '../../settings';
import {FwFormConfig, FwFormViewMode} from './form.interfaces';

@Injectable({
    providedIn: 'root'
})
export class FormService {
    constructor() {
    }

    open: Subject<FwOpenData> = new Subject();
    openModal: Subject<FwOpenData> = new Subject();
    closeModal: Subject<any> = new Subject();
    insert: Subject<any> = new Subject();
    update: Subject<any> = new Subject();
    delete: Subject<any> = new Subject();
    formReady: Subject<any> = new Subject();
    changeMode: Subject<FwFormViewMode> = new Subject();
    goBack: Subject<FwFormViewMode> = new Subject();

    formInvalid(config: FwFormConfig): boolean {
        return Object.entries(config.formFields).some(([key, field]) => {
            return field._DB_required && field._value.length === 0;
        });
    }
}
