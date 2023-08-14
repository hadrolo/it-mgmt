import {Component, Input} from '@angular/core';
import {TableService} from '../table.service';
import {FwTableData} from '../table.interfaces';

@Component({
  selector: 'app-table-pagination',
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.scss']
})
export class TablePaginationComponent {

  @Input() data: FwTableData;

  constructor(
      public tableService: TableService,
  ) {
  }

}
