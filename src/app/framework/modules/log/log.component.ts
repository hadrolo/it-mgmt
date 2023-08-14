import {Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import * as moment from 'moment';
import {UserService} from '../auth/user.service';
import {DataService} from '../../services/data.service';
import {
    FwTableColumnFilterField,
    FwTableColumnFilterType,
    FwTableConfig, FwTableData,
    FwTableField,
    FwTableFilterOperator,
    FwTableJoin,
    FwTableRowColorConditionOperator,
    FwTableStatus,
    FwTableStatusType
} from '../table/table.interfaces';
import {FwMode, SettingsService} from '../../services/settings.service';
import {FwFormTableNavigatorStyle} from '../form/form-element/form-table-navigator/form-table-navigator.component';
import {MatDialog} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';

declare var $: any; // JQuery

@Component({
    selector: 'app-log',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit, OnDestroy {

    formTableNavigatorConfig: FwFormTableNavigatorStyle = {
        bootstrapButtonName: 'btn-dark',
        bootstrapButtonSize: 'btn-sm'
    };

    // data
    log: any = [];
    navigation: any = [];
    timerList = [
        {id: 0, name: 'Aus', sec: 0},
        {id: 1, name: '2 Sekunden', sec: 2},
        {id: 2, name: '5 Sekunden', sec: 5},
        {id: 3, name: '10 Sekunden', sec: 10},
        {id: 4, name: '15 Sekunden', sec: 15},
        {id: 5, name: '30 Sekunden', sec: 30},
        {id: 6, name: '45 Sekunden', sec: 45},
        {id: 7, name: '1 Minute', sec: 60},
        {id: 8, name: '2 Minuten', sec: 120},
        {id: 9, name: '3 Minuten', sec: 180},
        {id: 10, name: '5 Minuten', sec: 300}
    ];

    msgButtonNext = true;
    msgButtonPrev = true;
    timerInterval;
    timerValue = 60;

    table: FwTableData = {
        config: null,
        result: {}
    }

    currentPkValue;

    @ViewChild('modalLogEntry') modalLogEntry: TemplateRef<any>;

    constructor(
        private dataService: DataService,
        private userService: UserService,
        public settingsService: SettingsService,
        public dialog: MatDialog,
        private toastrService: ToastrService,
    ) {
    }

    ngOnInit(): void {

        let tableFields: FwTableField[];
        let fields: { [key: string]: FwTableColumnFilterField };
        let tableJoins: FwTableJoin[];

        if (this.settingsService.frameworkSettings.frameworkMode === FwMode.UNIVERSE) {
            tableFields = [
                {key: 'created', name: 'created', title: 'Created', sortable: true, searchable: true, nowrap: true},
                {key: 'UID', name: 'UID', title: 'UID', sortable: true, searchable: true},
                /*{key: 'usertype', table: this.settingsService.frameworkSettings.log.userTableName, name: 'usertype', title: 'Usertype', sortable: true, searchable: true, translateValuePrefix: 'USER_ROLE'},*/
                {key: 'username', table: 'users', name: 'username', title: 'User', sortable: true, searchable: true},
                {key: 'APPID', name: 'APPID', title: 'APPID', sortable: true, searchable: true},
                {key: 'environment', name: 'environment', title: 'Environment', sortable: true, searchable: true},
                {key: 'c_component', name: 'c_component', title: '(C) Component', sortable: true, searchable: true, nowrapHeader: true},
                {key: 'c_method', name: 'c_method', title: '(C) Method', sortable: true, searchable: true, nowrapHeader: true},
                {key: 's_controller', name: 's_controller', title: '(S) Controller', sortable: true, searchable: true, nowrapHeader: true},
                {key: 's_action', name: 's_action', title: '(S) Action', sortable: true, searchable: true, nowrapHeader: true},
                {key: 'type', name: 'type', title: 'Type', sortable: true, searchable: true},
                {key: 'text', name: 'text', title: 'Text', sortable: false, searchable: true},
                {
                    key: this.settingsService.frameworkSettings.log.logTableIndexName,
                    name: this.settingsService.frameworkSettings.log.logTableIndexName,
                    title: 'ID',
                    sortable: true,
                    searchable: true,
                    visible: false,
                },
            ];
            fields = {
                UID: {value: '', type: FwTableColumnFilterType.GROUP},
                username: {value: ''},
                APPID: {value: '', type: FwTableColumnFilterType.GROUP},
                environment: {value: '', type: FwTableColumnFilterType.GROUP},
                c_component: {value: '', type: FwTableColumnFilterType.GROUP},
                c_method: {value: '', type: FwTableColumnFilterType.GROUP},
                s_controller: {value: '', type: FwTableColumnFilterType.GROUP},
                s_action: {value: '', type: FwTableColumnFilterType.GROUP},
                type: {value: '', type: FwTableColumnFilterType.GROUP},
                text: {value: ''},
                created: {value: ''},
            };
            tableJoins = [
                {left: this.settingsService.frameworkSettings.log.userTableName, right: this.settingsService.frameworkSettings.log.logTableName, key: 'UID'},
            ];
        } else {
            tableFields = [
                {key: 'created', name: 'created', title: 'Created', sortable: true, searchable: true},
                {key: 'UID', name: 'UID', title: 'UID', sortable: true, searchable: true},
                {key: 'username', table: this.settingsService.frameworkSettings.log.userTableName, name: 'username', title: 'User', sortable: true, searchable: true},
                /*{key: 'usertype', table: this.settingsService.frameworkSettings.log.userTableName, name: 'usertype', title: 'Usertype', sortable: true, searchable: true, translateValuePrefix: 'USER_ROLE'},*/
                {key: 'APPID', name: 'APPID', title: 'APPID', sortable: true, searchable: true},
                {key: 'c_component', name: 'c_component', title: '(C) Component', sortable: true, searchable: true, nowrapHeader: true},
                {key: 'c_method', name: 'c_method', title: '(C) Method', sortable: true, searchable: true, nowrapHeader: true},
                {key: 's_controller', name: 's_controller', title: '(S) Controller', sortable: true, searchable: true, nowrapHeader: true},
                {key: 's_action', name: 's_action', title: '(S) Action', sortable: true, searchable: true, nowrapHeader: true},
                {key: 'type', name: 'type', title: 'Type', sortable: true, searchable: true},
                {key: 'text', name: 'text', title: 'Text', sortable: false, searchable: true},
                {
                    key: this.settingsService.frameworkSettings.log.logTableIndexName,
                    name: this.settingsService.frameworkSettings.log.logTableIndexName,
                    title: 'ID',
                    sortable: true,
                    searchable: true,
                    visible: false,
                },
            ];
            fields = {
                UID: {value: '', type: FwTableColumnFilterType.GROUP},
                username: {value: ''},
                APPID: {value: '', type: FwTableColumnFilterType.GROUP},
                c_component: {value: '', type: FwTableColumnFilterType.GROUP},
                c_method: {value: '', type: FwTableColumnFilterType.GROUP},
                s_controller: {value: '', type: FwTableColumnFilterType.GROUP},
                s_action: {value: '', type: FwTableColumnFilterType.GROUP},
                type: {value: '', type: FwTableColumnFilterType.GROUP},
                text: {value: ''},
                created: {value: ''},
            };
            tableJoins = [
                {left: this.settingsService.frameworkSettings.log.userTableName, right: this.settingsService.frameworkSettings.log.logTableName, key: 'UID'}
            ];
        }

        this.table.config = {
            title: 'Logtable',
            language: this.userService.currentUser.language,
            dataFilterAllName: 'Alle',
            openDatasetRouterLink: null,
            enableAlphalist: true,
            dataConfig: {
                tableName: this.settingsService.frameworkSettings.log.logTableName,
                tableIndexName: this.settingsService.frameworkSettings.log.logTableIndexName,
                tableJoins,
                tableFields,
                tableFilter: [],
                rowImage: [
                    {key: 'type', icon: 'fa-sign-in-alt', color: 'forestgreen', conditions: [{key: 'type', value: 'login', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-sign-out-alt', color: 'gray', conditions: [{key: 'type', value: 'logout', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-user-circle', color: 'tomato', conditions: [{key: 'type', value: 'login-error', operator: FwTableRowColorConditionOperator.EQUAL}]},

                    {key: 'type', icon: 'fa-info-circle', color: 'gray', conditions: [{key: 'type', value: 'info', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-exclamation-circle', color: 'tomato', conditions: [{key: 'type', value: 'error', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-exclamation-circle', color: 'tomato', conditions: [{key: 'type', value: 'exception', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-exclamation-circle', color: 'tomato', conditions: [{key: 'type', value: 'access-violation', operator: FwTableRowColorConditionOperator.EQUAL}]},

                    {key: 'type', icon: 'fa-database', color: 'royalblue', conditions: [{key: 'type', value: 'insert', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-database', color: 'forestgreen', conditions: [{key: 'type', value: 'update', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-database', color: 'darkorange', conditions: [{key: 'type', value: 'delete', operator: FwTableRowColorConditionOperator.EQUAL}]},

                    {key: 'type', icon: 'fa-file', color: 'royalblue', conditions: [{key: 'type', value: 'insert-file', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-file', color: 'darkorange', conditions: [{key: 'type', value: 'delete-file', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {key: 'type', icon: 'fa-file', color: 'tomato', conditions: [{key: 'type', value: 'error-file', operator: FwTableRowColorConditionOperator.EQUAL}]}
                ],
                reverse: true,
                alphaFilter: '',
                searchMinimumCharacter: 3,
                search: '',
                order: this.settingsService.frameworkSettings.log.logTableIndexName,
                columnFilter: {
                    buttonOn: 'Filter ein',
                    buttonOff: 'Filter aus',
                    enabled: true,
                    active: false,
                    dropDownDefault: 'alle',
                    fields
                }
            },
            localStorage: {
                version: 0,
                name: 'log',
                enabled: true,
            },
            paginConfig: {
                id: 'log',
                rowFields: ['5', '10', '15', '20', '25', '30', '35', '40'],
                itemsPerPageDb: true,
                itemsPerPage: '20',
                currentPage: 1,
                totalItems: 0,
                totalItemsLabel: 'Zeilen',
                prevLabel: 'Zurück',
                nextLabel: 'Weiter'
            }
        };

        if (this.settingsService.frameworkSettings.log.appID) {
            this.table.config.dataConfig.tableFilter = [
                {table: this.settingsService.frameworkSettings.log.logTableName, field: 'APPID', operator: FwTableFilterOperator.EQUAL, values: [this.settingsService.frameworkSettings.log.appID]}
            ];
        } else {
            this.table.config.dataConfig.tableFilter = [];
        }
    }

    @HostListener('window:focus')
    onFocus(event: any): void {
        this.changeTimer();
    }

    @HostListener('window:blur')
    onBlur(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    ngOnDestroy(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    changeTimer(): void {
        if (this.timerValue > 0) {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
            this.timerInterval = setInterval(() => {
                const datetime = moment().format('DD.MM.YYYY HH:mm:ss');
                this.toastrService.info('Daten wurden neu geladen: ' + datetime, 'Auto-Reload');
            }, this.timerValue * 1000);
        } else {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
        }
    }

    handleStatus(event: FwTableStatus): void {
        if (event.type === FwTableStatusType.ENTRY_CLICKED) {
            this.openLogModal(event.data);
        }
    }

    openLogModal(ULID, openModal = true): void {
        this.currentPkValue = ULID;
        this.dataService.request('framework.Logfile/getEntry', {
            ULID
        }).subscribe(response => {
            this.log = response.log;
            this.log.error = this.log.text.split('::');
            if (this.log.type === 'insert') {
                this.log.error.table = this.log.error[0];
                this.log.error.field = this.log.error[1].slice(1, -1);
                this.log.error.field = this.log.error.field.replace(/"/g, '');
                this.log.error.field = this.log.error.field.split(',');
                this.log.error.value = this.log.error[2].slice(1, -1);
                this.log.error.value = this.log.error.value.replace(/"/g, '');
                this.log.error.value = this.log.error.value.split(',');
                this.log.error.fields = [];
                this.log.error.field.forEach((i, index: any) => {
                    this.log.error.fields.push({field: i, value: this.log.error.value[index]});
                });
                this.log.error.key = this.log.error[3];
            }
            if (this.log.type === 'update') {
                this.log.error.table = this.log.error[0];
                this.log.error.fields = [];
                this.log.error.fields.push({field: this.log.error[1], value: this.log.error[2]});
                this.log.error.key = this.log.error[3];
            }
            if (this.log.type === 'delete') {
                this.log.error.table = this.log.error[0];
                this.log.error.key = this.log.error[1];
            }
            if (this.log.type === 'insert' || this.log.type === 'update' || this.log.type === 'delete') {
                this.log.error.key = this.log.error.key.split('=');
                this.log.error.key.name = this.log.error.key[0];
                this.log.error.key.value = this.log.error.key[1];
            }
            if (this.log.type === 'insert-image') {
                this.log.text = JSON.parse(this.log.text);
            }

            if (openModal) {
                this.dialog.open(this.modalLogEntry);
            }
        });
    }


    goTo(event: any): void {
        this.openLogModal(event, false);
    }
}
