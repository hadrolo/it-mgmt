import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormService} from '../form.service';
import {FwFormButtonType, FwFormConfig, FwFormStatus, FwFormViewMode} from '../form.interfaces';

@Component({
    selector: 'app-form-card',
    templateUrl: './form-card.component.html',
    styleUrls: ['./form-card.component.scss']
})
export class FormCardComponent implements OnInit {

    @Input() config: FwFormConfig;
    @Output() status = new EventEmitter<FwFormStatus>();

    FormViewMode = FwFormViewMode;
    FormButtonType = FwFormButtonType;

    constructor(
        public formService: FormService
    ) {
    }

    ngOnInit(): void {
        this.formService.formReady.next(true);
    }
}
