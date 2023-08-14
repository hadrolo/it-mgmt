import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FwTagConfig} from '../tag.interfaces';
import {DataService} from '../../../services/data.service';
import {TagService} from '../tag.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-tag-viewer',
    templateUrl: './tag-viewer.component.html',
    styleUrls: ['./tag-viewer.component.scss']
})
export class TagViewerComponent implements OnInit, OnDestroy {

    @Input() config: FwTagConfig;
    @Output() tagClicked = new EventEmitter();

    tags = [];
    reload$: Subscription;

    constructor(
        private dataService: DataService,
        private tagService: TagService,
    ) {
    }

    ngOnInit(): void {
        this.reload$ = this.tagService.reloadViewer.subscribe(() => this.listTags());
        this.listTags();
    }

    ngOnDestroy(): void {
        this.reload$.unsubscribe();
    }

    listTags(): void {
        this.dataService.request('framework.Tag/listAll', {
            config: this.config
        }).subscribe(response => {
            this.tags = response.tags;
        });
    }

}
