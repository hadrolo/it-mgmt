import {Injectable} from '@angular/core';

import {BehaviorSubject, NEVER, Observable, throwError} from 'rxjs';
import {catchError, filter, finalize, map, switchMap, take} from 'rxjs/operators';
import {Router} from '@angular/router';
import {
    HttpErrorResponse,
    HttpHandler,
    HttpHeaderResponse,
    HttpInterceptor,
    HttpProgressEvent,
    HttpRequest,
    HttpResponse,
    HttpSentEvent,
    HttpUserEvent
} from '@angular/common/http';
import {UserService} from './user.service';
import {JwtService, FwTokenType} from './jwt.service';
import {SettingsService} from '../../services/settings.service';
import {environment} from '../../../../environments/environment';
import {ToastrService} from 'ngx-toastr';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private router: Router,
        private settingsService: SettingsService,
        private toastrService: ToastrService,
    ) {
    }

    isRefreshingToken = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any> | any> {

        if (request.url.startsWith('./assets/')) {
            return next.handle(request);
        }

        if (
            this.settingsService.frameworkSettings.auth.interceptorWhitelist.some(element => {
                return request.url.startsWith(element);
            })
        ) {
            return next.handle(request);
        }

        if (request.body && request.body.action !== 'framework.Token/newAnonymous') {

          return next.handle(this.addTokenToRequest(request, this.jwtService.getToken(FwTokenType.ACCESS_TOKEN))).pipe(
                map((response: any) => {
                    if (response.body && response.body.databaseError) {
                        this.router.navigate(['db-error']);
                    }
                    return response;
                }),
               // @ts-ignore  //ToDo: Darf das no type sein????
                catchError(err => {
                    if (err instanceof HttpErrorResponse) {
                        switch ((err as HttpErrorResponse).status) {
                            case 401:
                                return this.handle401Error(request, next);
                            case 500:
                                this.toastrService.error('Internal Error');
                                // this.router.navigate([this.settingsService.frameworkSettings.auth.afterLogoutDestination]);
                                if (environment.production) {
                                    return this.userService.logout();
                                }
                            // return of(err);
                        }
                    } else {
                        return throwError(err);
                    }
                })
            );
        } else {
            if (this.jwtService.getToken(FwTokenType.ACCESS_TOKEN)) {
                return next.handle(this.addTokenToRequest(request, this.jwtService.getToken(FwTokenType.ACCESS_TOKEN))).pipe(
                    map((response: any) => {
                        if (response.body && response.body.databaseError) {
                            this.router.navigate(['db-error']);
                        }
                        return response;
                    })
                );
            } else {
                return next.handle(request).pipe(
                    map((response: any) => {
                        if (response.body && response.body.databaseError) {
                            this.router.navigate(['db-error']);
                        }
                        return response;
                    })
                );
            }
        }
    }

    private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({setHeaders: {Authorization: `Bearer ${token}`}});
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;

            // Reset here so that the following requests wait until the token comes back from the refreshToken call.
            this.tokenSubject.next(null);

            return this.jwtService.refreshToken().pipe(
              // @ts-ignore  //ToDo: Darf das no type sein????
                switchMap((response: any) => {
                    if (response) {
                        if (response.jwt_token.anonymous && request.body.action !== 'framework.Auth/login') {
                            // INFO: user gets logged out and redirected but requests are not prevented
                            this.userService.logoutAutomatic(response.jwt_token.accessToken, response.jwt_token.refreshToken, response.nobodyuser);
                        }

                        this.tokenSubject.next(response.jwt_token.accessToken);

                        // handle original request
                        return next.handle(this.addTokenToRequest(request, response.jwt_token.accessToken));
                    }
                }),
                catchError(err => {
                    return this.userService.logout();
                }),
                finalize(() => {
                    this.isRefreshingToken = false;
                })
            );
        } else {
            this.isRefreshingToken = false;
            return this.tokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(token => {
                    return next.handle(this.addTokenToRequest(request, token));
                })
            );
        }
    }
}
