import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'IT-Mgmt';
  constructor(
      private translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    let browserLanguage = this.translate.getBrowserLang();
    browserLanguage = browserLanguage.match(/en|de|fr/) ? browserLanguage : 'en';
    this.translate.use(browserLanguage);
  }

}
