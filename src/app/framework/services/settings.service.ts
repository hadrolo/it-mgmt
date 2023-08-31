import {Injectable} from '@angular/core';
import {FwApiUrl, FwUserType} from '../settings';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from 'rxjs';

export enum FwUserDisplayStyle {
  NONE = 'none',
  USERNAME = 'username',
  FULLNAME = 'fullname',
  FIRSTNAME = 'firstname'
}

export enum FwMode {
  STANDALONE = 'standalone',
  SSO = 'sso'
}

export enum FwLoginType {
  VIEW = 'VIEW',
  MODAL = 'MODAL'
}

interface FwAuthReset {
  modalTitle: string;
  modalText: string;
  modalPlaceholder: string;
  modalConfirmation: string;
  buttonConfirm: string;
  buttonCancel: string;
  errorMessage: string;
}

export interface FwAuthJwtStorageCookie {
  domain: string;
  expiresDays: number;
  path?: string;
  secure?: boolean;
}

interface FwRegisterConfig {
  tableName: string;
  tableIndexName: string;
  cancelRouterLink: string;
  saveRouterLink: string;
  saveLabel: string;
  saveLabelFields: string[];
}

interface FwRegisterButton {
  valueTrans: string;
  buttonClass: string;
  iconClass: string;
  type: string;
  captcha?: boolean;
}

interface FwRegisterValue {
  key: string;
  value: string;
}

interface FwRegisterLookup {
  table: string;
  value_de: string;
  value_en: string;
}

interface FwRegisterRow {
  valueTrans: string;
  field: string;
  type: string;
  minLength?: number;
  required?: boolean;
  checkExists?: boolean;
  checkExistsLabel?: string;
  values?: FwRegisterValue[];
  lookup?: FwRegisterLookup;
  defaultValue?: any;
}

export interface FwRegister {
  rows: FwRegisterRow[];
  buttons: FwRegisterButton[];
  config: FwRegisterConfig;
}

export enum FwSettingAuthType{
  STANDALONE = 'STANDALONE',
  SSO = 'SSO'
}

interface FwSettingsAuth {
  type: FwSettingAuthType,
  loginType: FwLoginType;
  // Placeholder for the login input
  loginField: string;
  // Route to the login view
  loginDestination: string;
  logoutAutomatic: FwLogoutAutomatic;
  // Route to redirect after login
  afterLoginDestination: string;
  // Route to redirect after logout
  afterLogoutDestination: string;
  googleRecaptcha: boolean;
  googleRecaptchaSiteKey: string;
  jwtStorageCookie?: FwAuthJwtStorageCookie;
  jwtKeyName: string;
  translateUsertype: boolean;
  // URLs that should not be handled by the TokenInterceptor (eg. external links)
  interceptorWhitelist: string[];
  // If set enables passwort reset, defines the labels to be used
  passwordReset?: FwAuthReset;
  register?: FwRegister;
}

interface FwLogoutAutomatic {
  enabled: boolean;
  inactivityTime: number;
  logoutCountDown: number;
}

interface FwFileViewerFileInfoRow {
  valueTrans: string;
  field: string;
  suffix?: string;
  editable?: boolean;
}

interface FwFileViewerFileInfo {
  classModule: string;
  rows: FwFileViewerFileInfoRow[];
}

interface FwSettingsFile {
  fileViewerFileInfo: FwFileViewerFileInfo;
}

interface FwSettingsLog {
  logTableName: string;
  logTableIndexName: string;
  userTableName: string;
  // TODO: unused, always UID, remove?
  userTableIndexName: string;
  // TODO. unused, what is this used for, remove?
  userTableUserName: string;
  appID?: string;
}

interface FwSettingsRight {
  dashboardLink: string;
  // The view to redirect to when access rights are not met
  exitLink: string;
}

interface FwSettingsTable {
  // Path where table field images are located
  imagePath: string;
}

interface FwSettingsUserAssignment {
  usertypePrefix: string;
  // Defines for each usertype the available usertypes to set
  usertypeList: any;
  // Defines the fields to be shown in the assign modal
  assignFormFields: any;
  // Defines the fields to be shown in the unassign modal
  unassignFormFields: any;
  // TODO: unused, what is this used for?
  useClientlistRole: FwUserType[];
}

interface FwSettingsUser {
  displayStyle: FwUserDisplayStyle;
}

export interface FwSettings {
  production: boolean;
  apiUrl: FwApiUrl;
  frameworkMode: FwMode;
  appID: string;
  appName: string;
  // Route to navigate to when urlData decryption fails
  urlDataFallbackLink: string;
  cryptoKey: string;
  auth?: FwSettingsAuth;
  user: FwSettingsUser;
  log: FwSettingsLog;
  file?: FwSettingsFile;
  right?: FwSettingsRight;
  table?: FwSettingsTable;
  userAssignment?: FwSettingsUserAssignment;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settingsLoaded: Subject<any> = new Subject<string>();

  frameworkSettings: FwSettings;
  jsonSettings: any;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.router.events.subscribe(res => {
      if (res instanceof NavigationEnd) {
        this.getDynamicSettings();
      }
    });
  }

  set(settings: FwSettings): void {
    this.frameworkSettings = settings;
  }

  setUserAssignmentUsertypeList(usertypeList: any): void {
    this.frameworkSettings.userAssignment.usertypeList = usertypeList;
  }

  getDynamicSettings(): void {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      Pragma: 'no-cache',
      Expires: '0'
    });
    this.http.get('./assets/settings.conf', {headers}).subscribe(response => {
      this.jsonSettings = response;
      this.settingsLoaded.next(null);
    });
  }

}
