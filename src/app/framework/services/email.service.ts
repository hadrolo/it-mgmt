import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SettingsService} from './settings.service';
import {DataService} from './data.service';

@Injectable({
    providedIn: 'root'
})
export class EmailService {

    constructor(
        private http: HttpClient,
        private settingsService: SettingsService,
        private dataService: DataService,
    ) {
    }

    sendEmailHtml(from, to, subject, body, cc = null, bcc = null, attachments = null): Observable<any> {
        return this.dataService.request('framework.Email/send', {
            from,
            to,
            cc,
            bcc,
            subject,
            body,
            attachments,
            mailType: 'html'
        });
    }

    sendEmailPlain(from, to, subject, body, cc = null, bcc = null, attachments = null): Observable<any> {
        return this.dataService.request('framework.Email/send', {
            from,
            to,
            cc,
            bcc,
            subject,
            body,
            attachments,
            mailType: 'plain'
        });
    }

    sendCalenderIcal(from, to, cc, bcc, title, message, attachments, ical): Observable<any> {
        return this.dataService.request('framework.Email/send', {
            from,
            to,
            cc,
            bcc,
            title,
            message,
            attachments,
            ical,
            mailType: 'ical'
        });
    }
}
