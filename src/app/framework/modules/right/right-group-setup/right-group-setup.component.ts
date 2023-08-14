import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FwTableConfig, FwTableData} from '../../table/table.interfaces';
import {UserService} from '../../auth/user.service';
import {FwFormButtonType, FwFormInputSize, FwFormInputStyle, FwFormType, FwFormValidationStyle, FwFormViewMode} from '../../form/form.interfaces';
import {TableService} from '../../table/table.service';
import {SettingsService} from '../../../services/settings.service';
import {SeoService} from '../../../services/seo.service';


@Component({
    selector: 'app-right-group-setup',
    templateUrl: './right-group-setup.component.html',
    styleUrls: ['./right-group-setup.component.scss']
})
export class RightGroupSetupComponent implements OnInit {

    rightGroupConfig: FwTableConfig;

    table: FwTableData = {
        config: null,
        result: {}
    }

    constructor(
        private router: Router,
        private translateService: TranslateService,
        private userService: UserService,
        private route: ActivatedRoute,
        public tableService: TableService,
        private settingsService: SettingsService,
        private seoService: SeoService,
    ) {
    }

    ngOnInit(): void {
        this.seoService.setTitle(this.settingsService.frameworkSettings.appName + ' - ' + this.translateService.instant('FW.RIGHT.RIGHT_GROUP_TITLE'));
        this.createRightGroupTable();
    }

    createRightGroupTable(): void {
        this.table.config = {
            title: this.translateService.instant('FW.RIGHT.RIGHT_GROUP_TITLE'),
            language: this.userService.currentUser.language,
            dataFilterAllName: this.translateService.instant('FW.TABLE.DROPDOWN_DEFAULT'),
            openDatasetRouterLink: null,
            insertButton: {
                enabled: true,
                innerHtml: '<i class="fa fa-plus"></i>',
                i18n: 'FW.BUTTON.NEW'
            },
            enableAlphalist: true,
            dataConfig: {
                tableName: 'app.rights_groups',
                tableIndexName: 'RGID',
                tableJoins: [],
                tableFilter: [],
                tableFields: [
                    {key: 'RGID', name: 'RGID', title: 'Gruppenname', sortable: true, searchable: true},
                    {key: 'description', name: 'description', title: this.translateService.instant('FW.RIGHT.DESCRIPTION'), sortable: false, searchable: true}
                ],
                rowColor: [],
                rowImage: [],
                reverse: false,
                alphaFilter: '',
                searchMinimumCharacter: 3,
                search: '',
                order: 'RGID',
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
                        name: {value: ''}
                    }
                }
            },
            localStorage: {
                version: 0,
                name: 'table_rights_groups',
                enabled: true
            },
            paginConfig: {
                id: 'rightGroupTable',
                rowFields: ['5', '10', '15', '20', '25', '30', '35', '40'],
                itemsPerPageDb: true,
                itemsPerPage: '20',
                currentPage: 1,
                totalItems: 0,
                totalItemsLabel: this.translateService.instant('FW.TABLE.TOTAL_ROWS'),
                prevLabel: this.translateService.instant('FW.TABLE.PREVIOUS'),
                nextLabel: this.translateService.instant('FW.TABLE.NEXT')
            },
            formConfig: {
                formName: 'RightGroup',
                titleView: this.translateService.instant('FW.RIGHT.FORM_TITLE_VIEW'),
                titleInsert: this.translateService.instant('FW.RIGHT.FORM_TITLE_INSERT'),
                titleEdit: this.translateService.instant('FW.RIGHT.FORM_TITLE_EDIT'),
                titleDelete: this.translateService.instant('FW.RIGHT.FORM_TITLE_DELETE'),
                tableName: 'app.rights_groups',
                tableIndexName: 'RGID',
                modalName: 'right',
                formValidationStyle: FwFormValidationStyle.FIELD,
                formType: FwFormType.MODAL,
                viewMode: FwFormViewMode.INSERT,
                formInputSize: FwFormInputSize.SMALL,
                formFields: {
                    RGID: {name: 'RGID', title: 'Gruppenname', validationInfo: 'Gruppennamen eingeben', style: FwFormInputStyle.TITLE_COUNT},
                    description: {name: 'description', title: this.translateService.instant('FW.RIGHT.DESCRIPTION'), style: FwFormInputStyle.TITLE_COUNT}
                },
                buttons: {
                    cancelView: {type: FwFormButtonType.CANCEL_VIEW, name: 'Zurück', enabled: true},
                    insert: {type: FwFormButtonType.INSERT, name: 'Einfügen', enabled: true},
                    cancelInsert: {type: FwFormButtonType.CANCEL_INSERT, name: 'Abbrechen', enabled: true},
                    update: {type: FwFormButtonType.UPDATE, name: 'Speichern', enabled: true},
                    setDelete: {type: FwFormButtonType.SET_DELETE, name: 'Löschen', enabled: true},
                    delete: {type: FwFormButtonType.DELETE, name: 'Jetzt löschen', enabled: true},
                    cancelDelete: {type: FwFormButtonType.CANCEL_DELETE, name: 'Abbrechen', enabled: true},
                    edit: {type: FwFormButtonType.EDIT, name: 'Bearbeiten', enabled: true},
                    cancelEdit: {type: FwFormButtonType.CANCEL_EDIT, name: 'Abbrechen', enabled: true}
                }
            }
        };
    }

    openRouterLink(link: string): void {
        this.router.navigate([link], {relativeTo: this.route.parent});
    }

}
