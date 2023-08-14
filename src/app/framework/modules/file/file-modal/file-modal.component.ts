import {Component, HostListener, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SettingsService, FwUserDisplayStyle} from '../../../services/settings.service';
import {DataService} from '../../../services/data.service';
import * as moment from 'moment';
import {FileService} from '../file.service';
import {UserService} from '../../auth/user.service';
import {animate, group, state, style, transition, trigger} from '@angular/animations';
import {FwBackupService} from '../../../services/fw-backup.service';
import {FwFormViewMode} from '../../form/form.interfaces';
import {MatDialog} from '@angular/material/dialog';
//declare var $: any; // JQuery

@Component({
    selector: 'app-file-modal',
    templateUrl: './file-modal.component.html',
    styleUrls: ['./file-modal.component.scss'],
    animations: [
        // the fade-in/fade-out animation.
        trigger('slideInOut', [
            state('in', style({height: '*', opacity: 1})),
            transition(':leave', [style({
                height: '*',
                opacity: 1
            }), group([animate(300, style({height: 0})), animate('200ms ease-in-out', style({opacity: '1'}))])]),
            transition(':enter', [style({
                height: '0',
                opacity: 0
            }), group([animate(300, style({height: '*'})), animate('400ms ease-in-out', style({opacity: '1'}))])])
        ])
    ]
})
export class FileModalComponent implements OnInit {

    @Input() files: any = [];
    @Input() viewExternalData = null; // Required for overlay
    @Input() viewFileInfo = true;
    @Input() viewFlipImage = false;
    @Input() viewZoomNavigator = false;
    @Input() viewZoomNavigatorMinValue = 100; // Image size min Value in Percent
    @Input() viewZoomNavigatorMaxValue = 300; // Image size min Value in Percent
    @Input() navigation: any = {};
    @ViewChild('modalInfo') modalInfo: TemplateRef<any>;


    clientHeight = document.body.clientHeight;
    clientWidth = document.body.clientWidth;
    imageHeight = null;
    imageWidth = null;
    imageClass = 'bgDefault';
    resizeTimeout = null;
    hideFileinfo = false;
    viewImageModal = false;
    loading = false;
    result: any = {};
    fileData;
    randomID: string;
    fwFormViewMode = FwFormViewMode;
    viewMode = FwFormViewMode.VIEW;
    zoom = 100;
    backgroundImagePosition = 'center center';

    @HostListener('window:resize', ['$event'])
    onResize(): void {
        if (this.result.openFile) {
            if (this.resizeTimeout === null) {
                this.resizeTimeout = setTimeout(() => {
                    this.calcImageSize();
                    this.resizeTimeout = null;
                }, 150);
            }
        }
    }

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent): void {
        if (event.code === 'ArrowRight') {
            this.goNextImage();
        }
        if (event.code === 'ArrowLeft') {
            this.goPrevImage();
        }
        if (event.code === 'ArrowDown') {
            if (this.hideFileinfo !== true) {
                this.toggleFileInfo();
            }
        }
        if (event.code === 'ArrowUp') {
            if (this.hideFileinfo === true) {
                this.toggleFileInfo();
            }
        }
        if (event.code === 'Escape') {
            this.closeFileModal();
        }
    }

    @HostListener("wheel", ["$event"])
    public onScroll(event: WheelEvent) {
        if (this.viewZoomNavigator) {
            // manage alignment of backgound image (1/3 of screensize)
            let vertical = null;
            let horizontal = null;
            const widthSpacer = document.body.clientWidth / 3;
            const heightSpacer = document.body.clientHeight / 3;

            if (event.x <= widthSpacer) {
                vertical = 'left';
            } else if (event.x >= document.body.clientWidth - widthSpacer) {
                vertical = 'right';
            } else {
                vertical = 'center';
            }
            if (event.y <= heightSpacer) {
                horizontal = 'top';
            } else if (event.y >= document.body.clientHeight - heightSpacer) {
                horizontal = 'bottom';
            } else {
                horizontal = 'center';
            }
            if (!vertical && !horizontal){
                this.backgroundImagePosition = 'center center'
            } else {
                this.backgroundImagePosition = vertical + ' ' + horizontal;
            }

            if (event.deltaY > 0) {
                if (this.viewZoomNavigatorMinValue <= this.zoom - 10) {
                    this.zoom = this.zoom - 10;
                }
            } else {
                if (this.viewZoomNavigatorMaxValue >= this.zoom + 10) {
                    this.zoom = this.zoom + 10;
                }
            }
            this.changeZoom();
        }
    }
/*
    // Touch functions ToDo: use hammer.js ??
    defaultTouch = { x: 0, y: 0, time: 0 };
    @HostListener('touchstart', ['$event'])
    @HostListener('touchend', ['$event'])
    @HostListener('touchcancel', ['$event'])
    handleTouch(event) {
        let touch = event.touches[0] || event.changedTouches[0];
        if (event.type === 'touchstart') {
            this.defaultTouch.x = touch.pageX;
            this.defaultTouch.y = touch.pageY;
            this.defaultTouch.time = event.timeStamp;
        } else if (event.type === 'touchend') {
            let deltaX = touch.pageX - this.defaultTouch.x;
            let deltaY = touch.pageY - this.defaultTouch.y;
            let deltaTime = event.timeStamp - this.defaultTouch.time;
            if (deltaTime < 500) {
                // touch movement lasted less than 500 ms
                if (Math.abs(deltaX) > 60) {
                    // delta x is at least 60 pixels
                    if (deltaX > 0) {
                        this.goPrevImage();
                    } else {
                        this.goNextImage();
                    }
                }

                // zoom
/!*                if (Math.abs(deltaY) > 60) {
                    // delta y is at least 60 pixels
                    if (deltaY > 0) {
                        this.doSwipeDown(event);
                    } else {
                        this.doSwipeUp(event);
                    }
                }*!/
            }
        }
    }*/

    constructor(
        public settingsService: SettingsService,
        private dataService: DataService,
        private fileService: FileService,
        private userService: UserService,
        private backupService: FwBackupService,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.randomID = (Math.random() * 1000).toFixed(0);
    }

    closeFileModal(): void {
        this.viewImageModal = false;
        //todo: alternative Nötig
/*        $('html').css('height', 'inherit');
        $('body').css('height', 'inherit');
        $('body').css('overflow-y', 'inherit');*/
    }

    goPrevImage(): void {
        if (this.navigation.focus !== this.navigation.first) {
            this.loading = true;
            this.openFile(this.navigation.prev);
        }
    }

    goNextImage(): void {
        if (this.navigation.focus !== this.navigation.last) {
            this.loading = true;
            this.openFile(this.navigation.next);
        }
    }

    toggleFileInfo(): void {
        this.hideFileinfo = this.hideFileinfo !== true;
    }

    rotateImage(degrees): void {
        this.loading = true;
        this.dataService.request('framework.File/rotateImageSet', {
            degrees,
            FID: this.result.openFile.FID,
        }).subscribe(() => {
            this.fileService.loadFiles.next(null);
            this.openFile(this.result.openFile.FID);
        });
    }

    calcImageSize(): void {
        this.clientHeight = document.body.clientHeight;
        this.clientWidth = document.body.clientWidth;

        this.imageWidth = this.result.openFile.width ? +this.result.openFile.width : 0;
        this.imageHeight = this.result.openFile.height ? +this.result.openFile.height : 0;
        if (this.result) {
            if (this.imageWidth <= this.clientWidth && this.imageHeight <= this.clientHeight) {
                // if both file dimensions are smaller than client apply automatic background size
                this.imageClass = 'bgDefault';
            } else {
                // else apply background size based on ratio
                const ratioX = this.clientWidth / this.imageWidth;
                const ratioY = this.clientHeight / this.imageHeight;

                if (ratioX > ratioY) {
                    this.imageClass = 'bgVertical';
                } else {
                    this.imageClass = 'bgHorizontal';
                }
            }
        }
    }

    openFile(FID): void {
        this.navigation.focus = FID;
        this.dataService.request(this.settingsService.frameworkSettings.file.fileViewerFileInfo.classModule, {
            FID,
            thumbnail: false,
            lang: this.userService.currentUser.language
        }).subscribe(response => {
            this.loading = false;
            this.result.openFile = response.file;
            this.fileData = response.fileData;

            if (this.settingsService.frameworkSettings.user.displayStyle === FwUserDisplayStyle.FULLNAME) {
                this.result.openFile.create_UID = this.result.openFile.firstname + ' ' + this.result.openFile.lastname;
            } else if (this.settingsService.frameworkSettings.user.displayStyle === FwUserDisplayStyle.USERNAME) {
                this.result.openFile.create_UID = this.result.openFile.username;
            } else {
                this.result.openFile.create_UID = this.result.openFile.firstname;
            }

            if (this.userService.currentUser.language === 'de') {
                this.result.openFile.create_date = moment(this.result.openFile.create_date, 'YYYY-MM-DD HH:mm:ss').format('DD.MM.YYYY HH:mm');
            }
            this.result.openFile.imageData = response.imageData;
            this.result.openFile.isImage = response.isImage;

            if (this.result.openFile.mimetype.substring(0, 5) === 'image') {
                //todo: sollte das doch sein??? momentan keine Auswirkungen beim bilder öffnen ersichtlich...
     /*           $('html').css('height', '100%');
                $('body').css('height', '100%');
                $('body').css('overflow-y', 'hidden');
*/
                this.calcImageSize();
                this.viewImageModal = true;

                let indexFirstSet = false;
                let indexPrevFound = false;
                let indexNextWrite = false;
                this.files.forEach(element => {
                    if (indexFirstSet === false) {
                        this.navigation.first = this.files[0].FID;
                        indexFirstSet = true;
                    }
                    if (element.mimetype.split('/')[0] === 'image') {
                        if (indexPrevFound === false) {
                            if (element.FID === this.result.openFile.FID) {
                                indexPrevFound = true;
                            } else {
                                this.navigation.prev = element.FID;
                            }
                        }
                        if (indexNextWrite === true) {
                            this.navigation.next = element.FID;
                            indexNextWrite = false;
                        }
                        if (element.FID === this.result.openFile.FID) {
                            indexNextWrite = true;
                        }
                        this.navigation.last = element.FID;
                    }
                });
            } else {
                //todo: alternative Suchen
                this.dialog.open(this.modalInfo);
                //$(('#info-file-modal_' + this.randomID)).modal({backdrop: 'static'});

            }
        });
    }

    downloadFile(): void {
        const linkSource = this.fileData != null ? this.fileData : this.result.openFile.imageData;
        const downloadLink = document.createElement('a');
        const fileName = this.result.openFile.display_name + '.' + this.result.openFile.extension;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    setView(viewMode: FwFormViewMode): void {
        this.viewMode = viewMode;
    }

    updateFile(): void {
        // aggregate editable fields
        const fields = [];
        this.settingsService.frameworkSettings.file.fileViewerFileInfo.rows.forEach(row => {
            if (row.editable === true) {
                fields.push({
                    key: row.field,
                    value: this.result.openFile[row.field]
                });
            }
        });

        this.dataService.request('framework.File/update', {FID: this.result.openFile.FID, fields}).subscribe(() => {
            this.fileService.loadFiles.next(null);
            this.setView(this.fwFormViewMode.VIEW);
        });
    }

    editFile(): void {
        this.backupService.backup('filemodal', this.result.openFile);
        this.viewMode = this.fwFormViewMode.EDIT;
    }

    cancelEditFile(): void {
        this.result.openFile = this.backupService.reset('filemodal', this.result.openFile);
        this.viewMode = this.fwFormViewMode.VIEW;
    }

    openInfoModal(): void {
        //todo: alternative Suchen
        this.dialog.open(this.modalInfo);
        //$(('#info-file-modal_' + this.randomID)).modal({backdrop: 'static'});
    }

    changeZoom() {
        this.imageWidth = Math.round(this.result.openFile.width * this.zoom / 100);
        this.imageHeight = Math.round(this.result.openFile.height * this.zoom / 100);
    }

    hammerTime($event: any) {
        console.log($event.type);
        console.log($event);
    }
}
