import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UserProfileService} from '../user-profile.service';
import {DataService} from '../../../services/data.service';
import {UserService} from '../../auth/user.service';
import {MatDialog} from '@angular/material/dialog';
import {FwFormViewMode} from '../../form/form.interfaces';


@Component({
    selector: 'app-user-profile-sso',
    templateUrl: './user-profile-sso.component.html',
    styleUrls: ['./user-profile-sso.component.scss']
})
export class UserProfileSsoComponent implements OnInit, OnDestroy {

    @ViewChild('modalUserprofileSso') modalUserprofileSso: TemplateRef<any>;
    openUserProfileSso$;

    constructor(
        private dataService: DataService,
        public userService: UserService,
        private userProfileService: UserProfileService,
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.openUserProfileSso$ = this.userProfileService.openUserprofileSso.subscribe(() => this.openUserprofile());
    }

    ngOnDestroy(): void {
        this.openUserProfileSso$.unsubscribe();
    }


    openUserprofile(): void {
        this.dialog.open(this.modalUserprofileSso);
    }

    protected readonly FwFormViewMode = FwFormViewMode;
}
