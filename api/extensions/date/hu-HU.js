/*global window, dope*/

dope.initComponent({
    name: 'date.extensions.hu-HU',
    init (dope) {
        'use strict';

        const loc = Object.create(Date.localizationBase);

        const weekDays = [
            'Vasárnap',
            'Hétfő',
            'Kedd',
            'Szerda',
            'Csütörtök',
            'Péntek',
            'Szombat'];

        const months = [
            'Január',
            'Fbruár',
            'Március',
            'Április',
            'Május',
            'Június',
            'Július',
            'Augusztus',
            'Szeptember',
            'Október',
            'November',
            'December'];

        Date.localizations['hu-HU'] = Object.assign(loc, {
            d (d) {
                return dope.sprintf('%04d.%02d.%02d.', d.year, d.month + 1, d.date);
            },
            D (d) {
                return dope.sprintf('%04d. %s %02d.', d.year, months[d.month], d.date);
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
            t (d) {
                return dope.sprintf('%d:%02d', d.hours, d.minutes);
            },
            T (d) {
                return dope.sprintf('%d:%02d:%02d', d.hours, d.minutes, d.seconds);
            },
            M (d) {
                return `${months[d.month]} ${d.date}.`;
            },
            Y (d) {
                return `${d.year}. ${months[d.month]}`;
            },
            MMMM (date) {
                return months[date.month];
            }
        });

        Object.assign(Date.localizations['hu-HU'], {
            m: Date.localizations['hu-HU'].M,
            r: Date.localizations['hu-HU'].R,
            y: Date.localizations['hu-HU'].Y
        });
    }
});