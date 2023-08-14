import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SettingsService} from '../../framework/services/settings.service';
import {SeoService} from '../../framework/services/seo.service';

@Component({
    selector: 'app-logfile-viewer',
    templateUrl: './logfile-viewer.component.html',
    styleUrls: ['./logfile-viewer.component.scss']
})
export class LogfileViewerComponent implements OnInit {

    constructor(
        public translateService: TranslateService,
        private settingsService: SettingsService,
        private seoService: SeoService,
    ) {
    }

    ngOnInit() {
        this.seoService.setTitle(this.settingsService.frameworkSettings.appName + ' - ' + this.translateService.instant('FW.LOG.TITLE'));
    }


}
