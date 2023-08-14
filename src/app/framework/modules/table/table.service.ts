import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TableService {

    currentTables: any; // wird von FormTableNavigatorComponent verwendet

    tableList: Subject<any> = new Subject();
    openDataset: Subject<any> = new Subject();
    changeSort: Subject<any> = new Subject();
    changeColumnFilterValue: Subject<any> = new Subject();
    changeRows: Subject<any> = new Subject();
    changeAlphaFilter: Subject<any> = new Subject();
    reloadTable: Subject<any> = new Subject();
    exportXls: Subject<any> = new Subject();
    setExporting: Subject<any> = new Subject();
}

