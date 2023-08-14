import {Component, Input, OnInit} from '@angular/core';
import {FwTableDataConfig, FwTableField, FwTableFieldAlignment, FwTableRowColorConditionOperator, FwTableRowImage} from '../../../table/table.interfaces';
import {SettingsService} from '../../../../services/settings.service';
import * as moment from 'moment/moment';

@Component({
  selector: 'app-table-table-field-image',
  templateUrl: './table-table-field-image.component.html',
  styleUrls: ['./table-table-field-image.component.scss']
})
export class TableTableFieldImageComponent implements OnInit {

  @Input() dataConfig: FwTableDataConfig;
  @Input() tableField: FwTableField;
  @Input() row;

  imageConfig: FwTableRowImage;
  TableFieldAlignment = FwTableFieldAlignment;

  constructor(
      public settingsService: SettingsService
  ) {
  }

  ngOnInit(): void {
    if (!this.dataConfig.rowImage) {
      return;
    }

    this.imageConfig = null;

    this.dataConfig.rowImage.forEach(icon => {
      if (icon.key === this.tableField.key) {
        // @ts-ignore //ToDo: ts-ignore ersetzen durch...?
        const valid = icon.conditions.every(condition => {
          if (condition.operator === FwTableRowColorConditionOperator.SMALLER_DATE) {
            if (moment(condition.value, 'YYYY-MM-DD') < moment(this.row[condition.key], 'YYYY-MM-DD')) {
              return true;
            }
          }
          if (condition.operator === FwTableRowColorConditionOperator.BIGGER_DATE) {
            if (moment(condition.value, 'YYYY-MM-DD') > moment(this.row[condition.key], 'YYYY-MM-DD')) {
              return true;
            }
          }
          if (condition.operator === FwTableRowColorConditionOperator.SMALLER_INT) {
            if (condition.value < this.row[condition.key]) {
              return true;
            }
          }
          if (condition.operator === FwTableRowColorConditionOperator.BIGGER_INT) {
            if (condition.value > this.row[condition.key]) {
              return true;
            }
          }
          if (condition.operator === FwTableRowColorConditionOperator.EQUAL) {
            if (condition.value === this.row[condition.key]) {
              return true;
            }
          }
        });

        if (valid) {
          this.imageConfig = icon;
        }
      }
    });
  }
}
