import {Component, ElementRef, Inject, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {BreadcrumbsService} from './breadcrumbs.service';

function Replace(el: any): any {
    const nativeElement: HTMLElement = el.nativeElement;
    const parentElement: HTMLElement = nativeElement.parentElement;

    // move all children out of the element
    while (nativeElement.firstChild) {
        parentElement.insertBefore(nativeElement.firstChild, nativeElement);
    }

    // remove the empty element(the host)
    parentElement.removeChild(nativeElement);
}

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {

    @Input() fixed: boolean;
    breadcrumbs;
    private readonly fixedClass = 'breadcrumb-fixed';

    constructor(
        @Inject(DOCUMENT) private document: any,
        private renderer: Renderer2,
        public service: BreadcrumbsService,
        public el: ElementRef
    ) {
    }

    ngOnInit(): void {
        Replace(this.el);
        this.isFixed(this.fixed);
        this.breadcrumbs = this.service.breadcrumbs;
    }

    ngOnDestroy(): void {
        this.renderer.removeClass(this.document.body, this.fixedClass);
    }

    isFixed(fixed: boolean = this.fixed): void {
        if (fixed) {
            this.renderer.addClass(this.document.body, this.fixedClass);
        }
    }
}
