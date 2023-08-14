import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoginComponent} from './login.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {AuthLoginModule} from '../framework/modules/auth/auth-login/auth-login.module';
import {MatDialogModule} from '@angular/material/dialog';


export const routes: Routes = [
    {path: '', component: LoginComponent, pathMatch: 'full'}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        TranslateModule,
        AuthLoginModule,
        MatCardModule,
        MatInputModule,
        MatDialogModule,
    ],
    declarations: [LoginComponent],
    providers: []
})

export class LoginModule {
}
