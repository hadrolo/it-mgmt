import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LanguageSwitchComponent} from './language-switch.component';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
    imports: [CommonModule, RouterModule, MatInputModule, MatSelectModule, NgOptimizedImage],
    declarations: [LanguageSwitchComponent],
    exports: [LanguageSwitchComponent]
})
export class LanguageSwitchModule {
}
