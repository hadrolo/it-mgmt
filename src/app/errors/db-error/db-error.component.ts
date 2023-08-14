import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import {SettingsService} from '../../framework/services/settings.service';

@Component({
  selector: 'app-db-error',
  templateUrl: './db-error.component.html',
  styleUrls: ['./db-error.component.scss']
})
export class DbErrorComponent implements OnInit {

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
