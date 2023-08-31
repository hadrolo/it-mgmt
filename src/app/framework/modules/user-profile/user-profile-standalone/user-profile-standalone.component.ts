import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UserProfileService} from '../user-profile.service';
import {FormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {DataService} from '../../../services/data.service';
import {UserService} from '../../auth/user.service';
import {FormTranslateService} from '../../../services/form-translate.service';
import {MatDialog} from '@angular/material/dialog';
import {FwFormViewMode} from '../../form/form.interfaces';
import {fileMimeTypeGroup} from '../../file/file.component';
import {FwUserType} from '../../../settings';
import {Subscription} from 'rxjs';

interface UserFormSetting {
    formViewMode: FwFormViewMode;
    showPasswordUpdate: boolean;
    emailExist: boolean;
    backlink: string;
    allowEdit: boolean;
    deleteConfirmation: string;
}

interface UserFormData {
    currentUID: string;
    currentPublicId: string;
    user: any;
    userTypeList: any;
    countryList: any;
    ynList: any;
    languageList: any;
}

interface UserFormView {
    setting: UserFormSetting;
    data: UserFormData;
}


@Component({
    selector: 'app-user-profile-standalone',
    templateUrl: './user-profile-standalone.component.html',
    styleUrls: ['./user-profile-standalone.component.scss']
})
export class UserProfileStandaloneComponent implements OnInit {

    @ViewChild('modalUserprofile') modalUserprofile: TemplateRef<any>;

    view: UserFormView = {
        setting: {
            formViewMode: null,
            showPasswordUpdate: false,
            emailExist: null,
            backlink: null,
            allowEdit: false,
            deleteConfirmation: null,
        },
        data: {
            currentUID: null,
            currentPublicId: null,
            user: null,
            userTypeList: null,
            countryList: null,
            ynList: [
                {name: 'FW.STATUS.YES', db: '1'},
                {name: 'FW.STATUS.NO', db: '0'}
            ],
            languageList: ['de', 'en'], // LANGUAGE.
        }
    };

    openUserProfile$: Subscription;
    userForm: UntypedFormGroup = null;
    FormViewMode = FwFormViewMode;
    userType = FwUserType;
    fileMimeTypeGroup = fileMimeTypeGroup;

    constructor(
        private dataService: DataService,
        public userService: UserService,
        private userProfileService: UserProfileService,
        public formBuilder: FormBuilder,
        private formTranslateService: FormTranslateService,
        private translateService: TranslateService,
        public dialog: MatDialog,
    ) {
        translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.userService.currentUser.language = event.lang;
            this.prepareForm();
        });
    }

    ngOnInit(): void {
        const password: UntypedFormControl = new UntypedFormControl('', Validators.compose([Validators.required, Validators.min(6)]));
        const confirmPassword = new UntypedFormControl('', [
            Validators.required,
            (control: UntypedFormControl): { [key: string]: boolean } => {
                if (!control.parent) {
                    return null;
                }
                const email = control.parent.get('password');
                const confirm = control;
                if (!email || !confirm) return null;
                return email.value === confirm.value ? null : {nomatch: true};
            }]
        );
        this.userForm = this.formBuilder.group({
            country: ['', Validators.required],
            username: [''],
            password,
            confirmPassword,
            firstname: [''],
            lastname: [''],
            email: ['', [Validators.email, Validators.required]],
            postcode: [''],
            info: [''],
            last_login: [{value: null, disabled: true}],
            last_ip: [{value: null, disabled: true}],
            language: [null, Validators.required]
        });
        this.openUserProfile$ = this.userProfileService.openUserProfileStandalone.subscribe(() => this.openUserProfile());
    }

    ngOnDestroy(): void {
        this.openUserProfile$.unsubscribe();
    }

    openUserProfile(){
        this.view.setting.showPasswordUpdate = false;
        this.dataService.request('User/getOwnUserProfile', {
            getCountries: true,
            LANG: this.userService.currentUser.language
        }).subscribe((response: any) => {
            console.log(response);
            this.view.setting.formViewMode = FwFormViewMode.VIEW;
            this.prepareForm();
            this.view.data.user = response.user;
            this.view.data.currentUID = this.view.data.currentPublicId;

            this.view.data.countryList = response.countrys;
            this.userForm.reset();
            this.userForm.controls.username.setValue(this.view.data.user.username);
            this.userForm.controls.username.disable();
            this.userForm.controls.password.disable();
            this.userForm.controls.confirmPassword.disable();
            this.userForm.controls.firstname.setValue(this.view.data.user.firstname);
            this.userForm.controls.lastname.setValue(this.view.data.user.lastname);
            this.userForm.controls.email.setValue(this.view.data.user.email);
            this.userForm.controls.postcode.setValue(this.view.data.user.postcode);
            this.userForm.patchValue({country: this.view.data.countryList.find(x => x.CID === this.view.data.user.CID)});
            this.userForm.patchValue({active: this.view.data.ynList.find(x => x.db == this.view.data.user.active)});
            this.userForm.patchValue({language: this.view.data.user.language});
            this.userForm.controls.last_login.setValue(this.view.data.user.last_login);
            this.userForm.controls.last_ip.setValue(this.view.data.user.last_ip);
            this.userForm.controls.info.setValue(this.view.data.user.info);
            this.dialog.open(this.modalUserprofile);
        });
    }


    prepareForm(): void {
        const fields = ['country', 'password', 'confirmPassword', 'firstname', 'lastname', 'email', 'postcode', 'info','language'];

        fields.forEach(element => {
            this.userForm.controls[element].disable();
        });

        if (this.view.setting.formViewMode === FwFormViewMode.INSERT || this.view.setting.formViewMode === FwFormViewMode.EDIT) {
            fields.forEach(element => {
                this.userForm.controls[element].enable();
            });

            if (this.view.setting.formViewMode === FwFormViewMode.INSERT) {
                this.userForm.reset();
            }
            if (this.view.setting.formViewMode === FwFormViewMode.EDIT) {
                this.userForm.controls.password.disable();
                this.userForm.controls.confirmPassword.disable();
            }
        }
    }

    enablePasswortUpdate(): void {
        this.view.setting.showPasswordUpdate = true;
        this.userForm.controls.password.enable();
        this.userForm.controls.confirmPassword.enable();
    }

    checkEmailExist(): void {
        this.dataService.request('User/checkEmailExist', {
            email: this.userForm.value.email,
            UID: this.view.data.currentUID,
            public_id: this.view.data.currentPublicId
        }).subscribe((response: any) => {
            this.view.setting.emailExist = response.emailExist;
            if (this.view.setting.emailExist) {
                this.userForm.controls.email.setErrors({'Email exist': true});
            } else {
                this.userForm.controls.email.setErrors(null);
            }
        });
    }

    updateUser(): void {
        this.dataService.request('User/updateOwnUser', {
            public_id: this.view.data.currentPublicId,
            form: this.userForm.value,
        }).subscribe(() => {
            this.view.setting.showPasswordUpdate = false;
            this.userForm.controls.password.disable();
            this.userForm.controls.confirmPassword.disable();
            this.view.setting.formViewMode = FwFormViewMode.VIEW;
            this.prepareForm();
        });
    }

    switchFormViewMode(formViewMode: FwFormViewMode): void {
        this.view.setting.formViewMode = formViewMode;
        this.view.setting.showPasswordUpdate = false;
        this.prepareForm();
    }
}
