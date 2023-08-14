import {Pipe, PipeTransform} from '@angular/core';
import {FwTranslatable} from '../modules/table/table.interfaces';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
    name: 'fwTranslate',
    pure: false
})
export class FwTranslatePipe implements PipeTransform {

    constructor(
        private translateService: TranslateService,
    ) {
    }

    transform(value: FwTranslatable | string, ...args: unknown[]): string {
        if (typeof value === 'string') {
            return value;
        } else {
            return this.translateService.instant(value.label);
        }
    }

}
