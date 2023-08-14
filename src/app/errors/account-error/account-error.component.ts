import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import {SettingsService} from '../../framework/services/settings.service';

@Component({
  selector: 'app-account-error',
  templateUrl: './account-error.component.html',
  styleUrls: ['./account-error.component.scss']
})
export class AccountErrorComponent implements OnInit {

  constructor(
    private router: Router,
    private settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }

  login() {
    this.router.navigate([this.settingsService.frameworkSettings.auth.loginDestination]);
  }
}
