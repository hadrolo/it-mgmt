import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TagComponent} from './tag.component';
import {FormsModule} from '@angular/forms';
import {TagViewerComponent} from './tag-viewer/tag-viewer.component';

@NgModule({
    declarations: [
        TagComponent,
        TagViewerComponent
    ],
    exports: [
        TagComponent,
        TagViewerComponent
    ],
    imports: [
        CommonModule,
        FormsModule
    ]
})
export class TagModule {
}
