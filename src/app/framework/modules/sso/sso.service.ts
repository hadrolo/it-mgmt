import {Injectable} from '@angular/core';
import {MsalService} from '@azure/msal-angular';
import {HttpClient} from '@angular/common/http';
import {UserService} from '../auth/user.service';
import {RightService} from '../right/right.service';

@Injectable({
    providedIn: 'root'
})
export class SsoService {

    user;
    graphEndpoint = 'https://graph.microsoft.com/v1.0/me';

    constructor(
        private msalService: MsalService,
        private http: HttpClient,
        private userService: UserService,
        private rightService: RightService
    ) {
    }

    public setUser() {
/*        let allAccounts = this.msalService.instance.getAllAccounts();
        if (allAccounts.length > 0) {
            let account = allAccounts[0];
            let roles = account.idTokenClaims.roles;
            console.log(allAccounts);
            console.log(roles);

            this.http.get(this.graphEndpoint).subscribe(profile => {
                console.log(profile);

                this.userService.currentUser = {
                    UID: profile['id'],
                    CID: '',
                    SAID: '',
                    username: profile['userPrincipalName'],
                    firstname: profile['givenName'],
                    lastname: profile['surname'],
                    email: profile['mail'],
                    language: 'de',
                    app_cid: '',
                    usertype: roles[0],
                    loggedIn: true,
                    jobTitle: profile['jobTitle']
                }
                console.log(this.userService.currentUser);
            });


        }*/




    }

}
