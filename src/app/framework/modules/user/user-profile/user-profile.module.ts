import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserProfileSsoComponent} from './user-profile-sso/user-profile-sso.component';
import {UserProfileStandaloneComponent} from './user-profile-standalone/user-profile-standalone.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatDialogModule} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {FileModule} from '../../file/file.module';
import {UserProfileComponent} from './user-profile.component';


@NgModule({
    declarations: [
        UserProfileSsoComponent,
        UserProfileStandaloneComponent,
        UserProfileComponent,
    ],
    exports: [
        UserProfileComponent
    ],
    imports: [
        TranslateModule,
        CommonModule,
        MatDialogModule,
        ReactiveFormsModule,
        FileModule
    ]
})
export class UserProfileModule {
}
