import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../../framework/services/data.service';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {OtViewMode} from '../ot-group.component';
import {FwFormViewMode} from '../../../../framework/modules/form/form.interfaces';
import {OtService} from '../../ot.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

interface OtGroupSettings {
    formViewMode: OtViewMode,
    insertOtType: boolean,
    selectedOttid: string,
}

interface OtGroupData {
    otGroup: any;
    otTypes: any[]
    otTypeExist: any[];
    otTypeLike: any[];
    otGroupnameExist: any[];
    otGroupnameLike: any[];
}

interface OtGroupView {
    setting: OtGroupSettings;
    data: OtGroupData;
}

@Component({
    selector: 'app-ot-group-form',
    templateUrl: './ot-group-form.component.html',
    styleUrls: ['./ot-group-form.component.scss']
})
export class OtGroupFormComponent implements OnInit, OnDestroy {

    @Input() otViewMode: OtViewMode = null;

    protected readonly FwFormViewMode = FwFormViewMode;
    protected readonly OtViewMode = OtViewMode;
    openGroupForm$;

    view: OtGroupView = {
        setting: {
            formViewMode: null,
            insertOtType: false,
            selectedOttid: null
        },
        data: {
            otGroup: null,
            otTypes: null,
            otTypeExist: null,
            otTypeLike: null,
            otGroupnameExist: null,
            otGroupnameLike: null,
        }
    }

    otGroupForm = this.formBuilder.group({
        ottid: [null, Validators.required],
        level: [null, Validators.required],
        groupname: [{value: null, disabled: true}, [Validators.required, Validators.minLength(3)]],
        grouplevel: [null, Validators.required],
        description: [null],
        ottype: [{value: null, disabled: true}, [Validators.required, Validators.minLength(3)]],
    });

    constructor(
        private dataService: DataService,
        public formBuilder: UntypedFormBuilder,
        public otService: OtService,
    ) {
    }

    ngOnInit(): void {
        this.openGroupForm$ = this.otService.openGroupForm.subscribe((object) => this.openForm(object.viewMode, object.id));
    }

    ngOnDestroy(): void {
        this.openGroupForm$.unsubscribe();
    }

    prepareForm(): void {
        let fields = ['ottid', 'level', 'groupname', 'grouplevel', 'description'];

        if (this.otViewMode === OtViewMode.GROUP_INSERT || OtViewMode.GROUP_EDIT) {
            fields.forEach(element => {
                this.otGroupForm.controls[element].enable();
            });
        } else {
            fields.forEach(element => {
                this.otGroupForm.controls[element].disable();
            });
        }

        if (this.view.setting.insertOtType) {
            this.otGroupForm.controls['ottype'].enable();
            fields.forEach(element => {
                this.otGroupForm.controls[element].disable();
            });
        } else {
            this.otGroupForm.controls['ottype'].disable();
        }
    }

    openForm(viewMode: OtViewMode = null, id: string = null) {
        this.dataService.request('Ot/loadGroupFormData', {
            otgid: id
        }).subscribe(response => {
            this.view.data = {
                otGroup: response.otGroup?.data[0] ? response.otGroup.data[0] : null,
                otGroupnameExist: null,
                otGroupnameLike: null,
                otTypeExist: null,
                otTypeLike: null,
                otTypes: response.otTypes.data ? response.otTypes.data : null

            };

            this.view.setting.formViewMode = viewMode;
            this.prepareForm();

            if (viewMode == OtViewMode.GROUP_EDIT){
                this.otGroupForm.controls.level.setValue(this.view.data.otGroup.level);
                this.otGroupForm.controls.groupname.setValue(this.view.data.otGroup.groupname);
                this.otGroupForm.controls.grouplevel.setValue(this.view.data.otGroup.grouplevel);
                this.otGroupForm.controls.description.setValue(this.view.data.otGroup.description)
                this.otGroupForm.patchValue({ottid: this.view.data.otTypes.find(x => x.OTTID == this.view.data.otGroup.OTTID).OTTID});
            }
        });
    }

    loadTypeData(): Observable<any> {
        return this.dataService.request('Ot/loadTypesData').pipe(map(response => {
            return this.view.data.otTypes = response.otTypes.data;
        }));
    }

    insertOtGroup() {
        this.dataService.request('Ot/insertGroup', {
            form: this.otGroupForm.value
        }).subscribe((response: any) => {
            this.otService.loadAllOt.next({otViewMode: OtViewMode.ALL_VIEW})
        });
    }

    enableInsertModeType() {
        this.view.setting.insertOtType = true;
        this.prepareForm();
    }

    disableInsertModeType() {
        this.view.setting.insertOtType = false;
        this.prepareForm();
    }

    checkGroupnameExist() {
        if (this.otGroupForm.value.groupname && this.otGroupForm.value.groupname.length > 2) {
            this.view.data.otGroupnameExist = [];
            this.view.data.otGroupnameLike = [];
            this.dataService.request('Ot/checkGroupnameExist', {
                groupname: this.otGroupForm.value.groupname
            }).subscribe((response: any) => {
                this.view.data.otGroupnameExist = response.otGroupnameExist.data;
                this.view.data.otGroupnameLike = response.otGroupnameLike.data;
            });
        }
    }

    checkTypeExist() {
        if (this.otGroupForm.value.ottype && this.otGroupForm.value.ottype.length > 2) {
            this.view.data.otTypeExist = [];
            this.view.data.otTypeLike = [];
            this.dataService.request('Ot/checkTypeExist', {
                name: this.otGroupForm.value.ottype
            }).subscribe((response: any) => {
                this.view.data.otTypeExist = response.otTypeExist.data;
                this.view.data.otTypeLike = response.otTypeLike.data;
            });
        }
    }

    useTypeFound(ottid: any) {
        this.view.setting.insertOtType = false;
        this.otGroupForm.patchValue({ottid: this.view.data.otTypes.find(x => x.OTTID == ottid).OTTID});
        this.prepareForm();
    }

    insertOtType() {
        this.dataService.request('Ot/insertType', {
            form: this.otGroupForm.value
        }).subscribe((response: any) => {
            if (response.index) {
                console.log(response.index);
                this.disableInsertModeType();
                this.loadTypeData().subscribe((res) => {
                    console.log(this.view.data.otTypes);
                    console.log(this.view.data.otTypes.find(x => x.OTTID == response.index));
                    this.otGroupForm.patchValue({ottid: this.view.data.otTypes.find(x => x.OTTID == response.index).OTTID});
                });
            } else {
                console.error('no insert-id response');
            }

        });
    }

    closeForm() {
        this.view = {
            setting: {
                formViewMode: null,
                insertOtType: false,
                selectedOttid: null
            },
            data: {
                otGroup: null,
                otTypes: null,
                otTypeExist: null,
                otTypeLike: null,
                otGroupnameExist: null,
                otGroupnameLike: null,
            }
        }
        this.otService.setOtViewMode.next(OtViewMode.ALL_VIEW);
        this.otGroupForm.reset();
    }
}
