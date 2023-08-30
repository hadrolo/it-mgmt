import {NgModule} from '@angular/core';
import {UserProfileSsoComponent} from './user-profile-sso.component';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
    declarations: [UserProfileSsoComponent],
    exports: [UserProfileSsoComponent],
    imports: [TranslateModule, CommonModule, MatDialogModule, ReactiveFormsModule],
    providers: []
})
export class UserProfileSsoModule {
}
