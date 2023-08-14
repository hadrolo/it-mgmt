import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterButtonComponent } from './table-filter-button/table-filter-button.component';
import { TableIndexComponent } from './table-index/table-index.component';
import { TableRowSwitchComponent } from './table-row-switch/table-row-switch.component';
import { TableSearchFieldComponent } from './table-search-field/table-search-field.component';
import { TableTableComponent } from './table-table/table-table.component';
import {FileModule} from '../file/file.module';
import {FormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {TranslateModule} from '@ngx-translate/core';
import { TableTableFieldImageComponent } from './table-table/table-table-field-image/table-table-field-image.component';
import {FormModule} from '../form/form.module';
import {FrameworkModule} from '../../framework.module';
import {TableComponent} from './table.component';
import { TablePaginationComponent } from './table-pagination/table-pagination.component';
import { TableRowCountComponent } from './table-row-count/table-row-count.component';
import { TableExportButtonComponent } from './table-export-button/table-export-button.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { TableInsertButtonComponent } from './table-insert-button/table-insert-button.component';



@NgModule({
    declarations: [
        TableComponent,
        TableTableComponent,
        TableIndexComponent,
        TableRowSwitchComponent,
        TableSearchFieldComponent,
        TableFilterButtonComponent,
        TableTableFieldImageComponent,
        TablePaginationComponent,
        TableRowCountComponent,
        TableExportButtonComponent,
        TableInsertButtonComponent,
    ],
    exports: [TableComponent, TableTableComponent, TablePaginationComponent, TableRowCountComponent, TableRowSwitchComponent, TableSearchFieldComponent, TableIndexComponent, TableFilterButtonComponent, TableExportButtonComponent, TableInsertButtonComponent],
    imports: [CommonModule, FormsModule, TranslateModule, FormModule, FileModule, FrameworkModule, NgxPaginationModule, MatTooltipModule],
    providers: []
})
export class TableModule {
}
