import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FwTableColumnFilterType, FwTableData, FwTableRowColorConditionOperator} from '../../../framework/modules/table/table.interfaces';
import {UserService} from '../../../framework/modules/auth/user.service';
import {CryptoService} from '../../../framework/services/crypto.service';
import {RightService} from '../../../framework/modules/right/right.service';
import {SeoService} from '../../../framework/services/seo.service';
import {SettingsService} from '../../../framework/services/settings.service';

@Component({
    selector: 'app-user-mgmt-list',
    templateUrl: './user-mgmt-list.component.html',
    styleUrls: ['./user-mgmt-list.component.sass']
})

export class UserMgmtListComponent implements OnInit {

    table: FwTableData = {
        config: null,
        result: {}
    }

    constructor(
        public router: Router,
        private userService: UserService,
        private translateService: TranslateService,
        private cryptoService: CryptoService,
        private rightService: RightService,
        private settingsService: SettingsService,
        private seoService: SeoService,
    ) {
        this.translateService.onLangChange.subscribe(() => {
            this.createTable();
        });
    }

    ngOnInit(): void {
        this.seoService.setTitle(this.settingsService.frameworkSettings.appName + ' - ' + this.translateService.instant('FW.USER.MGMT'));
        this.rightService.routeAllowed(['User/openUserList'], '/home');
        this.createTable();
        this.router.events.subscribe(res => {
            if (res instanceof NavigationEnd) {
                this.createTable();
            }
        });
    }

    createTable(): void {
        this.table.config = {
            title: this.translateService.instant('FW.USER.USERLIST_TITLE'),
            language: this.userService.currentUser.language,
            dataFilterAllName: this.translateService.instant('FW.TABLE.DROPDOWN_DEFAULT'),
            openDatasetRouterLink: 'userlist/user/',
            enableAlphalist: true,
            dataConfig: {
                tableName: 'app.users',
                tableIndexName: 'public_id',
                tableJoins: [
                    {left: 'country', right: 'users', key: 'CID'},
                ],
                tableFilter: [],
                tableFields: [
                    {key: 'username', name: 'username', title: this.translateService.instant('USER.USERNAME'), sortable: true, searchable: true},
                    {key: 'usertype', name: 'usertype', title: this.translateService.instant('USER.USERTYPE'), sortable: true, searchable: true},
                    {key: 'firstname', name: 'firstname', title: this.translateService.instant('USER.FIRSTNAME'), sortable: true, searchable: true},
                    {key: 'lastname', name: 'lastname', title: this.translateService.instant('USER.LASTNAME'), sortable: true, searchable: true},
                    {key: 'email', name: 'email', title: this.translateService.instant('USER.EMAIL'), sortable: true, searchable: true},
                    {key: 'postcode', name: 'postcode', title: this.translateService.instant('USER.POST_CODE'), sortable: true, searchable: true},
                    {key: 'country', name: 'staat', title: this.translateService.instant('USER.COUNTRY'), table: 'country', index: 'CID', sortable: true, searchable: true},
                    {key: 'active', name: 'active', title: this.translateService.instant('DASHBOARD.ENABLED'), sortable: true, searchable: true},
                ],
                rowColor: [
                    {color: '#4c76ba', conditions: [{key: 'usertype', value: 'sysadmin', operator: FwTableRowColorConditionOperator.EQUAL}]},
                    {color: '#4c76ba', conditions: [{key: 'usertype', value: 'admin', operator: FwTableRowColorConditionOperator.EQUAL}]}
                ],
                rowImage: [
                    {
                        key: 'usertype',
                        icon: 'fas fa-star',
                        color: '#4c76ba',
                        conditions: [
                            {key: 'usertype', value: 'sysadmin', operator: FwTableRowColorConditionOperator.EQUAL},
                        ]
                    },
                    {
                        key: 'usertype',
                        icon: 'far fa-star',
                        color: '#4c76ba',
                        conditions: [
                            {key: 'usertype', value: 'admin', operator: FwTableRowColorConditionOperator.EQUAL},
                        ]
                    },
                    {
                        key: 'active',
                        icon: 'fa-times',
                        color: 'tomato',
                        conditions: [
                            {key: 'usertype', value: '0', operator: FwTableRowColorConditionOperator.EQUAL},
                        ]
                    },
                    {
                        key: 'active',
                        icon: 'fa-check',
                        color: '#0ca73b',
                        conditions: [
                            {key: 'usertype', value: '1', operator: FwTableRowColorConditionOperator.EQUAL},
                        ]
                    }
                ],
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
                        usertype: {value: '', type: FwTableColumnFilterType.GROUP},
                        firstname: {value: ''},
                        lastname: {value: ''},
                        email: {value: ''},
                        postcode: {value: ''},
                        country: {value: '', type: FwTableColumnFilterType.LOOKUP},
                        active: {value: '', type: FwTableColumnFilterType.BOOLEAN},
                    }
                }
            },
            localStorage: {
                version: 1,
                name: 'userlist',
                enabled: true,
            },
            paginConfig: {
                id: 'pageUserlist',
                rowFields: ['5', '10', '15', '20', '25', '30', '35', '40'],
                itemsPerPageDb: true,
                itemsPerPage: '20',
                currentPage: 1,
                totalItems: 0,
                totalItemsLabel: this.translateService.instant('FW.TABLE.TOTAL_ROWS'),
                prevLabel: this.translateService.instant('FW.TABLE.PREVIOUS'),
                nextLabel: this.translateService.instant('FW.TABLE.NEXT')
            }
        };
    }

    openInsertForm(): void {
        this.router.navigate(['/userlist/user/', this.cryptoService.encrypt(JSON.stringify({id: null, viewMode: 'insert'}))]);
    }
}
