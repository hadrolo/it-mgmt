import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import {UserService} from '../../modules/auth/user.service';
import {JwtService, FwTokenType} from '../../modules/auth/jwt.service';
import {SettingsService} from '../../services/settings.service';

@Component({
    selector: 'app-auth-info',
    templateUrl: './auth-info.component.html',
    styleUrls: ['./auth-info.component.scss']
})
export class AuthInfoComponent implements OnInit, OnDestroy {

    @Input() key = 'i';
    userServiceStatus$;
    jwtData;
    visible = false;

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent): void {
        event.preventDefault();
        if (event.ctrlKey && event.key === this.key) {
            this.visible = !this.visible;
        }
    }

    constructor(
        public userService: UserService,
        private jwtService: JwtService,
        public settingsService: SettingsService
    ) {
    }

    ngOnInit(): void {
        this.userServiceStatus$ = this.userService.tokenChanged.subscribe(event => {
            this.jwtData = jwt_decode(this.jwtService.getToken(FwTokenType.ACCESS_TOKEN));
            this.jwtData.expReadable = moment.unix(this.jwtData.exp).format('DD.MM.YYYY HH:mm');
        });
    }

    ngOnDestroy(): void {
        this.userServiceStatus$.unsubscribe();
    }

}
