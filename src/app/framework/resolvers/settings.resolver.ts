import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {SettingsService} from '../services/settings.service';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class FwSettingsResolver implements Resolve<any> {

    constructor(
        private http: HttpClient,
        private settingsService: SettingsService,
    ) {
    }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        const headers = new HttpHeaders({
            'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
            Pragma: 'no-cache',
            Expires: '0'
        });

        return this.http.get('./assets/settings.conf', {headers}).pipe(map(response => {
            this.settingsService.jsonSettings = response;
            return response;
        }));
    }
}
