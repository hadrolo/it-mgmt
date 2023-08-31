import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Meta, Title} from '@angular/platform-browser';

interface seoData{
    title?: string;
    description?: string,
    keywords?: string,
    robots?: string,
    ogUrl?: string,
    ogTitle?: string,
    ogDescription?: string,
    ogImage?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {

    constructor(
        private router: Router,
        private metaService: Meta,
        private titleService: Title,
    ) {
    }

    setMeta(data: seoData) {
        this.titleService.setTitle(data.title);
        if (data.description) {
            this.metaService.updateTag({name: 'keywords', content: data.keywords});
        } else {
            this.metaService.removeTag("name='keywords'")
        }
        if (data.description) {
            this.metaService.updateTag({name: 'description', content: data.description})
        } else {
            this.metaService.removeTag("name='description'")
        }
        if (data.robots) {
            this.metaService.updateTag({name: 'robots', content: data.robots})
        } else {
            this.metaService.updateTag({name: 'robots', content: "follow,index"})
        }
        if (data.ogUrl) {
            this.metaService.updateTag({property: 'og:url', content: data.ogUrl})
        } else {
            this.metaService.updateTag({property: 'og:url', content: this.router.url})
        }
        if (data.ogTitle) {
            this.metaService.updateTag({property: 'og:title', content: data.ogTitle})
        } else {
            this.metaService.removeTag("property='og:title'")
        }
        if (data.ogDescription) {
            this.metaService.updateTag({property: 'og:description', content: data.ogDescription})
        } else {
            this.metaService.removeTag("property='og:description'")
        }
        if (data.ogImage) {
            this.metaService.updateTag({property: 'og:image', content: data.ogImage})
        } else {
            this.metaService.removeTag("property='og:image'")
        }
    }

    setTitle(data: string){
        this.titleService.setTitle(data);
    }
}
