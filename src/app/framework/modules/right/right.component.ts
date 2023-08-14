import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../auth/user.service';
import {RightService} from './right.service';
import {TranslateService} from '@ngx-translate/core';
import {SeoService} from '../../services/seo.service';

@Component({
    selector: 'app-right',
    templateUrl: './right.component.html',
    styleUrls: ['./right.component.scss']
})
export class RightComponent implements OnInit {
    constructor(
        private router: Router,
        public userService: UserService,
        public rightService: RightService,
        private route: ActivatedRoute,
        private translateService: TranslateService,
        private seoService: SeoService,
    ) {
    }

    ngOnInit(): void {
        this.seoService.setTitle(this.translateService.instant('SEO.ADMINPANEL_TITLE') + ' - ' + this.translateService.instant('ADMIN_PANEL.RIGHT_MGMT'));
    }

    openRouterLink(link: string): void {
        this.router.navigate([link], {relativeTo: this.route.parent});
    }
}
