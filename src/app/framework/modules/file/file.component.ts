import {Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges, ViewEncapsulation, Output, EventEmitter} from '@angular/core';
import {FileService} from './file.service';
import {DataService} from '../../services/data.service';
import {Subscription} from 'rxjs';

export interface FwFileUpload {
    doctype: string;
    fkId: string;
    fkName: string;
    fkTable: string;
    uploadAccept: any[];
    uploadSelectMultiple: boolean;
    uploadMaxFilesize: number;
    uploadMaxFilecount: number;
    viewThumbnails: boolean;
    viewThumbnailsSize: string;
    viewEditmodeFlipImage: boolean;
    viewThumbnailsTitle: boolean;
    viewReadonly: boolean;
    viewNofilesText: string;
    viewLayout?: FwFileViewLayout;
}

export enum FwFileViewLayout {
    TILES = 'tiles',
    TABLE = 'table'
}

export enum FwFileMimeType {
    IMAGE_BMP = 'image/bmp',
    IMAGE_BMP_X = 'image/x-bmp',
    IMAGE_BMP_MS_X = 'image/x-ms-bmp',
    IMAGE_GIF = 'image/gif',
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_PNG = 'image/png',
    IMAGE_SVG_XML = 'image/svg+xml',
    IMAGE_TIFF = 'image/tiff',
    IMAGE_XICON = 'image/x-icon',

    DOCUMENT_DOC = 'application/msword',
    DOCUMENT_DOT = 'application/msword',
    DOCUMENT_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOCUMENT_DOTX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    DOCUMENT_DOCM = 'application/vnd.ms-word.document.macroEnabled.12',
    DOCUMENT_DOTM = 'application/vnd.ms-word.template.macroEnabled.12',
    DOCUMENT_XLS = 'application/vnd.ms-excel',
    DOCUMENT_XLT = 'application/vnd.ms-excel',
    DOCUMENT_XLA = 'application/vnd.ms-excel',
    DOCUMENT_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    DOCUMENT_XLTX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    DOCUMENT_XLSM = 'application/vnd.ms-excel.sheet.macroEnabled.12',
    DOCUMENT_XLTM = 'application/vnd.ms-excel.template.macroEnabled.12',
    DOCUMENT_XLAM = 'application/vnd.ms-excel.addin.macroEnabled.12',
    DOCUMENT_XLSB = 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    DOCUMENT_PPT = 'application/vnd.ms-powerpoint',
    DOCUMENT_POT = 'application/vnd.ms-powerpoint',
    DOCUMENT_PPS = 'application/vnd.ms-powerpoint',
    DOCUMENT_PPA = 'application/vnd.ms-powerpoint',
    DOCUMENT_PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    DOCUMENT_POTX = 'application/vnd.openxmlformats-officedocument.presentationml.template',
    DOCUMENT_PPSX = 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    DOCUMENT_PPAM = 'application/vnd.ms-powerpoint.addin.macroEnabled.12',
    DOCUMENT_PPTM = 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
    DOCUMENT_POTM = 'application/vnd.ms-powerpoint.template.macroEnabled.12',
    DOCUMENT_PPSM = 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
    DOCUMENT_MDB = 'application/vnd.ms-access',
    DOCUMENT_PDF = 'application/pdf',

    VIDEO_MPEG = 'video/mpeg',
    VIDEO_MP4 = 'video/mp4',
    VIDEO_OGG = 'video/ogg',
    VIDEO_QUICKTIME = 'video/quicktime',
    VIDEO_VIV = 'video/vnd.vivo',
    VIDEO_WEBM = 'video/webm',
    VIDEO_AVI = 'video/x-msvideo',

    AUDIO_MPEG = 'audio/mpeg',
    AUDIO_MP4 = 'audio/mp4',
    AUDIO_OGG = 'audio/ogg',
    AUDIO_WAV = 'audio/wav',
    AUDIO_MIDI = 'audio/x-midi',
}

export interface FwFileMimeTypeGroup {
    'IMAGES': FwFileMimeType[];
    'DOCUMENTS': FwFileMimeType[];
    'VIDEOS': FwFileMimeType[];
    'AUDIO': FwFileMimeType[];
}

export const fileMimeTypeGroup: FwFileMimeTypeGroup = {
    IMAGES: [
        FwFileMimeType.IMAGE_BMP,
        FwFileMimeType.IMAGE_BMP_X,
        FwFileMimeType.IMAGE_BMP_MS_X,
        FwFileMimeType.IMAGE_GIF,
        FwFileMimeType.IMAGE_JPEG,
        FwFileMimeType.IMAGE_PNG,
        FwFileMimeType.IMAGE_SVG_XML,
        FwFileMimeType.IMAGE_TIFF,
        FwFileMimeType.IMAGE_XICON,
    ],
    DOCUMENTS: [
        FwFileMimeType.DOCUMENT_DOC,
        FwFileMimeType.DOCUMENT_DOT,
        FwFileMimeType.DOCUMENT_DOCX,
        FwFileMimeType.DOCUMENT_DOTX,
        FwFileMimeType.DOCUMENT_DOCM,
        FwFileMimeType.DOCUMENT_DOTM,
        FwFileMimeType.DOCUMENT_XLS,
        FwFileMimeType.DOCUMENT_XLT,
        FwFileMimeType.DOCUMENT_XLA,
        FwFileMimeType.DOCUMENT_XLSX,
        FwFileMimeType.DOCUMENT_XLTX,
        FwFileMimeType.DOCUMENT_XLSM,
        FwFileMimeType.DOCUMENT_XLTM,
        FwFileMimeType.DOCUMENT_XLAM,
        FwFileMimeType.DOCUMENT_XLSB,
        FwFileMimeType.DOCUMENT_PPT,
        FwFileMimeType.DOCUMENT_POT,
        FwFileMimeType.DOCUMENT_PPS,
        FwFileMimeType.DOCUMENT_PPA,
        FwFileMimeType.DOCUMENT_PPTX,
        FwFileMimeType.DOCUMENT_POTX,
        FwFileMimeType.DOCUMENT_PPSX,
        FwFileMimeType.DOCUMENT_PPAM,
        FwFileMimeType.DOCUMENT_PPTM,
        FwFileMimeType.DOCUMENT_POTM,
        FwFileMimeType.DOCUMENT_PPSM,
        FwFileMimeType.DOCUMENT_MDB,
    ],
    VIDEOS: [
        FwFileMimeType.VIDEO_MPEG,
        FwFileMimeType.VIDEO_MP4,
        FwFileMimeType.VIDEO_OGG,
        FwFileMimeType.VIDEO_QUICKTIME,
        FwFileMimeType.VIDEO_VIV,
        FwFileMimeType.VIDEO_WEBM,
        FwFileMimeType.VIDEO_AVI,
    ],
    AUDIO: [
        FwFileMimeType.AUDIO_MPEG,
        FwFileMimeType.AUDIO_MP4,
        FwFileMimeType.AUDIO_OGG,
        FwFileMimeType.AUDIO_WAV,
        FwFileMimeType.AUDIO_MIDI,
    ]
};

@Component({
    selector: 'app-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FileComponent implements OnInit, OnDestroy, OnChanges {

    @Input() doctype: any; // table field: doctype
    @Input() fkName: any; // table field: fk_name
    @Input() fkTable: any; // table field: fk_table
    @Input() uploadAccept: any[] = []; // Allowed mimetypes zu upload
    @Input() uploadSelectMultiple: boolean = false; // Multible selection enabled
    @Input() uploadMaxFileCount: number = null; // Maximum allowed files
    @Input() uploadMaxFilesize = 0; // Maximum allowed upload size ( always overwritten by php.ini upload_max_filesize)
    @Input() uploadDisabled: boolean = false; // Disable Upload
    @Input() uploadMaxSingleFilesize = 0; // Maximum allowed upload size single file ( always overwritten by php.ini upload_max_filesize)
    @Input() viewDisabled: boolean = false; // Viewer visible
    @Input() viewReadonly: boolean = false; // Viewer in read only mode
    @Input() viewFullscreen: boolean = false; // View images in fullscreen
    @Input() viewThumbnails: boolean = false; // View thumbnails
    @Input() viewThumbnailsSize = null; // View thumbnails pic size
    @Input() viewThumbnailsTilesSize = null; // View thumbnails tiles pic size
    @Input() viewThumbnailsTitle: boolean = true; // View show thumbnail filename
    @Input() viewExternalData: any = null; // View external data
    @Input() viewShowFileInfo = true; // Show Fileinfo in Image Viewer Fullscreen Mode
    @Input() viewZoomNavigator: boolean = false; // Show Zoom Navigation
    @Input() viewZoomNavigatorMinValue: number = 100; // Image size min Value in Percent
    @Input() viewZoomNavigatorMaxValue: number = 300; // Image size min Value in Percent
    @Input() viewEditModeFlipImage: boolean = false; // allow Flip Image
    @Input() viewNoFilesText: string = null;
    @Input() viewLayout = FwFileViewLayout.TILES;
    @Input() showViewLayoutSwitcher = false;
    @Input() showDragAndDrop: boolean = false;
    @Input() fkId: any; // table field: fk_id

    @Output() reloadEvent = new EventEmitter();

    files: any = [];
    filesCount: string;
    private loadFiles$: Subscription;

    constructor(
        private dataService: DataService,
        private fileService: FileService
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.loadFiles();
    }

    ngOnInit(): void {
        this.loadFiles$ = this.fileService.loadFiles.subscribe(() => this.loadFiles());
    }

    ngOnDestroy(): void {
        this.loadFiles$.unsubscribe();
    }

    loadFiles(): void {
        this.reloadEvent.emit();

        if (this.viewExternalData === null) {
            this.dataService.request('framework.File/listUploadedFiles', {
                fk_table: this.fkTable,
                fk_name: this.fkName,
                fk_id: this.fkId,
                doctype: this.doctype,
                thumbnails: this.viewThumbnails
            }).subscribe(response => {
                this.files = response.files.data;
                this.filesCount = response.files.count;
            });
        } else {
            this.files = this.viewExternalData.data;
            this.filesCount = this.viewExternalData.count;
        }
    }
}
