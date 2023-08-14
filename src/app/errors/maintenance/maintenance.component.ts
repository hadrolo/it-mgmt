import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SettingsService} from '../../framework/services/settings.service';
import * as moment from 'moment';
import {UserService} from '../../framework/modules/auth/user.service';

@Component({
    selector: 'app-maintenance',
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit, OnDestroy {

    endDateTime;
    maintenanceActive$;

    constructor(
        private router: Router,
        private settingsService: SettingsService,
        private userService: UserService,
    ) {
    }

    ngOnInit(): void {
        this.maintenanceActive$ = this.userService.maintenanceActive.subscribe(active => {
            if (active) {
                this.endDateTime = moment(this.settingsService.jsonSettings.maintenance.end, 'YYYY-MM-DD HH:mm', true).toDate();
            } else {
                this.start();
            }
        });
    }

    ngOnDestroy(): void {
        this.maintenanceActive$.unsubscribe();
    }

    start() {
        this.router.navigate([this.settingsService.frameworkSettings.auth.afterLoginDestination]);
    }

}
