import {Component, Input} from '@angular/core';
import {FwTableData} from '../table.interfaces';
import {TableService} from '../table.service';
import {FwFormViewMode} from '../../form/form.interfaces';

@Component({
    selector: 'app-table-insert-button',
    templateUrl: './table-insert-button.component.html',
    styleUrls: ['./table-insert-button.component.scss']
})
export class TableInsertButtonComponent {

    @Input() data: FwTableData;
    FormViewMode = FwFormViewMode;

    constructor(
        public tableService: TableService,
    ) {
    }
}
