import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RightSetupFormComponent} from './right-setup-form/right-setup-form.component';
import {RightSetupListComponent} from './right-setup-list/right-setup-list.component';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {RightSetupAliasComponent} from './right-setup-alias/right-setup-alias.component';
import {TableModule} from '../../table/table.module';
import { RouterModule, Routes } from '@angular/router';
import {ToolbarModule} from '../../../../page/toolbar/toolbar.module';

const routes: Routes = [
    {
        path: '',
        children: [
            {path: '', redirectTo: 'list', pathMatch: 'full'},
            {path: 'list', component: RightSetupListComponent},
            {path: 'form/:urlData', component: RightSetupFormComponent},
        ]
    }
];

@NgModule({
    declarations: [
        RightSetupFormComponent,
        RightSetupListComponent,
        RightSetupAliasComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        TableModule,
        ToolbarModule
    ]
})
export class RightSetupModule {
}
