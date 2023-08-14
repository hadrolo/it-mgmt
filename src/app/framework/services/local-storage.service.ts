import {Injectable} from '@angular/core';
import {SettingsService} from './settings.service';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    constructor(
        private settingsService: SettingsService
    ) {
    }

    setItem(itemName: string, value): void {
        localStorage.setItem(this.settingsService.frameworkSettings.appID + '_' + itemName, JSON.stringify(value));
    }

    getItem(itemName: string): any {
        if (localStorage.getItem(this.settingsService.frameworkSettings.appID + '_' + itemName)) {
            return JSON.parse(localStorage.getItem(this.settingsService.frameworkSettings.appID + '_' + itemName));
        } else {
            return null;
        }
    }

    removeItem(itemName: string): void {
        localStorage.removeItem(this.settingsService.frameworkSettings.appID + '_' + itemName);
    }

    setItemProperty(itemName: string, propertyName: string, value): void {
        const item = JSON.parse(localStorage.getItem(this.settingsService.frameworkSettings.appID + '_' + itemName));
        item[propertyName] = value;
        localStorage.setItem(this.settingsService.frameworkSettings.appID + '_' + itemName, JSON.stringify(item));
    }

    getItemProperty(itemName: string, propertyName: string): any {
        const item = JSON.parse(localStorage.getItem(this.settingsService.frameworkSettings.appID + '_' + itemName));
        return item[propertyName];
    }

    removeItemProperty(itemName: string, propertyName: string): boolean {
        const item = JSON.parse(localStorage.getItem(this.settingsService.frameworkSettings.appID + '_' + itemName));
        const result = delete item[propertyName];
        localStorage.setItem(this.settingsService.frameworkSettings.appID + '_' + itemName, JSON.stringify(item));
        return result;
    }
}
