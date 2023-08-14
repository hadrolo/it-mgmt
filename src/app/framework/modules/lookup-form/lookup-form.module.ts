import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LookupFormComponent} from './lookup-form.component';
import {FormsModule} from '@angular/forms';

@NgModule({
    declarations: [LookupFormComponent],
    exports: [LookupFormComponent],
    imports: [CommonModule, FormsModule],
    providers: []
})
export class LookupFormModule {
}
