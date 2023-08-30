# IT-Mgmt
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.3.

# Configuration
First of all you must choose between 3 types of authentication functionality:
- Standalone - Use own user table 
- SSO - Single sign on windows azure and own user table (under development)
<hr>

## Use SSO
### Install and Configure Msal Modul
- install msal-plugins `npm install @azure/msal-angular @azure/msal-browser --save`
- edit `app.modules.ts` and insert to imports:
<pre>
    <code>
        MsalModule.forRoot(new PublicClientApplication({ // MSAL Configuration
            auth: {
                clientId: '965050fa-6058-4b2f-a843-0699bda7d1ec',
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
                ['api/api.php', ['api://965050fa-6058-4b2f-a843-0699bda7d1ec/api.access']],
            ])
        })
    </code>
</pre>
### Edit app.modules.ts and insert to providers:
<pre>
    <code>
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true
        }
    </code>
</pre>
### Edit app-routing.module.ts 
add `canActivate: [MsalGuard]`
<pre>
    <code>
        path: '', loadChildren: () => import('./page/page.module').then(m => m.PageModule),
        canActivate: [MsalGuard],
        runGuardsAndResolvers: 'always'
    </code>
</pre>
### Edit page.module.ts
and add `canActivate: SsoGuard`
<pre>
    <code>
const routes: Routes = [
    {
        path: '',
        component: PageComponent,
        canActivate: [SsoGuard],
    </code>
</pre>

### API Konfiguration 
`api/config.inc.php`

### Usertypen festlegen
Benutzergruppennamen dürfen in der Konfig-Datei nur mit "_" getrennt werden,
Azure-Gruppennamen werden automatisch auf Großschreibung umgeschrieben und "-" mit "_" ersetzt
<hr>

## Use Standalone
### Configure Modules
### Edit app.modules.ts and insert to providers:
edit `app.modules.ts` remove sso Entries (MsalModule)
<pre>
    <code>
{
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        }
    </code>
</pre>
### Edit app-routing.module.ts
add `canActivate: [MsalGuard]`
<pre>
    <code>
        path: '', loadChildren: () => import('./page/page.module').then(m => m.PageModule),
        canActivate: [MsalGuard],
        runGuardsAndResolvers: 'always'
    </code>
</pre>
### Edit page.module.ts
and remove `canActivate: SsoGuard`
<hr>

# Framework
1) Generate database based on `api/service/create_fw_Tables.sql`
2) Import basic rights `api/service/create_fw_Tables.sql`
3) Configure `api/config-standalone.php` or `api/config-sso.php`

# Client
1) Configure Framework `src/app/framework/app.settings.ts`
2) Configure Routing - use necessary guards (`StandaloneGuard`, `TokenGuard`, `LoggedInGuard`)
3) Load rights with the `RightLoaderGuard`

# Rights
Protect Routes with `RightGuard` like `data: {rights: ['Right/openRights']}, canActivate: [RightGuard]}`

# ToDo
- delete SsoService
- delete RightLoaderGuard
