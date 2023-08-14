import {Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Directive({
    selector: '[appDebounceKeyup]'
})
export class DebounceKeyupDirective implements OnInit, OnDestroy {

    @Input() debounceTime = 500;
    @Output() debounceKeyup = new EventEmitter();

    private keyup = new Subject();
    private subscription$: Subscription;

    constructor() {
    }

    ngOnInit(): void {
        this.subscription$ = this.keyup.pipe(debounceTime(this.debounceTime)).subscribe(e => this.debounceKeyup.emit(e));
    }

    ngOnDestroy(): void {
        this.subscription$.unsubscribe();
    }

    @HostListener('keyup', ['$event'])
    clickEvent(event): void {
        event.preventDefault();
        event.stopPropagation();
        this.keyup.next(event);
    }
}
