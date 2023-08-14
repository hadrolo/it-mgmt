import {Component, Input, OnInit} from '@angular/core';
import {SettingsService} from '../../../services/settings.service';
import {RegisterService} from '../register.service';
import {Router} from '@angular/router';
import {DataService} from '../../../services/data.service';
import {UserService} from '../../auth/user.service';

declare var $: any; // JQuery

@Component({
    selector: 'app-register-button',
    templateUrl: './register-button.component.html',
    styleUrls: ['./register-button.component.scss'],
})
export class RegisterButtonComponent implements OnInit {

    @Input() type: string;
    button;
    recaptcha: any = null;

    constructor(
        public settingsService: SettingsService,
        public registerService: RegisterService,
        private router: Router,
        private dataService: DataService,
        public userService: UserService,
    ) {
    }

    ngOnInit(): void {
        this.button = this.settingsService.frameworkSettings.auth.register.buttons.find(row => row.type === this.type);
        if (!this.button) {
            console.error('Button with type "' + this.type + '" not found!');
        }
    }


    prepareAction(): void {
        if (this.button.captcha || !this.settingsService.frameworkSettings.production) {
            this.action();
        }
    }

    action(): void {
        this.registerService.save.next(null);

        if (this.button.type === 'confirm') {
            const interpolateParams = {};
            this.settingsService.frameworkSettings.auth.register.config.saveLabelFields.forEach(labelField => {
                interpolateParams[labelField] = this.registerService.registerFormGroup.controls[labelField].value;
            });

            this.dataService.request('framework.Auth/register', {
                values: this.registerService.registerFormGroup.value,
                config: this.settingsService.frameworkSettings.auth.register.config,
            }).subscribe((response: any) => {
                this.router.navigate([this.settingsService.frameworkSettings.auth.register.config.saveRouterLink]).then(() => {
                    $('#register-modal').modal({backdrop: 'static'});
                });
            });
        } else if (this.button.type === 'cancel') {
            this.router.navigate([this.settingsService.frameworkSettings.auth.register.config.cancelRouterLink]);
        }
    }


}
