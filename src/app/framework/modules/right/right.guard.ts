import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UrlTree} from '@angular/router';
import {RightService} from './right.service';

@Injectable({
    providedIn: 'root'
})
export class RightGuard implements CanActivate {
    constructor(
        private rightService: RightService
    ) {
    }

    // @ts-ignore ToDo: Prüfe ob ohne Möglich
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const rights = route.data.rights as Array<string>;

        return this.rightService.routeAllowed(rights);
    }
}
