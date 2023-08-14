import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {FwFormConfig, FwFormField, FwFormInputSize, FwFormValidationStyle, FwFormViewMode} from '../../form.interfaces';
import {NgModel} from '@angular/forms';

@Component({
    selector: 'app-form-element-select-data',
    templateUrl: './form-element-select-data.component.html',
    styleUrls: ['./form-element-select-data.component.scss']
})
export class FormElementSelectDataComponent implements OnInit, AfterViewInit {

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
