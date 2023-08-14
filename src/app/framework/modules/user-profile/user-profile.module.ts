import {NgModule} from '@angular/core';
import {UserProfileComponent} from './user-profile.component';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
    declarations: [UserProfileComponent],
    exports: [UserProfileComponent],
    imports: [TranslateModule, CommonModule, ReactiveFormsModule, MatDialogModule],
    providers: []
})
export class UserProfileModule {
}
