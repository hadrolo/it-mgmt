import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UrlTree} from '@angular/router';
import {RightService} from './right.service';

@Injectable({
    providedIn: 'root'
})
export class RightLoaderGuard implements CanActivate {
    constructor(
        private rightService: RightService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return this.rightService.loadRights();

    }
}
