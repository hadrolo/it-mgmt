import {Component, Input} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {PageService} from '../page.service';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../framework/modules/auth/user.service';
import {RightService} from '../../framework/modules/right/right.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  constructor(
      private breakpointObserver: BreakpointObserver,
      public pageService: PageService,
      public translateService: TranslateService,
      public userService: UserService,
      public rightService: RightService,

  ) {
  }

  @Input() title: string;
}
