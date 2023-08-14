import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgModel} from '@angular/forms';
import {FwFormConfig, FwFormField, FwFormInputSize, FwFormValidationStyle, FwFormViewMode} from '../../form.interfaces';

@Component({
    selector: 'app-form-element-checkbox',
    templateUrl: './form-element-checkbox.component.html',
    styleUrls: ['./form-element-checkbox.component.scss']
})
export class FormElementCheckboxComponent implements OnInit, AfterViewInit {

    @Input() config: FwFormConfig;
    @Input() key;
    @ViewChild('model') model: NgModel;

    FormViewMode = FwFormViewMode;
    FormInputSize = FwFormInputSize;
    FormValidationStyle = FwFormValidationStyle;
    element: FwFormField;

    constructor() {
    }

    ngOnInit(): void {
        this.element = this.config.formFields[this.key];
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.getNgModel();
        });
    }

    getNgModel(): void {
        this.config.formFields[this.key]._model = this.model;
    }
}
