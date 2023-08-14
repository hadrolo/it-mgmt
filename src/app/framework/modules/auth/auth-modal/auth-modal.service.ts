import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

export interface FwAuthModalSubject {
    type: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthModalService {

    showModal: Subject<any> = new Subject<FwAuthModalSubject>();
    hideModal: Subject<any> = new Subject();

    constructor() {
    }

}
