import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {SettingsService} from '../../services/settings.service';
import Cookies from 'js-cookie';
import {Observable} from 'rxjs';

export enum FwTokenType {
    ACCESS_TOKEN = 'jwtAccessToken',
    REFRESH_TOKEN = 'jwtRefreshToken'
}

@Injectable({
    providedIn: 'root'
})
export class JwtService {
    constructor(
        private http: HttpClient,
        private settingsService: SettingsService
    ) {
    }

    /**
     * Store Access Token and Refresh Token in Cookie or Local Storage.
     *
     * @param jwtAccessToken The access token
     * @param jwtRefreshToken The refresh value
     */
    storeToken(jwtAccessToken: string, jwtRefreshToken: string): void {
        const token = {
            jwtAccessToken,
            jwtRefreshToken
        };

        // store token in Cookie or Local Storage
        if (this.settingsService.frameworkSettings.auth.jwtStorageCookie) {
            Cookies.set(this.settingsService.frameworkSettings.auth.jwtKeyName, JSON.stringify(token), {
                domain: this.settingsService.frameworkSettings.auth.jwtStorageCookie.domain,
                expires: this.settingsService.frameworkSettings.auth.jwtStorageCookie.expiresDays,
                path: this.settingsService.frameworkSettings.auth.jwtStorageCookie.path || '/',
                secure: this.settingsService.frameworkSettings.auth.jwtStorageCookie.secure || false,
            });
        } else {
            localStorage.setItem(this.settingsService.frameworkSettings.auth.jwtKeyName, JSON.stringify(token));
        }
    }


    setToken(item: FwTokenType, value): void {
        let token;
        if (!this.settingsService.frameworkSettings.auth.jwtStorageCookie) {
            token = JSON.parse(localStorage.getItem(this.settingsService.frameworkSettings.auth.jwtKeyName));
        } else {
            token = Cookies.get(this.settingsService.frameworkSettings.auth.jwtKeyName);
            if (token) { token = JSON.parse(token); }
        }
        if (!token) {
            token = {jwtAccessToken: null, jwtRefreshToken: null};
        }
        token[item] = value;

        if (!this.settingsService.frameworkSettings.auth.jwtStorageCookie) {
            localStorage.setItem(this.settingsService.frameworkSettings.auth.jwtKeyName, JSON.stringify(token));
        } else {
            Cookies.set(this.settingsService.frameworkSettings.auth.jwtKeyName, JSON.stringify(token), {
                domain: this.settingsService.frameworkSettings.auth.jwtStorageCookie.domain,
                expires: this.settingsService.frameworkSettings.auth.jwtStorageCookie.expiresDays,
                path: this.settingsService.frameworkSettings.auth.jwtStorageCookie.path || '/',
                secure: this.settingsService.frameworkSettings.auth.jwtStorageCookie.secure || false,
            });
        }
    }

    /**
     * Gets a token from Cookie or Local Storage.
     *
     * @param tokenType The token type
     */
    getToken(item: FwTokenType): any {
/*        console.log('getToken');
        console.log(this.settingsService.frameworkSettings);*/
        let token;
        if (!this.settingsService.frameworkSettings.auth.jwtStorageCookie) {
            token = JSON.parse(localStorage.getItem(this.settingsService.frameworkSettings.auth.jwtKeyName));
        } else {
            token = Cookies.get(this.settingsService.frameworkSettings.auth.jwtKeyName);
            if (token) { token = JSON.parse(token); }
        }
        return token ? token[item] : false;
    }


  /**
     * When the TokenInterceptor returns a 401 error (token invalid, expired or bearer missing) this
     * will retrieve a new access and refresh token using the existing refresh token.
     */
     // @ts-ignore  //toDo: Alternitve zu ts-ignore???
    refreshToken(): Observable<any> {
        const refreshToken = this.getToken(FwTokenType.REFRESH_TOKEN);
        if (refreshToken !== null) {
            return this.http
                .post(this.settingsService.frameworkSettings.apiUrl, {
                    action: 'framework.Token/refreshToken',
                    data: {
                        refreshToken
                    },
                    componentName: 'JwtService.ts',
                    methodName: 'refreshToken()'
                })
                .pipe(
                    map((response: any) => {
                        this.setToken(FwTokenType.REFRESH_TOKEN, response.jwt_token.refreshToken);
                        this.setToken(FwTokenType.ACCESS_TOKEN, response.jwt_token.accessToken);
                        return response;
                    })
                );
        }
    }
}
