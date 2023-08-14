import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FwUserType} from '../../../settings';
import {DataService} from '../../../services/data.service';
import {FwFormViewMode} from '../../form/form.interfaces';
import {SettingsService} from '../../../services/settings.service';
import {SeoService} from '../../../services/seo.service';
import {TranslateService} from '@ngx-translate/core';

interface FwRightGroupOverviewSetting {
    formViewMode: FwFormViewMode;
    openAllItems: boolean;
}

interface FwRightList{
    RGID: string;
    open: boolean;
    rights: any[];
}

interface FwRightListRight{
    RID: string;
    assigned?: boolean;
    class?: string;
    description?: string;
    i18n?: string;
    method?: string;
    module?: string;
    name: string;
    type: string;
    open?: boolean;
    allowPermanent?: boolean;
}

interface FwRightGroupList{
    RGID: string;
    description?: string;
}

interface FwRightGroupOverviewData {
    selectedUsertype: string;
    selectedRightType: string;
    selectedRightGroup: string;
    selectedRightFilter: string;
    usertypeList: string[];
    rightList: FwRightList[];
    rightTypeList: string[];
    rightGroupList: FwRightGroupList[];
}

interface FwRightGroupOverviewView {
    setting: FwRightGroupOverviewSetting,
    data: FwRightGroupOverviewData
}

@Component({
    selector: 'app-right-groupright-setup',
    templateUrl: './right-groupright-setup.component.html',
    styleUrls: ['./right-groupright-setup.component.scss']
})

export class RightGrouprightSetupComponent implements OnInit {

    UserType = FwUserType;
    FormViewMode = FwFormViewMode;

    view: FwRightGroupOverviewView = {
        setting: {
            formViewMode: FwFormViewMode.VIEW,
            openAllItems: false,
        },
        data: {
            selectedUsertype: null,
            selectedRightType: null,
            selectedRightGroup: 'alle',
            selectedRightFilter: null,
            usertypeList: null,
            rightList: null,
            rightTypeList: ['alle', 'ALIAS', 'API', 'CLIENT'],
            rightGroupList: null
        }
    };

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private dataService: DataService,
        private settingsService: SettingsService,
        private seoService: SeoService,
        private translateService: TranslateService,
    ) {
    }

    ngOnInit(): void {
        this.seoService.setTitle(this.settingsService.frameworkSettings.appName + ' - ' + this.translateService.instant('FW.RIGHT.USERTYPE_RIGHT_TITLE'));
        this.view.data.usertypeList = [];
        Object.values(this.UserType).forEach(elem => {
            if (elem !== 'SYSADMIN') {
                this.view.data.usertypeList.push(elem);
            }
        });
        this.view.data.selectedUsertype = this.view.data.usertypeList[0];
        this.view.data.selectedRightType = this.view.data.rightTypeList[0];
        this.getAllRights();
    }

    getAllRights(): void {
        this.dataService.request('framework.Right/loadAllUsertypeRights', {
            usertype: this.view.data.selectedUsertype,
            rightType: this.view.data.selectedRightType,
            rightGroup: this.view.data.selectedRightGroup,
            rightFilter: this.view.data.selectedRightFilter,
            openAllItems: this.view.setting.openAllItems,
        }).subscribe(response => {
            console.log(response);
            this.view.data.rightList = response.allRights;
            this.view.data.rightGroupList = response.rightGroups;
            this.view.data.rightGroupList.unshift({RGID: 'alle'});
            console.log(this.view);
        });
    }

    openRouterLink(link: string): void {
        this.router.navigate([link], {relativeTo: this.activatedRoute.parent});
    }

    updateRights(): void {
        this.dataService.request('framework.Right/updateUsertypeRights', {
            usertype: this.view.data.selectedUsertype,
            rightList: this.view.data.rightList
        }).subscribe(response => {
            this.getAllRights();
            this.view.setting.formViewMode = FwFormViewMode.VIEW;
        });
    }

    openEditMode(): void {
        this.view.setting.formViewMode = FwFormViewMode.EDIT;
    }

    cancelEditMode(): void {
        this.view.setting.formViewMode = FwFormViewMode.VIEW;
    }

    toggleCheckbox(right): void {
        if (!right.value.allowPermanent && this.view.setting.formViewMode === FwFormViewMode.EDIT) {
            right.value.assigned = !right.value.assigned;
        }
    }

    assignAll(): void {
        this.view.data.rightList.forEach((rightGroup: any) => {
            rightGroup.rights.forEach(right => {
                right.assigned = true;
            });
        });
    }

    unassignAll(): void {
        this.view.data.rightList.forEach((rightGroup: any) => {
            rightGroup.rights.forEach(right => {
                right.assigned = false;
            });
        });
    }

    toggleContent(rightgroup: any): void {
        rightgroup.open = !rightgroup.open;
    }

    maximizeAllRightGroups(): void {
        this.view.data.rightList.forEach(element => {
            this.view.setting.openAllItems = true;
            element.open = true;
        });
    }

    minimizeAllRightGroups(): void {
        this.view.data.rightList.forEach(element => {
            element.open = false;
            this.view.setting.openAllItems = true;
        });
    }
}
