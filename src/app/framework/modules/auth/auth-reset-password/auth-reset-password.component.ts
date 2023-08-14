import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../../services/data.service';
import {SettingsService} from '../../../services/settings.service';
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-auth-reset-password',
    templateUrl: './auth-reset-password.component.html',
    styleUrls: ['./auth-reset-password.component.scss']
})
export class AuthResetPasswordComponent implements OnInit {

    hash: string;
    password: string;
    resetForm: FormGroup;
    hashValid = false;

    constructor(
        private route: ActivatedRoute,
        private dataService: DataService,
        public settingsService: SettingsService,
        private router: Router,
        private formBuilder: FormBuilder,
        private translateService: TranslateService,
        private toastrService: ToastrService,
    ) {
    }

    ngOnInit(): void {
        this.hash = this.route.snapshot.paramMap.get('hash');

        this.dataService.request('framework.Auth/checkHash', {hash: this.hash}).subscribe(response => {
            if (!response.error) {
                this.hashValid = true;
                this.resetForm = this.formBuilder.group({
                    password: ['', Validators.compose([Validators.required, Validators.min(6)])],
                    confirmPassword: ['', [
                        Validators.required,
                        (control: FormControl): {[key: string]: boolean} => {
                            if (!control.parent) {
                                return null;
                            }

                            const email = control.parent.get('password');
                            const confirm = control;
                            if (!email || !confirm) return null;
                            return email.value === confirm.value ? null : { nomatch: true };
                        }]
                    ],
                    }
                );
            }
        });

    }

    reset(): void {
        this.dataService.request('framework.Auth/updatePassword', {hash: this.hash, password: this.resetForm.value.password}).subscribe(response => {
            if (!response.error) {
                this.toastrService.success(this.translateService.instant('FW.PASSWORD_RESET.MSG_CONFIRMATION'));
                this.router.navigate([this.settingsService.frameworkSettings.auth.loginDestination]);
            } else {
                this.hashValid = false;
            }
        });
    }

}
