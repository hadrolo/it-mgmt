import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TagService {

    reloadViewer: Subject<any> = new Subject();

    constructor() {
    }
}
