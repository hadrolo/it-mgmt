import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
// import {CustomDateFormatter} from './custom-date-formatter.provider';/
import {Subject} from 'rxjs';
/*import {CalendarDateFormatter, CalendarEvent, CalendarEventAction, CalendarView, DAYS_OF_WEEK} from 'angular-calendar';*/
import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek)

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
/*    providers: [
        {
            provide: CalendarDateFormatter,
            useClass: CustomDateFormatter,
        },
    ],*/
})
export class FwCalendarComponent implements OnInit {

/*    // the events to load on init
    @Input() events: CalendarEvent[];
    @Input() view: CalendarView = CalendarView.Month;
    @Input() viewDate: Date = new Date();

    @Output() eventClicked = new EventEmitter();
    @Output() dateRangeChangedEvent = new EventEmitter();
    @Output() viewChangedEvent = new EventEmitter();

    CalendarView = CalendarView;

    locale = 'de';
    weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

    actions: CalendarEventAction[] = [{
        label: '<i class="fas fa-fw fa-eye"></i>',
        onClick: ({event}: { event: CalendarEvent }): void => {
            console.dir(event);
        }
    } , {
        label: '<i class="fas fa-fw fa-times"></i>',
        onClick: ({event}: { event: CalendarEvent }): void => {
            this.events = this.events.filter(iEvent => iEvent !== event);
        }
    }];

    refresh: Subject<any> = new Subject();

    activeDayIsOpen = true;*/

    constructor() {
    }

   ngOnInit(): void {
        // this.refresh.next(null);
    }

  /*     loadEvents(events: CalendarEvent[]): void {
          this.events = events;
      }

      dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
          if (dayjs(date).isSame(this.viewDate, 'month')) {
              if (
                  (dayjs(date).isSame(this.viewDate, 'day') && this.activeDayIsOpen === true) ||
                  events.length === 0
              ) {
                  this.activeDayIsOpen = false;
              } else {
                  this.activeDayIsOpen = true;
              }
              this.viewDate = date;
          }
      }

      handleEvent(action: string, event: CalendarEvent): void {
          this.eventClicked.emit({action, event});
      }

      setView(view: CalendarView): void {
          this.view = view;

          this.viewChangedEvent.emit(view);
      }

      closeOpenMonthViewDay(): void {
          this.activeDayIsOpen = false;

          let startDate;
          let endDate;

          if (this.view === 'week') {
              startDate = dayjs(this.viewDate).startOf('isoWeek').format('YYYY-MM-DD');
              endDate = dayjs(this.viewDate).endOf('isoWeek').format('YYYY-MM-DD');
          }
          if (this.view === 'month') {
              startDate = dayjs(this.viewDate).startOf('month').format('YYYY-MM-DD');
              endDate = dayjs(this.viewDate).endOf('month').format('YYYY-MM-DD');
          }

          this.dateRangeChangedEvent.emit({startDate, endDate});
      }*/

}
