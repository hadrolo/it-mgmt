import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {UserAssignmentComponent} from './user-assignment.component';
import {TableModule} from '../table/table.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
    declarations: [UserAssignmentComponent],
    exports: [UserAssignmentComponent],
    imports: [CommonModule, TranslateModule, TableModule, ReactiveFormsModule],
    providers: []
})
export class UserAssignmentModule {
}
