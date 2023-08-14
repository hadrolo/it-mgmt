import {Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {SettingsService} from '../../services/settings.service';

@Component({
    selector: 'app-access',
    templateUrl: './access.component.html',
    styleUrls: ['./access.component.scss']
})
export class AccessComponent implements OnInit {

    apis: any[] = [];
    userTypes: any[] = [];

    constructor(
        public dataService: DataService,
        public settingsService: SettingsService,
    ) {
    }

    ngOnInit(): void {
        this.dataService.request('framework.Access/listAPIs').subscribe(response => {
            this.userTypes = response.userTypes;
            response.apis.forEach(api => {
                this.dataService.request('framework.Access/listAccessRules', {api}).subscribe(apiResponse => {
                    this.apis.push({
                        name: api.toUpperCase(),
                        access: apiResponse.access,
                        usertypes: apiResponse.userTypes,
                        no_access: apiResponse.access.some(acc => {
                            return acc.missing.length > 0;
                        })
                    });
                });
            });
        });
    }
}
