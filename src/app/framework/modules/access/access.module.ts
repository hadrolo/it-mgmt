import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AccessComponent} from './access.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [AccessComponent],
    exports: [AccessComponent],
    imports: [CommonModule, TranslateModule]
})
export class AccessModule {
}
