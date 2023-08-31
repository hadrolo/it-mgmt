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
import {RegisterModule} from './framework/modules/register/register.module';
import {MsalInterceptor, MsalModule} from '@azure/msal-angular';
import {BrowserCacheLocation, InteractionType, LogLevel, PublicClientApplication} from '@azure/msal-browser';

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
    ],
    imports: [
/*        MsalModule.forRoot(new PublicClientApplication({ // MSAL Configuration
            auth: {
                clientId: '824f703c-2fda-4ffc-9331-0363d5def700',
                authority: 'https://login.microsoftonline.com/a3c8a9b3-bacf-408b-a980-568f04ab0847',
                redirectUri: "/",
                postLogoutRedirectUri: '/'
            },
            cache: {
                cacheLocation: BrowserCacheLocation.LocalStorage,
            },
            system: {
                loggerOptions: {
                    loggerCallback: () => {
                    }, // replace with "loggerCallback" to enable MSAL logging
                    logLevel: LogLevel.Info,
                    piiLoggingEnabled: false
                }
            }
        }), {
            interactionType: InteractionType.Redirect, // MSAL Guard Configuration
            authRequest: {
                scopes: ['user.read']
            },
            loginFailedRoute: '/login-failed'
        }, {
            interactionType: InteractionType.Redirect, // MSAL Interceptor Configuration
            protectedResourceMap: new Map([
                ['https://graph.microsoft.com/v1.0/me', ['user.read']],
                ['api/api-sso.php', ['api://824f703c-2fda-4ffc-9331-0363d5def700/api.access']],
            ])
        }),*/
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
    ],
    providers: [
/*        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true
        },*/
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
