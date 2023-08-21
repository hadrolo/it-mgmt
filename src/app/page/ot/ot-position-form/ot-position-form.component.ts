import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UntypedFormBuilder, Validators} from '@angular/forms';
import {DataService} from '../../../framework/services/data.service';
import {OtService} from '../ot.service';
import {MatDialog} from '@angular/material/dialog';
import {OtTreeViewMode} from '../ot-tree/ot-tree.component';
import {UserService} from '../../../framework/modules/auth/user.service';

interface OtPositionSettings {
  formViewMode: OtTreeViewMode,
  selectedOtpid: string,
  insertOtPositionGroup: boolean,
}

interface OtPositionData {
  otPosition: any;
  otPositionGroups: any;
  otPositionGroupExist: any;
  otPositionGroupLike: any;
  otPositionNameExist: any;
  otPositionNameLike: any;
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

  @Input() treeViewMode: OtTreeViewMode = null;
  @ViewChild('modalOtPositionForm') modalOtPositionForm: TemplateRef<any>;

  protected readonly OtViewMode = OtTreeViewMode;
  protected readonly OtTreeViewMode = OtTreeViewMode;
  openPositionForm$;

  view: OtPositionView = {
    setting: {
      formViewMode: null,
      selectedOtpid: null,
      insertOtPositionGroup: false,
    },
    data: {
      otPosition: null,
      otPositionGroups: null,
      otPositionGroupExist: null,
      otPositionGroupLike: null,
      otPositionNameExist: null,
      otPositionNameLike: null,
    }
  }

  otPositionForm = this.formBuilder.group({
    otpgid: [null, Validators.required],
    id: [null, Validators.required],
    name: [{value: null, disabled: true}, [Validators.required, Validators.minLength(3)]],
    description: [null],
    CID: [null],
    CLID: [null],
    positionGroupName: [{value: null, disabled: true}, [Validators.required, Validators.minLength(3)]],
  });

  constructor(
      private dataService: DataService,
      public formBuilder: UntypedFormBuilder,
      public otService: OtService,
      public dialog: MatDialog,
      public userService: UserService,
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
    this.dataService.request('Ot/loadPositionFormData', {
      otgid: this.view.setting.selectedOtpid,
      LANG: this.userService.currentUser.language
    }).subscribe(response => {
      console.log(viewMode, this.view.setting.selectedOtpid);
      console.log(response);
      this.view.data = {
        otPosition: response.otPosition?.data[0] ? response.otPosition.data[0] : null,
        otPositionNameExist: null,
        otPositionNameLike: null,
        otPositionGroupExist: null,
        otPositionGroupLike: null,
        otPositionGroups: response.otPositionGroups?.data ? response.otPositionGroups.data : null
      };

      this.view.setting.formViewMode = viewMode;
      this.prepareForm();

      if (viewMode == OtTreeViewMode.GROUP_EDIT) {
/*        this.otPositionForm.controls.level.setValue(this.view.data.otGroup.level);
        this.otPositionForm.controls.groupname.setValue(this.view.data.otGroup.groupname);
        this.otPositionForm.controls.grouplevel.setValue(this.view.data.otGroup.grouplevel);
        this.otPositionForm.controls.description.setValue(this.view.data.otGroup.description)
        this.otPositionForm.patchValue({ottid: this.view.data.otTypes.find(x => x.OTTID == this.view.data.otGroup.OTTID).OTTID});*/
      }
    });
  }

  closeForm() {
    this.view = {
      setting: {
        formViewMode: null,
        selectedOtpid: null,
        insertOtPositionGroup: false,
      },
      data: {
        otPosition: null,
        otPositionGroups: null,
        otPositionGroupExist: null,
        otPositionGroupLike: null,
        otPositionNameExist: null,
        otPositionNameLike: null,
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

  checkPositionGroupExist() {

  }

  usePositionGroupFound(OTTID: any) {
    
  }

  enableInsertModePositionGroup() {
    this.view.setting.insertOtPositionGroup = true;
    this.prepareForm();
  }

  disableInsertModePostionGroup() {
    this.view.setting.insertOtPositionGroup = false;
    this.prepareForm();
  }

  insertOtPositionGroup() {

  }

  checkPositionNameExist() {

  }

  private prepareForm() {
    console.log('prepareForm');
    let fields = ['otpgid', 'id', 'name', 'description', 'CID', 'CLID'];

    if (this.treeViewMode === OtTreeViewMode.POSITION_INSERT || OtTreeViewMode.POSITION_EDIT) {
      fields.forEach(element => {
        this.otPositionForm.controls[element].enable();
      });
    } else {
      fields.forEach(element => {
        this.otPositionForm.controls[element].disable();
      });
    }

    if (this.view.setting.insertOtPositionGroup) {
      this.otPositionForm.controls['positionGroupName'].enable();
      fields.forEach(element => {
        this.otPositionForm.controls[element].disable();
      });
    } else {
      this.otPositionForm.controls['positionGroupName'].disable();
    }
  }
}
/*
    otpgid: [null, Validators.required],
    id: [null, Validators.required],
    name: [{value: null, disabled: true}, [Validators.required, Validators.minLength(3)]],
    description: [null],
    CID: [null],
    CLID: [null],
    positionGroupName: [{value: null, disabled: true}, [Validators.required, Validators.minLength(3)]],
 */
