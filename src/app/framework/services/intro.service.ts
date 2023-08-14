import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {UserService} from '../modules/auth/user.service';

// import * as introJs from 'intro.js/intro';
import * as introJs from 'introjs';

@Injectable({
    providedIn: 'root'
})
export class IntroService {

    introJS = introJs();

    constructor(
        private dataService: DataService,
        private userService: UserService
    ) {
    }

    startTour(component): void {
        this.dataService.request('framework.Intro/getData', {
            component
        }).subscribe(response => {
            const out = [];
            response.elements.data.forEach(element => {
                if (element.type === 'intro') {
                    out.push({
                        intro: element['text_' + this.userService.currentUser.language]
                    });
                } else if (element.type === 'element') {
                    out.push({
                        element: element.element,
                        intro: element['text_' + this.userService.currentUser.language],
                        position: element.position
                    });
                }
            });
            this.introJS.setOptions({steps: out});
            this.introJS.start();
        });
    }

    getHints(component): void {
        this.dataService.request('framework.Intro/getData', {
            component
        }).subscribe(response => {
            const out = [];
            response.elements.data.forEach(element => {
                if (element.type === 'hint') {
                    out.push({
                        element: element.element,
                        hint: element['text_' + this.userService.currentUser.language],
                        hintPosition: element.hintPosition,
                        hintAnimation: element.hintAnimation === '1'
                    });
                }
            });
            this.introJS.setOptions({hints: out});
            this.introJS.addHints();
            this.introJS.showHints();
        });
    }

    destroy(): void {
        this.introJS.hideHints();
    }
}
