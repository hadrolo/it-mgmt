import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UrlTree} from '@angular/router';
import {UserService} from './user.service';
import {JwtService, FwTokenType} from './jwt.service';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TokenGuard implements CanActivate {

    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        this.userService.loggedInArea = false;

        if (!this.jwtService.getToken(FwTokenType.ACCESS_TOKEN)) {
            return this.userService.newAnonymous();
        } else {
            return this.userService.updateCurrentUser().pipe(map((response) => {
                if (this.userService.currentUser.loggedIn) {
                    this.userService.setupForcedLogout();
                }
                return response;
            }));
        }
    }
}
