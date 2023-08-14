import {Injectable, NgModule} from '@angular/core';
import {BrowserModule, HammerGestureConfig, HammerModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {registerLocaleData} from '@angular/common';
import {LOCALE_ID} from '@angular/core';
import localeDE from '@angular/common/locales/de';
import localeEN from '@angular/common/locales/en';
import {HTTP_INTERCEPTORS, HttpBackend, HttpClientModule} from '@angular/common/http';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {environment} from '../environments/environment';
import {UserService} from './framework/modules/auth/user.service';
import {TokenInterceptor} from './framework/modules/auth/token.interceptor';
import {NgChartsModule} from 'ng2-charts';
import {AppSettings} from './app.settings';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import * as Hammer from 'hammerjs';
import {FrameworkModule} from './framework/framework.module';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {LayoutModule} from '@angular/cdk/layout';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {ToastrModule} from 'ngx-toastr';
import {RegisterComponent} from './page/user-mgmt/register/register.component';
import {RegisterModule} from './framework/modules/register/register.module';

registerLocaleData(localeDE);
registerLocaleData(localeEN);

export function HttpLoaderFactory(http: HttpBackend) {
    return new MultiTranslateHttpLoader(http, [
        {prefix: './assets/i18n/', suffix: '.json'},
        {prefix: './assets/framework/i18n/', suffix: '.json'},
    ]);
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        if (!environment.production) {
            // console.log('Missing translation for ' + params.key);
        }
        return params.key;
    }
}

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
    override overrides = <any>{
        swipe: {direction: Hammer.Swipe}
    };
}

@NgModule({
    declarations: [
        AppComponent,
        ResetPasswordComponent,
        RegisterComponent,
    ],
    imports: [
        HttpClientModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot({
            missingTranslationHandler: {provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler},
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpBackend]
            },
        }),
        NgChartsModule,
        HammerModule,
        FrameworkModule,
        MatGridListModule,
        MatCardModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        LayoutModule,
        BsDatepickerModule.forRoot(),
        RegisterModule,
    ],
    providers: [
        UserService,
        AppSettings,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        {provide: LOCALE_ID, useValue: 'de'},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
