import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FwTableColumnFilterType, FwTableConfig, FwTableData, FwTableFieldAlignment} from '../../../table/table.interfaces';
import {UserService} from '../../../auth/user.service';
import {CryptoService} from '../../../../services/crypto.service';
import {FwFormViewMode} from '../../../form/form.interfaces';
import {SettingsService} from '../../../../services/settings.service';
import {SeoService} from '../../../../services/seo.service';




@Component({
    selector: 'app-right-list-setup',
    templateUrl: './right-setup-list.component.html',
    styleUrls: ['./right-setup-list.component.scss']
})
export class RightSetupListComponent implements OnInit {

    rightConfig: FwTableConfig;
    table: FwTableData = {
        config: null,
        result: {}
    }

    constructor(
        private router: Router,
        private translateService: TranslateService,
        private userService: UserService,
        private activatedRoute: ActivatedRoute,
        private cryptoService: CryptoService,
        private settingService: SettingsService,
        private settingsService: SettingsService,
        private seoService: SeoService,
    ) {
    }

    ngOnInit(): void {
        this.seoService.setTitle(this.settingsService.frameworkSettings.appName + ' - ' + this.translateService.instant('FW.RIGHT.RIGHT_TITLE'));
        this.createRightTable();
        this.translateService.onLangChange.subscribe(() => {
            this.createRightTable();
        });
    }

    createRightTable(): void {
        this.table.config = {
            title: this.translateService.instant('FW.RIGHT.RIGHT_TITLE'),
            language: this.userService.currentUser.language,
            dataFilterAllName: this.translateService.instant('FW.TABLE.DROPDOWN_DEFAULT'),
            openDatasetRouterLink: (this.settingService.frameworkSettings.right.dashboardLink + 'right-setup/form'),
            enableAlphalist: true,
            dataConfig: {
                tableName: 'app.rights',
                tableIndexName: 'RID',
                tableFilter: [],
                tableJoins: [],
                tableFields: [
                    {key: 'type', name: 'type', title: 'Typ', sortable: true, searchable: true},
                    {key: 'module', name: 'module', title: 'Module', sortable: true, searchable: true},
                    {key: 'RGID', name: 'RGID', title: 'Gruppe', sortable: true, searchable: true},
/*                    {
                        key: 'usertypes',
                        table: 'position_field',
                        name: 'usertypes',
                        title: 'Usertypes',
                        sortable: true,
                        subquery: '(SELECT count(*) FROM rights_usertypes AS rut WHERE rut.RID=rights.RID)',
                        searchable: false,
                        nowrapHeader: true,
                        alignment: FwTableFieldAlignment.CENTER,
                    },*/
                    {key: 'name', name: 'name', title: this.translateService.instant('FW.RIGHT.NAME'), sortable: true, searchable: true},
                    {key: 'class', name: 'class', title: 'class', sortable: true, searchable: true},
                    {key: 'method', name: 'name', title: 'method', sortable: true, searchable: true},
                    {key: 'description', name: 'description', title: this.translateService.instant('FW.RIGHT.DESCRIPTION'), sortable: false, searchable: true}
                ],
                rowColor: [],
                rowImage: [],
                reverse: false,
                alphaFilter: '',
                searchMinimumCharacter: 3,
                search: '',
                order: 'name',
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
                        RGID: {value: '', type: FwTableColumnFilterType.GROUP},
                        module: {value: '', type: FwTableColumnFilterType.GROUP},
                        type: {value: '', type: FwTableColumnFilterType.GROUP},
                        usertypes: {value: ''},
                        name: {value: ''},
                        class: {value: '', type: FwTableColumnFilterType.GROUP},
                        method: {value: ''},
                        description: {value: ''},
                    }
                }
            },
            localStorage: {
                version: 0,
                name: 'table_rights',
                enabled: true
            },
            paginConfig: {
                id: 'rightTable',
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

    openRouterLink(link: string): void {
        this.router.navigate([this.settingService.frameworkSettings.right.dashboardLink + link]);

    }

    openInsertForm(): void {
        const urlData = {
            viewMode: FwFormViewMode.INSERT,
            ID: null,
        };
        this.router.navigate(['form', this.cryptoService.encrypt(JSON.stringify(urlData))], {relativeTo: this.activatedRoute.parent});
    }

/*    openDialog(): void {
        this.dialog.open(RightSetupFormComponent, {
            data: {},
            disableClose: true,
            width: '400px'
        });
    }*/
}
