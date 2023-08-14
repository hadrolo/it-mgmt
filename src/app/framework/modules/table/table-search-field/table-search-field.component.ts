import {Component, Input} from '@angular/core';
import {FwTableData} from '../table.interfaces';
import {TableService} from '../table.service';

@Component({
  selector: 'app-table-search-field',
  templateUrl: './table-search-field.component.html',
  styleUrls: ['./table-search-field.component.scss']
})
export class TableSearchFieldComponent {

  @Input() data: FwTableData;

  constructor(
      public tableService: TableService,
  ) {
  }
}
