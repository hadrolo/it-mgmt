import {Injectable} from '@angular/core';
import {DataService} from '../../services/data.service';
import {UserService} from '../auth/user.service';
import {Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {SettingsService} from '../../services/settings.service';
import {FwLogType, LogService} from '../../services/log.service';

@Injectable({
    providedIn: 'root'
})
export class RightService {
    public rights: any = null;

    constructor(
        private dataService: DataService,
        private userService: UserService,
        private router: Router,
        private settingsService: SettingsService,
        private logService: LogService,
    ) {
    }

    loadRights(): Observable<any> {
        if (!this.rights || (this.rights && this.rights.length == 0)) {
            return this.dataService
                .request('framework.Right/loadCurrentRights')
                .pipe(
                    map(response => {
                        this.rights = response.rights;
                        if (response.rights) {
                            return true;
                        } else {
                            console.error('no rights found/loaded')
                            return false;
                        }
                    })
                );
        } else {
            return of(true);
        }
    }

    routeAllowed(rights: string[], redirectRoute: string = this.settingsService.frameworkSettings.right.exitLink): boolean {
        let allowed = false;

        if (this.rights){
            if (rights && rights.length > 0) {
                rights.forEach(element => {
                    if (!allowed){
                        if (this.rights?.[element.split('/')[0].toLowerCase()]?.[element.split('/')[1]]) {
                            allowed =  true;
                        }
                    }
                });
                if (!allowed) {
                    if (!this.settingsService.frameworkSettings.production) {
                        console.warn('No access to route: ' + this.router.url);
                    }
                    this.logService.write(FwLogType.ACCESS_VIOLATION, 'No access to route: ' + this.router.url);
                    this.router.navigate([this.settingsService.frameworkSettings.right.exitLink]);
                    return false;
                } else {
                    if (!this.settingsService.frameworkSettings.production) {
                        //console.info('Access to protected route: ' + this.router.url);
                    }
                    return true;
                }
            } else {
                if (!this.settingsService.frameworkSettings.production) {
                    console.warn('No rights transmitted on route: ' + this.router.url);
                }
                this.logService.write(FwLogType.ACCESS_VIOLATION, 'No rights transmitted on route: ' + this.router.url);
                this.router.navigate([redirectRoute]);
                return false;
            }
        } else {
            if (!this.settingsService.frameworkSettings.production) {
                console.warn('No rights loaded in service');
            }
            this.logService.write(FwLogType.ACCESS_VIOLATION, 'No rights loaded in service');
            this.router.navigate([redirectRoute]);
            return false;
        }
    }
}
