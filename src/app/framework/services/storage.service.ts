import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {UserService} from '../modules/auth/user.service';
import {LocalStorageService} from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class FwStorageService {

    constructor(
        private userService: UserService,
        private dataService: DataService,
        private localStorageService: LocalStorageService,

    ) {
    }

    set(type, key, value): Observable<any> {
        if (this.userService.currentUser.loggedIn) {
            return this.dataService.request('framework.Storage/setData', {
                type,
                key,
                value
            }).pipe(map(result => {
                    return result.userRows.affectedRows === 1;
                }
            ));
        } else {
            this.localStorageService.setItem(type + key, value);
            return of(false);
        }
    }

    get(type, key): Observable<any> {
        if (this.userService.currentUser.loggedIn) {
            return this.dataService.request('framework.Storage/getData', {
                type,
                key
            }).pipe(map(response => {
                if (response.row && response.row.count > 0) {
                    return response.row.data[0].s_value;
                }
                return null;
            }));
        } else {
            const localStorageValue = this.localStorageService.getItem(type + key);
            if (localStorageValue) {
                return of(localStorageValue);
            } else {
                return of(false);
            }
        }
    }

    getAuto(type, key, defaultValue): Observable<any> {
        if (this.userService.currentUser.loggedIn) {
            return this.dataService.request('framework.Storage/getAuto', {
                type,
                key,
                defaultValue,
            }).pipe(map(response => {
                if (response.key) {
                    return response.key;
                } else {
                    return '';
                }
            }));
        } else {
            const localStorageValue = this.localStorageService.getItem(type + key);
            if (localStorageValue) {
                return of(localStorageValue);
            } else {
                this.localStorageService.setItem(type + key, defaultValue);
                return of(defaultValue);
            }

        }
    }

}
