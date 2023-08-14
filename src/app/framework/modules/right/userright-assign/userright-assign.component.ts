import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../../services/data.service';
import {ToastrService} from 'ngx-toastr';

declare var $: any; // JQuery

enum FwUserrightAssignFormType {
    INSERT = 'insert',
    INSERT_ALL = 'insert_all',
    COPY = 'copy_all',
    DELETE = 'delete',
    DELETE_ALL = 'delete_all'
}

interface FwUserrightAssignSelData {
    UID: string;
    /*    RTID: string;
        RGID: string;
        right: any;
        usertypeCopy: string;*/
}

interface FwUserrightAssignListData {
    users: string[];
    rightsAssigned: string[];
    /*    rightGroupsUnassigned: string[];
        rightsUnassigned: string[];
        copyUsertypes: string[];*/
}

interface FwUserrightAssignView {
    formType: FwUserrightAssignFormType;
    formTitle: string;
    selected: FwUserrightAssignSelData;
    data: FwUserrightAssignListData;
}

@Component({
    selector: 'app-userright-assign',
    templateUrl: './userright-assign.component.html',
    styleUrls: ['./userright-assign.component.scss']
})
export class UserrightAssignComponent implements OnInit {
    view: FwUserrightAssignView = {
        formType: null,
        formTitle: null,
        selected: {} as FwUserrightAssignSelData,
        data: {} as FwUserrightAssignListData
    };

    constructor(
        private router: Router,
        private dataService: DataService,
        public toastrService: ToastrService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        this.listUsers();
    }

    listUsers(): void {
        this.dataService.request('framework.Right/listUsers').subscribe(response => {
            this.view.data.users = response.users.data;
        });
    }

    openRouterLink(link: string): void {
        this.router.navigate([link], {relativeTo: this.route.parent});
    }

    changeUser(): void {
    }

    openInsertForm(): void {
    }

    openCopyRightsForm(): void {
    }

    openInsertAllForm(): void {
    }

    openDeleteAllForm(): void {
    }

    openDeleteModal(data): void {
    }
}
