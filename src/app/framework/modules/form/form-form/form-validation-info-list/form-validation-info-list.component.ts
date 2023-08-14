import {Component, Input, OnInit} from '@angular/core';
import {FwFormConfig} from '../../form.interfaces';

@Component({
    selector: 'app-form-validation-info-list',
    templateUrl: './form-validation-info-list.component.html',
    styleUrls: ['./form-validation-info-list.component.scss']
})
export class FormValidationInfoListComponent implements OnInit {

    @Input() config: FwFormConfig;

    constructor() {
    }

    ngOnInit(): void {
    }
}
