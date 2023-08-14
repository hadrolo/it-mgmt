import {Component, OnInit} from '@angular/core';
import {environment} from '../../../../environments/environment';

@Component({
    selector: 'app-dev-warning',
    templateUrl: './dev-warning.component.html',
    styleUrls: ['./dev-warning.component.css']
})
export class DevWarningComponent implements OnInit {

    devWarnings = environment.devWarnings;

    constructor() {
    }

    ngOnInit(): void {
    }

}
