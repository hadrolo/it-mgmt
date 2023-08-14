import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {Router} from '@angular/router';
import {FavoriteService} from '../favorite.service';

@Component({
    selector: 'app-favorite-widget',
    templateUrl: './favorite-widget.component.html',
    styleUrls: ['./favorite-widget.component.scss']
})
export class FavoriteWidgetComponent implements OnInit, OnDestroy {

    favorites: any[];
    private refreshWidget$;

    constructor(
        private dataService: DataService,
        private router: Router,
        private favoriteService: FavoriteService
    ) {
    }

    ngOnInit(): void {
        this.refreshWidget$ = this.favoriteService.refreshWidget.subscribe(() => this.listAll());
        this.listAll();
    }

    ngOnDestroy(): void {
        this.refreshWidget$.unsubscribe();
    }

    listAll(): void {
        this.dataService.request('framework.Favorite/listAll').subscribe(response => {
            this.favorites = response.favorites.data;
        });
    }

    go(event, url): void {
        event.preventDefault();
        this.router.navigate([url]);
    }

}
