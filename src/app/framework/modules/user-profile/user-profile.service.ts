import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserProfileService {

    constructor() {
    }

    openUserprofile: Subject<any> = new Subject();
}
