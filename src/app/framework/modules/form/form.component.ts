import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {FormService} from './form.service';
import {DataService} from '../../services/data.service';
import {ToastrService} from 'ngx-toastr';
import {Location} from '@angular/common';
import {SettingsService} from '../../services/settings.service';
import {Subscription} from 'rxjs';
import {FwFormButtonType, FwFormConfig, FwFormInputSize, FwFormInputStyle, FwFormStatus, FwFormStatusType, FwFormType, FwFormViewMode} from './form.interfaces';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {

    @Input() config: FwFormConfig;
    @Output() status = new EventEmitter<FwFormStatus>();
    @ViewChild('fwModalForm') fwModalForm: TemplateRef<any>;

    FormType = FwFormType;
    FormViewMode = FwFormViewMode;
    FormButtonType = FwFormButtonType;
    loaded = false;

    private open$: Subscription;
    private openModal$: Subscription;
    private closeModal$: Subscription;
    private insert$: Subscription;
    private update$: Subscription;
    private delete$: Subscription;
    private changeMode$: Subscription;

    constructor(
        private formService: FormService,
        private dataService: DataService,
        private toastrService: ToastrService,
        private location: Location,
        private settingsService: SettingsService,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        if (!this.config.formInputSize) {
            this.config.formInputSize = FwFormInputSize.DEFAULT;
        }

        // set default buttons if not set
        if (!this.config.buttons) {
            if (this.config.formType === FwFormType.CUSTOM && !this.settingsService.frameworkSettings.production) {
                console.warn('No button config defined, using default');
            }
            this.config.buttons = {
                cancelView: {type: FwFormButtonType.CANCEL_VIEW, name: 'Zurück', enabled: true},
                insert: {type: FwFormButtonType.INSERT, name: 'Einfügen', enabled: true},
                cancelInsert: {type: FwFormButtonType.CANCEL_INSERT, name: 'Abbrechen', enabled: true},
                update: {type: FwFormButtonType.UPDATE, name: 'Speichern', enabled: true},
                setDelete: {type: FwFormButtonType.SET_DELETE, name: 'Löschen', enabled: true},
                delete: {type: FwFormButtonType.DELETE, name: 'Jetzt löschen', enabled: true},
                cancelDelete: {type: FwFormButtonType.CANCEL_DELETE, name: 'Abbrechen', enabled: true},
                edit: {type: FwFormButtonType.EDIT, name: 'Bearbeiten', enabled: true},
                cancelEdit: {type: FwFormButtonType.CANCEL_EDIT, name: 'Abbrechen', enabled: true}
            };
        } else {
            Object.entries(this.config.buttons).forEach(([key, button]) => {
                if (!button.enabled) {
                    button.enabled = true;
                }
            });
        }

        Object.entries(this.config.formFields).forEach(([key, field]) => {
            if (!field.style) {
                field.style = FwFormInputStyle.TITLE_COUNT;
            }
            field._value = '';
            field._registered = false;
        });

        this.open$ = this.formService.open.subscribe(data => this.open(data));
        this.openModal$ = this.formService.openModal.subscribe(data => this.open(data, true));
        this.closeModal$ = this.formService.closeModal.subscribe(() => this.closeModal());
        this.insert$ = this.formService.insert.subscribe(() => this.insertData());
        this.update$ = this.formService.update.subscribe(() => this.updateData());
        this.delete$ = this.formService.delete.subscribe(() => this.deleteData());
        this.changeMode$ = this.formService.changeMode.subscribe(mode => this.changeMode(mode));

        this.changeMode(this.config.viewMode);
        if (this.config.formType === FwFormType.CUSTOM || this.config.formType === FwFormType.CARD) {
            this.open({ID: this.config.pkValue, viewMode: this.config.viewMode});
        }
    }

    ngOnDestroy(): void {
        this.open$.unsubscribe();
        this.openModal$.unsubscribe();
        this.closeModal$.unsubscribe();
        this.insert$.unsubscribe();
        this.update$.unsubscribe();
        this.delete$.unsubscribe();
        this.changeMode$.unsubscribe();
    }

    changeMode(mode): void {
        this.config.viewMode = mode;

        Object.entries(this.config.buttons).forEach(([key, button]) => {
            this.checkButtonVisibility(button);
        });

        if (this.config.viewMode === FwFormViewMode.DELETE) {
            Object.entries(this.config.formFields).forEach(([key, field]) => {
                field._disabled = true;
            });
        } else {
            Object.entries(this.config.formFields).forEach(([key, field]) => {
                field._disabled = false;
            });
        }
    }

    checkButtonVisibility(button): void {
        if (this.config.viewMode === FwFormViewMode.VIEW) {
            button._visible = [FwFormButtonType.EDIT, FwFormButtonType.SET_DELETE, FwFormButtonType.CANCEL_VIEW].includes(button.type);
        } else if (this.config.viewMode === FwFormViewMode.INSERT) {
            button._visible = [FwFormButtonType.INSERT, FwFormButtonType.CANCEL_INSERT].includes(button.type);
        } else if (this.config.viewMode === FwFormViewMode.EDIT) {
            button._visible = [FwFormButtonType.UPDATE, FwFormButtonType.CANCEL_EDIT].includes(button.type);
        } else if (this.config.viewMode === FwFormViewMode.DELETE) {
            button._visible = [FwFormButtonType.DELETE, FwFormButtonType.CANCEL_DELETE].includes(button.type);
        }
    }

    closeModal(): void {
        this.dialog.closeAll();
        this.status.emit({
            type: FwFormStatusType.CLOSE_MODAL
        });
    }

    open(data, modal = false): void {
        this.changeMode(data.viewMode);
        this.config.pkValue = data.ID;

        this.dataService.request('framework.Form/getFormInfo', {
            config: this.config
        }).subscribe(response => {
            Object.entries(response.formFields).forEach(([key, value]) => {
                this.config.formFields[key] = Object.assign(value, this.config.formFields[key]);

                if (this.config.pkValue === '0') {
                    if (this.config.formFields[key]._DB_Default !== null) {
                        this.config.formFields[key]._value = this.config.formFields[key]._DB_Default;
                    } else {
                        this.config.formFields[key]._value = '';
                    }
                }

                if (this.config.formFields[key]._disabled === undefined) {
                    this.config.formFields[key]._disabled = false;
                }
                if (this.config.formFields[key].placeholder === undefined) {
                    this.config.formFields[key].placeholder = '';
                }
                if (this.config.formFields[key].readOnly === undefined) {
                    this.config.formFields[key].readOnly = false;
                }
            });

            if (this.config.pkValue !== '0') {
                this.getData();
            } else {
                this.loaded = true;
            }

            if (modal) {
                /*$('#' + this.config.modalName + '-modal').modal({backdrop: 'static'});*/
                this.dialog.open(this.fwModalForm);

                this.status.emit({
                    type: FwFormStatusType.OPEN_MODAL
                });
            } else {
                this.status.emit({
                    type: FwFormStatusType.OPEN
                });
            }
        });
    }

    getData(): void {
        this.dataService.request('framework.Form/getData', {
            config: this.config
        }).subscribe(response => {
            this.loaded = true;

            Object.entries(response.data).forEach(([key, value]: any) => {
                this.config.formFields[key]._value = value;
                this.config.formFields[key]._oldValue = value === null ? null : (' ' + value).slice(1);

                this.updateForeignName(key);
            });
        });
    }

    updateForeignName(key): void {
        // for FK values get the matching element name from the data array

        if (this.config.formFields[key]._DB_Key === 'MUL' && this.config.formFields[key]._DB_CONSTRAINT_TYPE === 'FOREIGN KEY' && this.config.formFields[key]._value) {
            this.config.formFields[key]._foreignValue = this.config.formFields[key]._data.find(element => {
                return element[this.config.formFields[key].name] === this.config.formFields[key]._value;
            })[this.config.formFields[key].foreignName];
        }
    }

    insertData(): void {
        this.dataService.request('framework.Form/insertData', {
            config: this.config
        }).subscribe(response => {
            if (!response.errors) {
                this.status.emit({
                    type: FwFormStatusType.INSERT,
                    data: {
                        id: response.lastID
                    }
                });

                this.toastrService.info('Daten wurden gespeichert');

                // TODO: customize
                if (this.config.formType !== FwFormType.MODAL) {
                    this.location.back();
                }
            }
        });
    }

    updateData(): void {
        Object.entries(this.config.formFields).forEach(([key, value]: any) => {
            this.updateForeignName(key);
        });

        this.dataService.request('framework.Form/updateData', {
            config: this.config
        }).subscribe(response => {
            if (!response.errors) {
                this.status.emit({
                    type: FwFormStatusType.UPDATE,
                    data: {
                        id: this.config.pkValue
                    }
                });

                this.toastrService.info('Daten wurden aktualisiert');

                this.config.viewMode = FwFormViewMode.VIEW;
            }
        });
    }

    deleteData(): void {
        this.dataService.request('framework.Form/deleteData', {
            config: this.config
        }).subscribe(response => {
            if (!response.errors) {
                this.status.emit({
                    type: FwFormStatusType.DELETE,
                    data: {
                        id: this.config.pkValue
                    }
                });

                this.toastrService.info('Daten wurden gelöscht');

                // TODO: customize
                if (this.config.formType !== FwFormType.MODAL) {
                    this.location.back();
                }
            }
        });
    }
}
