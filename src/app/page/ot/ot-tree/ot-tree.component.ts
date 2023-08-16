import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../framework/services/data.service';
import {OtService} from '../ot.service';

export enum OtTreeViewMode{
    ALL_VIEW = 'ALL_VIEW',
    GROUP_INSERT = 'GROUP_INSERT',
    GROUP_EDIT = 'GROUP_EDIT',
    GROUP_VIEW = 'GROUP_VIEW'
}

interface OtTreeSetting {
    viewMode: OtTreeViewMode;
}

interface OtTreeData {
    groups: [];
}

interface OtTreeView {
    setting: OtTreeSetting;
    data: {
        ot: OtTreeData;
    }
}

@Component({
    selector: 'app-ot-tree',
    templateUrl: './ot-tree.component.html',
    styleUrls: ['./ot-tree.component.scss']
})
export class OtTreeComponent implements OnInit, OnDestroy{

    setOtViewMode$;
    loadAllOt$;
    view: OtTreeView = {
        setting: {
            viewMode: null,
        },
        data: {
            ot: {
                groups: [],
            }
        }
    };
    protected readonly OtTreeViewMode = OtTreeViewMode;

    constructor(
        private dataService: DataService,
        public otService: OtService,
    ) {
    }

    ngOnInit(): void {
        this.setOtViewMode$ = this.otService.setOtViewMode.subscribe((otViewMode) => this.setOtViewMode(otViewMode));
        this.loadAllOt$ = this.otService.loadAllOt.subscribe((object) => this.loadAllOt(object.otViewMode));
        this.loadAllOt();
    }

    ngOnDestroy(): void {
        this.setOtViewMode$.unsubscribe();
        this.loadAllOt$.unsubscribe();
    }

    setOtViewMode(otViewMode: OtTreeViewMode) {
        this.view.setting.viewMode = otViewMode;
    }

    loadAllOt(otViewMode: OtTreeViewMode = null) {
        this.dataService.request('Ot/loadGroups', {}).subscribe(response => {
            console.log(otViewMode);
            console.log(response);
            this.view.data.ot.groups = response.otGroups.data;
            if (otViewMode) {
                this.view.setting.viewMode = otViewMode;
            }
        });
    }


    openGroupForm(viewMode: OtTreeViewMode, id = null) {
        console.log(id);
        this.view.setting.viewMode = viewMode;
        this.otService.openGroupForm.next({viewMode: viewMode, id: id});
    }
}
