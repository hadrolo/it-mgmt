import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {DataService} from '../../../framework/services/data.service';
import {OtService} from '../ot.service';
import {MatDialog} from '@angular/material/dialog';

export enum OtTreeViewMode {
    ALL_VIEW = 'ALL_VIEW',
    GROUP_INSERT = 'GROUP_INSERT',
    GROUP_EDIT = 'GROUP_EDIT',
    GROUP_DELETE = 'GROUP_DELETE',
    POSITION_GROUP_INSERT = 'POSITION_GROUP_INSERT',
    POSITION_GROUP_EDIT = 'POSITION_GROUP_EDIT',
    POSITION_GROUP_DELETE = 'POSITION_GROUP_DELETE',
    POSITION_INSERT = 'POSITION_INSERT',
    POSITION_EDIT = 'POSITION_EDIT',
    POSITION_DELETE = 'POSITION_DELETE',
    FIELD_INSERT = 'FIELD_INSERT',
    FIELD_EDIT = 'FIELD_EDIT',
    FIELD_DELETE = 'FIELD_DELETE',
}

interface OtTreeSetting {
    viewMode: OtTreeViewMode;
}

interface OtTreeData {
    tree: [];
}

interface OtTreeView {
    setting: OtTreeSetting;
    data: OtTreeData;
}

@Component({
    selector: 'app-ot-tree',
    templateUrl: './ot-tree.component.html',
    styleUrls: ['./ot-tree.component.scss']
})
export class OtTreeComponent implements OnInit, OnDestroy {


    setOtViewMode$;
    loadAllOt$;
    view: OtTreeView = {
        setting: {
            viewMode: null,
        },
        data: {
                tree: [],
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
        this.test();
    }

    ngOnDestroy(): void {
        this.setOtViewMode$.unsubscribe();
        this.loadAllOt$.unsubscribe();
    }

    setOtViewMode(otViewMode: OtTreeViewMode) {
        this.view.setting.viewMode = otViewMode;
    }

    loadAllOt(otViewMode: OtTreeViewMode = null) {
        this.dataService.request('Ot/loadGroupsTree').subscribe(response => {
            this.view.data.tree = response.tree;
            console.log(this.view.data);
            if (otViewMode) {
                this.view.setting.viewMode = otViewMode;
            }
        });
    }

    test(){
        this.dataService.request('Ot/createGroupLayer',
            {
                LAYER: 2
            }).subscribe(response => {
            console.log(response);
        });
    }


    openGroupForm(viewMode: OtTreeViewMode, id = null) {
        this.view.setting.viewMode = viewMode;
        this.otService.openGroupForm.next({id: id});
    }

    openPositionForm(viewMode: OtTreeViewMode, id = null, $event) {
        $event.stopPropagation();
        this.view.setting.viewMode = viewMode;
        this.otService.openPositionForm.next({viewMode: viewMode, id: id});
    }

    openPositionGroupForm(viewMode: OtTreeViewMode, id = null, $event) {
        $event.stopPropagation();
        this.view.setting.viewMode = viewMode;
        this.otService.openPositionForm.next({viewMode: viewMode, id: id});
    }

    deleteOtGroup(viewMode: OtTreeViewMode, id, $event) {
        $event.stopPropagation();
        this.openGroupForm(viewMode, id);
    }

    openFieldForm(POSITION_INSERT: OtTreeViewMode, param2, $event: MouseEvent) {

    }

    deleteOtPosition(POSITION_DELETE: OtTreeViewMode, groupElement: never, $event: MouseEvent) {
        
    }

    deleteOtField(FIELD_DELETE: OtTreeViewMode, groupElement: never, $event: MouseEvent) {
        
    }


}
