/*global window, dope*/

dope.initComponent({
    name: 'date.extensions.en-US',
    init (dope) {
        'use strict';

        const loc = Object.create(Date.localizationBase);

        const weekDays = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'];

        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'];

        Date.localizations['en-US'] = Object.assign(loc, {
            d (date) {
                return `${date.month + 1}/${date.date}/${date.year}`;
            },
            D (date) {
                return `${weekDays[date.day]}, ${months[date.month]} ${date.date}, ${date.year}`;
            },
            f (date) {
                return `${this.D(date)} ${this.t(date)}`;
            },
            F (date) {
                return `${this.D(date)} ${this.T(date)}`;
            },
            g (date) {
                return `${this.d(date)} ${this.t(date)}`;
            },
            G (date) {
                return `${this.d(date)} ${this.T(date)}`;
            },
            t (date) {
                let hours = date.hours;
                let m = 'AM';
                if (hours >= 12) {
                    hours = hours - 12;
                    m = 'PM';
                }
                return dope.sprintf('%d:%02d %s', hours, date.minutes, m);
            },
            T (date) {
                let hours = date.hours;
                let m = 'AM';
                if (hours >= 12) {
                    hours = hours - 12;
                    m = 'PM';
                }
                return dope.sprintf('%d:%02d:%02d %s', hours, date.minutes, date.seconds, m);
            },
            M (date) {
                return `${months[date.month]} ${date.date}`;
            },
            Y (date) {
                return `${months[date.month]} ${date.year}`;
            },
            MMMM (date) {
                return months[date.month];
            }
        });

        Object.assign(Date.localizations['en-US'], {
            m: Date.localizations['en-US'].M,
            r: Date.localizations['en-US'].R,
            y: Date.localizations['en-US'].Y
        });
    }
});