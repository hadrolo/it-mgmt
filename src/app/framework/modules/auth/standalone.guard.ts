import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {mergeMap, Observable} from 'rxjs';
import {UrlTree} from '@angular/router';
import {FwMode, SettingsService} from '../../services/settings.service';
import {standaloneConfig} from '../../settings';
import {map} from 'rxjs/operators';
import {RightService} from '../right/right.service';

@Injectable({
    providedIn: 'root'
})
export class StandaloneGuard implements CanActivate {
    constructor(
        private settingsService: SettingsService,
        private rightService: RightService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (!this.settingsService.frameworkSettings) {
            this.settingsService.set(standaloneConfig);
        }

        return this.rightService.loadRights().pipe(map(_=>{
            return true;
        }));
    }
}
