import { Component } from '@angular/core';
import {FwMode, SettingsService} from '../../../services/settings.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {

  protected readonly FwMode = FwMode;

  constructor(
      public settingService: SettingsService,
  ) {
  }

}
