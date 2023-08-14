import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FwUserType} from 'src/app/framework/settings';
import {DataService} from '../../../services/data.service';
import {FwMessage} from '../../../services/form-translate.service';
import {ToastrService} from 'ngx-toastr';
import {SettingsService} from '../../../services/settings.service';
import {TranslateService} from '@ngx-translate/core';

declare var $: any; // JQuery

enum FwRightAssignFormType {
    INSERT = 'insert',
    INSERT_ALL = 'insert_all',
    COPY = 'copy_all',
    DELETE = 'delete',
    DELETE_ALL = 'delete_all'
}

interface FwRightAssignSelData {
    usertype: string;
    RTID: string;
    RGID: string;
    right: any;
    usertypeCopy: string;
}

interface FwRightAssignedData {
    group_name: string;
    name: string;
    description: string;
}
interface FwRightUnassignedData {
    name: string;
}
interface FwGroupUnassignedData {
    RGID: string;
    group_name: string;
}

interface FwRightAssignListData {
    usertypes: string[];
    rightsAssigned: FwRightAssignedData[];
    rightGroupsUnassigned: FwGroupUnassignedData[];
    rightsUnassigned: FwRightUnassignedData[];
    copyUsertypes: string[];
}

interface FwRightAssignView {
    formType: FwRightAssignFormType;
    formTitle: string;
    selected: FwRightAssignSelData;
    data: FwRightAssignListData;
}

@Component({
    selector: 'app-right-assign',
    templateUrl: './right-assign.component.html',
    styleUrls: ['./right-assign.component.scss']
})
export class RightAssignComponent implements OnInit {
    view: FwRightAssignView = {
        formType: null,
        formTitle: null,
        selected: {} as FwRightAssignSelData,
        data: {} as FwRightAssignListData
    };
    UserType = FwUserType;
    FormType = FwRightAssignFormType;

    constructor(
        private router: Router,
        private dataService: DataService,
        public toastrService: ToastrService,
        private route: ActivatedRoute,
        public settingsService: SettingsService,
        private translateService: TranslateService,
    ) {
    }

    ngOnInit(): void {
        this.view.data.usertypes = Object.values(this.UserType);
        this.view.selected.usertype = this.view.data.usertypes[0];
        this.listRightsAssigned();
    }

    listRightGroupsUnassigned(): void {
        this.dataService.request('framework.Right/listRightGroupsUnassigned', {
            usertype: this.view.selected.usertype
        }).subscribe(response => {
            this.view.data.rightGroupsUnassigned = response.groups.data;
        });
    }

    listRightsUnassigned(): void {
        this.dataService.request('framework.Right/listRightsUnassigned', {
            usertype: this.view.selected.usertype,
            RGID: this.view.selected.RGID
        }).subscribe(response => {
            this.view.data.rightsUnassigned = response.rights.data;
        });
    }

    listRightsAssigned(): void {
        this.dataService.request('framework.Right/listRightsAssigned', {
            usertype: this.view.selected.usertype
        }).subscribe(response => {
            this.view.data.rightsAssigned = response.rights.data;
        });
    }

    openRouterLink(link: string): void {
        this.router.navigate([link], {relativeTo: this.route.parent});
    }

    openInsertForm(): void {
        this.view.formTitle = 'Berechtigung zuweisen';
        this.view.formType = FwRightAssignFormType.INSERT;
        this.listRightGroupsUnassigned();
        $('#right-modal').modal({backdrop: 'static'});
    }

    openDeleteModal(data): void {
        this.view.formTitle = 'Berechtigung löschen';
        this.view.formType = FwRightAssignFormType.DELETE;
        this.view.selected.right = data;
        $('#right-modal').modal({backdrop: 'static'});
    }

    openCopyRightsForm(): void {
        this.view.formTitle = 'Berechtigung kopieren';
        this.view.formType = FwRightAssignFormType.COPY;
        this.view.data.copyUsertypes = Object.values(this.UserType);
        this.view.data.copyUsertypes.splice(this.view.data.copyUsertypes.indexOf(this.view.selected.usertype), 1);
        $('#right-modal').modal({backdrop: 'static'});
    }

    openInsertAllForm(): void {
        this.view.formTitle = 'Alle Berechtigungen einfügen';
        this.view.formType = FwRightAssignFormType.INSERT_ALL;
        $('#right-modal').modal({backdrop: 'static'});
    }

    openDeleteAllForm(): void {
        this.view.formTitle = 'Alle Berechtigungen löschen';
        this.view.formType = FwRightAssignFormType.DELETE_ALL;
        $('#right-modal').modal({backdrop: 'static'});
    }

    changeUsertype(): void {
        this.listRightsAssigned();
    }

    changeUserGroup(): void {
        this.listRightsUnassigned();
    }

    insert(): void {
        this.dataService.request('framework.Right/assignUsertypeRight', {
            RID: this.view.selected.right.RID,
            usertype: this.view.selected.usertype
        }).subscribe(response => {
            if (!response.errors) {
                this.toastrService.success(this.translateService.instant('FW.FORM.MSG_INSERT_OK'));
                this.listRightsAssigned();
                this.view.selected.RGID = null;
                this.view.data.rightsUnassigned = [];
                this.view.data.rightGroupsUnassigned = [];
                $('#right-modal').modal('hide');
            }
        });
    }

    delete(): void {
        this.dataService.request('framework.Right/unassignUsertypeRight', {
            RTID: this.view.selected.right.RTID
        }).subscribe(response => {
            if (!response.errors) {
                this.toastrService.success(this.translateService.instant('FW.FORM.MSG_DELETE'));
                this.listRightsAssigned();
                this.view.selected.RGID = null;
                this.view.data.rightsUnassigned = [];
                this.view.data.rightGroupsUnassigned = [];
                $('#right-modal').modal('hide');
            }
        });
    }

    deleteAll(): void {
        this.dataService.request('framework.Right/deleteAllUsertypeRights', {
            usertype: this.view.selected.usertype
        }).subscribe(response => {
            if (!response.errors) {
                this.toastrService.success(this.translateService.instant('FW.FORM.MSG_INSERT_OK'));
                this.listRightsAssigned();
                $('#right-modal').modal('hide');
            }
        });
    }

    insertAll(): void {
        this.dataService.request('framework.Right/insertAllUsertypeRights', {
            usertype: this.view.selected.usertype
        }).subscribe(response => {
            if (!response.errors) {
                this.toastrService.success(this.translateService.instant('FW.FORM.MSG_INSERT_OK'));
                this.listRightsAssigned();
                $('#right-modal').modal('hide');
            }
        });
    }

    copy(): void {
        this.dataService.request('framework.Right/copyUsertypeRight', {
            src_usertype: this.view.selected.usertype,
            dst_usertype: this.view.selected.usertypeCopy
        }).subscribe(response => {
            if (!response.errors) {
                this.toastrService.success(this.translateService.instant('FW.FORM.MSG_INSERT_OK'));
                this.view.selected.usertype = this.view.selected.usertypeCopy;
                this.listRightsAssigned();
                $('#right-modal').modal('hide');
            }
        });
    }
}
