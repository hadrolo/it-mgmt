import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserMgmtFormComponent} from './user-mgmt-form.component';
import {ToolbarModule} from '../../../../page/toolbar/toolbar.module';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';



@NgModule({
  declarations: [UserMgmtFormComponent],
  exports: [
    UserMgmtFormComponent
  ],
  imports: [
    CommonModule,
    ToolbarModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class UserMgmtFormModule { }
