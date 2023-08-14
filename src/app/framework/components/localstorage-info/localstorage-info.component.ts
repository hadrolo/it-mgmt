import {Component, HostListener, Input, OnInit} from '@angular/core';
import {SettingsService} from '../../services/settings.service';
import {ToastrService} from 'ngx-toastr';

declare var $: any; // JQuery

@Component({
    selector: 'app-localstorage-info',
    templateUrl: './localstorage-info.component.html',
    styleUrls: ['./localstorage-info.component.scss']
})
export class LocalstorageInfoComponent implements OnInit {

    // The key that will show the info modal
    @Input() key = 'q';

    keys: any[] = [];

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent): void {
        event.preventDefault();
        if (event.ctrlKey && event.key === this.key) {
            this.getKeys();
            $('#remove-localstorage-modal').modal({backdrop: 'static'});
        }
    }

    constructor(
        private settingsService: SettingsService,
        private toastrService: ToastrService,
    ) {
    }

    ngOnInit(): void {
    }

    getKeys(): void {
        // get all localStorage keys
        this.keys = Object.keys(localStorage);

        // filter only those which belong to the app according to the settings
        this.keys = this.keys.filter(key => {
            return key.startsWith(this.settingsService.frameworkSettings.appID);
        }).map(key => {
            return {name: key, checked: true, show: false};
        });
    }

    remove(): void {
        this.keys.forEach(key => {
            if (key.checked) {
                localStorage.removeItem(key.name);
            }
        });
      this.toastrService.info('FW items were deleted!');
    }

    showInfo(key: any): void {
        key.show = !key.show;
        key.data = JSON.parse(localStorage.getItem(key.name));
    }
}
