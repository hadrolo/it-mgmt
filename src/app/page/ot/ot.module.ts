import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import { OtGroupFormComponent } from './ot-group-form/ot-group-form.component';
import { OtTypeComponent } from './ot-type/ot-type.component';
import { OtTreeComponent } from './ot-tree/ot-tree.component';
import {OtPositionFormComponent} from './ot-position-form/ot-position-form.component';
import {MatDialogModule} from '@angular/material/dialog';

const routes: Routes = [
    {
        path: '',
        children: [
            {path: '', redirectTo: 'tree', pathMatch: 'full'},
            {path: 'tree', component: OtTreeComponent},
        ]
    }
];

@NgModule({
    declarations: [
        OtGroupFormComponent,
        OtPositionFormComponent,
        OtTypeComponent,
        OtTreeComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        MatDialogModule,
    ]
})
export class OtModule {
}
