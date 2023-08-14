import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FavoriteComponent} from './favorite.component';
import {FormsModule} from '@angular/forms';
import {FavoriteWidgetComponent} from './favorite-widget/favorite-widget.component';
import {TranslateModule} from '@ngx-translate/core';
import {PopoverModule} from 'ngx-bootstrap/popover';

@NgModule({
    declarations: [FavoriteComponent, FavoriteWidgetComponent],
    exports: [
        FavoriteComponent,
        FavoriteWidgetComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        PopoverModule
    ]
})
export class FavoriteModule {
}
