import {Component, Input} from '@angular/core';
import {TableService} from '../table.service';
import {FwTableData} from '../table.interfaces';

@Component({
    selector: 'app-table-row-switch',
    templateUrl: './table-row-switch.component.html',
    styleUrls: ['./table-row-switch.component.scss']
})
export class TableRowSwitchComponent {

    @Input() data: FwTableData;

    constructor(
        public tableService: TableService,
    ) {
    }
}
