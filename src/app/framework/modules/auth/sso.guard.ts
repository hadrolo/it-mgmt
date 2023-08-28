import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {mergeMap, Observable} from 'rxjs';
import {UrlTree} from '@angular/router';
import {FwUserType, ssoConfig} from '../../settings';
import {FwMode, SettingsService} from '../../services/settings.service';
import {UserService} from './user.service';
import {SsoService} from '../sso/sso.service';
import {MsalService} from '@azure/msal-angular';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {FwStorageService} from '../../services/storage.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class SsoGuard implements CanActivate {
    constructor(
        private settingsService: SettingsService,
        private http: HttpClient,
        private msalService: MsalService,
        private userService: UserService,
        private storageService: FwStorageService,
        private translateService: TranslateService,
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        this.settingsService.set(ssoConfig);


        let allAccounts = this.msalService.instance.getAllAccounts();
        if (allAccounts.length > 0) {
            let account = allAccounts[0];
            let roles = account.idTokenClaims.roles;
            console.log(allAccounts);
            console.log(roles);

            return this.http.get('https://graph.microsoft.com/v1.0/me').pipe(mergeMap(profile => {
                console.log(profile);
                this.userService.currentUser = {
                    UID: profile['id'],
                    CID: '',
                    SAID: '',
                    username: profile['userPrincipalName'],
                    firstname: profile['givenName'],
                    lastname: profile['surname'],
                    email: profile['mail'],
                    app_cid: '',
                    usertype: roles[0],
                    loggedIn: true,
                    jobTitle: profile['jobTitle']
                }

                return this.storageService.getAuto('user', 'language', 'de').pipe(map(language => {
                    this.userService.currentUser.language = language;
                    return true;
                }));
            }));

        } else {
            return false;
        }
    }
}
