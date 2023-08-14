import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OtGroupComponent} from './ot-group/ot-group.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import { OtGroupFormComponent } from './ot-group/ot-group-form/ot-group-form.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {path: '', redirectTo: 'group', pathMatch: 'full'},
            {path: 'group', component: OtGroupComponent},
        ]
    }
];

@NgModule({
    declarations: [
        OtGroupComponent,
        OtGroupFormComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
    ]
})
export class OtModule {
}
