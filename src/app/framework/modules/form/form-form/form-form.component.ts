import {Component, Input, OnInit} from '@angular/core';
import {FwFormConfig, FwFormInputSize} from '../form.interfaces';

@Component({
    selector: 'app-form-form',
    templateUrl: './form-form.component.html',
    styleUrls: ['./form-form.component.scss']
})
export class FormFormComponent implements OnInit {

    @Input() config: FwFormConfig;
    FormInputSize = FwFormInputSize;

    constructor() {
    }

    ngOnInit(): void {
    }

    keepOriginalOrder = (a, b) => a.key;
}
