import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HistoryComponent implements OnInit {
    @Input() dbname: string = null;
    @Input() fkTable: string;
    @Input() fkName: string;
    @Input() fkId: string;
    history: any = [];

    constructor(
        private dataService: DataService
    ) {
    }

    ngOnInit(): void {
        this.readHistory();
    }

    readHistory(): void {
        this.dataService.request('framework.History/getData', {
            dbname: this.dbname,
            FK_ID: this.fkId,
            FK_name: this.fkName,
            FK_table: this.fkTable,
        }).subscribe(response => {
            this.history = response.history.data;
            this.history.forEach((i, index) => {
                i.id = index;
            });

            this.history.forEach(element => {
                element.dataArray = [];
                if (element.data) {
                    const historyData = JSON.parse(element.data);
                    Object.entries(historyData).forEach(([key, value]) => {
                        let found = false;
                        let parentValue = null;
                        this.history.forEach(element2 => {
                            if (!found && element2.created !== element.created && element.type !== 'insert') {
                                const historyData2 = JSON.parse(element2.data);
                                Object.entries(historyData2).forEach(([key2, value2]) => {
                                    if (key2 === key && value !== value2) {
                                        found = true;
                                        parentValue = value2;
                                    }
                                });
                            }
                        });
                        element.dataArray.push({key, value, parentValue});
                    });
                }
            });
        });
    }
}
