import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsService} from '../../services/settings.service';
import * as moment from 'moment';
import {UserService} from '../../modules/auth/user.service';

@Component({
    selector: 'app-maintenance-info',
    templateUrl: './maintenance-info.component.html',
    styleUrls: ['./maintenance-info.component.scss']
})
export class MaintenanceInfoComponent implements OnInit, OnDestroy {

    start;
    end;
    maintenanceSet$;

    constructor(
        public settingsService: SettingsService,
        private userService: UserService,
    ) {
    }

    ngOnInit(): void {
        this.maintenanceSet$ = this.userService.maintenanceSet.subscribe(set => {
            if (set) {
                this.start = moment(this.settingsService.jsonSettings.maintenance.start, 'YYYY-MM-DD HH:mm', true).format('DD.MM.YYYY HH:mm');
                this.end = moment(this.settingsService.jsonSettings.maintenance.end, 'YYYY-MM-DD HH:mm', true).format('DD.MM.YYYY HH:mm');
            }
        });
    }

    ngOnDestroy(): void {
        this.maintenanceSet$.unsubscribe();
    }

}
