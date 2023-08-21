import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtService {

  constructor() { }

  setOtViewMode: Subject<any> = new Subject();
  loadAllOt: Subject<any> = new Subject();
  openGroupForm: Subject<any> = new Subject();
  openPositionGroupForm: Subject<any> = new Subject();
  openPositionForm: Subject<any> = new Subject();
}
