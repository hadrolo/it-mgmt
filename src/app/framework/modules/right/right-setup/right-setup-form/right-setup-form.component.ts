import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {RightService} from '../../right.service';
import {CryptoService} from '../../../../services/crypto.service';
import {DataService} from '../../../../services/data.service';
import {FwFormViewMode} from '../../../form/form.interfaces';

interface FwRightData {
    currentRID: string;
    right: any;
    moduleList: string[];
    typeList: string[];
    rightList: any;
    rightGroupList: any;
}

interface FwRightSettings {
    formViewMode: FwFormViewMode;
    htmlTitle: string;
}

interface FwRightView {
    setting: FwRightSettings;
    data: FwRightData;
}


@Component({
    selector: 'app-right-setup-form',
    templateUrl: './right-setup-form.component.html',
    styleUrls: ['./right-setup-form.component.scss']
})
export class RightSetupFormComponent implements OnInit {

    view: FwRightView = {
        setting: {
            formViewMode: null,
            htmlTitle: null,
        },
        data: {
            currentRID: null,
            right: null,
            moduleList: ['APP', 'FRAMEWORK'],
            typeList: ['API', 'CLIENT', 'ALIAS'],
            rightList: null,
            rightGroupList: null,
        }
    };

    rightForm = this.formBuilder.group({
        module: [null, Validators.required],
        type: [null, Validators.required],
        rightGroup: [null, Validators.required],
        name: ['', Validators.required],
        class: ['', Validators.required],
        method: ['', Validators.required],
        i18n: [''],
        description: [''],
    });

    FormViewMode = FwFormViewMode;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public rightService: RightService,
        private cryptoService: CryptoService,
        private dataService: DataService,
        public formBuilder: UntypedFormBuilder,
    ) {
    }

    ngOnInit(): void {
        const urlData = this.cryptoService.urlData(this.router.url.split('/').reverse()[0]);
        if (urlData.viewMode) {
            this.view.setting.formViewMode = urlData.viewMode;
            if (urlData.ID) {
                this.view.data.currentRID = urlData.ID;
            }
            if (this.view.setting.formViewMode === FwFormViewMode.INSERT) {
                this.view.setting.htmlTitle = 'Recht erstellen';
                this.openInsertForm();
            }
            if (this.view.setting.formViewMode === FwFormViewMode.VIEW || this.view.setting.formViewMode === FwFormViewMode.EDIT) {
                if (this.view.setting.formViewMode === FwFormViewMode.VIEW) {
                    this.view.setting.htmlTitle = 'Recht';
                }
                if (this.view.setting.formViewMode === FwFormViewMode.EDIT) {
                    this.view.setting.htmlTitle = 'Recht bearbeiten';
                }
                this.openViewEditForm();
            }

        } else {
            console.error('no viewMode in urlData');
        }
    }

    openInsertForm(): void {
        this.dataService.request('framework.Right/loadRightGroupList').subscribe(response => {
            this.view.data.rightGroupList = response.rightGroupList.data;
            this.prepareForm();
        });
    }

    openViewEditForm(): void {
        this.dataService.request('framework.Right/loadRight', {
            RID: this.view.data.currentRID
        }).subscribe(response => {
            this.view.data.right = response.right;
            this.view.data.rightGroupList = response.rightGroupList.data;
            this.rightForm.patchValue({module: this.view.data.right.module});
            this.rightForm.patchValue({type: this.view.data.right.type});
            this.rightForm.patchValue({rightGroup: this.view.data.right.RGID});
            this.rightForm.controls.name.setValue(this.view.data.right.name);
            this.rightForm.controls.i18n.setValue(this.view.data.right.i18n);
            this.rightForm.controls.class.setValue(this.view.data.right.class);
            this.rightForm.controls.method.setValue(this.view.data.right.method);
            this.rightForm.controls.description.setValue(this.view.data.right.description);
            this.prepareForm();
        });
    }

    prepareForm(): void {
        let fieldsEnable;
        let fieldsDisable;

        fieldsDisable = ['module','type', 'rightGroup', 'name', 'i18n', 'description', 'class', 'method'];

        if (this.rightForm.value.type === 'API') {
            fieldsEnable = ['module','type', 'rightGroup', 'name', 'i18n', 'description', 'class', 'method'];
        } else {
            fieldsEnable = ['module','type', 'rightGroup', 'name', 'i18n', 'description'];
        }

        fieldsDisable.forEach(element => {
            this.rightForm.controls[element].disable();
        });

        if (this.view.setting.formViewMode === FwFormViewMode.INSERT || this.view.setting.formViewMode === FwFormViewMode.EDIT) {
            fieldsEnable.forEach(element => {
                this.rightForm.controls[element].enable();
            });
        }
    }

/*    loadRightList(RGID = null): void {
        this.dataService.request('framework.Right/loadRightList', {
            RGID
        }).subscribe(response => {
            // console.log(response);
        });
    }*/

    closeForm(): void {
        this.router.navigate(['list'], {relativeTo: this.activatedRoute.parent});
    }

    openEditForm(): void {
        this.view.setting.formViewMode = FwFormViewMode.EDIT;
        this.prepareForm();
        // this.rightForm.controls.type.disable();
    }

    cancelEditMode(): void {
        this.view.setting.formViewMode = FwFormViewMode.VIEW;
        this.openViewEditForm();
    }

    insertRight(): void {
        this.dataService.request('framework.Right/insertRight', {
            form: this.rightForm.value
        }).subscribe(response => {
            this.view.data.currentRID = response.index;
            this.view.setting.formViewMode = FwFormViewMode.VIEW;
            this.openViewEditForm();
        });
    }

    updateRight(): void {
        this.dataService.request('framework.Right/updateRight', {
            form: this.rightForm.value,
            RID: this.view.data.currentRID
        }).subscribe(response => {
            this.view.setting.formViewMode = FwFormViewMode.VIEW;
            this.prepareForm();
        });
    }

    deleteRight(): void {
        this.dataService.request('framework.Right/deleteRight', {
            RID: this.view.data.currentRID
        }).subscribe(() => {
            this.closeForm();
        });
    }
}
