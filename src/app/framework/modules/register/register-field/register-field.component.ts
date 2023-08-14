import {Component, Input, OnInit} from '@angular/core';
import {SettingsService} from '../../../services/settings.service';
import {RegisterService} from '../register.service';
import {DataService} from '../../../services/data.service';

@Component({
    selector: 'app-register-field',
    templateUrl: './register-field.component.html',
    styleUrls: ['./register-field.component.scss'],
})
export class RegisterFieldComponent implements OnInit {

    @Input() key: string;
    field;

    constructor(
        private settingsService: SettingsService,
        public registerService: RegisterService,
        private dataService: DataService,
    ) {
    }

    ngOnInit(): void {
        this.field = this.settingsService.frameworkSettings.auth.register.rows.find(row => row.field === this.key);
        if (!this.field) {
            console.error('Field with key "' + this.key + '" not found!');
        } else {
            this.field.data = '';
        }
    }

    checkExists(): void {
        if (!this.field.checkExists) {
            return;
        }

        this.dataService.request('framework.Auth/checkValueExists', {
            value: this.registerService.registerFormGroup.controls[this.field.field].value,
            field: this.field,
            config: this.settingsService.frameworkSettings.auth.register.config,
        }).subscribe((response: any) => {
            if (response.exists) {
                this.registerService.registerFormGroup.controls[this.field.field].setErrors({exists: true});
            }
        });
    }

}
