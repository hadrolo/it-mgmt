import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {TableModule} from '../table/table.module';
import {RightGroupSetupComponent} from './right-group-setup/right-group-setup.component';
import {RightComponent} from './right.component';
import {RouterModule, Routes } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {UserrightAssignComponent} from './userright-assign/userright-assign.component';
import {RightAssignComponent} from './right-assign/right-assign.component';
import {RightGrouprightSetupComponent} from './right-groupright-setup/right-groupright-setup.component';
import {RightSetupComponent} from './right-setup/right-setup.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ToolbarModule} from '../../../page/toolbar/toolbar.module';
import {FormModule} from '../form/form.module';


const routes: Routes = [
    {
        path: '',
        children: [
            {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
            {path: 'dashboard', component: RightComponent},
            {path: 'userright-assign', component: UserrightAssignComponent},
            {path: 'right-setup', loadChildren: () => import('./right-setup/right-setup.module').then(m => m.RightSetupModule)},
            {path: 'groupright-setup', component: RightGrouprightSetupComponent},
            {path: 'right-group-setup', component: RightGroupSetupComponent}

        ]
    }
];

@NgModule({
    declarations: [RightGroupSetupComponent, RightComponent, UserrightAssignComponent, RightAssignComponent, RightGrouprightSetupComponent, RightSetupComponent],
    imports: [RouterModule.forChild(routes), CommonModule, TranslateModule, TableModule, FormsModule, MatButtonModule, MatIconModule, ToolbarModule, FormModule],
    providers: []
})
export class RightModule {
}
