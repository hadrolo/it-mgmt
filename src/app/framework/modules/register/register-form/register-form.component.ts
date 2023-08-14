import {Component, OnInit} from '@angular/core';
import {RegisterService} from '../register.service';
import {SettingsService} from '../../../services/settings.service';
import {DataService} from '../../../services/data.service';
import {UserService} from '../../auth/user.service';

@Component({
    selector: 'app-register-form',
    templateUrl: './register-form.component.html',
    styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {

    loaded = false;

    constructor(
        public settingsService: SettingsService,
        private dataService: DataService,
        private userService: UserService,
        public registerService: RegisterService,
    ) {
    }

    ngOnInit(): void {
        this.registerService.createForm().subscribe(() => {
            this.loaded = true;
        });

        this.dataService.request('framework.Auth/registerLookup', {
            config: this.settingsService.frameworkSettings.auth.register,
            lang: this.userService.currentUser.language
        }).subscribe(response => {
            Object.entries(this.settingsService.frameworkSettings.auth.register.rows).forEach(([key, row]: any) => {
                if (row.type === 'lookup') {
                    row.items = response.fields[row.field];
                }
            });
        });


    }
}
