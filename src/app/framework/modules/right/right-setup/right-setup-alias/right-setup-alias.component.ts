import {Component, Input, OnInit} from '@angular/core';
import {DataService} from '../../../../services/data.service';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {FwFormViewMode} from '../../../form/form.interfaces';

interface FwRightSelected {
    type: string;
    RGID: string;
    RID: string;
}

interface FwRightAliasData {
    selected: FwRightSelected;
    rightAssignedList: any;
    rightUnassignedList: any;
    rightUnassignedGroupsList: any;
    rightTypeList: any;
}

interface FwRightAliasSettings {
    formViewMode: FwFormViewMode;
}

interface FwRightView {
    setting: FwRightAliasSettings;
    data: FwRightAliasData;
}

@Component({
    selector: 'app-right-setup-alias',
    templateUrl: './right-setup-alias.component.html',
    styleUrls: ['./right-setup-alias.component.scss']
})
export class RightSetupAliasComponent implements OnInit {

    @Input() RID: string;
    @Input() viewMode: string;

    view: FwRightView = {
        setting: {
            formViewMode: FwFormViewMode.VIEW
        },
        data: {
            selected: {
                type: null,
                RGID: null,
                RID: null,
            },
            rightAssignedList: null,
            rightTypeList: ['API', 'CLIENT'],
            rightUnassignedGroupsList: null,
            rightUnassignedList: null
        }
    };

    rightAssignForm = this.formBuilder.group({
        type: [null, Validators.required],
        rightGroup: [null, Validators.required],
        right: [null, Validators.required]
    });

    FormViewMode = FwFormViewMode;

    constructor(
        private dataService: DataService,
        public formBuilder: UntypedFormBuilder,
    ) {
    }

    ngOnInit(): void {
        this.loadRightsAliases();
    }


    loadRightsAliases(): void {
        if (this.rightAssignForm.value?.type) {
            this.view.data.selected.type = this.rightAssignForm.value.type;
        } else {
            this.view.data.selected.type = null;
        }
        if (this.rightAssignForm.value.rightGroup?.RGID) {
            this.view.data.selected.RGID = this.rightAssignForm.value.rightGroup?.RGID;
        } else {
            this.view.data.selected.RGID = null;
        }
        if (this.rightAssignForm.value.right?.RID) {
            this.view.data.selected.RID = this.rightAssignForm.value.right?.RID;
        } else {
            this.view.data.selected.RID = null;
        }
        this.dataService.request('framework.Right/loadRightAliases', {
            RID: this.RID,
            selected: this.view.data.selected
        }).subscribe(response => {
            this.view.data.rightAssignedList = response.rightAssignedList.data;
            this.view.data.rightUnassignedGroupsList = response.rightUnassignedGroupsList.data;
            this.view.data.rightUnassignedGroupsList.forEach((i, index) => {
                i.id = index;
            });
            this.view.data.rightUnassignedList = response.rightUnassignedList.data;
            this.view.data.rightUnassignedList.forEach((i, index) => {
                i.id = index;
            });

            this.prepareForm();
        });
    }

    prepareForm(): void {
        if (this.view.data.selected?.type) {
            this.rightAssignForm.patchValue({type: this.view.data.selected.type});
        }
        if (this.view.data.selected?.RGID) {
            this.rightAssignForm.patchValue({rightGroup: this.view.data.rightUnassignedGroupsList[this.view.data.rightUnassignedGroupsList.find(x => x.RGID === this.view.data.selected.RGID).id]});
        }
        if (this.view.data.selected?.RID) {
            this.rightAssignForm.patchValue({right: this.view.data.rightUnassignedList[this.view.data.rightUnassignedList.find(x => x.RID === this.view.data.selected.RID).id]});
        }
    }

    unassign(alias: any): void {
        this.dataService.request('framework.Right/unassignRightAlias', {
            RID_alias: alias.RID_alias,
            RID_client: alias.RID_client
        }).subscribe(() => {
            this.rightAssignForm.reset();
            this.view.data.selected = {
                type: null,
                RGID: null,
                RID: null,
            };
            this.loadRightsAliases();
        });
    }

    assignRight(): void {
        this.dataService.request('framework.Right/assignRightAlias', {
            RID_alias: this.RID,
            RID_client: this.view.data.selected.RID
        }).subscribe(() => {
            this.rightAssignForm.reset();
            this.view.data.selected = {
                type: null,
                RGID: null,
                RID: null,
            };
            this.loadRightsAliases();
        });
    }

    protected readonly FwFormViewMode = FwFormViewMode;
}
