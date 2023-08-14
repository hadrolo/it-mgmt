import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserProfileStandaloneService {

    constructor() {
    }

    openUserProfileStandalone: Subject<any> = new Subject();
}
