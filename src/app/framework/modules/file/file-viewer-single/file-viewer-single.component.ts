import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {FileService} from '../file.service';

@Component({
    selector: 'app-file-viewer-single',
    templateUrl: './file-viewer-single.component.html',
    styleUrls: ['./file-viewer-single.component.scss']
})
export class FileViewerSingleComponent implements OnInit {

    @Input() selFid: any; // Index of files table
    @Input() viewThumbnail = false; // Fullscreen or thumbnail
    @Input() imageWidth: string = null;
    @Input() imageHeight: string = null;
    @Input() maxWidth: string = null;
    @Input() maxHeight: string = null;
    @Output() fileStatus = new EventEmitter();

    imageData: any;

    constructor(
        private dataService: DataService,
        private fileService: FileService,
    ) {
    }

    ngOnInit(): void {
        this.dataService.request('framework.File/getFile', {
            FID: this.selFid,
            thumbnail: this.viewThumbnail
        }).subscribe(response => {
            this.imageData = response.imageData;
            this.fileStatus.emit({loaded: true, FID: this.selFid});
        });
    }

    openModal(): void {
        this.fileService.openModal.next(this.selFid);
    }
}
