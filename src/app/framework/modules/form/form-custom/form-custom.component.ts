import {Component, Input, OnInit} from '@angular/core';
import {FormService} from '../form.service';
import {FwFormConfig, FwFormViewMode} from '../form.interfaces';

@Component({
    selector: 'app-form-custom',
    templateUrl: './form-custom.component.html',
    styleUrls: ['./form-custom.component.scss']
})
export class FormCustomComponent implements OnInit {

    @Input() config: FwFormConfig;

    FormViewMode = FwFormViewMode;

    constructor(
        private formService: FormService
    ) {
    }

    ngOnInit(): void {
        this.formService.formReady.next(true);
    }

    missingFields(): any {
        return Object.entries(this.config.formFields).filter(([key, field]) => {
            return field._registered === false;
        });
    }
}
