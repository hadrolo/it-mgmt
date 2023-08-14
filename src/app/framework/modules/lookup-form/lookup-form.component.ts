import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {DataService} from '../../services/data.service';
import {UserService} from '../auth/user.service';
import {FwFormViewMode} from '../form/form.interfaces';

enum FwFormType {
    VIEW = 'view',
    EDIT = 'edit',
    INSERT = 'insert'
}

enum FwFormShow {
    DEFAULT = 'default',
    EDIT = 'edit',
    SEARCH = 'search'
}

export interface FwLookupFormConfig {
    multiSelect?: boolean;
    insertNew?: boolean;
    parentTable: string;
    parentIndexName: string;
    parentFieldName: string;
    clientTable: string;
    clientIndexName: string;
    clientFieldName: string;
    clientFieldName2?: string;
    lookupTable?: string;
    lookupTableIndexName?: string;
    searchStartLength: number;
}

@Component({
    selector: 'app-lookup-form',
    templateUrl: './lookup-form.component.html',
    styleUrls: ['./lookup-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LookupFormComponent implements OnInit {
    // DATA
    @Input() config: FwLookupFormConfig;
    @Input() selIndex: any; // SELECTED INDEX (MAIN INDEX)
    @Input() view: FwFormViewMode;
    result: any = {};
    fieldValue = '';

    // FORM
    FormViewMode = FwFormViewMode;
    searchResult = false;

    constructor(
        public dataService: DataService,
        public userService: UserService
    ) {
    }

    ngOnInit(): void {
        this.get();
        if (!this.config.multiSelect) {
            this.config.multiSelect = false;
        }
        if (this.config.insertNew !== false) {
            this.config.insertNew = true;
        }
    }

    get(): void {
        this.dataService.request('framework.LookupForm/getParentData', {
            config: this.config,
            parentIndexValue: this.selIndex
        }).subscribe(response => {
            this.result.selected = response.data;
        });
    }

    list(): void {
        if (this.fieldValue.length > 1) {
            if (this.fieldValue.length > this.config.searchStartLength) {
                this.dataService.request('framework.LookupForm/ListAll', {
                    config: this.config,
                    clientFieldValue: this.fieldValue
                }).subscribe(response => {
                    this.result.list = response.result.data;
                    if (this.result.list.length > 0) {
                        this.searchResult = true;
                    } else {
                        this.searchResult = false;
                    }
                });
            } else {
                this.result[this.config.clientTable] = [];
            }
        } else {
            this.searchResult = false;
        }
    }

    insertNew(): void {
        this.dataService.request('framework.LookupForm/insertData', {
            config: this.config,
            parentIndexValue: this.selIndex,
            clientFieldValue: this.fieldValue
        }).subscribe(response => {
            if (!response.errors) {
                this.set(response.lastID);
            }
        });
    }

    set(ID): void {
        this.dataService.request('framework.LookupForm/setData', {
            config: this.config,
            parentIndexValue: this.selIndex,
            clientIndexValue: ID
        }).subscribe(() => {
            this.searchResult = false;
            this.result.selected = [];
            this.result.list = [];
            this.fieldValue = '';
            this.get();
        });
    }

    delete(index = null): void {
        this.dataService.request('framework.LookupForm/deleteData', {
            index,
            config: this.config,
            parentIndexValue: this.selIndex
        }).subscribe(() => {
            this.fieldValue = '';
            this.searchResult = false;
            this.result.selected = [];
            this.result.list = [];
            this.get();
        });
    }
}
