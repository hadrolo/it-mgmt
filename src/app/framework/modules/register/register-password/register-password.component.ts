import {Component, Input, OnInit} from '@angular/core';
import {SettingsService} from '../../../services/settings.service';
import {RegisterService} from '../register.service';

@Component({
    selector: 'app-register-password',
    templateUrl: './register-password.component.html',
    styleUrls: ['./register-password.component.scss'],
})
export class RegisterPasswordComponent implements OnInit {

    @Input() key: string;
    field;

    constructor(
        private settingsService: SettingsService,
        public registerService: RegisterService,
    ) {
    }

    ngOnInit(): void {
        this.field = this.settingsService.frameworkSettings.auth.register.rows.find(row => row.field === this.key);
        if (!this.field) {
            console.error('Field with key "' + this.key + '" not found!');
        } else {
            this.field.data = '';
            this.field.required = true;
        }
    }

}
