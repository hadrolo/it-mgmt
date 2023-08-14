import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthLoginComponent} from './auth-login.component';
import {TranslateModule} from '@ngx-translate/core';
import {NgxCaptchaModule} from 'ngx-captcha';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, NgxCaptchaModule, MatDialogModule],
    exports: [AuthLoginComponent],
    declarations: [AuthLoginComponent],
    providers: []
})
export class AuthLoginModule {
}
