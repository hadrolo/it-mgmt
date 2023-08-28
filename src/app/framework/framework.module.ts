import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {GoBackDirective} from './directives/go-back.directive';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthInfoComponent} from './components/auth-info/auth-info.component';
import {DevWarningComponent} from './components/dev-warning/dev-warning.component';
import {LocalstorageInfoComponent} from './components/localstorage-info/localstorage-info.component';
import {AuthResetPasswordComponent} from './modules/auth/auth-reset-password/auth-reset-password.component';
import {MaintenanceInfoComponent} from './components/maintenance-info/maintenance-info.component';
import {AuthLoginModalComponent} from './modules/auth/auth-login-modal/auth-login-modal.component';
import {NgxCaptchaModule} from 'ngx-captcha';
import {YesNoPipe} from './pipes/yes-no.pipe';
import {DebounceKeyupDirective} from './directives/debounce-keyup.directive';
import {FwTranslatePipe} from './pipes/fw-translate.pipe';
import {FormModule} from './modules/form/form.module';
import { LoginFailedComponent } from './modules/sso/login-failed/login-failed.component';

@NgModule({
    declarations: [
        GoBackDirective,
        LocalstorageInfoComponent,
        AuthInfoComponent,
        AuthResetPasswordComponent,
        DevWarningComponent,
        MaintenanceInfoComponent,
        AuthLoginModalComponent,
        YesNoPipe,
        DebounceKeyupDirective,
        FwTranslatePipe,
        LoginFailedComponent,
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        NgxCaptchaModule,
        FormModule,
    ],
    exports: [
        GoBackDirective,
        LocalstorageInfoComponent,
        AuthInfoComponent,
        AuthResetPasswordComponent,
        DevWarningComponent,
        MaintenanceInfoComponent,
        AuthLoginModalComponent,
        DebounceKeyupDirective,
        FwTranslatePipe
    ]
})
export class FrameworkModule {
}
