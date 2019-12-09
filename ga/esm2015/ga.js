import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { Angulartics2, } from 'angulartics2';
import * as i0 from "@angular/core";
import * as i1 from "angulartics2";
export class GoogleAnalyticsDefaults {
    constructor() {
        this.additionalAccountNames = [];
        this.userId = null;
        this.transport = '';
        this.anonymizeIp = false;
    }
}
let Angulartics2GoogleAnalytics = class Angulartics2GoogleAnalytics {
    constructor(angulartics2) {
        this.angulartics2 = angulartics2;
        this.dimensionsAndMetrics = [];
        const defaults = new GoogleAnalyticsDefaults();
        // Set the default settings for this module
        this.angulartics2.settings.ga = Object.assign({}, defaults, this.angulartics2.settings.ga);
        this.settings = this.angulartics2.settings.ga;
        this.angulartics2.setUsername.subscribe((x) => this.setUsername(x));
        this.angulartics2.setUserProperties.subscribe(x => this.setUserProperties(x));
    }
    startTracking() {
        this.angulartics2.pageTrack
            .pipe(this.angulartics2.filterDeveloperMode())
            .subscribe(x => this.pageTrack(x.path));
        this.angulartics2.eventTrack
            .pipe(this.angulartics2.filterDeveloperMode())
            .subscribe(x => this.eventTrack(x.action, x.properties));
        this.angulartics2.exceptionTrack
            .pipe(this.angulartics2.filterDeveloperMode())
            .subscribe(x => this.exceptionTrack(x));
        this.angulartics2.userTimings
            .pipe(this.angulartics2.filterDeveloperMode())
            .subscribe(x => this.userTimings(x));
    }
    pageTrack(path) {
        if (typeof _gaq !== 'undefined' && _gaq) {
            _gaq.push(['_trackPageview', path]);
            for (const accountName of this.angulartics2.settings.ga.additionalAccountNames) {
                _gaq.push([accountName + '._trackPageview', path]);
            }
        }
        if (typeof ga !== 'undefined' && ga) {
            if (this.angulartics2.settings.ga.userId) {
                ga('set', '&uid', this.angulartics2.settings.ga.userId);
                for (const accountName of this.angulartics2.settings.ga.additionalAccountNames) {
                    ga(accountName + '.set', '&uid', this.angulartics2.settings.ga.userId);
                }
            }
            if (this.angulartics2.settings.ga.anonymizeIp) {
                ga('set', 'anonymizeIp', true);
                for (const accountName of this.angulartics2.settings.ga.additionalAccountNames) {
                    ga(accountName + '.set', 'anonymizeIp', true);
                }
            }
            ga('send', 'pageview', path);
            for (const accountName of this.angulartics2.settings.ga.additionalAccountNames) {
                ga(accountName + '.send', 'pageview', path);
            }
        }
    }
    /**
     * Track Event in GA
     *
     * @param action Associated with the event
     * @param properties Comprised of:
     *  - category (string) and optional
     *  - label (string)
     *  - value (integer)
     *  - noninteraction (boolean)
     *
     * @link https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide#SettingUpEventTracking
     * @link https://developers.google.com/analytics/devguides/collection/analyticsjs/events
     */
    eventTrack(action, properties) {
        // Google Analytics requires an Event Category
        if (!properties || !properties.category) {
            properties = properties || {};
            properties.category = 'Event';
        }
        // GA requires that eventValue be an integer, see:
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventValue
        // https://github.com/luisfarzati/angulartics/issues/81
        if (properties.value) {
            const parsed = parseInt(properties.value, 10);
            properties.value = isNaN(parsed) ? 0 : parsed;
        }
        if (typeof ga !== 'undefined') {
            const eventOptions = {
                eventCategory: properties.category,
                eventAction: action,
                eventLabel: properties.label,
                eventValue: properties.value,
                nonInteraction: properties.noninteraction,
                page: properties.page || location.hash.substring(1) || location.pathname,
                userId: this.angulartics2.settings.ga.userId,
                hitCallback: properties.hitCallback,
            };
            // add custom dimensions and metrics
            this.setDimensionsAndMetrics(properties);
            if (this.angulartics2.settings.ga.transport) {
                ga('send', 'event', eventOptions, {
                    transport: this.angulartics2.settings.ga.transport,
                });
            }
            else {
                ga('send', 'event', eventOptions);
            }
            for (const accountName of this.angulartics2.settings.ga.additionalAccountNames) {
                ga(accountName + '.send', 'event', eventOptions);
            }
        }
        else if (typeof _gaq !== 'undefined') {
            _gaq.push([
                '_trackEvent',
                properties.category,
                action,
                properties.label,
                properties.value,
                properties.noninteraction,
            ]);
        }
    }
    /**
     * Exception Track Event in GA
     *
     * @param properties Comprised of the optional fields:
     *  - fatal (string)
     *  - description (string)
     *
     * @https://developers.google.com/analytics/devguides/collection/analyticsjs/exceptions
     *
     * @link https://developers.google.com/analytics/devguides/collection/analyticsjs/events
     */
    exceptionTrack(properties) {
        if (properties.fatal === undefined) {
            console.log('No "fatal" provided, sending with fatal=true');
            properties.fatal = true;
        }
        properties.exDescription = properties.description;
        const eventOptions = {
            exFatal: properties.fatal,
            exDescription: properties.description,
        };
        ga('send', 'exception', eventOptions);
        for (const accountName of this.angulartics2.settings.ga.additionalAccountNames) {
            ga(accountName + '.send', 'exception', eventOptions);
        }
    }
    /**
     * User Timings Event in GA
     *
     * @param properties Comprised of the mandatory fields:
     *  - timingCategory (string)
     *  - timingVar (string)
     *  - timingValue (number)
     * Properties can also have the optional fields:
     *  - timingLabel (string)
     *
     * @link https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings
     */
    userTimings(properties) {
        if (!properties ||
            !properties.timingCategory ||
            !properties.timingVar ||
            !properties.timingValue) {
            console.error('Properties timingCategory, timingVar, and timingValue are required to be set.');
            return;
        }
        if (typeof ga !== 'undefined') {
            ga('send', 'timing', properties);
            for (const accountName of this.angulartics2.settings.ga.additionalAccountNames) {
                ga(accountName + '.send', 'timing', properties);
            }
        }
    }
    setUsername(userId) {
        this.angulartics2.settings.ga.userId = userId;
        if (typeof ga === 'undefined') {
            return;
        }
        ga('set', 'userId', userId);
    }
    setUserProperties(properties) {
        this.setDimensionsAndMetrics(properties);
    }
    setDimensionsAndMetrics(properties) {
        if (typeof ga === 'undefined') {
            return;
        }
        // clean previously used dimensions and metrics that will not be overriden
        this.dimensionsAndMetrics.forEach(elem => {
            if (!properties.hasOwnProperty(elem)) {
                ga('set', elem, undefined);
                this.angulartics2.settings.ga.additionalAccountNames.forEach((accountName) => {
                    ga(`${accountName}.set`, elem, undefined);
                });
            }
        });
        this.dimensionsAndMetrics = [];
        // add custom dimensions and metrics
        Object.keys(properties).forEach(key => {
            if (key.lastIndexOf('dimension', 0) === 0 ||
                key.lastIndexOf('metric', 0) === 0) {
                ga('set', key, properties[key]);
                this.angulartics2.settings.ga.additionalAccountNames.forEach((accountName) => {
                    ga(`${accountName}.set`, key, properties[key]);
                });
                this.dimensionsAndMetrics.push(key);
            }
        });
    }
};
Angulartics2GoogleAnalytics.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function Angulartics2GoogleAnalytics_Factory() { return new Angulartics2GoogleAnalytics(i0.ɵɵinject(i1.Angulartics2)); }, token: Angulartics2GoogleAnalytics, providedIn: "root" });
Angulartics2GoogleAnalytics = tslib_1.__decorate([
    Injectable({ providedIn: 'root' }),
    tslib_1.__metadata("design:paramtypes", [Angulartics2])
], Angulartics2GoogleAnalytics);
export { Angulartics2GoogleAnalytics };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2EuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFydGljczIvZ2EvIiwic291cmNlcyI6WyJnYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQ0wsWUFBWSxHQUdiLE1BQU0sY0FBYyxDQUFDOzs7QUFPdEIsTUFBTSxPQUFPLHVCQUF1QjtJQUFwQztRQUNFLDJCQUFzQixHQUFHLEVBQUUsQ0FBQztRQUM1QixXQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2QsY0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNmLGdCQUFXLEdBQUcsS0FBSyxDQUFDO0lBQ3RCLENBQUM7Q0FBQTtBQUdELElBQWEsMkJBQTJCLEdBQXhDLE1BQWEsMkJBQTJCO0lBSXRDLFlBQW9CLFlBQTBCO1FBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBSDlDLHlCQUFvQixHQUFHLEVBQUUsQ0FBQztRQUl4QixNQUFNLFFBQVEsR0FBRyxJQUFJLHVCQUF1QixFQUFFLENBQUM7UUFDL0MsMkNBQTJDO1FBQzNDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUscUJBQ3hCLFFBQVEsRUFDUixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQ2pDLENBQUM7UUFDRixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTO2FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUM7YUFDN0MsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVU7YUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzthQUM3QyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjO2FBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUM7YUFDN0MsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVzthQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQzdDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsU0FBUyxDQUFDLElBQVk7UUFDcEIsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLEtBQUssTUFBTSxXQUFXLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFO2dCQUM5RSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxHQUFHLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDcEQ7U0FDRjtRQUNELElBQUksT0FBTyxFQUFFLEtBQUssV0FBVyxJQUFJLEVBQUUsRUFBRTtZQUNuQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDeEQsS0FBSyxNQUFNLFdBQVcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUU7b0JBQzlFLEVBQUUsQ0FBQyxXQUFXLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3hFO2FBQ0Y7WUFDRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUU7Z0JBQzdDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMvQixLQUFLLE1BQU0sV0FBVyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRTtvQkFDOUUsRUFBRSxDQUFDLFdBQVcsR0FBRyxNQUFNLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUMvQzthQUNGO1lBQ0QsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0IsS0FBSyxNQUFNLFdBQVcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUU7Z0JBQzlFLEVBQUUsQ0FBQyxXQUFXLEdBQUcsT0FBTyxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM3QztTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILFVBQVUsQ0FBQyxNQUFjLEVBQUUsVUFBZTtRQUN4Qyw4Q0FBOEM7UUFDOUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7WUFDdkMsVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFLENBQUM7WUFDOUIsVUFBVSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7U0FDL0I7UUFDRCxrREFBa0Q7UUFDbEQsc0dBQXNHO1FBQ3RHLHVEQUF1RDtRQUN2RCxJQUFJLFVBQVUsQ0FBQyxLQUFLLEVBQUU7WUFDcEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUMsVUFBVSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQy9DO1FBRUQsSUFBSSxPQUFPLEVBQUUsS0FBSyxXQUFXLEVBQUU7WUFDN0IsTUFBTSxZQUFZLEdBQUc7Z0JBQ25CLGFBQWEsRUFBRSxVQUFVLENBQUMsUUFBUTtnQkFDbEMsV0FBVyxFQUFFLE1BQU07Z0JBQ25CLFVBQVUsRUFBRSxVQUFVLENBQUMsS0FBSztnQkFDNUIsVUFBVSxFQUFFLFVBQVUsQ0FBQyxLQUFLO2dCQUM1QixjQUFjLEVBQUUsVUFBVSxDQUFDLGNBQWM7Z0JBQ3pDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRO2dCQUN4RSxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU07Z0JBQzVDLFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVzthQUNwQyxDQUFDO1lBRUYsb0NBQW9DO1lBQ3BDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUU7Z0JBQzNDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRTtvQkFDaEMsU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTO2lCQUNuRCxDQUFDLENBQUM7YUFDSjtpQkFBTTtnQkFDTCxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQzthQUNuQztZQUVELEtBQUssTUFBTSxXQUFXLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFO2dCQUM5RSxFQUFFLENBQUMsV0FBVyxHQUFHLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDbEQ7U0FDRjthQUFNLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ1IsYUFBYTtnQkFDYixVQUFVLENBQUMsUUFBUTtnQkFDbkIsTUFBTTtnQkFDTixVQUFVLENBQUMsS0FBSztnQkFDaEIsVUFBVSxDQUFDLEtBQUs7Z0JBQ2hCLFVBQVUsQ0FBQyxjQUFjO2FBQzFCLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxjQUFjLENBQUMsVUFBZTtRQUM1QixJQUFJLFVBQVUsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsOENBQThDLENBQUMsQ0FBQztZQUM1RCxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztTQUN6QjtRQUVELFVBQVUsQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQztRQUVsRCxNQUFNLFlBQVksR0FBRztZQUNuQixPQUFPLEVBQUUsVUFBVSxDQUFDLEtBQUs7WUFDekIsYUFBYSxFQUFFLFVBQVUsQ0FBQyxXQUFXO1NBQ3RDLENBQUM7UUFFRixFQUFFLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN0QyxLQUFLLE1BQU0sV0FBVyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRTtZQUM5RSxFQUFFLENBQUMsV0FBVyxHQUFHLE9BQU8sRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDdEQ7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxXQUFXLENBQUMsVUFBdUI7UUFDakMsSUFDRSxDQUFDLFVBQVU7WUFDWCxDQUFDLFVBQVUsQ0FBQyxjQUFjO1lBQzFCLENBQUMsVUFBVSxDQUFDLFNBQVM7WUFDckIsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUN2QjtZQUNBLE9BQU8sQ0FBQyxLQUFLLENBQ1gsK0VBQStFLENBQ2hGLENBQUM7WUFDRixPQUFPO1NBQ1I7UUFFRCxJQUFJLE9BQU8sRUFBRSxLQUFLLFdBQVcsRUFBRTtZQUM3QixFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNqQyxLQUFLLE1BQU0sV0FBVyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRTtnQkFDOUUsRUFBRSxDQUFDLFdBQVcsR0FBRyxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ2pEO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQWM7UUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDOUMsSUFBSSxPQUFPLEVBQUUsS0FBSyxXQUFXLEVBQUU7WUFDN0IsT0FBTztTQUNSO1FBQ0QsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELGlCQUFpQixDQUFDLFVBQWU7UUFDL0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxVQUFlO1FBQzdDLElBQUksT0FBTyxFQUFFLEtBQUssV0FBVyxFQUFFO1lBQzdCLE9BQU87U0FDUjtRQUNELDBFQUEwRTtRQUMxRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNwQyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFFM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FDMUQsQ0FBQyxXQUFtQixFQUFFLEVBQUU7b0JBQ3RCLEVBQUUsQ0FBQyxHQUFHLFdBQVcsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDNUMsQ0FBQyxDQUNGLENBQUM7YUFDSDtRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztRQUUvQixvQ0FBb0M7UUFDcEMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDcEMsSUFDRSxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNyQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQ2xDO2dCQUNBLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVoQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsT0FBTyxDQUMxRCxDQUFDLFdBQW1CLEVBQUUsRUFBRTtvQkFDdEIsRUFBRSxDQUFDLEdBQUcsV0FBVyxNQUFNLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDLENBQ0YsQ0FBQztnQkFDRixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3JDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YsQ0FBQTs7QUF4T1ksMkJBQTJCO0lBRHZDLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQzs2Q0FLQyxZQUFZO0dBSm5DLDJCQUEyQixDQXdPdkM7U0F4T1ksMkJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBBbmd1bGFydGljczIsXG4gIEdvb2dsZUFuYWx5dGljc1NldHRpbmdzLFxuICBVc2VyVGltaW5ncyxcbn0gZnJvbSAnYW5ndWxhcnRpY3MyJztcblxuXG5kZWNsYXJlIHZhciBfZ2FxOiBHb29nbGVBbmFseXRpY3NDb2RlO1xuZGVjbGFyZSB2YXIgZ2E6IFVuaXZlcnNhbEFuYWx5dGljcy5nYTtcbmRlY2xhcmUgdmFyIGxvY2F0aW9uOiBhbnk7XG5cbmV4cG9ydCBjbGFzcyBHb29nbGVBbmFseXRpY3NEZWZhdWx0cyBpbXBsZW1lbnRzIEdvb2dsZUFuYWx5dGljc1NldHRpbmdzIHtcbiAgYWRkaXRpb25hbEFjY291bnROYW1lcyA9IFtdO1xuICB1c2VySWQgPSBudWxsO1xuICB0cmFuc3BvcnQgPSAnJztcbiAgYW5vbnltaXplSXAgPSBmYWxzZTtcbn1cblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBBbmd1bGFydGljczJHb29nbGVBbmFseXRpY3Mge1xuICBkaW1lbnNpb25zQW5kTWV0cmljcyA9IFtdO1xuICBzZXR0aW5nczogUGFydGlhbDxHb29nbGVBbmFseXRpY3NTZXR0aW5ncz47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBhbmd1bGFydGljczI6IEFuZ3VsYXJ0aWNzMikge1xuICAgIGNvbnN0IGRlZmF1bHRzID0gbmV3IEdvb2dsZUFuYWx5dGljc0RlZmF1bHRzKCk7XG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0IHNldHRpbmdzIGZvciB0aGlzIG1vZHVsZVxuICAgIHRoaXMuYW5ndWxhcnRpY3MyLnNldHRpbmdzLmdhID0ge1xuICAgICAgLi4uZGVmYXVsdHMsXG4gICAgICAuLi50aGlzLmFuZ3VsYXJ0aWNzMi5zZXR0aW5ncy5nYSxcbiAgICB9O1xuICAgIHRoaXMuc2V0dGluZ3MgPSB0aGlzLmFuZ3VsYXJ0aWNzMi5zZXR0aW5ncy5nYTtcbiAgICB0aGlzLmFuZ3VsYXJ0aWNzMi5zZXRVc2VybmFtZS5zdWJzY3JpYmUoKHg6IHN0cmluZykgPT4gdGhpcy5zZXRVc2VybmFtZSh4KSk7XG4gICAgdGhpcy5hbmd1bGFydGljczIuc2V0VXNlclByb3BlcnRpZXMuc3Vic2NyaWJlKHggPT4gdGhpcy5zZXRVc2VyUHJvcGVydGllcyh4KSk7XG4gIH1cblxuICBzdGFydFRyYWNraW5nKCk6IHZvaWQge1xuICAgIHRoaXMuYW5ndWxhcnRpY3MyLnBhZ2VUcmFja1xuICAgICAgLnBpcGUodGhpcy5hbmd1bGFydGljczIuZmlsdGVyRGV2ZWxvcGVyTW9kZSgpKVxuICAgICAgLnN1YnNjcmliZSh4ID0+IHRoaXMucGFnZVRyYWNrKHgucGF0aCkpO1xuICAgIHRoaXMuYW5ndWxhcnRpY3MyLmV2ZW50VHJhY2tcbiAgICAgIC5waXBlKHRoaXMuYW5ndWxhcnRpY3MyLmZpbHRlckRldmVsb3Blck1vZGUoKSlcbiAgICAgIC5zdWJzY3JpYmUoeCA9PiB0aGlzLmV2ZW50VHJhY2soeC5hY3Rpb24sIHgucHJvcGVydGllcykpO1xuICAgIHRoaXMuYW5ndWxhcnRpY3MyLmV4Y2VwdGlvblRyYWNrXG4gICAgICAucGlwZSh0aGlzLmFuZ3VsYXJ0aWNzMi5maWx0ZXJEZXZlbG9wZXJNb2RlKCkpXG4gICAgICAuc3Vic2NyaWJlKHggPT4gdGhpcy5leGNlcHRpb25UcmFjayh4KSk7XG4gICAgdGhpcy5hbmd1bGFydGljczIudXNlclRpbWluZ3NcbiAgICAgIC5waXBlKHRoaXMuYW5ndWxhcnRpY3MyLmZpbHRlckRldmVsb3Blck1vZGUoKSlcbiAgICAgIC5zdWJzY3JpYmUoeCA9PiB0aGlzLnVzZXJUaW1pbmdzKHgpKTtcbiAgfVxuXG4gIHBhZ2VUcmFjayhwYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAodHlwZW9mIF9nYXEgIT09ICd1bmRlZmluZWQnICYmIF9nYXEpIHtcbiAgICAgIF9nYXEucHVzaChbJ190cmFja1BhZ2V2aWV3JywgcGF0aF0pO1xuICAgICAgZm9yIChjb25zdCBhY2NvdW50TmFtZSBvZiB0aGlzLmFuZ3VsYXJ0aWNzMi5zZXR0aW5ncy5nYS5hZGRpdGlvbmFsQWNjb3VudE5hbWVzKSB7XG4gICAgICAgIF9nYXEucHVzaChbYWNjb3VudE5hbWUgKyAnLl90cmFja1BhZ2V2aWV3JywgcGF0aF0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGdhICE9PSAndW5kZWZpbmVkJyAmJiBnYSkge1xuICAgICAgaWYgKHRoaXMuYW5ndWxhcnRpY3MyLnNldHRpbmdzLmdhLnVzZXJJZCkge1xuICAgICAgICBnYSgnc2V0JywgJyZ1aWQnLCB0aGlzLmFuZ3VsYXJ0aWNzMi5zZXR0aW5ncy5nYS51c2VySWQpO1xuICAgICAgICBmb3IgKGNvbnN0IGFjY291bnROYW1lIG9mIHRoaXMuYW5ndWxhcnRpY3MyLnNldHRpbmdzLmdhLmFkZGl0aW9uYWxBY2NvdW50TmFtZXMpIHtcbiAgICAgICAgICBnYShhY2NvdW50TmFtZSArICcuc2V0JywgJyZ1aWQnLCB0aGlzLmFuZ3VsYXJ0aWNzMi5zZXR0aW5ncy5nYS51c2VySWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5hbmd1bGFydGljczIuc2V0dGluZ3MuZ2EuYW5vbnltaXplSXApIHtcbiAgICAgICAgZ2EoJ3NldCcsICdhbm9ueW1pemVJcCcsIHRydWUpO1xuICAgICAgICBmb3IgKGNvbnN0IGFjY291bnROYW1lIG9mIHRoaXMuYW5ndWxhcnRpY3MyLnNldHRpbmdzLmdhLmFkZGl0aW9uYWxBY2NvdW50TmFtZXMpIHtcbiAgICAgICAgICBnYShhY2NvdW50TmFtZSArICcuc2V0JywgJ2Fub255bWl6ZUlwJywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGdhKCdzZW5kJywgJ3BhZ2V2aWV3JywgcGF0aCk7XG4gICAgICBmb3IgKGNvbnN0IGFjY291bnROYW1lIG9mIHRoaXMuYW5ndWxhcnRpY3MyLnNldHRpbmdzLmdhLmFkZGl0aW9uYWxBY2NvdW50TmFtZXMpIHtcbiAgICAgICAgZ2EoYWNjb3VudE5hbWUgKyAnLnNlbmQnLCAncGFnZXZpZXcnLCBwYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJhY2sgRXZlbnQgaW4gR0FcbiAgICpcbiAgICogQHBhcmFtIGFjdGlvbiBBc3NvY2lhdGVkIHdpdGggdGhlIGV2ZW50XG4gICAqIEBwYXJhbSBwcm9wZXJ0aWVzIENvbXByaXNlZCBvZjpcbiAgICogIC0gY2F0ZWdvcnkgKHN0cmluZykgYW5kIG9wdGlvbmFsXG4gICAqICAtIGxhYmVsIChzdHJpbmcpXG4gICAqICAtIHZhbHVlIChpbnRlZ2VyKVxuICAgKiAgLSBub25pbnRlcmFjdGlvbiAoYm9vbGVhbilcbiAgICpcbiAgICogQGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vYW5hbHl0aWNzL2Rldmd1aWRlcy9jb2xsZWN0aW9uL2dhanMvZXZlbnRUcmFja2VyR3VpZGUjU2V0dGluZ1VwRXZlbnRUcmFja2luZ1xuICAgKiBAbGluayBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9hbmFseXRpY3MvZGV2Z3VpZGVzL2NvbGxlY3Rpb24vYW5hbHl0aWNzanMvZXZlbnRzXG4gICAqL1xuICBldmVudFRyYWNrKGFjdGlvbjogc3RyaW5nLCBwcm9wZXJ0aWVzOiBhbnkpIHtcbiAgICAvLyBHb29nbGUgQW5hbHl0aWNzIHJlcXVpcmVzIGFuIEV2ZW50IENhdGVnb3J5XG4gICAgaWYgKCFwcm9wZXJ0aWVzIHx8ICFwcm9wZXJ0aWVzLmNhdGVnb3J5KSB7XG4gICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCB7fTtcbiAgICAgIHByb3BlcnRpZXMuY2F0ZWdvcnkgPSAnRXZlbnQnO1xuICAgIH1cbiAgICAvLyBHQSByZXF1aXJlcyB0aGF0IGV2ZW50VmFsdWUgYmUgYW4gaW50ZWdlciwgc2VlOlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2FuYWx5dGljcy9kZXZndWlkZXMvY29sbGVjdGlvbi9hbmFseXRpY3Nqcy9maWVsZC1yZWZlcmVuY2UjZXZlbnRWYWx1ZVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9sdWlzZmFyemF0aS9hbmd1bGFydGljcy9pc3N1ZXMvODFcbiAgICBpZiAocHJvcGVydGllcy52YWx1ZSkge1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VJbnQocHJvcGVydGllcy52YWx1ZSwgMTApO1xuICAgICAgcHJvcGVydGllcy52YWx1ZSA9IGlzTmFOKHBhcnNlZCkgPyAwIDogcGFyc2VkO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZ2EgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCBldmVudE9wdGlvbnMgPSB7XG4gICAgICAgIGV2ZW50Q2F0ZWdvcnk6IHByb3BlcnRpZXMuY2F0ZWdvcnksXG4gICAgICAgIGV2ZW50QWN0aW9uOiBhY3Rpb24sXG4gICAgICAgIGV2ZW50TGFiZWw6IHByb3BlcnRpZXMubGFiZWwsXG4gICAgICAgIGV2ZW50VmFsdWU6IHByb3BlcnRpZXMudmFsdWUsXG4gICAgICAgIG5vbkludGVyYWN0aW9uOiBwcm9wZXJ0aWVzLm5vbmludGVyYWN0aW9uLFxuICAgICAgICBwYWdlOiBwcm9wZXJ0aWVzLnBhZ2UgfHwgbG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkgfHwgbG9jYXRpb24ucGF0aG5hbWUsXG4gICAgICAgIHVzZXJJZDogdGhpcy5hbmd1bGFydGljczIuc2V0dGluZ3MuZ2EudXNlcklkLFxuICAgICAgICBoaXRDYWxsYmFjazogcHJvcGVydGllcy5oaXRDYWxsYmFjayxcbiAgICAgIH07XG5cbiAgICAgIC8vIGFkZCBjdXN0b20gZGltZW5zaW9ucyBhbmQgbWV0cmljc1xuICAgICAgdGhpcy5zZXREaW1lbnNpb25zQW5kTWV0cmljcyhwcm9wZXJ0aWVzKTtcbiAgICAgIGlmICh0aGlzLmFuZ3VsYXJ0aWNzMi5zZXR0aW5ncy5nYS50cmFuc3BvcnQpIHtcbiAgICAgICAgZ2EoJ3NlbmQnLCAnZXZlbnQnLCBldmVudE9wdGlvbnMsIHtcbiAgICAgICAgICB0cmFuc3BvcnQ6IHRoaXMuYW5ndWxhcnRpY3MyLnNldHRpbmdzLmdhLnRyYW5zcG9ydCxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnYSgnc2VuZCcsICdldmVudCcsIGV2ZW50T3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgYWNjb3VudE5hbWUgb2YgdGhpcy5hbmd1bGFydGljczIuc2V0dGluZ3MuZ2EuYWRkaXRpb25hbEFjY291bnROYW1lcykge1xuICAgICAgICBnYShhY2NvdW50TmFtZSArICcuc2VuZCcsICdldmVudCcsIGV2ZW50T3B0aW9ucyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgX2dhcSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIF9nYXEucHVzaChbXG4gICAgICAgICdfdHJhY2tFdmVudCcsXG4gICAgICAgIHByb3BlcnRpZXMuY2F0ZWdvcnksXG4gICAgICAgIGFjdGlvbixcbiAgICAgICAgcHJvcGVydGllcy5sYWJlbCxcbiAgICAgICAgcHJvcGVydGllcy52YWx1ZSxcbiAgICAgICAgcHJvcGVydGllcy5ub25pbnRlcmFjdGlvbixcbiAgICAgIF0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeGNlcHRpb24gVHJhY2sgRXZlbnQgaW4gR0FcbiAgICpcbiAgICogQHBhcmFtIHByb3BlcnRpZXMgQ29tcHJpc2VkIG9mIHRoZSBvcHRpb25hbCBmaWVsZHM6XG4gICAqICAtIGZhdGFsIChzdHJpbmcpXG4gICAqICAtIGRlc2NyaXB0aW9uIChzdHJpbmcpXG4gICAqXG4gICAqIEBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9hbmFseXRpY3MvZGV2Z3VpZGVzL2NvbGxlY3Rpb24vYW5hbHl0aWNzanMvZXhjZXB0aW9uc1xuICAgKlxuICAgKiBAbGluayBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9hbmFseXRpY3MvZGV2Z3VpZGVzL2NvbGxlY3Rpb24vYW5hbHl0aWNzanMvZXZlbnRzXG4gICAqL1xuICBleGNlcHRpb25UcmFjayhwcm9wZXJ0aWVzOiBhbnkpIHtcbiAgICBpZiAocHJvcGVydGllcy5mYXRhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLmxvZygnTm8gXCJmYXRhbFwiIHByb3ZpZGVkLCBzZW5kaW5nIHdpdGggZmF0YWw9dHJ1ZScpO1xuICAgICAgcHJvcGVydGllcy5mYXRhbCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJvcGVydGllcy5leERlc2NyaXB0aW9uID0gcHJvcGVydGllcy5kZXNjcmlwdGlvbjtcblxuICAgIGNvbnN0IGV2ZW50T3B0aW9ucyA9IHtcbiAgICAgIGV4RmF0YWw6IHByb3BlcnRpZXMuZmF0YWwsXG4gICAgICBleERlc2NyaXB0aW9uOiBwcm9wZXJ0aWVzLmRlc2NyaXB0aW9uLFxuICAgIH07XG5cbiAgICBnYSgnc2VuZCcsICdleGNlcHRpb24nLCBldmVudE9wdGlvbnMpO1xuICAgIGZvciAoY29uc3QgYWNjb3VudE5hbWUgb2YgdGhpcy5hbmd1bGFydGljczIuc2V0dGluZ3MuZ2EuYWRkaXRpb25hbEFjY291bnROYW1lcykge1xuICAgICAgZ2EoYWNjb3VudE5hbWUgKyAnLnNlbmQnLCAnZXhjZXB0aW9uJywgZXZlbnRPcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXNlciBUaW1pbmdzIEV2ZW50IGluIEdBXG4gICAqXG4gICAqIEBwYXJhbSBwcm9wZXJ0aWVzIENvbXByaXNlZCBvZiB0aGUgbWFuZGF0b3J5IGZpZWxkczpcbiAgICogIC0gdGltaW5nQ2F0ZWdvcnkgKHN0cmluZylcbiAgICogIC0gdGltaW5nVmFyIChzdHJpbmcpXG4gICAqICAtIHRpbWluZ1ZhbHVlIChudW1iZXIpXG4gICAqIFByb3BlcnRpZXMgY2FuIGFsc28gaGF2ZSB0aGUgb3B0aW9uYWwgZmllbGRzOlxuICAgKiAgLSB0aW1pbmdMYWJlbCAoc3RyaW5nKVxuICAgKlxuICAgKiBAbGluayBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9hbmFseXRpY3MvZGV2Z3VpZGVzL2NvbGxlY3Rpb24vYW5hbHl0aWNzanMvdXNlci10aW1pbmdzXG4gICAqL1xuICB1c2VyVGltaW5ncyhwcm9wZXJ0aWVzOiBVc2VyVGltaW5ncykge1xuICAgIGlmIChcbiAgICAgICFwcm9wZXJ0aWVzIHx8XG4gICAgICAhcHJvcGVydGllcy50aW1pbmdDYXRlZ29yeSB8fFxuICAgICAgIXByb3BlcnRpZXMudGltaW5nVmFyIHx8XG4gICAgICAhcHJvcGVydGllcy50aW1pbmdWYWx1ZVxuICAgICkge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgJ1Byb3BlcnRpZXMgdGltaW5nQ2F0ZWdvcnksIHRpbWluZ1ZhciwgYW5kIHRpbWluZ1ZhbHVlIGFyZSByZXF1aXJlZCB0byBiZSBzZXQuJyxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBnYSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGdhKCdzZW5kJywgJ3RpbWluZycsIHByb3BlcnRpZXMpO1xuICAgICAgZm9yIChjb25zdCBhY2NvdW50TmFtZSBvZiB0aGlzLmFuZ3VsYXJ0aWNzMi5zZXR0aW5ncy5nYS5hZGRpdGlvbmFsQWNjb3VudE5hbWVzKSB7XG4gICAgICAgIGdhKGFjY291bnROYW1lICsgJy5zZW5kJywgJ3RpbWluZycsIHByb3BlcnRpZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFVzZXJuYW1lKHVzZXJJZDogc3RyaW5nKSB7XG4gICAgdGhpcy5hbmd1bGFydGljczIuc2V0dGluZ3MuZ2EudXNlcklkID0gdXNlcklkO1xuICAgIGlmICh0eXBlb2YgZ2EgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGdhKCdzZXQnLCAndXNlcklkJywgdXNlcklkKTtcbiAgfVxuXG4gIHNldFVzZXJQcm9wZXJ0aWVzKHByb3BlcnRpZXM6IGFueSkge1xuICAgIHRoaXMuc2V0RGltZW5zaW9uc0FuZE1ldHJpY3MocHJvcGVydGllcyk7XG4gIH1cblxuICBwcml2YXRlIHNldERpbWVuc2lvbnNBbmRNZXRyaWNzKHByb3BlcnRpZXM6IGFueSkge1xuICAgIGlmICh0eXBlb2YgZ2EgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGNsZWFuIHByZXZpb3VzbHkgdXNlZCBkaW1lbnNpb25zIGFuZCBtZXRyaWNzIHRoYXQgd2lsbCBub3QgYmUgb3ZlcnJpZGVuXG4gICAgdGhpcy5kaW1lbnNpb25zQW5kTWV0cmljcy5mb3JFYWNoKGVsZW0gPT4ge1xuICAgICAgaWYgKCFwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KGVsZW0pKSB7XG4gICAgICAgIGdhKCdzZXQnLCBlbGVtLCB1bmRlZmluZWQpO1xuXG4gICAgICAgIHRoaXMuYW5ndWxhcnRpY3MyLnNldHRpbmdzLmdhLmFkZGl0aW9uYWxBY2NvdW50TmFtZXMuZm9yRWFjaChcbiAgICAgICAgICAoYWNjb3VudE5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgZ2EoYCR7YWNjb3VudE5hbWV9LnNldGAsIGVsZW0sIHVuZGVmaW5lZCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmRpbWVuc2lvbnNBbmRNZXRyaWNzID0gW107XG5cbiAgICAvLyBhZGQgY3VzdG9tIGRpbWVuc2lvbnMgYW5kIG1ldHJpY3NcbiAgICBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGtleS5sYXN0SW5kZXhPZignZGltZW5zaW9uJywgMCkgPT09IDAgfHxcbiAgICAgICAga2V5Lmxhc3RJbmRleE9mKCdtZXRyaWMnLCAwKSA9PT0gMFxuICAgICAgKSB7XG4gICAgICAgIGdhKCdzZXQnLCBrZXksIHByb3BlcnRpZXNba2V5XSk7XG5cbiAgICAgICAgdGhpcy5hbmd1bGFydGljczIuc2V0dGluZ3MuZ2EuYWRkaXRpb25hbEFjY291bnROYW1lcy5mb3JFYWNoKFxuICAgICAgICAgIChhY2NvdW50TmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBnYShgJHthY2NvdW50TmFtZX0uc2V0YCwga2V5LCBwcm9wZXJ0aWVzW2tleV0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuZGltZW5zaW9uc0FuZE1ldHJpY3MucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=