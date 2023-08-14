import {Directive, Output, EventEmitter, HostListener} from '@angular/core';

@Directive({
    selector: '[appDnd]'
})
export class DndDirective {
    @Output() fileDropped = new EventEmitter<any>();

    @HostListener('dragover', ['$event'])
    public onDragOver(evt): void {
        evt.preventDefault();
        evt.stopPropagation();
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(evt): void {
        evt.preventDefault();
        evt.stopPropagation();
    }

    @HostListener('drop', ['$event'])
    public onDrop(evt): void {
        evt.preventDefault();
        evt.stopPropagation();

        const files = evt.dataTransfer.files;
        if (files.length > 0) {
            this.fileDropped.emit(files);
        }
    }
}
