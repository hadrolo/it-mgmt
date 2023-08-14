import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    constructor() {
    }

    loadFiles: Subject<any> = new Subject();
    deselectFiles: Subject<any> = new Subject();
    countUploadedFiles: Subject<any> = new Subject();
    openModal: Subject<any> = new Subject<any>();
    uploadCompleted: Subject<any> = new Subject();

}
