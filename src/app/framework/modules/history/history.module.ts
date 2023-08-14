import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {HistoryComponent} from './history.component';

@NgModule({
    declarations: [HistoryComponent],
    exports: [HistoryComponent],
    imports: [TranslateModule, CommonModule],
    providers: []
})
export class HistoryModule {
}
