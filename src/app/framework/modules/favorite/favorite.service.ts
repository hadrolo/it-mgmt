import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FavoriteService {

    constructor() {
    }

    refreshWidget: Subject<any> = new Subject();
    enabled: Subject<any> = new Subject();
    componentLoaded: Subject<any> = new Subject();
    isLoaded = false;

    activate(): void {
        if (!this.isLoaded) {
            this.componentLoaded.subscribe(() => {
                this.isLoaded = true;
                this.enabled.next(null);
            });
        }

        this.enabled.next(null);
    }
}
