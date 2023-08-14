import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../framework/modules/auth/user.service';
import {RightService} from '../../framework/modules/right/right.service';
import {MatDialog} from '@angular/material/dialog';
import {FwAuthentication} from '../../framework/modules/right/right.interfaces';
import {SettingsService} from '../../framework/services/settings.service';
import {SeoService} from '../../framework/services/seo.service';

interface DashboardSettingsConfig {
    selectedYear: string;
    selectedYearRange: string[];
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit{
    dashboardSettings: DashboardSettingsConfig = {
        selectedYear: '',
        selectedYearRange: []
    }

    constructor(
        public rightService: RightService,
        private router: Router,
        public userService: UserService,
        public translateService: TranslateService,
        public dialog: MatDialog,
        private settingsService: SettingsService,
        private seoService: SeoService,
    ) {
    }

    f/*wAuthentication = FwAuthentication;*/


    ngOnInit() {
        this.seoService.setTitle(this.settingsService.frameworkSettings.appName + ' - ' + this.translateService.instant('MENU.DASHBOARD'));
    }

    @ViewChild('modalDashboardSetting') modalDashboardSetting: TemplateRef<any>;

    openRouterLink(link) {
        this.router.navigate([link]);
    }

    openDashboardSettings() {
        this.dialog.open(this.modalDashboardSetting);
    }

    updateSettings() {
        /*        this.fwStorageService.set('desktopCharts', 'year', this.dashboardSettings.selectedYear).subscribe(result => {
                    this.getCharts();
                });*/
    }


    button2click() {
        this.rightService.loadRights().subscribe((rights) => {
            console.log('Button2 Click');
        });
    }

    button3click() {
        console.log('Button3 Click');
        console.log(this.rightService.rights);

    }
}
