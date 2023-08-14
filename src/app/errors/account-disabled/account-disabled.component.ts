import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {SettingsService} from '../../framework/services/settings.service';

@Component({
  selector: 'app-account-disabled',
  templateUrl: './account-disabled.component.html',
  styleUrls: ['./account-disabled.component.scss']
})
export class AccountDisabledComponent implements OnInit {

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
