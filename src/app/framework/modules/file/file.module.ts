import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FileUploadComponent} from './file-upload/file-upload.component';
import {FormsModule} from '@angular/forms';
import {FileViewerComponent} from './file-viewer/file-viewer.component';
import {FileComponent} from './file.component';
import {TranslateModule} from '@ngx-translate/core';
import {FileViewerSingleComponent} from './file-viewer-single/file-viewer-single.component';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';
import {FileSizePipe} from './pipes/file-size.pipe';
import {FileModalComponent} from './file-modal/file-modal.component';
import {DndDirective} from './directives/dnd.directive';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
    declarations: [
        SafeHtmlPipe,
        FileUploadComponent,
        FileViewerComponent,
        FileComponent,
        FileViewerSingleComponent,
        FileSizePipe,
        FileModalComponent,
        DndDirective
    ],
    exports: [
        FileUploadComponent,
        FileViewerComponent,
        FileComponent,
        FileViewerSingleComponent,
        FileModalComponent
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        MatDialogModule
    ],
    providers: []
})
export class FileModule {
}
