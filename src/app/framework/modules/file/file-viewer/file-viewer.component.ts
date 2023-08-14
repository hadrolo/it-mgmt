import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FileService} from '../file.service';
import {DomSanitizer} from '@angular/platform-browser';
import * as moment from 'moment';
import {UserService} from '../../auth/user.service';
import {DataService} from '../../../services/data.service';
import {SettingsService, FwUserDisplayStyle} from '../../../services/settings.service';
import {FwFileViewLayout} from '../file.component';
import {FileModalComponent} from '../file-modal/file-modal.component';

/*declare var $: any; // JQuery*/

@Component({
    selector: 'app-file-viewer',
    templateUrl: './file-viewer.component.html',
    styleUrls: ['./file-viewer.component.scss'],
})
export class FileViewerComponent implements OnInit {

    @Input() files: any;
    @Input() document = false;
    @Input() fileTypes = 'pics';
    @Input() viewReadonly = false;
    @Input() viewThumbnails = false;
    @Input() viewThumbnailsSize = null;
    @Input() viewThumbnailsTilesSize = null;
    @Input() viewThumbnailsTitle = true;
    @Input() viewFullscreen = false;
    @Input() viewExternalData = null; // View external data
    @Input() viewShowFileInfo = true; // Show Fileinfo in Image Viewer Fullscreen Mode
    @Input() viewEditModeFlipImage = false; // allow Flip Image
    @Input() viewNoFilesText: string = null;
    @Input() viewZoomNavigator = false;
    @Input() viewZoomNavigatorMinValue = 100; // Image size min Value in Percent
    @Input() viewZoomNavigatorMaxValue = 300; // Image size min Value in Percent
    @Input() viewLayout = FwFileViewLayout.TILES;
    @Input() showViewLayoutSwitcher = false;

    fileViewLayout = FwFileViewLayout;

    @ViewChild('fileModalComponent') fileModalComponent: FileModalComponent;

    // DATA
    result: any = [];
    randomID: string;

    constructor(
        private dataService: DataService,
        private userService: UserService,
        private fileService: FileService,
        private sanitizer: DomSanitizer,
        public settingsService: SettingsService,
    ) {
    }

    ngOnInit(): void {
        this.randomID = (Math.random() * 1000).toFixed(0);
    }

    openDeleteFileModal(event, f): void {
        event.stopPropagation();
        this.dataService.request('framework.File/getFile', {
            FID: f.FID,
            thumbnail: false
        }).subscribe(response => {
            this.result.selectedFile = response.file;
            if (this.settingsService.frameworkSettings.user.displayStyle === FwUserDisplayStyle.FULLNAME) {
                this.result.selectedFile.create_UID = this.result.selectedFile.firstname + ' ' + this.result.selectedFile.lastname;
            } else if (this.settingsService.frameworkSettings.user.displayStyle === FwUserDisplayStyle.USERNAME) {
                this.result.selectedFile.create_UID = this.result.selectedFile.username;
            } else {
                this.result.selectedFile.create_UID = this.result.selectedFile.firstname;
            }

            if (this.userService.currentUser.language === 'de') {
                this.result.selectedFile.create_date = moment(this.result.selectedFile.create_date, 'YYYY-MM-DD HH:mm:ss').format(
                    'DD.MM.YYYY HH:mm'
                );
            }
            this.result.selectedFile.imgData = this.sanitizer.bypassSecurityTrustUrl(f.imgData);
            // Todo: FIX IT (New Modal)
            /*$('#del-file-modal_' + this.randomID).modal({backdrop: 'static'});*/
        });
    }

    deleteFile(f): void {
        this.dataService.request('framework.File/deleteFile', {
            FID: f.FID,
            uid: this.userService.currentUser.UID
        }).subscribe(() => {
            this.fileService.loadFiles.next(null);
            this.fileService.deselectFiles.next(null);
            this.fileService.countUploadedFiles.next(null);
        });
    }

    openFileModal(FID: any): void {
        this.fileService.openModal.next(FID);

        this.fileModalComponent.openFile(FID);
    }

    setLayout(fileViewLayout: FwFileViewLayout): void {
        this.viewLayout = fileViewLayout;
    }
}
