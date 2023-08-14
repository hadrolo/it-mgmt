import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UrlTree} from '@angular/router';
import {map} from 'rxjs/operators';
import {JwtService, FwTokenType} from './jwt.service';
import {UserService} from './user.service';
import {SettingsService} from '../../services/settings.service';

@Injectable({
    providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {
    constructor(
        private router: Router,
        private userService: UserService,
        private jwtService: JwtService,
        private settingsService: SettingsService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (!this.jwtService.getToken(FwTokenType.ACCESS_TOKEN)) {
            // if there is no access token, generate anonymous tokens and redirect user to login
            this.userService.loggedInArea = false;
            return this.userService.newAnonymous().pipe(
                map((response: any) => {
                    this.settingsService.frameworkSettings.auth.afterLoginDestination = state.url;

                    this.userService.loginSubject.next(null);
                    return false;
                })
            );
        } else {
            // if there is an access token, check if it's an anonymous token or not
            this.userService.loggedInArea = true;
            return this.userService.updateCurrentUser().pipe(
                map((response: any) => {
                    if (this.userService.currentUser.loggedIn) {
                        // if not anonymous guard will allow access
                        this.userService.setupForcedLogout();
                        return true;
                    } else {
                        // if anonymous redirect user to login
                        this.settingsService.frameworkSettings.auth.afterLoginDestination = state.url;

                        this.userService.loginSubject.next(null);
                        return false;
                    }
                })
            );
        }
    }
}
