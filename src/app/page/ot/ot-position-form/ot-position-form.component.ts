import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {DataService} from '../../../framework/services/data.service';
import {OtService} from '../ot.service';
import {MatDialog} from '@angular/material/dialog';
import {OtTreeViewMode} from '../ot-tree/ot-tree.component';

interface OtPositionSettings {
  formViewMode: OtTreeViewMode,
  selectedOtpid: string,
/*  insertOtType: boolean,
  selectedOtgid: string,
  selectedOttid: string,*/
}

interface OtPositionData {
  otPosition: any;
/*  otTypes: any[]
  otTypeExist: any[];
  otTypeLike: any[];
  otGroupnameExist: any[];
  otGroupnameLike: any[];*/
}

interface OtPositionView {
  setting: OtPositionSettings;
  data: OtPositionData;
}

@Component({
  selector: 'app-ot-position-form',
  templateUrl: './ot-position-form.component.html',
  styleUrls: ['./ot-position-form.component.scss']
})
export class OtPositionFormComponent implements OnInit, OnDestroy {

  @Input() otTreeViewMode: OtTreeViewMode = null;
  @ViewChild('modalOtPositionForm') modalOtPositionForm: TemplateRef<any>;

  protected readonly OtViewMode = OtTreeViewMode;
  protected readonly OtTreeViewMode = OtTreeViewMode;
  openPositionForm$;

  view: OtPositionView = {
    setting: {
      formViewMode: null,
      selectedOtpid: null,
/*      insertOtType: false,
      selectedOtgid: null,
      selectedOttid: null*/
    },
    data: {
      otPosition: null,
/*      otTypes: null,
      otTypeExist: null,
      otTypeLike: null,
      otGroupnameExist: null,
      otGroupnameLike: null,*/
    }
  }

  otPositionForm = this.formBuilder.group({
    otpgid: [null, Validators.required],
    id: [null, Validators.required],
    name: [{value: null, disabled: true}, [Validators.required, Validators.minLength(3)]],
    description: [null],
    CID: [null],
    CLID: [null],
    //ottype: [{value: null, disabled: true}, [Validators.required, Validators.minLength(3)]],
  });

  constructor(
      private dataService: DataService,
      public formBuilder: UntypedFormBuilder,
      public otService: OtService,
      public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.openPositionForm$ = this.otService.openPositionForm.subscribe((object) => this.openForm(object.viewMode, object.id));
  }

  ngOnDestroy(): void {
    this.openPositionForm$.unsubscribe();
  }

  openForm(viewMode: OtTreeViewMode = null, id: string = null) {

    console.log('TEST');
    this.view.setting.selectedOtpid = id;
    this.dialog.open(this.modalOtPositionForm, {disableClose: true});
/*    this.dataService.request('Ot/loadGroupFormData', {
      otgid: this.view.setting.selectedOtgid
    }).subscribe(response => {
      console.log(viewMode, this.view.setting.selectedOtgid);
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

      if (viewMode == OtTreeViewMode.GROUP_EDIT) {
        this.otPositionForm.controls.level.setValue(this.view.data.otGroup.level);
        this.otPositionForm.controls.groupname.setValue(this.view.data.otGroup.groupname);
        this.otPositionForm.controls.grouplevel.setValue(this.view.data.otGroup.grouplevel);
        this.otPositionForm.controls.description.setValue(this.view.data.otGroup.description)
        this.otPositionForm.patchValue({ottid: this.view.data.otTypes.find(x => x.OTTID == this.view.data.otGroup.OTTID).OTTID});
      }
    });*/
  }

  closeForm() {
    this.view = {
      setting: {
        formViewMode: null,
        selectedOtpid: null
      },
      data: {
        otPosition: null
      }
    }
    this.otService.loadAllOt.next(OtTreeViewMode.ALL_VIEW);
    this.otPositionForm.reset();
  }

  insertOtPosition() {

  }

  updateOtPosition() {

  }

  deleteOtPosition() {

  }
}
