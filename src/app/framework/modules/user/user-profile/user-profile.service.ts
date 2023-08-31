import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {

    constructor() {
    }

    openUserProfileStandalone: Subject<any> = new Subject();
    openUserprofileSso: Subject<any> = new Subject();
}
