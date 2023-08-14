import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FwTableColumnFilterType, FwTableField, FwTableDesign, FwTableData, FwTableStatus, FwTableStatusType} from '../table/table.interfaces';
import {Observable, of, Subscription} from 'rxjs';
import {FwFormType, FwFormViewMode} from '../form/form.interfaces';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {CryptoService} from '../../services/crypto.service';
import {TableService} from '../table/table.service';
import {LocalStorageService} from '../../services/local-storage.service';
import {FormService} from '../form/form.service';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../auth/user.service';
import {FwStorageService} from '../../services/storage.service';
import {FwOpenData} from '../../settings';
import {map} from 'rxjs/operators';
import {FwTableRowColorConditionOperator} from '../table/table.interfaces';
import * as moment from 'moment';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy, OnChanges {

    @Input() data: FwTableData = null;
    @Output() status = new EventEmitter<FwTableStatus>();

    reloadTable$: Subscription | any;
    tableList$: Subscription | any;
    openDataset$: Subscription | any;
    changeColumnFilterValue$: Subscription | any;
    changeRows$: Subscription | any;
    changeAlphaFilter$: Subscription | any;
    changeSort$: Subscription | any;
    exportData$: Subscription | any;
    FormViewMode = FwFormViewMode;

    constructor(
        private router: Router,
        public dataService: DataService,
        private cryptoService: CryptoService,
        private tableService: TableService,
        private localStorageService: LocalStorageService,
        private formService: FormService,
        private translateService: TranslateService,
        private userService: UserService,
        private fwStorageService: FwStorageService,
    ) {
    }

    ngOnInit(): void {
        this.tableList$ = this.tableService.tableList.subscribe((object) => this.tableList(object.event, object.table, object.id));
        this.openDataset$ = this.tableService.openDataset.subscribe((object) => this.openDataset(object.openData, object.id));
        this.changeSort$ = this.tableService.changeSort.subscribe((object) => this.tableSort(object.field, object.data));
        this.changeColumnFilterValue$ = this.tableService.changeColumnFilterValue.subscribe((data) => this.changeColumnFilterValue(data));
        this.changeRows$ = this.tableService.changeRows.subscribe((data) => this.changeRows(data));
        this.changeAlphaFilter$ = this.tableService.changeAlphaFilter.subscribe((object) => this.tableAlphaFilter(object.alpha, object.data));
        this.exportData$ = this.tableService.exportXls.subscribe((id) => this.exportXLS(id));
        this.data.config._id = "id" + Math.random().toString(16).slice(2);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.data.config.design) {
            this.data.config.design = FwTableDesign.CARD;
        }

        this.data.config.dataConfig.tableFields.forEach((field: any) => {
            if (field.sortable === undefined) {
                field.sortable = false;
            }
            if (field.searchable === undefined) {
                field.searchable = false;
            }
            if (field.nowrap === undefined) {
                field.nowrap = false;
            }
            if (field.visible === undefined) {
                field.visible = true;
            }

            if (this.data.config.dataConfig.rowImage) {
                field._hasImage = this.data.config.dataConfig.rowImage.some((rowElement: any) => rowElement.key === field.key);
            }
        });

        if (this.data.config.dataConfig.rowImage) {
            this.data.config.dataConfig.rowImage.forEach((field: any) => {
                if (!field.width) {
                    field.width = 'auto';
                }
                if (!field.height) {
                    field.height = 'auto';
                }
            });
        }

        if (this.data.config.dataConfig.externalFilter?.key && this.data.config.dataConfig.externalFilter?.value) {
            this.data.config.dataConfig.columnFilter.active = true;
            this.data.config.dataConfig.columnFilter.fields[this.data.config.dataConfig.externalFilter.key].value = this.data.config.dataConfig.externalFilter.value;
        } else {
            if (this.data.config.localStorage.enabled) {
                const localStorage = this.localStorageService.getItem(this.data.config.localStorage.name);

                if (localStorage) {
                    if (localStorage.version !== this.data.config.localStorage.version) {
                        this.writeLocalStorage();
                    } else {
                        this.data.config.paginConfig.currentPage = localStorage.currentPage;
                        this.data.config.dataConfig.reverse = localStorage.reverse;
                        this.data.config.dataConfig.alphaFilter = localStorage.alphaFilter;
                        this.data.config.dataConfig.search = localStorage.search;
                        this.data.config.dataConfig.order = localStorage.order;

                        this.data.config.dataConfig.columnFilter.active = localStorage.columnFilter.active;
                        this.data.config.dataConfig.columnFilter.enabled = localStorage.columnFilter.enabled;
                        this.data.config.dataConfig.columnFilter.fields = localStorage.columnFilter.fields;
                    }
                }
            }
        }

        if (this.data.config.dataConfig.columnFilter) {
            Object.values(this.data.config.dataConfig.columnFilter.fields).forEach((field: any) => {
                if (field.type === undefined) {
                    field.type = FwTableColumnFilterType.INPUT;
                }
            });
        }

        this.reloadTable$ = this.tableService.reloadTable.subscribe((data) => this.reloadTable(data));

        this.dataService.request('framework.Table/getTableInfo', {
            config: this.data.config
        }).subscribe(response => {
            Object.entries(response.tableFields).forEach(([key, field]: any) => {
                this.data.config.dataConfig.tableFields.find((tableField: any) => tableField.key === key)._DB_type_name = field._DB_type_name;
                this.data.config.dataConfig.tableFields.find((tableField: any) => tableField.key === key)._DB_type_constraints = field._DB_type_constraints;
            });
            this.getTableRows().subscribe(() => {
                this.getTranslationLists();
                this.reloadTable(this.data);
            });
        });
    }

    writeLocalStorage(): void {
        if (!this.data.config.localStorage.enabled) {
            return;
        }

        const localStorage = {
            version: this.data.config.localStorage.version,
            currentPage: this.data.config.paginConfig.currentPage,
            reverse: this.data.config.dataConfig.reverse,
            alphaFilter: this.data.config.dataConfig.alphaFilter,
            search: this.data.config.dataConfig.search,
            order: this.data.config.dataConfig.order,
            columnFilter: this.data.config.dataConfig.columnFilter
        };
        this.localStorageService.setItem(this.data.config.localStorage.name, localStorage);
    }

    ngOnDestroy(): void {
        this.reloadTable$.unsubscribe();
        this.tableList$.unsubscribe();
        this.openDataset$.unsubscribe();
        this.changeColumnFilterValue$.unsubscribe();
        this.changeRows$.unsubscribe();
        this.changeSort$.unsubscribe();
        this.changeAlphaFilter$.unsubscribe();
        this.exportData$.unsubscribe();
    }

    getAlpha(): void {
        const out: any = [];
        this.dataService.request('framework.Table/groupAlpha', {
            config: this.data.config
        }).subscribe(response => {
            const alphaList = response.alphalist;
            const tableField = this.data.config.dataConfig.tableFields.find((field: any) => {
                return field.key === this.data.config.dataConfig.order;
            });

            if (tableField.translate) {
                const labels = response.alpha.data.map((field: any) => {
                    return tableField.translateValuePrefix + '.' + field.sortIndexName;
                });
                const result = this.translateService.instant(labels);

                this.data.result.alpha = [];
                Object.values(result).forEach((value: any) => {
                    this.data.result.alpha.push({
                        sortIndexName: value.substring(0, 1)
                    });
                });

                alphaList.forEach((elem: any, index: any) => {
                    if (this.data.result.alpha.find((x: any) => x.sortIndexName.toLowerCase() === elem.toLowerCase()) !== undefined) {
                        out.push({id: index, name: elem, found: true, filtered: elem === this.data.config.dataConfig.alphaFilter});
                    } else {
                        out.push({id: index, name: elem, found: false, filtered: false});
                    }
                });
                this.data.result.alpha = out;
            } else {
                this.data.result.alpha = response.alpha.data;
                if (+response.alpha.count > 0) {
                    alphaList.forEach((elem: any, index: any) => {
                        if (this.data.result.alpha.find((x: any) => x.sortIndexName.substring(0, 1).toLowerCase() === elem.toLowerCase()) !== undefined) {
                            out.push({id: index, name: elem, found: true, filtered: elem === this.data.config.dataConfig.alphaFilter});
                        } else {
                            out.push({id: index, name: elem, found: false, filtered: false});
                        }
                    });
                    this.data.result.alpha = out;
                }
            }
        });
    }

    tableAlphaFilter(value: any, data = null): void {
        if (data.config._id == this.data.config._id) {
            if (data) {
                this.data = data;
            }
            this.data.config.dataConfig.alphaFilter = value;
            this.writeLocalStorage();
            this.tableList(1, null, data.config._id);
        }
    }

    tableSort(field: any, data = null): void {
        if (data.config._id == this.data.config._id) {
            if (data) {
                this.data = data;
            }
            this.data.config.dataConfig.order = field.key;
            if (field.key === this.data.config.dataConfig.order) {
                this.data.config.dataConfig.reverse = this.data.config.dataConfig.reverse !== true;
            } else {
                this.data.config.dataConfig.reverse = false;
            }
            this.changeColumnFilterValue(data);
        }
    }

    tableList(pageNumber: number | null = null, data = null, id: string): void {
        if (this.data.config._id == id) {
            if (data) {
                this.data = data;
            }
            if (pageNumber != null) {
                this.data.config.paginConfig.currentPage = pageNumber;
                this.writeLocalStorage();
            }

            this.dataService.request('framework.Table/listAll', {
                config: this.data.config
            }).subscribe(response => {
                this.data.config.paginConfig.totalItems = response.total;
                this.data.result.table = response.table.data;

                this.data.result.pkKeys = [];
                if (this.data.result.table) {
                    this.data.result.table.forEach((elem: any) => {
                        this.data.result.pkKeys.push(elem[this.data.config.dataConfig.tableIndexName]);
                    });
                }

                // currentTables - wird von FormTableNavigatorComponent verwendet
                this.tableService.currentTables = {[this.data.config.dataConfig.tableName]: this.data.result.pkKeys};
                if (this.data.config.dataConfig.columnFilter.active) {
                    this.data.result.selects = response.selects;
                }

                this.data.config.dataConfig.tableFields.forEach((field: any) => {
                    if (field.footerSum) {
                        field._footerSumValue = response.footerSums[field.name];
                    }
                });

                this.setColorActive();
            });
        }
    }

    setColorActive(): void {
        this.data.result.table.forEach(row => {
            if (this.data.config.dataConfig?.rowColor) {
                this.data.config.dataConfig.rowColor.forEach(color => {
                    const valid = color.conditions.every(condition => {
                        if (condition.operator === FwTableRowColorConditionOperator.SMALLER_DATE) {
                            if (moment(condition.value, 'YYYY-MM-DD') < moment(row[condition.key], 'YYYY-MM-DD')) {
                                return true;
                            }
                        }
                        if (condition.operator === FwTableRowColorConditionOperator.BIGGER_DATE) {
                            if (moment(condition.value, 'YYYY-MM-DD') > moment(row[condition.key], 'YYYY-MM-DD')) {
                                return true;
                            }
                        }
                        if (condition.operator === FwTableRowColorConditionOperator.BIGGER_INT) {
                            if (+condition.value < +row[condition.key]) {
                                return true;
                            }
                        }
                        if (condition.operator === FwTableRowColorConditionOperator.SMALLER_INT) {
                            if (+condition.value > +row[condition.key]) {
                                return true;
                            }
                        }
                        if (condition.operator === FwTableRowColorConditionOperator.EQUAL) {
                            if (condition.value === row[condition.key]) {
                                return true;
                            }
                        }
                        return false;
                    });

                    if (valid) {
                        row.colorActive = true;
                        row.color = color.color;
                    }
                });
            }
        });
    }

    getTranslationLists(): void {
        this.data.config.dataConfig.tableFields.forEach((field: FwTableField) => {
            if (field.translate && Array.isArray(field._DB_type_constraints)) {
                field._DB_type_constraints = field._DB_type_constraints.map(constraint => field.translateValuePrefix + '.' + constraint);
                field._DB_type_constraints_translated = this.translateService.instant(field._DB_type_constraints);
            }
        });
    }

    reloadTable(data): void {
        if (data.config._id == this.data.config._id) {
            this.getAlpha();
            if (this.data.config.localStorage.enabled === true) {
                this.tableList(this.data.config.paginConfig.currentPage, null, this.data.config._id);
            } else {
                this.tableList(1, null, this.data.config._id);
            }
        }
    }

    openDataset(openData: FwOpenData, id): void {
        //console.log(openData, id);
        if (id == this.data.config._id) {
            this.status.emit({
                type: FwTableStatusType.ENTRY_CLICKED,
                data: openData.ID
            });

            if (this.data.config.openDatasetRouterLink === null) {
                if (this.data.config.formConfig) {
                    // ToDo: config varablen (send.event, router-link, open-form)
                    if (this.data.config.formConfig.formType === FwFormType.MODAL) {
                        this.formService.openModal.next(openData);
                    } else {
                        console.warn('Sinnvoll?');
                    }
                }
            } else {
                this.router.navigate([this.data.config.openDatasetRouterLink + '/', this.cryptoService.encrypt(JSON.stringify(openData))]).then();
            }
        }
    }

    changeColumnFilterValue(data): void {
        if (data.config._id == this.data.config._id) {
            this.writeLocalStorage();
            this.tableList(1, null, data.config._id);
            this.getAlpha();
        }
    }

    changeRows(data): void {
        if (data.config._id == this.data.config._id) {
            this.data = data;
            if (this.data.config.paginConfig.itemsPerPageDb) {
                this.fwStorageService.set('tableRows', this.data.config.localStorage.name, this.data.config.paginConfig.itemsPerPage).subscribe();
            }

            this.getAlpha();
            if (this.data.config.localStorage.enabled === true) {
                this.tableList(this.data.config.paginConfig.currentPage, null, data.config._id);
            } else {
                this.tableList(1, null, data.config._id);
            }
        }
    }

    getTableRows(): Observable<any> {
        if (!this.data.config.paginConfig.itemsPerPageDb) {
            return of(true);
        }

        return this.fwStorageService.get('tableRows', this.data.config.localStorage.name).pipe(map(response => {
            if (response) {
                this.data.config.paginConfig.itemsPerPage = response;
            }
            return of(true);
        }));
    }

    exportXLS(id): void {
        if (id == this.data.config._id) {
            this.tableService.setExporting.next({id: id, value: true});
            this.dataService.request('framework.Table/exportXLS', {
                config: this.data.config
            }).subscribe(response => {
                this.tableService.setExporting.next({id: id, value: false});
                const link = document.createElement('a');
                link.setAttribute('href', 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + response.data);
                link.setAttribute('download', response.path);
                link.click();
            });
        }
    }

}
