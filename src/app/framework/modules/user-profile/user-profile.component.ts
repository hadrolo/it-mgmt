import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UserProfileService} from './user-profile.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {DataService} from '../../services/data.service';
import {UserService} from '../auth/user.service';
import {FormTranslateService, FwMessage} from '../../services/form-translate.service';
import {FwUniverseType} from '../../services/settings.service';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';

enum FwFormType {
    VIEW,
    EDIT
}

interface FwViewUserProfileStatus {
    formType: FwFormType;
    changePassword: boolean;
}

interface FwViewUserProfileData {
    user: any;
}

interface FwViewUserProfile {
    data: FwViewUserProfileData;
    status: FwViewUserProfileStatus;
}

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {

    @ViewChild('modalUserprofile') modalUserprofile: TemplateRef<any>;

    view: FwViewUserProfile = {
        data: {
            user: null
        },
        status: {
            formType: FwFormType.VIEW,
            changePassword: false
        }
    };

    fwFormType = FwFormType;
    private openUserProfile$: Subscription;

    // FORM
    userForm: FormGroup;

    constructor(
        private dataService: DataService,
        private userService: UserService,
        private userProfileService: UserProfileService,
        public formBuilder: FormBuilder,
        private formTranslateService: FormTranslateService,
        private translateService: TranslateService,
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.view.status.formType = FwFormType.VIEW;
        this.openUserProfile$ = this.userProfileService.openUserprofile.subscribe(() => this.openUserprofile());

        this.userForm = this.formBuilder.group({
            CID: [''],
            username: [''],
            password: ['', Validators.compose([Validators.required, Validators.min(6)])],
            confirmPassword: ['', [
                Validators.required,
                (control: FormControl): { [key: string]: boolean } => {
                    if (!control.parent) {
                        return null;
                    }

                    const email = control.parent.get('password');
                    const confirm = control;
                    if (!email || !confirm) return null;
                    return email.value === confirm.value ? null : {nomatch: true};
                }]
            ],
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', Validators.email],
            language: [''],
            universetype: [''],
            app_usertype: ['']
        });
    }

    ngOnDestroy(): void {
        this.openUserProfile$.unsubscribe();
    }

    disableInputs(): void {
        this.view.status.formType = FwFormType.VIEW;
        this.userForm.controls['username'].disable();
        this.userForm.controls['firstname'].disable();
        this.userForm.controls['lastname'].disable();
        this.userForm.controls['email'].disable();
        this.userForm.controls['app_usertype'].disable();
        this.view.status.changePassword = false;
    }

    openUserprofile(): void {
        this.dataService.request('universe.User/getUserProfile', {
            UID: this.userService.currentUser.UID
        }).subscribe(response => {
            this.view.data.user = response.user;
            this.userForm.reset();
            this.disableInputs();
            this.translateAppUsertype();
            this.userForm.controls['username'].setValue(this.view.data.user.username);
            this.userForm.controls['firstname'].setValue(this.view.data.user.firstname);
            this.userForm.controls['lastname'].setValue(this.view.data.user.lastname);
            this.userForm.controls['email'].setValue(this.view.data.user.email);
            this.dialog.open(this.modalUserprofile);
        });
    }

    switchToEdit(): void {
        this.userForm.controls['firstname'].enable();
        this.userForm.controls['lastname'].enable();
        this.userForm.controls['email'].enable();
        this.view.status.formType = FwFormType.EDIT;
    }

    updateUserdata(): void {
        this.dataService.request('universe.User/getUserProfile', {
            UID: this.userService.currentUser.UID
        }).subscribe(response => {
            this.view.data.user = response.user;
            this.userForm.reset();
            this.disableInputs();
            this.translateAppUsertype();
            this.userForm.controls['username'].setValue(this.view.data.user.username);
            this.userForm.controls['firstname'].setValue(this.view.data.user.firstname);
            this.userForm.controls['lastname'].setValue(this.view.data.user.lastname);
            this.userForm.controls['email'].setValue(this.view.data.user.email);
        });
    }

    updateUser(): void {
        this.dataService.request('universe.User/updateUserProfile', {
            uid: this.userService.currentUser.UID,
            form: this.userForm.value
        }).subscribe(response => {
            if (response.error && response.error.length > 0) {
                // ToDo: !! Material !! ToasterService
                //  this.toastrService.error(response.error.join(', '), 'Fehler');
            } else if (response.update.length > 0) {
                //$('#user-profile-modal').modal('hide');
                // ToDo: !! Material !! ToasterService
                /* this.toastrService.success(
                    this.formTranslateService.message(FwMessage.UPDATE_OK) + this.userService.currentUser.universetype === FwUniverseType.SYSADMIN ? ' ' + response.update.join(', ') : '',
                    this.formTranslateService.message(FwMessage.UPDATE_TITLE)
                );*/
                this.userService.currentUser.firstname = this.userForm.controls['firstname'].value;
                this.userService.currentUser.lastname = this.userForm.controls['lastname'].value;
                this.userService.currentUser.email = this.userForm.controls['email'].value;
                this.userService.tokenChanged.next('refreshNavbar');
                this.disableInputs();
            } else {
               //this.toastrService.info(this.formTranslateService.message(FwMessage.UPDATE_NOCHANGES), this.formTranslateService.message(FwMessage.UPDATE_NOCHANGES_TITLE));
                this.disableInputs();
            }
        });
    }

    cancelEdit(): void {
        this.updateUserdata();
        this.view.status.formType = FwFormType.VIEW;
    }

    changePassword(): void {
        this.view.status.changePassword = true;
    }

    translateAppUsertype(): void {
        if (this.userService.currentUser.universetype === FwUniverseType.SYSADMIN) {
            this.userForm.controls['app_usertype'].setValue(this.translateService.instant('FW.USER_ROLE.SYSADMIN'));
        } else {
            this.userForm.controls['app_usertype'].setValue(this.translateService.instant('USER_ROLE.' + this.userService.currentUser.usertype));
        }
    }
}
