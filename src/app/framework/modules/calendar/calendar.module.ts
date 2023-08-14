import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FwCalendarComponent} from './calendar.component';


@NgModule({
    declarations: [FwCalendarComponent],
    exports: [
        FwCalendarComponent
    ],
    imports: [
        CommonModule,
/*        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        })*/
    ]
})
export class FwCalendarModule {
}
