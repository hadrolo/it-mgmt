import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AutoRefreshComponent} from './auto-refresh.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [AutoRefreshComponent],
    exports: [
        AutoRefreshComponent
    ],
    imports: [
        CommonModule,
        TranslateModule
    ]
})
export class AutoRefreshModule {
}
