import {Component, Input} from '@angular/core';
import {TableService} from '../table.service';
import {FwTableData} from '../table.interfaces';

@Component({
  selector: 'app-table-filter-button',
  templateUrl: './table-filter-button.component.html',
  styleUrls: ['./table-filter-button.component.scss']
})
export class TableFilterButtonComponent {

  @Input() data: FwTableData;

  constructor(
      private tableService: TableService,
  ) {
  }

  toggleFilter(): void {
      this.data.config.dataConfig.columnFilter.active = !this.data.config.dataConfig.columnFilter.active;
      this.tableService.reloadTable.next(this.data);
  }

  checkFiltered(): boolean {
    return Object.values(this.data.config.dataConfig.columnFilter.fields).some((field: any) => {
      return field.value !== '';
    });
  }

  resetFilter(): void {
    Object.values(this.data.config.dataConfig.columnFilter.fields).forEach(field => {
      field.value = '';
    });
    this.tableService.reloadTable.next(this.data);
  }
}
