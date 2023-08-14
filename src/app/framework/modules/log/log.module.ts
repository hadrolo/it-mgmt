import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {LookupFormModule} from '../lookup-form/lookup-form.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LogComponent} from './log.component';
import {TableModule} from '../table/table.module';
import {FormModule} from '../form/form.module';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
    declarations: [LogComponent],
    exports: [LogComponent],
    imports: [CommonModule, TranslateModule, LookupFormModule, TableModule, FormsModule, ReactiveFormsModule, FormModule, MatDialogModule],
    providers: []
})
export class LogModule {
}
