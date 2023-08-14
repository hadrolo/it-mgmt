import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {SettingsService} from '../../framework/services/settings.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {

  constructor(
    private router: Router,
    private settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }

  dashboard() {
    this.router.navigate([this.settingsService.frameworkSettings.auth.afterLoginDestination]);
  }

}
