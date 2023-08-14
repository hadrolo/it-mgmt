import {Injectable} from '@angular/core';
import {Subscription} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ObsService {

    private observables$: Subscription[] = [];

    clear(observables): void {
        this.observables$.forEach(subscription => subscription.unsubscribe());
    }

}
