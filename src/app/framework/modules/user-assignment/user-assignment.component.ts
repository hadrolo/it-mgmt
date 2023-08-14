import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FwTableColumnFilterType, FwTableConfig, FwTableData, FwTableStatus} from '../table/table.interfaces';
import {NavigationEnd, Router} from '@angular/router';
import {UserService} from '../auth/user.service';
import {TranslateService} from '@ngx-translate/core';
import {DataService} from '../../services/data.service';
import {SettingsService} from '../../services/settings.service';

@Component({
    selector: 'app-user-assignment',
    templateUrl: './user-assignment.component.html',
    styleUrls: ['./user-assignment.component.scss']
})
export class UserAssignmentComponent implements OnInit, OnDestroy {

    @Input() assignedTable: FwTableData;
    @Output() assignEvent = new EventEmitter();
    @Output() unassignEvent = new EventEmitter();

    unassignedTable: FwTableData = {
        config: null,
        result: {}
    }

    result: any = [];
    UID: string;
    loaded = false;

    private routerEnd$;

    constructor(
        public router: Router,
        public userService: UserService,
        private translateService: TranslateService,
        private dataService: DataService,
        public settingsService: SettingsService,
    ) {
    }

    ngOnInit(): void {
        this.createNotAssignedTable();
        this.routerEnd$ = this.router.events.subscribe(res => {
            if (res instanceof NavigationEnd) {
                this.createNotAssignedTable();
            }
        });
    }

    ngOnDestroy(): void {
        this.routerEnd$.unsubscribe();
    }

    openAssignUser($event: FwTableStatus): void {
        console.log('openAssignUser()');
        console.log($event);
        this.dataService.request('universe.User/getUserProfile', {
            UID: $event.data
        }).subscribe(response => {
            if (response.user){
                this.assignEvent.emit(response.user);
            } else {
                console.error('no response from user');
            }
        });
    }

    openUnassignUser($event: FwTableStatus): void {
        this.unassignEvent.emit($event.data);
    }

    createNotAssignedTable(): void {
        if (!this.loaded){
            this.unassignedTable.config = {
                title: 'Not Assigned User',
                language: this.userService.currentUser.language,
                dataFilterAllName: this.translateService.instant('FW.TABLE.DROPDOWN_DEFAULT'),
                openDatasetRouterLink: null,
/*                enableCreate: false,*/
                enableAlphalist: true,
                dataConfig: {
                    tableName: 'universe.users',
                    tableIndexName: 'UID',
                    tableJoins: [],
                    tableFilter: [],
                    tableFields: [
                        {key: 'username', name: 'username', title: this.translateService.instant('FW.USER.USERNAME'), sortable: true, searchable: true},
                        // {key: 'CID', name: 'CID', title: this.translateService.instant('FW.USER.CLIENT'), sortable: true, searchable: true},
                        {key: 'firstname', name: 'firstname', title: this.translateService.instant('FW.USER.FIRSTNAME'), sortable: true, searchable: true},
                        {key: 'lastname', name: 'lastname', title: this.translateService.instant('FW.USER.LASTNAME'), sortable: true, searchable: true},
                        {key: 'email', name: 'email', title: this.translateService.instant('FW.USER.EMAIL'), sortable: true, searchable: true},
                        {key: 'active', name: 'active', title: this.translateService.instant('FW.USER.ACTIVE'), sortable: true, searchable: true}
                    ],
                    rowColor: [],
                    rowImage: [],
                    reverse: false,
                    alphaFilter: '',
                    searchMinimumCharacter: 3,
                    search: '',
                    order: 'username',
                    columnFilter: {
                        buttonOn: this.translateService.instant('FW.TABLE.ENABLE_FILTER'),
                        buttonOff: this.translateService.instant('FW.TABLE.DISABLE_FILTER'),
                        buttonReset: this.translateService.instant('FW.TABLE.RESET_FILTER'),
                        trueValue: this.translateService.instant('FW.TABLE.TRUE_VALUE'),
                        falseValue: this.translateService.instant('FW.TABLE.FALSE_VALUE'),
                        enabled: true,
                        active: false,
                        dropDownDefault: this.translateService.instant('FW.TABLE.DROPDOWN_DEFAULT'),
                        fields: {
                            username: {value: ''},
                            // CID: {value: '', type: TableColumnFilterType.GROUP},
                            firstname: {value: ''},
                            lastname: {value: ''},
                            email: {value: ''},
                            active: {value: '', type: FwTableColumnFilterType.BOOLEAN}
                        }
                    }
                },
                localStorage: {
                    version: 0,
                    name: 'userlist_not_assigned',
                    enabled: true
                },
                paginConfig: {
                    id: 'pageUserlistNotAssigned',
                    rowFields: ['5', '10', '15', '20', '25', '30', '35', '40'],
                    itemsPerPageDb: false,
                    itemsPerPage: '30',
                    currentPage: 1,
                    totalItems: 0,
                    totalItemsLabel: this.translateService.instant('FW.TABLE.TOTAL_ROWS'),
                    prevLabel: this.translateService.instant('FW.TABLE.PREVIOUS'),
                    nextLabel: this.translateService.instant('FW.TABLE.NEXT')
                }
            };
            this.loaded = true;
        }
        this.unassignedTable.config = {
            title: 'Assigned User',
            language: this.userService.currentUser.language,
            dataFilterAllName: this.translateService.instant('FW.TABLE.DROPDOWN_DEFAULT'),
            openDatasetRouterLink: null,
/*            enableCreate: false,*/
            enableAlphalist: true,
            dataConfig: {
                tableName: 'universe.users',
                tableIndexName: 'UID',
                tableJoins: [],
                tableFilter: [],
                tableFields: [
                    {key: 'username', name: 'username', title: this.translateService.instant('FW.USER.USERNAME'), sortable: true, searchable: true},
                    // {key: 'CID', name: 'CID', title: this.translateService.instant('FW.USER.CLIENT'), sortable: true, searchable: true},
                    {key: 'firstname', name: 'firstname', title: this.translateService.instant('FW.USER.FIRSTNAME'), sortable: true, searchable: true},
                    {key: 'lastname', name: 'lastname', title: this.translateService.instant('FW.USER.LASTNAME'), sortable: true, searchable: true},
                    {key: 'email', name: 'email', title: this.translateService.instant('FW.USER.EMAIL'), sortable: true, searchable: true},
                    {key: 'active', name: 'active', title: this.translateService.instant('FW.USER.ACTIVE'), sortable: true, searchable: true}
                ],
                rowColor: [],
                rowImage: [],
                reverse: false,
                alphaFilter: '',
                searchMinimumCharacter: 3,
                search: '',
                order: 'username',
                columnFilter: {
                    buttonOn: this.translateService.instant('FW.TABLE.ENABLE_FILTER'),
                    buttonOff: this.translateService.instant('FW.TABLE.DISABLE_FILTER'),
                    buttonReset: this.translateService.instant('FW.TABLE.RESET_FILTER'),
                    trueValue: this.translateService.instant('FW.TABLE.TRUE_VALUE'),
                    falseValue: this.translateService.instant('FW.TABLE.FALSE_VALUE'),
                    enabled: true,
                    active: false,
                    dropDownDefault: this.translateService.instant('FW.TABLE.DROPDOWN_DEFAULT'),
                    fields: {
                        username: {value: ''},
                        // CID: {value: '', type: TableColumnFilterType.GROUP},
                        firstname: {value: ''},
                        lastname: {value: ''},
                        email: {value: ''},
                        active: {value: '', type: FwTableColumnFilterType.BOOLEAN}
                    }
                }
            },
            localStorage: {
                version: 0,
                name: 'userlist_not_assigned',
                enabled: true
            },
            paginConfig: {
                id: 'pageUserlistNotAssigned',
                rowFields: ['5', '10', '15', '20', '25', '30', '35', '40'],
                itemsPerPageDb: false,
                itemsPerPage: '30',
                currentPage: 1,
                totalItems: 0,
                totalItemsLabel: this.translateService.instant('FW.TABLE.TOTAL_ROWS'),
                prevLabel: this.translateService.instant('FW.TABLE.PREVIOUS'),
                nextLabel: this.translateService.instant('FW.TABLE.NEXT')
            }
        };
    }

}
