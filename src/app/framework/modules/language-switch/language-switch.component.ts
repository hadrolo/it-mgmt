import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../auth/user.service';
import {DataService} from '../../services/data.service';
import {FwLanguages} from '../../settings';

@Component({
    selector: 'app-language-switch',
    templateUrl: './language-switch.component.html',
    styleUrls: ['./language-switch.component.scss']
})
export class LanguageSwitchComponent implements OnInit {

    @Input() showFlags = true;
    @Input() showIso3= false;
    @Input() showText = true;
    fwLanguages = FwLanguages;
    selectedLanguage = null;

    constructor(
        public translateService: TranslateService,
        public userService: UserService,
        private dataService: DataService,
    ) {
    }

    ngOnInit(): void {
        if (this.userService.currentUser.language) {

            this.translateService.use(this.userService.currentUser.language);
        }
        this.setSelectedLanguage();
    }

    set(language): void {
        this.dataService.request('framework.User/writeLanguage', {
            language,
        }).subscribe(_ => {
            this.userService.currentUser.language = language;
            this.translateService.use(language);
            this.setSelectedLanguage();
        });
    }

    setSelectedLanguage(){
        this.selectedLanguage = this.fwLanguages.find(element=> element.short==this.userService.currentUser.language);
    }

}
