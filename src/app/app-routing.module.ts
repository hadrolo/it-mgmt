import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoggedInGuard} from './framework/modules/auth/loggedIn.guard';
import {TokenGuard} from './framework/modules/auth/token.guard';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {RightLoaderGuard} from './framework/modules/right/right.loader.guard';
import {RegisterComponent} from './page/user-mgmt/register/register.component';
import {MsalGuard} from '@azure/msal-angular';
import {LoginFailedComponent} from './framework/modules/sso/login-failed/login-failed.component';
import {SsoGuard} from './framework/modules/auth/sso.guard';
import {StandaloneGuard} from './framework/modules/auth/standalone.guard';

const routes: Routes = [
    {
        path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
        canActivate: [StandaloneGuard, TokenGuard],
        runGuardsAndResolvers: 'always'
    },
    {
        path: 'reset-password/:hash',
        component: ResetPasswordComponent,
        canActivate: [StandaloneGuard, TokenGuard],
        runGuardsAndResolvers: 'always'
    },
    {
        path: 'error', loadChildren: () => import('./errors/errors.module').then(m => m.ErrorsModule),
        runGuardsAndResolvers: 'always'
    },
    {
        path: '', loadChildren: () => import('./page/page.module').then(m => m.PageModule),
        canActivate: [StandaloneGuard, LoggedInGuard/*, RightLoaderGuard*/],
        runGuardsAndResolvers: 'always'
    },
/*    {
        path: '', loadChildren: () => import('./page/page.module').then(m => m.PageModule),
        canActivate: [MsalGuard],
        runGuardsAndResolvers: 'always'
    },*/
    {
        path: 'login-failed',
        component: LoginFailedComponent
    },
    {
        path: '**', loadChildren: () => import('./errors/errors.module').then(m => m.ErrorsModule),
        canActivate: [StandaloneGuard, TokenGuard],
        runGuardsAndResolvers: 'always'
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
