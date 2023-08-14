import {Component, Input, OnInit} from '@angular/core';
import {FwFormConfig} from '../../form.interfaces';

@Component({
    selector: 'app-form-validation-info',
    templateUrl: './form-validation-info.component.html',
    styleUrls: ['./form-validation-info.component.scss']
})
export class FormValidationInfoComponent implements OnInit {

    @Input() config: FwFormConfig;
    @Input() key;

    constructor() {
    }

    ngOnInit(): void {
    }
}
