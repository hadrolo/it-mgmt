import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UrlTree} from '@angular/router';
import {universeConfig} from '../../settings';
import {FwMode, SettingsService} from '../../services/settings.service';

@Injectable({
    providedIn: 'root'
})
export class UniverseGuard implements CanActivate {
    constructor(
        private settingsService: SettingsService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (!this.settingsService.frameworkSettings || this.settingsService.frameworkSettings.frameworkMode !== FwMode.UNIVERSE) {
            this.settingsService.set(universeConfig);
        }

        return true;
    }
}
