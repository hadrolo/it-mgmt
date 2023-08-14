import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment';
import {InvisibleReCaptchaComponent} from 'ngx-captcha';
import {DataService} from '../../../services/data.service';
import {LocalStorageService} from '../../../services/local-storage.service';
import {UserService} from '../user.service';
import {JwtService, FwTokenType} from '../jwt.service';
import {SettingsService} from '../../../services/settings.service';
import {MatDialog} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-auth-login',
    templateUrl: './auth-login.component.html',
    styleUrls: ['./auth-login.component.scss']
})
export class AuthLoginComponent implements OnInit {

    deniedMessage: any;
    dst: any = null;
    loginData: any;
    environment = environment;
    loginInProgress = false;

    theme: 'dark' | 'light' = 'light';
    type: 'audio' | 'image' = 'image';
    badge: 'bottomright' | 'bottomleft' | 'inline' = 'bottomleft';
    recaptcha: any = null;

    @ViewChild('captchaElem', {static: false}) captchaElem: InvisibleReCaptchaComponent;
    @ViewChild('modalAccessDenied') modalAccessDenied: TemplateRef<any>;
    @ViewChild('modalPasswordReset') modalPasswordReset: TemplateRef<any>;
    fieldCheck: string;

    constructor(
        private router: Router,
        public userService: UserService,
        private dataService: DataService,
        private translateService: TranslateService,
        private localStorageService: LocalStorageService,
        private jwtService: JwtService,
        public settingsService: SettingsService,
        public dialog: MatDialog,
        private toastrService: ToastrService,
    ) {
    }

    ngOnInit(): void {
        this.loginData = {
            username: environment.username,
            password: environment.password
        };
    }

    login(): void {
        this.loginInProgress = true;
        if (this.settingsService.frameworkSettings.production && this.settingsService.frameworkSettings.auth.googleRecaptcha
        ) {
            this.captchaElem.resetCaptcha();
            this.captchaElem.execute();
        } else {
            this.loginFunction();
        }
    }

    loginFunction(): void {
        this.userService.login(this.loginData.username, this.loginData.password).subscribe(response => {
            if (response.auth.success) {
                this.jwtService.setToken(FwTokenType.ACCESS_TOKEN, response.jwt_token.accessToken);
                this.jwtService.setToken(FwTokenType.REFRESH_TOKEN, response.jwt_token.refreshToken);

                console.log(response);

                this.translateService.use(response.user.language);
                this.userService.currentUser = response.user;
                this.userService.currentUser.loggedIn = true;

                this.toastrService.info(this.translateService.instant('FW.LOGIN.MSG_WELCOME') + ' ' + this.userService.userDisplayName() + '!');
                if (this.dst) {
                    this.localStorageService.setItem('crypt_key', this.dst.key);
                    this.router.navigate([this.dst.link_dst + '/' + this.dst.link_key]).catch();
                } else {
                    this.router.navigate([this.settingsService.frameworkSettings.auth.afterLoginDestination]).catch();
                }
            } else {
                if (response.auth.message === 'user-disabled') {
                    this.deniedMessage = this.translateService.instant('FW.LOGIN.MSG_USER_DISABLED');
                }
                if (response.auth.message === 'invalid-credentials') {
                    this.deniedMessage = this.translateService.instant('FW.LOGIN.MSG_INVALID_CREDENTIALS');
                }
                if (response.auth.message === 'user-not-found') {
                    this.deniedMessage = this.translateService.instant('FW.LOGIN.MSG_USER_NOT_FOUND');
                }
                this.loginInProgress = false;

                this.dialog.open(this.modalAccessDenied);
            }
        });
    }

    forgotPassword(): void {
        this.dialog.open(this.modalPasswordReset);
    }

    resetPasswordNow(): void {
        this.dataService.request('framework.Auth/resetPassword', {field_check: this.fieldCheck, language: this.userService.currentUser.language}).subscribe(response => {
            this.fieldCheck = '';
            if (!response.error) {
                this.toastrService.success(this.translateService.instant(this.settingsService.frameworkSettings.auth.passwordReset.modalConfirmation));
            } else {
                this.toastrService.error(this.translateService.instant(this.settingsService.frameworkSettings.auth.passwordReset.errorMessage));
            }
        });
    }
}
