import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

export interface Layout {
  isScreenSmall: boolean | null;
  isFullscreen: boolean | null;
  sidebarAutoHide: boolean;
}

export enum SidbarAction {
  openSidebar = 'open',
  closeSidbar = 'close'
}

@Injectable({
  providedIn: 'root'
})
export class PageService {

  layout: Layout = {
    isScreenSmall: null,
    isFullscreen: false,
    sidebarAutoHide: false,
  };
  sidenavOpen = true;

  constructor() {
  }

  openSidebar: Subject<any> = new BehaviorSubject<any>(true);
  closeSidebar: Subject<any> = new BehaviorSubject<any>(true);

  enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      this.layout.isFullscreen = true;
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      this.layout.isFullscreen = false;
    }
  }
}
