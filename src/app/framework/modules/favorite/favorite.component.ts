import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../services/data.service';
import {NavigationEnd, Router} from '@angular/router';
import {FavoriteService} from './favorite.service';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-favorite',
    templateUrl: './favorite.component.html',
    styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit, OnDestroy {

    @Input() activeColor = '#d50b23';

    favorite: any = {};
    active = false;

    private path: string;
    private routerEnd$;
    private activate$;

    @ViewChild('pop', {static: true}) popover;

    constructor(
        private dataService: DataService,
        private router: Router,
        private favoriteService: FavoriteService,
        private toastrService: ToastrService,
    ) {
    }

    ngOnInit(): void {
        this.activate$ = this.favoriteService.enabled.subscribe(() => {
            this.active = true;
        });

        this.favoriteService.componentLoaded.next(null);

        this.path = this.router.url;
        this.checkExisting();

        this.routerEnd$ = this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.active = false;
                this.path = this.router.url;
                this.checkExisting();
            }
        });
    }

    ngOnDestroy(): void {
        this.routerEnd$.unsubscribe();
        this.activate$.unsubscribe();
    }

    setDefault(): void {
        this.favorite = {
            name: '',
            path: this.path
        };
    }

    checkExisting(): void {
        this.dataService.request('framework.Favorite/get', {path: this.path}).subscribe(response => {
            if (response.favorite.count > 0) {
                this.favorite = response.favorite.data[0];
            } else {
                this.setDefault();
            }
        });
    }

    saveFavorite(): void {
        this.dataService.request('framework.Favorite/save', this.favorite).subscribe(response => {
            this.favorite.FAVID = response.insert.lastID;
            this.popover.hide();
            this.toastrService.success('Favorit gespeichert');
            this.favoriteService.refreshWidget.next(null);
        });
    }

    updateFavorite(): void {
        this.dataService.request('framework.Favorite/update', this.favorite).subscribe(() => {
            this.popover.hide();
            this.toastrService.success('Favorit aktualisiert');
            this.favoriteService.refreshWidget.next(null);
        });
    }

    deleteFavorite(): void {
        this.dataService.request('framework.Favorite/delete', this.favorite).subscribe(() => {
            this.popover.hide();
            this.setDefault();
            this.toastrService.success('Favorit gelöscht');
            this.favoriteService.refreshWidget.next(null);
        });
    }

}
