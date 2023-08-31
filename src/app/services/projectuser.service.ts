import {Injectable} from '@angular/core';
import {UserService} from '../framework/modules/auth/user.service';
import {DataService} from '../framework/services/data.service';

export enum IField {
  ROWS_CLAIMS = 'rows_claims',
  ROWS_TASKS = 'rows_tasks',
  ROWS_PRODUCTS = 'rows_products',
  ROWS_USER_MGMT = 'rows_user_mgmt'
}

@Injectable({
  providedIn: 'root'
})
/**
 * Provides user data
 */
export class ProjectUserService {

  constructor(
    private userService: UserService,
    private dataService: DataService
  ) {
  }


  setRows(field: IField, value) {
    this.dataService.request('framework.User/updateRows', {
      UID: this.userService.currentUser.UID,
      field: field,
      value: value
    }).subscribe();
  }

  checkGroup() {

  }

}
