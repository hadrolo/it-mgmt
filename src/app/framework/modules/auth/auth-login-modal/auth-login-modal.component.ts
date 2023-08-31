import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SettingsService} from '../../../services/settings.service';
import {JwtService, FwTokenType} from '../jwt.service';
import {environment} from '../../../../../environments/environment';
import {UserService} from '../user.service';
import {TranslateService} from '@ngx-translate/core';
import {InvisibleReCaptchaComponent} from 'ngx-captcha';
import {Router} from '@angular/router';
import {DataService} from '../../../services/data.service';
import {ToastrService} from 'ngx-toastr';

declare var $: any;

enum FwLoginModalViewMode {
    LOGIN = 'LOGIN',
    RESET_PW = 'RESET_PW',
    ERROR = 'ERROR',
}

interface FwRecaptcha {
    theme: 'dark' | 'light';
    type: 'audio' | 'image';
    badge: 'bottomright' | 'bottomleft' | 'inline';
    recaptcha: any;
}

interface FwLoginModalSetting {
    viewMode: FwLoginModalViewMode;
    recaptcha: FwRecaptcha;
    loginInProgress: boolean;
}

interface FwLoginModalData {
    username: string;
    password: string;
    email: string;
    deniedMessage: string;
}

interface FwLoginModalView {
    setting: FwLoginModalSetting;
    data: FwLoginModalData;
}

@Component({
    selector: 'app-auth-login-modal',
    templateUrl: './auth-login-modal.component.html',
    styleUrls: ['./auth-login-modal.component.scss']
})
export class AuthLoginModalComponent {

    @ViewChild('captchaElem', {static: false}) captchaElem: InvisibleReCaptchaComponent;
    @ViewChild('errorDismissButton') errorDismissButton: ElementRef;

    view: FwLoginModalView = {
        setting: {
            loginInProgress: false,
            viewMode: FwLoginModalViewMode.LOGIN,
            recaptcha: {
                theme: 'light',
                type: 'image',
                badge: 'bottomleft',
                recaptcha: null,
            }
        },
        data: {
            username: environment.username,
            password: environment.password,
            email: null,
            deniedMessage: null,
        }
    };

    fwLoginModalViewMode = FwLoginModalViewMode;

    constructor(
        public settingsService: SettingsService,
        public userService: UserService,
        private translateService: TranslateService,
        private jwtService: JwtService,
        private router: Router,
        private dataService: DataService,
        private toastrService: ToastrService,
    ) {
    }

    login(): void {
        this.view.setting.loginInProgress = true;
        if (this.settingsService.frameworkSettings.production && this.settingsService.frameworkSettings.auth.googleRecaptcha) {
            this.captchaElem.resetCaptcha();
            this.captchaElem.execute();
        } else {
            this.loginFunction();
        }
    }

    loginFunction(): void {
        this.userService.login(this.view.data.username, this.view.data.password).subscribe(response => {
            if (response.auth.success) {
                this.jwtService.setToken(FwTokenType.ACCESS_TOKEN, response.jwt_token.accessToken);
                this.jwtService.setToken(FwTokenType.REFRESH_TOKEN, response.jwt_token.refreshToken);

                this.translateService.use(response.user.language);
                this.userService.currentUser = response.user;
                this.userService.currentUser.loggedIn = true;

                $('#login-modal').modal('hide');

                this.toastrService.info(this.translateService.instant('FW.LOGIN.MSG_WELCOME') + ' ' + this.userService.userDisplayName() + '!');
                this.router.navigate([this.settingsService.frameworkSettings.auth.afterLoginDestination]).catch();
            } else {
                if (response.auth.message === 'user-disabled') {
                    this.view.data.deniedMessage = this.translateService.instant('FW.LOGIN.MSG_USER_DISABLED');
                }
                if (response.auth.message === 'invalid-credentials') {
                    this.view.data.deniedMessage = this.translateService.instant('FW.LOGIN.MSG_INVALID_CREDENTIALS');
                }
                if (response.auth.message === 'user-not-found') {
                    this.view.data.deniedMessage = this.translateService.instant('FW.LOGIN.MSG_USER_NOT_FOUND');
                }
                this.view.setting.loginInProgress = false;
                this.view.setting.viewMode = FwLoginModalViewMode.ERROR;

                setTimeout(() => this.errorDismissButton.nativeElement.focus());
            }
        });
    }

    resetPasswordNow(): void {
        this.view.setting.viewMode = FwLoginModalViewMode.LOGIN;

        this.dataService.request('framework.Auth/resetPassword', {field_check: this.view.data.email, language: this.userService.currentUser.language}).subscribe(response => {
            this.view.data.email = '';
            if (!response.error) {
              this.toastrService.success(this.translateService.instant(this.settingsService.frameworkSettings.auth.passwordReset.modalConfirmation));
            } else {
              this.toastrService.error(this.translateService.instant(this.settingsService.frameworkSettings.auth.passwordReset.errorMessage));
            }
        });
    }

    setView(viewMode: FwLoginModalViewMode): void {
        this.view.setting.viewMode = viewMode;
    }
}
