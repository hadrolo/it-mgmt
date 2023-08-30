import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {PageComponent} from './page.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TranslateModule} from '@ngx-translate/core';
import {NgChartsModule} from 'ng2-charts';
import {TableModule} from '../framework/modules/table/table.module';
import {LogModule} from '../framework/modules/log/log.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {LanguageSwitchModule} from '../framework/modules/language-switch/language-switch.module';
import {NgSelectModule} from '@ng-select/ng-select';
import {ToolbarModule} from './toolbar/toolbar.module';
import {LogfileViewerComponent} from './logfile-viewer/logfile-viewer.component';
import {RightGuard} from '../framework/modules/right/right.guard';
import {UserMgmtListComponent} from './user-mgmt/user-mgmt-list/user-mgmt-list.component';
import {UserMgmtFormComponent} from './user-mgmt/user-mgmt-form/user-mgmt-form.component';
import {FileModule} from '../framework/modules/file/file.module';
import { UserEditModalComponent } from './user-mgmt/user-edit-modal/user-edit-modal.component';
import {UserProfileStandaloneModule} from '../framework/modules/user-profile/user-profile-standalone/user-profile-standalone.module';
import {SsoGuard} from '../framework/modules/auth/sso.guard';
import {UserProfileSsoComponent} from '../framework/modules/user-profile/user-profile-sso/user-profile-sso.component';
import {UserProfileSsoModule} from '../framework/modules/user-profile/user-profile-sso/user-profile-sso.module';
import {RightLoaderGuard} from '../framework/modules/right/right.loader.guard';



const routes: Routes = [
    {
        path: '',
        component: PageComponent,
        /*        canActivate: [SsoGuard],*/
        children: [
            {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
            {path: 'dashboard', component: DashboardComponent},
            {path: 'userlist', component: UserMgmtListComponent},
            {path: 'userlist/user/:uid', component: UserMgmtFormComponent},
            {path: 'dashboard/user/:uid', component: UserMgmtFormComponent},
            {path: 'user/:user', component: UserMgmtFormComponent},
/*            {path: 'right', loadChildren: () => import('./../framework/modules/right/right.module').then(m => m.RightModule), data: {rights: ['Right/openRights']}, canActivate: [RightGuard]},*/
            {path: 'right', loadChildren: () => import('./../framework/modules/right/right.module').then(m => m.RightModule)},
            {path: 'ot', loadChildren: () => import('./ot/ot.module').then(m => m.OtModule)},
            {path: 'log', component: LogfileViewerComponent},
        ]
    }
];


@NgModule({
    declarations: [
        PageComponent,
        DashboardComponent,
        LogfileViewerComponent,
        UserMgmtFormComponent,
        UserMgmtListComponent,
        UserEditModalComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        TranslateModule,
        FormsModule,
        NgSelectModule,
        ReactiveFormsModule,
        NgChartsModule,
        LogModule,
        TableModule,
        ReactiveFormsModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatExpansionModule,
        MatButtonModule,
        MatTooltipModule,
        MatToolbarModule,
        MatDialogModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatFormFieldModule,
        LanguageSwitchModule,
        ToolbarModule,
        FileModule,
        UserProfileStandaloneModule,
        UserProfileSsoModule,
    ],
    exports: [],
    providers: [
        {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
    ]
})
export class PageModule {
}
