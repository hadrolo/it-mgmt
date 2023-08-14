import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Observable, Subscription, timer} from 'rxjs';
import * as dayjs from 'dayjs';


@Component({
    selector: 'app-auto-refresh',
    templateUrl: './auto-refresh.component.html',
    styleUrls: ['./auto-refresh.component.css']
})
export class AutoRefreshComponent implements OnInit, OnDestroy {

    private subscription$: Subscription;
    @Output() TimerExpired: EventEmitter<any> = new EventEmitter<any>();

    @Input() SearchDate: dayjs.Dayjs = dayjs();
    @Input() ElapsTime = 1;

    searchEndDate: dayjs.Dayjs;
    remainingTime: number;
    minutes: number;
    seconds: number;

    everySecond: Observable<number> = timer(0, 1000);

    constructor(private ref: ChangeDetectorRef) {
        this.searchEndDate = this.SearchDate.add(this.ElapsTime, 'minutes');
    }

    ngOnInit(): void {
        this.subscription$ = this.everySecond.subscribe((seconds) => {
            const currentTime: dayjs.Dayjs = dayjs();
            this.remainingTime = this.searchEndDate.diff(currentTime);
            this.remainingTime = this.remainingTime / 1000;

            if (this.remainingTime <= 0) {
                this.SearchDate = dayjs();
                this.searchEndDate = this.SearchDate.add(this.ElapsTime, 'minutes');

                this.TimerExpired.emit();
            } else {
                this.minutes = Math.floor(this.remainingTime / 60);
                this.seconds = Math.floor(this.remainingTime - this.minutes * 60);
            }
            this.ref.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.subscription$.unsubscribe();
    }

}
