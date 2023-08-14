import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RegisterFormComponent} from './register-form/register-form.component';
import {RegisterFieldComponent} from './register-field/register-field.component';
import {RegisterButtonComponent} from './register-button/register-button.component';
import { RegisterPasswordComponent } from './register-password/register-password.component';
import { RegisterPasswordConfirmComponent } from './register-password-confirm/register-password-confirm.component';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterModalComponent } from './register-modal/register-modal.component';
import {NgxCaptchaModule} from 'ngx-captcha';


@NgModule({
    declarations: [
        RegisterFormComponent,
        RegisterFieldComponent,
        RegisterButtonComponent,
        RegisterPasswordComponent,
        RegisterPasswordConfirmComponent,
        RegisterModalComponent
    ],
    exports: [
        RegisterFormComponent,
        RegisterFieldComponent,
        RegisterButtonComponent,
        RegisterPasswordComponent,
        RegisterPasswordConfirmComponent,
        RegisterModalComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        NgxCaptchaModule
    ]
})
export class RegisterModule {
}
