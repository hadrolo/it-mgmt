import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {AuthModalService, FwAuthModalSubject} from './auth-modal.service';
import {UserService} from '../user.service';

@Component({
    selector: 'app-auth-modal',
    templateUrl: './auth-modal.component.html',
    styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit {

    modalRef: BsModalRef;
    config = {
        class: 'modal-dialog-centered',
        backdrop: true,
        ignoreBackdropClick: true
    };
    @ViewChild('template') template: TemplateRef<any>;

    constructor(
        private modalService: BsModalService,
        private authModalService: AuthModalService,
        public userService: UserService,
    ) {
    }

    ngOnInit(): void {
        this.authModalService.showModal.subscribe((data: FwAuthModalSubject) => {
            this.modalRef = this.modalService.show(this.template, this.config);
            this.modalRef.onHidden.subscribe(() => {
                this.userService.stopForcedLogout();
            });
        });
        this.authModalService.hideModal.subscribe(() => {
            this.modalRef.hide();
        });
    }

    extendSession(): void {
        this.modalRef.hide();
    }

    logout(): void {
        this.userService.logout().subscribe(() => {
            this.modalRef.hide();
        });
    }
}
