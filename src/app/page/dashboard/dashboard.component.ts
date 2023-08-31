import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../framework/modules/auth/user.service';
import {RightService} from '../../framework/modules/right/right.service';
import {MatDialog} from '@angular/material/dialog';
import {FwAuthentication} from '../../framework/modules/right/right.interfaces';
import {SettingsService} from '../../framework/services/settings.service';
import {SeoService} from '../../framework/services/seo.service';
/*import {MsalService} from '@azure/msal-angular';*/
import {HttpClient} from '@angular/common/http';
import {SsoService} from '../../framework/modules/sso/sso.service';
import {FwFormViewMode} from '../../framework/modules/form/form.interfaces';
import {DataService} from '../../framework/services/data.service';

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
    public profile: any;

    constructor(
        public rightService: RightService,
        private router: Router,
        public userService: UserService,
        public translateService: TranslateService,
        public dialog: MatDialog,
        private settingsService: SettingsService,
        private seoService: SeoService,
/*        private msalService: MsalService,*/
        private dataService: DataService,
        private settingService: SettingsService,
    ) {
    }


    ngOnInit() {
        //this.seoService.setTitle(this.settingsService.frameworkSettings.appName + ' - ' + this.translateService.instant('MENU.DASHBOARD'));
        this.apiTest();
    }

    @ViewChild('modalDashboardSetting') modalDashboardSetting: TemplateRef<any>;

    openRouterLink(link: any) {
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
            console.log(rights);
        });
    }

    button3click() {
        console.log('Button3 Click');
        this.rightService.loadRights().subscribe(_=>{
            console.log(this.rightService.rights);
        });
/*        this.dataService.request('framework.Right/loadCurrentRights', {
        }).subscribe((response: any) => {
            console.log(response);
        });*/
    }

    button5click() {
        this.dataService.request('framework.Right/loadCurrentRights').subscribe((response: any) => {
            console.log(response);
        });
    }


/*    logout(popup?: boolean) {
        if (popup) {
            this.msalService.logoutPopup({
                mainWindowRedirectUri: "/"
            });
        } else {
            this.msalService.logoutRedirect();
        }
    }*/


    apiTest(): void {
        this.dataService.request('Country/listAll', {
            LANG: 'de'
        }).subscribe((response: any) => {
            console.log(response);
        });
    }

}
