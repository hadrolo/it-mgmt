import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FwTokenType, JwtService} from './jwt.service';
import {FwUser, FwUserType} from '../../settings';
import {FwLoginType, FwMode, FwUserDisplayStyle, SettingsService} from '../../services/settings.service';
import * as moment from 'moment';
import {AuthModalService} from './auth-modal/auth-modal.service';
import jwt_decode from 'jwt-decode';

export interface FwLoginSubjectData {
    loginField: string;
    loginValue: string;
    redirect?: boolean;
    // callback function to execute after successful login
    callback?: any;
}

export interface FwForcedLogoutData {
    lastActivityTime: string;
    lastActivityTimestamp: any;
    expirationTimestamp: any;
    tokenExpireTimestamp: any;
    logoutCountDown: number;
    showModal: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    loginSubject: Subject<FwLoginSubjectData> = new Subject<FwLoginSubjectData>();
    tokenChanged: Subject<any> = new Subject<string>();
    usernameChanged: Subject<any> = new Subject<string>();
    openAuthModal: Subject<any> = new Subject<string>();
    currentUser: FwUser;

    // Set to true when user is in a view where he needs to be logged in
    loggedInArea = false;

    showInfo = false;

    // Used in maintenance-info component
    maintenanceActive: Subject<any> = new Subject<boolean>();
    maintenanceSet: Subject<any> = new Subject<boolean>();

    interval;

    forcedLogout: FwForcedLogoutData = {
        lastActivityTime: null,
        lastActivityTimestamp: null,
        tokenExpireTimestamp: null,
        expirationTimestamp: null,
        logoutCountDown: null,
        showModal: false
    };

    constructor(
        private http: HttpClient,
        private translateService: TranslateService,
        private router: Router,
        private jwtService: JwtService,
        private settingsService: SettingsService,
        private authModalService: AuthModalService,
    ) {
        this.settingsService.settingsLoaded.subscribe(() => this.handleMaintenance());

        this.loginSubject.subscribe((subjectData: FwLoginSubjectData) => {
            if (subjectData?.loginValue) {
                this.showInfo = !!subjectData;
                this.usernameChanged.next(subjectData.loginValue);
            }
            if (settingsService.frameworkSettings.auth.loginType === FwLoginType.VIEW) {
                this.router.navigate([this.settingsService.frameworkSettings.auth.loginDestination]);
            } else if (settingsService.frameworkSettings.auth.loginType === FwLoginType.MODAL) {
                this.openAuthModal.next({redirect: subjectData?.redirect, callback: subjectData?.callback});
            }
        });
    }

    login(username, password): Observable<any> {
        return this.http.post(this.settingsService.frameworkSettings.apiUrl, {
            action: 'framework.Auth/login',
            data: {username, password},
            componentName: 'UserService.ts',
            methodName: 'login()'
        });
    }

    setupForcedLogout(): void {
        if (this.settingsService.frameworkSettings.auth.logoutAutomatic.enabled) {
            this.forcedLogout.lastActivityTimestamp = moment();
            this.forcedLogout.lastActivityTime = this.forcedLogout.lastActivityTimestamp.format('HH:mm');

            this.stopForcedLogout();

            this.interval = setInterval(() => {
                const jwtData: any = jwt_decode(this.jwtService.getToken(FwTokenType.ACCESS_TOKEN));
                this.forcedLogout.tokenExpireTimestamp = moment.unix(jwtData.exp);

                if (this.forcedLogout.lastActivityTimestamp.clone().add(this.settingsService.frameworkSettings.auth.logoutAutomatic.inactivityTime) <= moment()) {

                    this.forcedLogout.logoutCountDown -= 1;
                }

                if (this.forcedLogout.logoutCountDown < this.settingsService.frameworkSettings.auth.logoutAutomatic.logoutCountDown && !this.forcedLogout.showModal) {
                    this.forcedLogout.showModal = true;
                    // open modal
                    this.authModalService.showModal.next({type: 1});
                }
                if (this.forcedLogout.logoutCountDown === 0) {
                    this.logout().subscribe(() => {
                        this.stopForcedLogout();
                        this.authModalService.hideModal.next(true);
                    });

                }
            }, 1000);
        }
    }

    stopForcedLogout(): void {
        this.forcedLogout.logoutCountDown = this.settingsService.frameworkSettings.auth.logoutAutomatic.inactivityTime;
        if (this.interval) {
            this.forcedLogout.showModal = false;
            clearInterval(this.interval);
        }
    }

    logout(): Observable<any> {
        return this.http
            .post(this.settingsService.frameworkSettings.apiUrl, {
                action: 'framework.Auth/logout',
                data: {
                    accessToken: this.jwtService.getToken(FwTokenType.ACCESS_TOKEN)
                },
                componentName: 'UserService.ts',
                methodName: 'logout()'
            })
            .pipe(
                map((response: any) => {
                    return this.logoutAutomatic(response.jwt_token.accessToken, response.jwt_token.refreshToken, response.nobodyuser);
                })
            );
    }

    logoutAutomatic(accessToken, refreshToken, nobodyuser): Observable<any> {
        this.stopForcedLogout();
        this.setNobodyUser(nobodyuser);
        this.jwtService.storeToken(accessToken, refreshToken);
        this.tokenChanged.next('loggedOut');
        if (this.loggedInArea) {
            this.router.navigate([this.settingsService.frameworkSettings.auth.afterLogoutDestination]);
        }
        return of(true);
    }

    updateCurrentUser(): Observable<any> {
        return this.http
            .post(this.settingsService.frameworkSettings.apiUrl, {
                action: 'framework.Auth/isLoggedIn',
                data: {
                    accessToken: this.jwtService.getToken(FwTokenType.ACCESS_TOKEN),
                    refreshToken: this.jwtService.getToken(FwTokenType.REFRESH_TOKEN)
                },
                componentName: 'UserService.ts',
                methodName: 'isLoggedIn()'
            })
            .pipe(
                map((response: any) => {

                    // if the access token was expired and new tokens were generated with the refresh token store them
                    if (response.jwt_token) {
                        this.jwtService.storeToken(response.jwt_token.accessToken, response.jwt_token.refreshToken);
                    }

                    if (response.anonymous === true || !response.user) {
                        this.setNobodyUser(response.nobodyuser);
                        this.tokenChanged.next('anon');
                    } else {
                        this.currentUser = response.user;
                        this.currentUser.loggedIn = true;
                        this.tokenChanged.next('loggedIn');
                    }
                    return true;
                })
            );
    }

    newAnonymous(): Observable<any> {
        return this.http
            .post(this.settingsService.frameworkSettings.apiUrl, {
                action: 'framework.Token/newAnonymous',
                data: {},
                componentName: 'UserService.ts',
                methodName: 'newAnonymous()'
            })
            .pipe(
                map((response: any) => {
                    this.setNobodyUser(response.nobodyuser);
                    this.jwtService.storeToken(response.jwt_token.accessToken, response.jwt_token.refreshToken);
                    this.tokenChanged.next('anon');
                    return true;
                })
            );
    }

    /**
     * Populates currentUser with an anonymous/nobody data
     * @param nobodyuser nobody
     */
    setNobodyUser(nobodyuser): void {
        const browserLanguage = this.translateService.getBrowserLang();
        const currentUser = nobodyuser;
        currentUser.language = browserLanguage.match(/en|de|fr/) ? browserLanguage : 'en';
        currentUser.loggedIn = false;
        this.translateService.use(currentUser.language);
        this.currentUser = currentUser;
    }

    userDisplayName(): string {
        if (this.settingsService.frameworkSettings.user.displayStyle === FwUserDisplayStyle.FULLNAME) {
            return this.currentUser.firstname + ' ' + this.currentUser.lastname;
        } else if (this.settingsService.frameworkSettings.user.displayStyle === FwUserDisplayStyle.USERNAME) {
            return this.currentUser.username;
        } else if (this.settingsService.frameworkSettings.user.displayStyle === FwUserDisplayStyle.FIRSTNAME) {
            return this.currentUser.firstname;
        } else {
            return '';
        }
    }


    private handleMaintenance(): void {
        // check if start and end are set
        if (!this.settingsService.jsonSettings.maintenance.start || !this.settingsService.jsonSettings.maintenance.end) {
            return;
        }

        // parse dates
        const start = moment(this.settingsService.jsonSettings.maintenance.start, 'YYYY-MM-DD HH:mm', true);
        const end = moment(this.settingsService.jsonSettings.maintenance.end, 'YYYY-MM-DD HH:mm', true);

        // check of both are valid
        if (!start.isValid() || !end.isValid()) {
            // console.log('Maintenance dates are set but not valid!');
            return;
        }

        // check if start is before end
        if (!start.isBefore(end)) {
            // console.log('Maintenance start is not before end');
            return;
        }

        this.maintenanceSet.next(moment().isBefore(end));

        // redirect to maintenance page if current date is between start and end
        if (moment().isBetween(start, end)) {
            this.maintenanceActive.next(true);
            // console.log('Maintenance is active');

            // @ts-ignore
            if ((this.currentUser.usertype !== FwUserType.SYSADMIN) &&
                !this.router.url.endsWith('login')) {
                if (this.router.url !== '/error/maintenance') {
                    this.router.navigate(['/error/maintenance']);
                }
            }
        } else {
            this.maintenanceActive.next(false);
            // console.log('Maintenance is set but not active');
        }
    }
}
