import {Component, Input, OnInit} from '@angular/core';
import {SettingsService} from '../../../services/settings.service';
import {RegisterService} from '../register.service';

@Component({
    selector: 'app-register-password-confirm',
    templateUrl: './register-password-confirm.component.html',
    styleUrls: ['./register-password-confirm.component.scss'],
})
export class RegisterPasswordConfirmComponent implements OnInit {

    @Input() key: string;
    @Input() keyPasswordField: string;

    passwordField;
    field;

    constructor(
        private settingsService: SettingsService,
        public registerService: RegisterService,
    ) {
    }

    ngOnInit(): void {
        this.passwordField = this.settingsService.frameworkSettings.auth.register.rows.find(row => row.field === this.keyPasswordField);
        this.field = this.settingsService.frameworkSettings.auth.register.rows.find(row => row.field === this.key);
        if (!this.field) {
            console.error('Field with key "' + this.key + '" not found!');
        } else {
            this.field.data = '';
            this.field.required = true;
        }
    }

}
