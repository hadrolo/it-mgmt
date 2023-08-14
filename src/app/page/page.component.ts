import {AfterContentInit, Component, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {PageService} from './page.service';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {environment} from '../../environments/environment';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../framework/modules/auth/user.service';
import {RightService} from '../framework/modules/right/right.service';
import {FwTableExternalFilter} from '../framework/modules/table/table.interfaces';
import {CryptoService} from '../framework/services/crypto.service';
import {NavigationEnd, Router} from '@angular/router';
import {UserProfileService} from '../framework/modules/user-profile/user-profile.service';
import {MatSidenav} from '@angular/material/sidenav';
import {UserProfileStandaloneService} from '../framework/modules/user-profile-standalone/user-profile-standalone.service';


@Component({
    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss'],
    encapsulation: ViewEncapsulation.None,  // current alternative to ::ng-deep
})
export class PageComponent implements OnInit, AfterContentInit, OnDestroy{

    private msgservSidebarOpen: any;
    public currentApplicationVersion = environment.appVersion;
    private routerEnd$;

    constructor(
        private breakpointObserver: BreakpointObserver,
        public pageService: PageService,
        public translateService: TranslateService,
        public userService: UserService,

        public rightService: RightService,
        private cryptoService: CryptoService,
        public router: Router,
        private userProfileStandaloneService: UserProfileStandaloneService,
    ) {
    }

    @ViewChild('sidenav') sidenav: MatSidenav;
    @HostListener('mousemove', ['$event'])
    handleMousemove(event: any) {
        if (this.pageService.layout.sidebarAutoHide && event.clientX < 8) {
            this.sidenav.open().then();
        }
    }

    ngOnInit() {
    }

    ngAfterContentInit(): void {
        this.msgservSidebarOpen= this.pageService.openSidebar.subscribe( () => this.openSidenav());
        this.breakpointObserver
            .observe([Breakpoints.Small, Breakpoints.HandsetPortrait])
            .subscribe((state: BreakpointState) => {
                this.pageService.layout.isScreenSmall = state.matches;
            });
    }

    ngOnDestroy(): void {
        this.msgservSidebarOpen.unsubscribe();
    }

    openSidenav(){
        this.sidenav?.open().then();
    }

    closeSidenav() {
        if (this.pageService.layout.sidebarAutoHide) {
            this.sidenav.close().then();
        }
    }

    toogleSidebarAutoHide() {
        this.pageService.layout.sidebarAutoHide = !this.pageService.layout.sidebarAutoHide;
    }

    openUserProfile() {
        this.userProfileStandaloneService.openUserProfileStandalone.next(true);
    }

    writeStatus() {
        this.pageService.sidenavOpen = this.sidenav.opened;
    }
}

