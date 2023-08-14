import {Component, Input, OnInit} from '@angular/core';
import {FwFormConfig, FwFormInputSize, FwFormInputStyle, FwFormViewMode} from '../form.interfaces';

@Component({
    selector: 'app-form-element',
    templateUrl: './form-element.component.html',
    styleUrls: ['./form-element.component.scss']
})
export class FormElementComponent implements OnInit {

    @Input() config: FwFormConfig;
    @Input() key;

    FormViewMode = FwFormViewMode;
    FormInputSize = FwFormInputSize;
    FormInputStyle = FwFormInputStyle;

    constructor() {
    }

    ngOnInit(): void {
        if (this.config.formFields[this.key]) {
            this.config.formFields[this.key]._registered = true;
        }
    }
}
