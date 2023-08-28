import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {UserProfileService} from './framework/modules/user-profile/user-profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'IT-Mgmt';
  constructor(
      private translate: TranslateService,
      private userProvileService: UserProfileService,
  ) {
  }

  ngOnInit(): void {
    console.log('xxxxx');
    let browserLanguage = this.translate.getBrowserLang();
    browserLanguage = browserLanguage.match(/en|de|fr/) ? browserLanguage : 'en';
    this.translate.use(browserLanguage);
  }

  openUserProfile() {
    this.userProvileService.openUserprofile.next(true);
  }
}
