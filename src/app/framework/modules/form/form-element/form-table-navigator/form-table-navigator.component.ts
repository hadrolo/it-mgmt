import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormService} from '../../form.service';
import {TableService} from '../../../table/table.service';

export interface FwFormTableNavigatorStyle {
    bootstrapButtonName: string;
    bootstrapButtonSize: string;
}

@Component({
    selector: 'app-form-table-navigator',
    templateUrl: './form-table-navigator.component.html',
    styleUrls: ['./form-table-navigator.component.scss']
})
export class FormTableNavigatorComponent implements OnInit, OnChanges {

    @Input() activePkKey: string;
    @Input() tableName: string;
    @Input() style: FwFormTableNavigatorStyle;
    @Output() newPkId = new EventEmitter();

    viewButtons = false;
    nextPk = null;
    prevPk = null;

    constructor(
        private formService: FormService,
        private tableService: TableService
    ) {
    }

    ngOnInit(): void {
        this.calcPrevNext();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.calcPrevNext();
    }

    prev(): void {
        this.newPkId.emit(this.prevPk);
    }

    next(): void {
        this.newPkId.emit(this.nextPk);
    }

    calcPrevNext(): void {
        if (this.tableService.currentTables && this.tableService.currentTables[this.tableName]) {
            this.viewButtons = true;
            this.prevPk = null;
            this.nextPk = null;
            let found = false;
            let search = true;
            this.tableService.currentTables[this.tableName].forEach(element => {
                if (search === true) {
                    if (found === true) {
                        this.nextPk = element;
                        search = false;
                    } else {
                        if (element === this.activePkKey) {
                            found = true;
                        } else {
                            this.prevPk = element;
                        }
                    }
                }
            });
        }
    }
}
