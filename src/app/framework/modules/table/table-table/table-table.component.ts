import {Component, Input, OnInit} from '@angular/core';
import {FwTableColumnFilterType, FwTableFieldAlignment} from '../../table/table.interfaces';
import {UserService} from '../../auth/user.service';
import {TableService} from '../table.service';
import {FwTableData} from '../table.interfaces';
import {FwFormViewMode} from '../../form/form.interfaces';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-table-table',
  templateUrl: './table-table.component.html',
  styleUrls: ['./table-table.component.scss']
})
export class TableTableComponent implements OnInit  {

  showFooter = false;
  @Input() data: FwTableData;

  TableFieldAlignment = FwTableFieldAlignment;
  TableColumnFilterType = FwTableColumnFilterType;
  rowFocus = null;

  constructor(
      public userService: UserService,
      public tableService: TableService,
      public translateService: TranslateService,
  ) {
  }

  ngOnInit() {
    this.showFooter = this.data.config.dataConfig.tableFields.some(field => field.footerSum);

  }

  openDataset(ID): void {
    if (this.data.config.enableFocusRow === true) {
      this.rowFocus = ID;
    }

    this.tableService.openDataset.next({
      openData: {ID, viewMode: FwFormViewMode.VIEW},
      id: this.data.config._id
    });
  }
}
