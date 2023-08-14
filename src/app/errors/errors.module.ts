import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {ErrorsComponent} from './errors.component';
import {AccountErrorComponent} from './account-error/account-error.component';
import {AccountDisabledComponent} from './account-disabled/account-disabled.component';
import {DbErrorComponent} from './db-error/db-error.component';
import {DbNoLocalRightsComponent} from './db-no-local-rights/db-no-local-rights.component';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {MaintenanceComponent} from './maintenance/maintenance.component';


const routes: Routes = [
    {
        path: '',
        component: ErrorsComponent,
        children: [
            {path: 'disabled', component: AccountDisabledComponent},
            {path: 'error', component: AccountErrorComponent},
            {path: 'db', component: DbErrorComponent},
            {path: 'maintenance', component: MaintenanceComponent},
            {path: '**', component: PageNotFoundComponent},
        ]
    }

];

@NgModule({
    declarations: [
        PageNotFoundComponent,
        ErrorsComponent,
        AccountErrorComponent,
        AccountDisabledComponent,
        DbErrorComponent,
        DbNoLocalRightsComponent,
        MaintenanceComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        TranslateModule,
    ]
})
export class ErrorsModule {
}
