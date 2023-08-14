import {Component, Input} from '@angular/core';
import {FwTableData} from '../table.interfaces';
import {TableService} from '../table.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-table-export-button',
    templateUrl: './table-export-button.component.html',
    styleUrls: ['./table-export-button.component.scss']
})
export class TableExportButtonComponent {

    @Input() data: FwTableData;

    setExporting$: Subscription | any;
    exporting = false;

    constructor(
        public tableService: TableService,
    ) {
    }

    ngOnInit(): void {
        this.setExporting$ = this.tableService.setExporting.subscribe((object) => this.setExporting(object.id, object.value));
    }

    ngOnDestroy(): void {
        this.setExporting$.unsubscribe();
    }

    setExporting(id, value){
        if (id == this.data.config._id){
            this.exporting = value;
        }
    }
}
