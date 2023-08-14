import {Injectable, OnInit} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {SettingsService} from '../../services/settings.service';
/*import {CustomValidators} from 'ngx-custom-validators';*/

@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    save: Subject<any> = new Subject<any>();
    registerFormGroup: UntypedFormGroup;

    constructor(
        public settingsService: SettingsService,
    ) {
    }

    createForm(): Observable<any> {
        const group = {};
        let password = null;

        this.settingsService.frameworkSettings.auth.register.rows.forEach((element) => {
            if (element.type === 'password') {
                if (element.field === 'password') {
                    password = new UntypedFormControl('', Validators.compose([Validators.required, Validators.minLength(element.minLength)]));
                    group[element.field] = password;
                } else if (element.field === 'password_confirm') {
                    group[element.field] = new UntypedFormControl('', Validators.compose([Validators.required, Validators.minLength(element.minLength)]));
                }
            } else {
                if (element.required) {
                    if (element.type === 'email') {
                        group[element.field] = new UntypedFormControl(element.defaultValue ? element.defaultValue : '', Validators.email);
                    } else {
                        group[element.field] = new UntypedFormControl(element.defaultValue ? element.defaultValue : '', Validators.required);
                    }
                } else {
                    group[element.field] = new UntypedFormControl(element.defaultValue ? element.defaultValue : '');
                }
            }
        });
        this.registerFormGroup = new UntypedFormGroup(group);

        return of(true);
    }

}
