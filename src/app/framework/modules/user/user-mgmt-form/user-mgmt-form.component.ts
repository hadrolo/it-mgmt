import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {fileMimeTypeGroup} from 'src/app/framework/modules/file/file.component';
import { v4 as uuidv4 } from 'uuid';
import {FwFormViewMode} from '../../form/form.interfaces';
import {FwOpenData, FwUserType} from '../../../settings';

import {DataService} from '../../../services/data.service';
import {UserService} from '../../auth/user.service';
import {FwLogType, LogService} from '../../../services/log.service';
import {CryptoService} from '../../../services/crypto.service';
import {AppSettings} from '../../../../app.settings';
import {MatDialog} from '@angular/material/dialog';

interface UserFormSetting {
    formViewMode: FwFormViewMode;
    showPasswordUpdate: boolean;
    userExist: boolean;
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
    selector: 'app-user-mgmt-form',
    templateUrl: './user-mgmt-form.component.html',
    styleUrls: ['./user-mgmt-form.component.scss']
})
export class UserMgmtFormComponent implements OnInit {

    @ViewChild('modalDelete') modalDelete: TemplateRef<any>;

    view: UserFormView = {
        setting: {
            formViewMode: null,
            showPasswordUpdate: false,
            userExist: null,
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

    userForm: UntypedFormGroup = null;
    FormViewMode = FwFormViewMode;
    userType = FwUserType;
    fileMimeTypeGroup = fileMimeTypeGroup;

    constructor(
        public router: Router,
        private route: ActivatedRoute,
        private appSettings: AppSettings,
        private dataService: DataService,
        public formBuilder: UntypedFormBuilder,
        private toastrService: ToastrService,
        public userService: UserService,
        private logService: LogService,
        private cryptoService: CryptoService,
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
            (control: UntypedFormControl): {[key: string]: boolean} => {
                if (!control.parent) {
                    return null;
                }
                const email = control.parent.get('password');
                const confirm = control;
                if (!email || !confirm) return null;
                return email.value === confirm.value ? null : { nomatch: true };
            }]
        );
        this.userForm = this.formBuilder.group({
            country: ['', Validators.required],
            username: ['', Validators.required],
            password,
            confirmPassword,
            firstname: [''],
            lastname: [''],
            email: ['', [Validators.email, Validators.required]],
            postcode: [''],
            info: [''],
            last_login: [{value: null, disabled: true}],
            last_ip: [{value: null, disabled: true}],
            language: [null, Validators.required],
            usertype: [null, Validators.required],
            active: [null, Validators.required],
        });

        if (this.userService.currentUser.usertype === FwUserType.SYSADMIN) {
            this.view.data.userTypeList = ['USER', 'ADMIN', 'SYSADMIN'];
        }
        if (this.userService.currentUser.usertype === FwUserType.ADMIN) {
            this.view.data.userTypeList = ['USER'];
        }

        const urlData = JSON.parse(this.cryptoService.decrypt(this.router.url.split('/').reverse()[0])) as FwOpenData;
        if (urlData) {
            if (urlData.viewMode === FwFormViewMode.INSERT) {
                if (this.userService.currentUser.usertype === FwUserType.SYSADMIN || this.userService.currentUser.usertype === FwUserType.ADMIN) {
                    this.openInsertForm();
                    this.view.setting.backlink = '/userlist';
                } else {
                    console.error('wrong usertype');
                    this.logService.write(FwLogType.ACCESS_VIOLATION, 'wrong usertype');
                }

            } else {
                if (urlData.ID) {
                    this.view.data.currentPublicId = urlData.ID;
                } else {
                    this.view.data.currentPublicId = this.userService.currentUser.public_id;
                }
                this.switchFormViewMode(urlData.viewMode);
                this.openEditForm();
                if (this.userService.currentUser.usertype === FwUserType.SYSADMIN || this.userService.currentUser.usertype === FwUserType.ADMIN) {
                    this.view.setting.backlink = '/userlist';
                } else {
                    this.view.setting.backlink = '/dashboard';
                }
            }
        } else {
            console.error('wrong url parameter');
            this.logService.write(FwLogType.ACCESS_VIOLATION, 'wrong url parameter');
        }
    }

    prepareForm(): void {
        const fields = ['country', 'username', 'password', 'confirmPassword', 'firstname', 'lastname', 'email', 'postcode', 'info', 'language', 'usertype', 'active'];

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
            if(this.view.setting.formViewMode === FwFormViewMode.EDIT){
                this.openEditForm();
            }
        }
    }

    openInsertForm(): void {
        this.prepareForm();
        this.dataService.request('Country/listAll', {
            LANG: this.userService.currentUser.language
        }).subscribe((response: any) => {
            response.countrys.forEach((i, index) => {
                i.id = index;
            });
            this.view.data.countryList = response.countrys;
            this.userForm.reset();
            this.userForm.controls.username.enable();
            this.userForm.controls.password.enable();
            this.userForm.controls.active.enable();
            this.switchFormViewMode(FwFormViewMode.INSERT);
            this.view.setting.showPasswordUpdate = true;
            this.view.setting.userExist = false;
        });
    }

    openEditForm(): void {
        this.view.setting.showPasswordUpdate = false;
        this.dataService.request('User/getUserInfo', {
            public_id: this.view.data.currentPublicId,
            LANG: this.userService.currentUser.language
        }).subscribe((response: any) => {
            this.view.data.user = response.user;
            this.view.data.currentUID = this.view.data.currentPublicId;


            if (this.userService.currentUser.usertype === FwUserType.SYSADMIN
                || (this.userService.currentUser.usertype === FwUserType.ADMIN && this.view.data.user.UID === this.userService.currentUser.UID)
                || this.userService.currentUser.usertype === FwUserType.USER
            ) {
                this.view.setting.allowEdit = true;
            } else {
                this.view.setting.allowEdit = false;
            }

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
            this.userForm.patchValue({usertype: this.view.data.user.usertype});
            this.userForm.patchValue({country: this.view.data.countryList.find(x => x.CID === this.view.data.user.CID)});
            if (this.userService.currentUser.usertype !== FwUserType.SYSADMIN) {
                this.userForm.controls.usertype.disable();
            } else {
                if (this.view.setting.formViewMode !== this.FormViewMode.VIEW) {
                    this.userForm.controls.usertype.enable();
                }
            }

            this.userForm.patchValue({active: this.view.data.ynList.find(x => x.db == this.view.data.user.active)});
            this.userForm.patchValue({language: this.view.data.user.language});
            this.userForm.controls.last_login.setValue(this.view.data.user.last_login);
            this.userForm.controls.last_ip.setValue(this.view.data.user.last_ip);
            /*this.userForm.patchValue({usertype: this.view.data.user.usertype});*/
            this.userForm.controls.info.setValue(this.view.data.user.info);
        });
    }

    closeUserForm(): void {
        this.router.navigate([this.view.setting.backlink]).catch();
    }

    enablePasswortUpdate(): void {
        this.view.setting.showPasswordUpdate = true;
        this.userForm.controls.password.enable();
        this.userForm.controls.confirmPassword.enable();
    }

    checkUsernameExist(): void {
        this.dataService.request('User/checkUserExist', {
            username: this.userForm.controls.username.value,
        }).subscribe((response: any) => {
            this.view.setting.userExist = response.userExist;
            if (this.view.setting.userExist) {
                this.userForm.controls.username.setErrors({'Username exist': true});
            } else {
                this.userForm.controls.username.setErrors(null);
            }
        });
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

    insertUser(): void {
        this.view.data.currentPublicId = uuidv4();
        this.dataService.request('User/insert', {
            public_id: this.view.data.currentPublicId,
            form: this.userForm.value
        }).subscribe((response: any) => {
            this.view.data.currentUID = response.user.index;
            this.view.setting.formViewMode = FwFormViewMode.VIEW;
            this.openEditForm();
        });
    }

    updateUser(): void {
        this.dataService.request((this.userService.currentUser.usertype === FwUserType.SYSADMIN || this.userService.currentUser.usertype === FwUserType.ADMIN) ? 'User/updateUser' : 'User/updateOwnUser', {
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

    deleteUser(): void {
        this.dataService.request('User/delete', {
            public_id: this.view.data.currentPublicId
        }).subscribe(() => {
            this.router.navigate(['/userlist']);
        });
    }

    switchFormViewMode(formViewMode: FwFormViewMode): void {
        this.view.setting.formViewMode = formViewMode;
        this.view.setting.showPasswordUpdate = false;
        this.prepareForm();
    }

    openDeleteModal() {
        this.dialog.open(this.modalDelete);
    }
}
