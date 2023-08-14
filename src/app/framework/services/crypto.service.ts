import {Injectable} from '@angular/core';
import CryptoES from 'crypto-es';
import {LogService, FwLogType} from './log.service';
import {Router} from '@angular/router';
import {SettingsService} from './settings.service';
import {LocalStorageService} from './local-storage.service';
import {FwOpenData} from '../settings';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {

    constructor(
        private localStorageService: LocalStorageService,
        private logService: LogService,
        private router: Router,
        private settingsService: SettingsService
    ) {
    }

    encrypt(toEncrypt: string): string {
        const $iv = this.randomHex(16);
        const encrypted = $iv + CryptoES.AES.encrypt(toEncrypt, CryptoES.enc.Utf8.parse(this.settingsService.frameworkSettings.cryptoKey), {iv: CryptoES.enc.Utf8.parse($iv)}).toString();
        return CryptoES.enc.Base64.parse(encrypted).toString(CryptoES.enc.Hex);
    }

    decrypt(toDecrypt: string): string {
        toDecrypt = CryptoES.enc.Hex.parse(toDecrypt).toString(CryptoES.enc.Base64);
        const $iv = toDecrypt.substring(0, 16);
        toDecrypt = toDecrypt.substring(16);
        return CryptoES.AES.decrypt(toDecrypt, CryptoES.enc.Utf8.parse(this.settingsService.frameworkSettings.cryptoKey), {iv: CryptoES.enc.Utf8.parse($iv)}).toString(CryptoES.enc.Utf8);
    }

    private randomHex(size): string {
        return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    urlData(url): any {
        const noHash = url.split('#')[0];
        const toDecrypt = noHash.split('/').reverse()[0];

        try {
            return JSON.parse(this.decrypt(toDecrypt)) as FwOpenData;
        } catch (e) {
            this.logService.write(FwLogType.ACCESS_VIOLATION, 'decrypt url-data failed');
            this.router.navigate([this.settingsService.frameworkSettings.urlDataFallbackLink]);
            return null;
        }
    }

}
