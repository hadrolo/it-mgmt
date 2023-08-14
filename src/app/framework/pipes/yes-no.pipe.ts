import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
    name: 'yesNo'
})
export class YesNoPipe implements PipeTransform {

    constructor(
        private translateService: TranslateService
    ) {
    }

    transform(value: boolean, ...args: unknown[]): string {
        return value === true ? this.translateService.instant('FW.GENERAL.YES') : this.translateService.instant('FW.GENERAL.NO');
    }

}
