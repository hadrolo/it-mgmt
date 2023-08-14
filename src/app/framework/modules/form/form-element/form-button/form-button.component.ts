import {Component, Input, OnInit} from '@angular/core';
import {FormService} from '../../form.service';
import {Location} from '@angular/common';
import {FwFormButtonConfig, FwFormButtonType, FwFormConfig, FwFormType, FwFormViewMode} from '../../form.interfaces';

declare var $: any; // JQuery

@Component({
    selector: 'app-form-button',
    templateUrl: './form-button.component.html',
    styleUrls: ['./form-button.component.scss']
})
export class FormButtonComponent implements OnInit {

    @Input() config: FwFormConfig;
    @Input() key;

    fwFormButtonType = FwFormButtonType;
    element: FwFormButtonConfig;

    constructor(
        public formService: FormService,
        private location: Location
    ) {
    }

    ngOnInit(): void {
        this.element = this.config.buttons[this.key];
    }

    buttonClick(): void {
        if (this.element.type === FwFormButtonType.CANCEL_VIEW) {
            this.clearModel();
            if (this.config.formType === FwFormType.MODAL) {
                this.formService.closeModal.next(true);
/*                $('#' + this.config.modalName + '-modal').modal('hide');*/
            } else {
                this.location.back();
            }
        }

        if (this.element.type === FwFormButtonType.INSERT) {
            this.clearModel();
            this.formService.insert.next(true);
            if (this.config.formType === FwFormType.MODAL) {
                this.formService.closeModal.next(true);
            } else {
                this.location.back();
            }
        }

        if (this.element.type === FwFormButtonType.CANCEL_INSERT) {
            this.clearModel();
            if (this.config.formType === FwFormType.MODAL) {
                this.formService.closeModal.next(true);
            } else {
                this.location.back();
            }
        }

        if (this.element.type === FwFormButtonType.UPDATE) {
            this.clearModel();
            Object.entries(this.config.formFields).forEach(([key, field]) => {
                field._oldValue = (' ' + field._value).slice(1);
            });
            this.formService.update.next(true);
            this.formService.changeMode.next(FwFormViewMode.VIEW);
        }

        if (this.element.type === FwFormButtonType.EDIT) {
            this.formService.changeMode.next(FwFormViewMode.EDIT);
        }

        if (this.element.type === FwFormButtonType.CANCEL_EDIT) {
            Object.entries(this.config.formFields).forEach(([key, field]) => {
                if (field._oldValue) {
                    field._value = (' ' + field._oldValue).slice(1);
                } else {
                    field._value = '';
                }
            });
            this.formService.changeMode.next(FwFormViewMode.VIEW);
        }

        if (this.element.type === FwFormButtonType.SET_DELETE) {
            this.formService.changeMode.next(FwFormViewMode.DELETE);
        }

        if (this.element.type === FwFormButtonType.DELETE) {
            this.clearModel();
            this.formService.delete.next(true);
            if (this.config.formType === FwFormType.MODAL) {
                this.formService.closeModal.next(true);
            }
        }

        if (this.element.type === FwFormButtonType.CANCEL_DELETE) {
            this.formService.changeMode.next(FwFormViewMode.VIEW);
        }
    }

    clearModel(): void {
        Object.entries(this.config.formFields).forEach(([key, field]) => {
            delete field._model;
        });
    }
}
