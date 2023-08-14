import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FwTagConfig} from './tag.interfaces';
import {DataService} from '../../services/data.service';
import {TagService} from './tag.service';

@Component({
    selector: 'app-tag',
    templateUrl: './tag.component.html',
    styleUrls: ['./tag.component.scss']
})
export class TagComponent implements OnInit, OnChanges {

    @Input() config: FwTagConfig;

    tags = [];
    newTag: any;
    saving = false;

    constructor(
        private dataService: DataService,
        private tagService: TagService,
    ) {
    }

    ngOnInit(): void {
        // this.resetNewTag();
        // this.listTags();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.resetNewTag();
        this.listTags();
    }

    listTags(): void {
        this.dataService.request('framework.Tag/listAll', {
            config: this.config
        }).subscribe(response => {
            this.tags = response.tags;
        });
    }

    addTag(): void {
        this.saving = true;
        this.dataService.request('framework.Tag/save', this.newTag).subscribe(() => {
            this.saving = false;
            this.resetNewTag();
            this.listTags();
            this.tagService.reloadViewer.next(null);
        });
    }

    deleteTag(tag: any): void {
        this.dataService.request('framework.Tag/delete', {
            TAGID: tag.TAGID
        }).subscribe(() => {
            this.tags.splice(this.tags.indexOf(tag), 1);
            this.tagService.reloadViewer.next(null);
        });
    }

    private resetNewTag(): void {
        this.newTag = {
            FK_ID: this.config.FK_ID,
            FK_name: this.config.FK_name,
            name: ''
        };
    }
}
