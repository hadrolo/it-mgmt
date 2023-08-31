import {NgModule} from '@angular/core';
import {UserRegisterComponent} from './user-register.component';
import {TranslateModule} from '@ngx-translate/core';
import {RegisterModule} from '../../register/register.module';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [
        UserRegisterComponent
    ],
    exports: [],
    imports: [
        CommonModule,
        TranslateModule,
        RegisterModule,
    ]
})
export class UserRegisterModule {
}
