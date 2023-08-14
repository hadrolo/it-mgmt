import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {DataService} from '../../services/data.service';
import {UserService} from '../auth/user.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SettingsService} from '../../services/settings.service';

export interface FwUploadConfig {
    api: FwUploadConfigApi;
    uploadAccept: string[];
    uploadMaxFilesize: number;
    uploadMaxSingleFilesize: number;
    allowMultipleUpload: boolean;
    layout: FwUploadLayoutConfig;
}

interface FwUploadConfigApi {
    controller: string;
    infoComponent: string;
    infoMethod: string;
    infoController: string;
    infoAction: string;
}

interface FwUploadLayoutConfig {
    form: {
        title: string;
        selectedFiles: string;
        buttons: {
            selectFiles: string;
            upload: string;
            cancel: string;
            new: string;
        };
    };
    msg: {
        success: string;
        error: string;
        invalid_type: string;
        invalid_size: string;
        invalid_max_filesize: string;
    };
}

interface FwUploadVarables {
    selectedFiles: any;
    fileSize: number;
    status: string;
    progress: number;
    errors: any;
    uploading: boolean;
    uploadedCount: string; /// ??? verbessern
    uploadMaxFilecount: number; /// ??? verbessern
    countAlreadyUploaded: number; /// ??? verbessern
    uploadDisabled: boolean;
    showError: boolean;
    showSuccess: boolean;
    acceptString?: string;
}

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss'],
    animations: [
        // the fade-in/fade-out animation.
        trigger('simpleFadeAnimation', [
            // the "in" style determines the "resting" state of the element when it is visible.
            state('in', style({opacity: 1})),

            // fade in when created. this could also be written as transition('void => *')
            transition(':enter', [style({opacity: 0}), animate(300)]),

            // fade out when destroyed. this could also be written as transition('void => *')
            transition(':leave', animate(600, style({opacity: 0})))
        ])
    ]
})
export class UploadComponent implements OnInit {

    @Input() config: FwUploadConfig;
    @Input() customData: any;
    @Output() uploaded = new EventEmitter();

    fileInputModel;

    upload: FwUploadVarables = {
        selectedFiles: null,
        fileSize: 0,
        status: '',
        progress: 0,
        uploading: false,
        errors: [],
        uploadedCount: '',
        uploadMaxFilecount: null,
        countAlreadyUploaded: null,
        uploadDisabled: false,
        showError: false,
        showSuccess: false
    };

    constructor(
        private dataService: DataService,
        private userService: UserService,
        private http: HttpClient,
        private settingsService: SettingsService
    ) {
    }

    ngOnInit(): void {
        this.config.uploadAccept.forEach(element => {
            if (element.includes('/')) {
                this.upload.acceptString = this.upload.acceptString + element.split('/')[1].toUpperCase() + ', ';
            } else {
                this.upload.acceptString = this.upload.acceptString + element.replace('.', '').toUpperCase() + ', ';
            }
        });
        this.upload.acceptString = this.upload.acceptString.slice(0, -2);

        /*        this.msgSrvdDeselectFiles = this.fileService.deselectFiles.subscribe(() => this.deselectFiles());
                this.msgSrvdCountUploadedFiles = this.fileService.countUploadedFiles.subscribe(() => this.countUploadedFiles());
                if (this.uploadMaxFilecount !== null) {
                    this.countUploadedFiles();
                }*/
        this.getServerMaxFileSize();
    }

    selectFiles(event): void {
        this.upload.fileSize = 0;
        this.upload.showError = false;
        this.upload.showSuccess = false;
        this.upload.selectedFiles = event.target.files;
        this.upload.status = 'pending';
        this.upload.progress = 0;

        Array.from(this.upload.selectedFiles).forEach((file: any) => {
            this.upload.fileSize = this.upload.fileSize + file.size;
            if (this.config.uploadAccept.length > 0 && this.config.uploadAccept.indexOf(file.type) === -1) {
                this.upload.errors.push({
                    filename: file.name,
                    errorType: 'INVALID_TYPE',
                    type: file.type
                });
            }
            if (this.config.uploadMaxSingleFilesize > 0 && file.size / (1024 * 1024) > this.config.uploadMaxSingleFilesize) {
                this.upload.errors.push({
                    filename: file.name,
                    errorType: 'INVALID_SIZE',
                    size: file.size
                });
            }
        });
        if (this.config.uploadMaxFilesize !== 0 && this.upload.fileSize / (1024 * 1024) > this.config.uploadMaxFilesize) {
            this.upload.errors.push({
                errorType: 'INVALID_MAX_FILESIZE',
                maxFilesizeAllowed: this.config.uploadMaxFilesize,
                maxFilesizeUpload: this.upload.fileSize
            });
        }
    }

    onUpload(): void {
        const formData = new FormData();
        Array.from(this.upload.selectedFiles).forEach((file: any) => {
            formData.append('files[]', file, file.name);
        });
        formData.append('apiController', this.config.api.controller);
        formData.append('infoComponent', this.config.api.infoComponent);
        formData.append('infoMethod', this.config.api.infoMethod);
        if (this.customData) {
            Object.entries(this.customData).forEach(([key, value]: any) => {
                formData.append(key, value);
            });
        }
        this.http.post(this.settingsService.frameworkSettings.apiUrl, formData, {
            reportProgress: true,
            observe: 'events'
        }).subscribe((event: any) => {
            if (event.status === 500) {
                this.deselectFiles();
            }
            if (event.type === HttpEventType.UploadProgress) {
                // 1
                this.upload.uploading = true;
                this.upload.status = 'progress';
                this.upload.progress = Math.round((event.loaded / event.total) * 100);
            } else if (event.type === HttpEventType.Response) {
                // 4
                if (!event.body.error) {
                    this.uploaded.emit(event.body);
                    this.upload.status = 'finished';
                } else {
                    this.upload.showError = true;
                }
                this.upload.uploading = false;
                this.upload.showSuccess = true;
                /*                if (this.upload.uploadMaxFilecount !== null) {
                                this.countUploadedFiles();
                            }*/
                setTimeout(() => {
                    this.upload.showSuccess = false;
                }, 5000);
                // this.deselectFiles();
            }
        });
    }

    deselectFiles(): void {
        this.upload.showError = false;
        this.upload.showSuccess = false;
        this.upload.errors = [];
        this.upload.selectedFiles = null;
        this.fileInputModel = '';
    }

    getServerMaxFileSize(): void {
        this.dataService.request('framework.File/getUploadMaxFilesize').subscribe(response => {
            let maxSize = response.upload_max_filesize;
            let maxPostSize = response.post_max_size;

            if (maxSize.search(/M/gi)) {
                maxSize = maxSize.replace(/M/gi, '');
            }
            if (maxPostSize.search(/M/gi)) {
                maxPostSize = maxPostSize.replace(/M/gi, '');
            }

            if (this.config.uploadMaxFilesize > maxSize || this.config.uploadMaxFilesize > maxPostSize) {
                this.config.uploadMaxFilesize = maxSize;
            }
            if (this.config.uploadMaxSingleFilesize > maxSize || this.config.uploadMaxFilesize > maxPostSize) {
                this.config.uploadMaxSingleFilesize = maxSize;
            }
        });
    }
}
