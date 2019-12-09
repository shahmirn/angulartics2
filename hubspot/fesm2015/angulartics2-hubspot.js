import { __decorate, __metadata } from 'tslib';
import { ɵɵdefineInjectable, ɵɵinject, Injectable } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

let Angulartics2Hubspot = class Angulartics2Hubspot {
    constructor(angulartics2) {
        this.angulartics2 = angulartics2;
        this.angulartics2.setUserProperties
            .subscribe((x) => this.setUserProperties(x));
    }
    startTracking() {
        this.angulartics2.pageTrack
            .pipe(this.angulartics2.filterDeveloperMode())
            .subscribe((x) => this.pageTrack(x.path));
        this.angulartics2.eventTrack
            .pipe(this.angulartics2.filterDeveloperMode())
            .subscribe((x) => this.eventTrack(x.action, x.properties));
    }
    pageTrack(path) {
        if (typeof _hsq !== 'undefined') {
            _hsq.push(['setPath', path]);
            _hsq.push(['trackPageView']);
        }
    }
    eventTrack(action, properties) {
        if (typeof _hsq !== 'undefined') {
            _hsq.push(['trackEvent', properties]);
        }
    }
    setUserProperties(properties) {
        if (typeof _hsq !== 'undefined') {
            _hsq.push(['identify', properties]);
        }
    }
};
Angulartics2Hubspot.ngInjectableDef = ɵɵdefineInjectable({ factory: function Angulartics2Hubspot_Factory() { return new Angulartics2Hubspot(ɵɵinject(Angulartics2)); }, token: Angulartics2Hubspot, providedIn: "root" });
Angulartics2Hubspot = __decorate([
    Injectable({ providedIn: 'root' }),
    __metadata("design:paramtypes", [Angulartics2])
], Angulartics2Hubspot);

export { Angulartics2Hubspot };
//# sourceMappingURL=angulartics2-hubspot.js.map
