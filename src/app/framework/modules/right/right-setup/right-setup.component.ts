import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FwTableColumnFilterType, FwTableConfig, FwTableData} from '../../table/table.interfaces';
import {UserService} from '../../auth/user.service';
import {Subscription} from 'rxjs';
import {FwFormButtonType, FwFormInputSize, FwFormInputStyle, FwFormType, FwFormValidationStyle, FwFormViewMode} from '../../form/form.interfaces';

@Component({
    selector: 'app-right-setup',
    templateUrl: './right-setup.component.html',
    styleUrls: ['./right-setup.component.scss']
})
export class RightSetupComponent implements OnInit, OnDestroy {

    rightConfig: FwTableConfig;
    private translation$: Subscription;
    table: FwTableData = {
        config: null,
        result: {}
    }

    constructor(
        private router: Router,
        private translateService: TranslateService,
        private userService: UserService,
        private activatedRoute: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.createRightTable();
        this.translateService.onLangChange.subscribe(() => {
            this.createRightTable();
        });
    }

    ngOnDestroy(): void {
        this.translation$.unsubscribe();
    }

    createRightTable(): void {
        this.table.config = {
            title: this.translateService.instant('FW.RIGHT.TABLE_TITLE'),
            language: this.userService.currentUser.language,
            dataFilterAllName: this.translateService.instant('FW.TABLE.DROPDOWN_DEFAULT'),
            openDatasetRouterLink: null,
            insertButton: {
                enabled: true,
                innerHtml: 'Insert',
                i18n: null
            },
            enableAlphalist: true,
            dataConfig: {
                tableName: 'app.rights',
                tableIndexName: 'RID',
                tableFilter: [],
                tableJoins: [{left: 'rights_groups', right: 'rights', key: 'RGID'}],
                tableFields: [
                    {key: 'group_name', name: 'name', table: 'rights_groups', title: 'Gruppe', sortable: true, searchable: true},
                    {key: 'name', name: 'name', title: this.translateService.instant('FW.RIGHT.NAME'), sortable: true, searchable: true},
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
                        group_name: {value: '', type: FwTableColumnFilterType.GROUP},
                        name: {value: ''}
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
            },
            formConfig: {
                formName: 'Right',
                titleView: this.translateService.instant('FW.RIGHT.FORM_TITLE_VIEW'),
                titleInsert: this.translateService.instant('FW.RIGHT.FORM_TITLE_INSERT'),
                titleEdit: this.translateService.instant('FW.RIGHT.FORM_TITLE_EDIT'),
                titleDelete: this.translateService.instant('FW.RIGHT.FORM_TITLE_DELETE'),
                tableName: 'app.rights',
                tableIndexName: 'RID',
                modalName: 'right',
                formValidationStyle: FwFormValidationStyle.FIELD,
                formType: FwFormType.MODAL,
                viewMode: FwFormViewMode.INSERT,
                formInputSize: FwFormInputSize.SMALL,
                formFields: {
                    group_name: {name: 'RGID', title: 'Gruppe', foreignName: 'name'},
                    name: {name: 'name', title: this.translateService.instant('FW.RIGHT.NAME'), validationInfo: this.translateService.instant('FW.RIGHT.VALINFO_NAME'), style: FwFormInputStyle.TITLE_COUNT},
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
        this.router.navigate([link], {relativeTo: this.activatedRoute.parent});
    }
}
