import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserMgmtListComponent} from './user-mgmt-list.component';
import {TranslateModule} from '@ngx-translate/core';
import {TableModule} from '../../table/table.module';
import {ToolbarModule} from '../../../../page/toolbar/toolbar.module';

@NgModule({
    declarations: [UserMgmtListComponent],
    exports: [UserMgmtListComponent],
    imports: [CommonModule, TranslateModule, TableModule, ToolbarModule],
    providers: []
})
export class UserMgmtListModule {
}
