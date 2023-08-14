import {Component, OnInit} from '@angular/core';
import {DataService} from '../../../framework/services/data.service'
import {OtService} from '../ot.service';


export enum OtViewMode{
  ALL_VIEW = 'ALL_VIEW',
  GROUP_INSERT = 'GROUP_INSERT',
  GROUP_EDIT = 'GROUP_EDIT',
  GROUP_VIEW = 'GROUP_VIEW'
}

interface OtSetting {
  viewMode: OtViewMode;
}

interface OtData {
  groups: [];
}

interface OtView {
  setting: OtSetting;
  data: {
    ot: OtData;
  }
}

@Component({
  selector: 'app-ot-group',
  templateUrl: './ot-group.component.html',
  styleUrls: ['./ot-group.component.scss']
})
export class OtGroupComponent implements OnInit{

  setOtViewMode$;
  loadAllOt$;

  view: OtView = {
    setting: {
      viewMode: null,
    },
    data: {
      ot: {
        groups: [],
      }
    }
  };

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

  setOtViewMode(otViewMode: OtViewMode){
    this.view.setting.viewMode = otViewMode;
  }

  loadAllOt(otViewMode: OtViewMode = null){
    this.dataService.request('Ot/loadGroups', {
    }).subscribe(response => {
      console.log(otViewMode);
      console.log(response);
      this.view.data.ot.groups = response.otGroups.data;
      if (otViewMode){
        this.view.setting.viewMode = otViewMode;
      }
    });
  }


  protected readonly OtViewMode = OtViewMode;


  openGroupForm(viewMode: OtViewMode, id = null) {
    console.log(id);
    this.view.setting.viewMode = viewMode;
    this.otService.openGroupForm.next({viewMode: viewMode ,id: id});
  }
}
