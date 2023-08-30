import {NgModule} from '@angular/core';
import {UserProfileStandaloneComponent} from './user-profile-standalone.component';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {FileModule} from '../../file/file.module';

@NgModule({
    declarations: [UserProfileStandaloneComponent],
    exports: [UserProfileStandaloneComponent],
    imports: [TranslateModule, CommonModule, ReactiveFormsModule, MatDialogModule, FileModule],
    providers: []
})
export class UserProfileStandaloneModule {
}
