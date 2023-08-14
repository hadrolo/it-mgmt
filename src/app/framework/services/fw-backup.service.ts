import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FwBackupService {

    backups = {};

    constructor() {
    }

    backup(key, object): void {
        this.backups[key] = JSON.parse(JSON.stringify(object));
    }

    reset(key, object): any {
        for (const property in this.backups[key]) {
            if (this.backups[key].hasOwnProperty(property)) {
                object[property] = this.backups[key][property];
            }
        }

        delete this.backups[key];
        return object;
    }
}
