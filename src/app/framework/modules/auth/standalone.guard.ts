import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UrlTree} from '@angular/router';
import {FwMode, SettingsService} from '../../services/settings.service';
import {standaloneConfig} from '../../settings';

@Injectable({
    providedIn: 'root'
})
export class StandaloneGuard implements CanActivate {
    constructor(
        private settingsService: SettingsService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (!this.settingsService.frameworkSettings || this.settingsService.frameworkSettings.frameworkMode !== FwMode.STANDALONE) {
            this.settingsService.set(standaloneConfig);
        }

        return true;
    }
}
