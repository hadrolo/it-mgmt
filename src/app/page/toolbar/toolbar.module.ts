import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ToolbarComponent} from './toolbar.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LanguageSwitchModule} from '../../framework/modules/language-switch/language-switch.module';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
    declarations: [
        ToolbarComponent,
    ],
    imports: [
        CommonModule,
        MatToolbarModule,
        MatIconModule,
        MatTooltipModule,
        LanguageSwitchModule,
        MatButtonModule
    ],
    exports: [
        ToolbarComponent,
    ]
})
export class ToolbarModule {
}
