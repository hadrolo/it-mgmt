import { Component, OnInit } from '@angular/core';
import {SettingsService} from '../framework/services/settings.service';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss']
})
export class ErrorsComponent implements OnInit {

  constructor(
      public settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }

}
