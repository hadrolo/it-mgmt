import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DataService} from './data.service';

@Injectable({
    providedIn: 'root'
})

export class UniverseService {

    constructor(
        private dataService: DataService,
    ) {
    }

    listCountries(order): Observable<any> {
        return this.dataService.request('universe.Country/listAll', {
            order
        });
    }

    getLatestRates(): Observable<any> {
        return this.dataService.request('universe.Rates/getLatest');
    }

    getUserProfile(UID): Observable<any> {
        return this.dataService.request('universe.User/getUserProfile', {
            UID
        });
    }
}
