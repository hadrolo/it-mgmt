import {Component, Input} from '@angular/core';
import {FwTableData} from '../table.interfaces';

@Component({
    selector: 'app-table-row-count',
    templateUrl: './table-row-count.component.html',
    styleUrls: ['./table-row-count.component.scss']
})
export class TableRowCountComponent {

    @Input() data: FwTableData;
}
