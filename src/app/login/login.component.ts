import {Component, OnInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {RightService} from '../framework/modules/right/right.service';

declare var particlesJS: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

    devWarnings = environment.devWarnings;
    currentApplicationVersion = environment.appVersion;

    constructor(
        private rightService: RightService,
    ) {}

    ngOnInit() {
        particlesJS.load('particles', './assets/particles/config.json', function () {
        });
        this.rightService.rights = [];
    }

}
