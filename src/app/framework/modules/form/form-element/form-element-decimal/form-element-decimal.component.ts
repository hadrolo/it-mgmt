import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {FwFormConfig, FwFormField, FwFormInputSize, FwFormValidationStyle, FwFormViewMode} from '../../form.interfaces';
import {NgModel} from '@angular/forms';

@Component({
    selector: 'app-form-element-decimal',
    templateUrl: './form-element-decimal.component.html',
    styleUrls: ['./form-element-decimal.component.scss']
})
export class FormElementDecimalComponent implements OnInit, AfterViewInit {

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
