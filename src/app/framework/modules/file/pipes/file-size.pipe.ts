import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

    transform(value: any, ...args: any[]): any {
        if (value >= 1073741824) {
            return (value / 1073741824).toFixed(2) + ' GB';
        } else if (value >= 1048576) {
            return (value / 1048576).toFixed(2) + ' MB';
        } else if (value >= 1024) {
            return (value / 1024).toFixed(2) + ' KB';
        } else if (value > 1) {
            return value + ' bytes';
        } else if (value === 1) {
            return value + ' byte';
        } else {
            return '0 byte';
        }
    }

}
