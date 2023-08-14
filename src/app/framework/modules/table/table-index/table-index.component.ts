import {Component, Input} from '@angular/core';
import {FwTableData} from '../table.interfaces';
import {TableService} from '../table.service';

@Component({
  selector: 'app-table-index',
  templateUrl: './table-index.component.html',
  styleUrls: ['./table-index.component.scss']
})
export class TableIndexComponent {

  @Input() data: FwTableData;

  constructor(
      private tableService: TableService,
  ) {
  }

  setFilter(alpha): void {
    if (alpha.found && !alpha.filtered) {
      Object.entries(this.data.result.alpha).forEach(([key, value]) => {
        value['filtered'] = false;
      });
      alpha.filtered = true;
      this.tableService.changeAlphaFilter.next({alpha: alpha.name, data: this.data});
    }
  }

  clearFilter(): void {
    if (this.data.config.dataConfig.alphaFilter !== '') {
      Object.entries(this.data.result.alpha).forEach(([key, value]) => {
        value['filtered'] = false;
      });
      this.tableService.changeAlphaFilter.next({alpha: '', data: this.data});
    }
  }
}
