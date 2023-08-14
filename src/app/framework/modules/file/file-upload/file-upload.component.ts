import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FileService} from '../file.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DataService} from '../../../services/data.service';
import {UserService} from '../../auth/user.service';
import {SettingsService} from '../../../services/settings.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
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
export class FileUploadComponent implements OnInit, OnDestroy {

    @Input() doctype: any; // table field: doctype
    @Input() fkId: any; // table field: fk_id
    @Input() fkName: any; // table field: fk_name
    @Input() fkTable: any; // table field: fk_table
    @Input() uploadAccept: any[] = []; // Allowed mimetypes zu upload
    @Input() uploadSelectMultiple = false; // Multible selection enabled
    @Input() uploadMaxFileCount = null; // Maximum allowed files
    @Input() uploadMaxFilesize = 0; // Maximum allowed upload size ( always overwritten by php.ini upload_max_filesize)
    @Input() uploadDisabled = false; // Disable Upload
    @Input() uploadedCount: string;
    @Input() showDragAndDrop = false;

    // max upload size in byte
    @Input() uploadMaxSingleFilesize = 0;
    @Output() uploaded = new EventEmitter();

    selectedFiles: File[] = null;
    upload: any = {};
    errors: any[] = [];
    uploading = false;
    acceptString = '';
    showError = false;
    showSuccess = false;
    countAlreadyUploaded = null;
    fileSize;
    activeFiles: number;

    private deselectFiles$: Subscription;
    private countUploadedFiles$: Subscription;

    constructor(
        public router: Router,
        private http: HttpClient,
        private translateService: TranslateService,
        private userService: UserService,
        private fileService: FileService,
        private dataService: DataService,
        private settingsService: SettingsService
    ) {
    }

    ngOnInit(): void {
        // this.acceptString = this.uploadAccept.map((element) => element.split('/')[1].toUpperCase()).join(', ');
        /*this.uploadAccept.forEach(element => {
            if (element.includes('/')) {
                this.acceptString = this.acceptString + element.split('/')[1].toUpperCase() + ', ';
            } else {
                this.acceptString = this.acceptString + element.replace('.', '').toUpperCase() + ', ';
            }
        });
        this.acceptString = this.acceptString.slice(0, -2);*/

        this.deselectFiles$ = this.fileService.deselectFiles.subscribe(() => this.deselectFiles());
        this.countUploadedFiles$ = this.fileService.countUploadedFiles.subscribe(() => this.countUploadedFiles());
        if (this.uploadMaxFileCount !== null) {
            this.countUploadedFiles();
        }
        this.getServerMaxFileSize();
    }

    ngOnDestroy(): void {
        this.deselectFiles$.unsubscribe();
        this.countUploadedFiles$.unsubscribe();
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

            if (this.uploadMaxFilesize > maxSize || this.uploadMaxFilesize > maxPostSize) {
                this.uploadMaxFilesize = maxSize;
            }
            if (this.uploadMaxSingleFilesize > maxSize || this.uploadMaxFilesize > maxPostSize) {
                this.uploadMaxSingleFilesize = maxSize;
            }
        });
    }

    selectFiles(event): void {
        this.fileSize = 0;
        this.showError = false;
        this.showSuccess = false;
        this.selectedFiles = event.target.files;
        this.upload.status = 'pending';
        this.upload.progress = 0;

        this.activeFiles = this.selectedFiles.length;

        Array.from(this.selectedFiles).forEach(file => {

            // only process image files
            if (file.type.match('image.*')) {
                const reader = new FileReader();

                reader.onload = (theFile => {
                    return e => {
                        // @ts-ignore
                        file.src = e.target.result;
                    };
                })(file);

                reader.readAsDataURL(file);
            }

            this.fileSize = this.fileSize + file.size;
            // @ts-ignore
            file.display_name = file.name;

            if (this.uploadAccept.length > 0) {
                const found = this.uploadAccept.some(fileMimeTypeArray => {
                    return fileMimeTypeArray.indexOf(file.type) > -1;
                });

                if (!found) {
                    this.errors.push({
                        filename: file.name,
                        errorType: 'INVALID_TYPE',
                        type: file.type
                    });
                }
            }

            if (this.uploadMaxSingleFilesize > 0 && file.size / (1024 * 1024) > this.uploadMaxSingleFilesize) {
                this.errors.push({
                    filename: file.name,
                    errorType: 'INVALID_SIZE',
                    size: file.size
                });
            }
        });
        if (this.uploadMaxFilesize !== 0 && this.fileSize / (1024 * 1024) > this.uploadMaxFilesize) {
            this.errors.push({
                errorType: 'INVALID_MAX_FILESIZE',
                maxFilesizeAllowed: this.uploadMaxFilesize,
                maxFilesizeUpload: this.fileSize
            });
        }
    }

    deselectFiles(): void {
        this.showError = false;
        this.showSuccess = false;
        this.errors = [];
        this.upload = [];
        this.selectedFiles = null;
    }

    countUploadedFiles(): void {
        this.dataService.request('framework.File/countAlreadyUploaded', {
            fk_name: this.fkName,
            fk_id: this.fkId,
            fk_table: this.fkTable,
            doctype: this.doctype
        }).subscribe(response => {
            this.countAlreadyUploaded = response.uploaded;
        });
    }

    onUpload(): void {
        const formData = new FormData();
        Array.from(this.selectedFiles).filter(file => {
            // @ts-ignore
            return !file.deleted;
        }).forEach(file => {
            formData.append('files[]', file, file.name);
            // @ts-ignore
            formData.append('display_names[]', file.display_name);
        });

        formData.append('doctype', this.doctype);
        formData.append('fk_id', this.fkId);
        formData.append('fk_name', this.fkName);
        formData.append('fk_table', this.fkTable);
        formData.append('uid', this.userService.currentUser.UID);
        formData.append('environment', this.settingsService.frameworkSettings.production ? 'production' : 'local');

        this.http.post(this.settingsService.frameworkSettings.apiUrl, formData, {
            reportProgress: true,
            observe: 'events'
        }).subscribe((event: any) => {
            if (event.status === 500) {
                this.deselectFiles();
            }
            if (event.type === HttpEventType.UploadProgress) {
                // 1
                this.uploading = true;
                this.upload.status = 'progress';
                this.upload.progress = Math.round((event.loaded / event.total) * 100);
            } else if (event.type === HttpEventType.Response) {
                // 4
                if (!event.body.error) {
                    this.uploaded.emit(event.body);
                    this.upload.status = 'finished';
                } else {
                    this.showError = true;
                }
                this.uploading = false;
                this.showSuccess = true;
                if (this.uploadMaxFileCount !== null) {
                    this.countUploadedFiles();
                }
                setTimeout(() => {
                    this.showSuccess = false;
                }, 5000);
                // this.deselectFiles();

                this.fileService.uploadCompleted.next(null);
            }
        });
    }

    removeSelectedFile(file: File): void {
        this.activeFiles--;
        // @ts-ignore
        file.deleted = 1;
    }

    onFileDropped($event: any): void {
        if (this.uploadDisabled) { return; }

        // ugly workaround but allows to reuse the existing 'selectFiles' method
        const event = {
            target: {
                files: $event
            }
        };
        this.selectFiles(event);
    }
}
