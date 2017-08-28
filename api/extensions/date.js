/*global window, dope*/

dope.initComponent({
    name: 'extensions.date',
    depends: 'extensions.string',
    init (dope) {
        'use strict';

        const regexJsonMilliseconds = /\.[0-9]+(Z|\+[0-9]{1,2}(:[0-9]{1,2})?)$/i;
        const monthLengths = [
            31, // jan
            NaN, // feb
            31,  // mar
            30,  // apr
            31,  // may
            30,  // jun
            31,  // jul
            31,  // aug
            30,  // sep
            31,  // okt
            30,  // nov
            31  // dec
        ];
        const cc = value => {
            return {
                value: value,
                enumerable: true,
                writable: false,
                configurable: false
            };
        };

        Object.def(Date, {
            MillisecondsInSecond: cc(1000),
            MillisecondsInMinute: cc(1000 * 60),
            MillisecondsInHour: cc(1000 * 60 * 60),
            MillisecondsInDay: cc(1000 * 60 * 60 * 24),
            localizationComponents: {
                value: {},
                enumerable: false,
                writable: false,
                configurable: false
            },
            localizations: {
                value: {},
                enumerable: false,
                writable: false,
                configurable: false
            },
            localizationBase : {
                value: {
                    R (d) {
                        return d.toUTCString();
                    },
                    s (d) {
                        return dope.sprintf('%04d-%02d-%02dT%02d:%02d:%02d', d.year, d.month + 1, d.date, d.hours, d.minutes, d.seconds);
                    },
                    u (d) {
                        return dope.sprintf('%04d-%02d-%02dT%02d:%02d:%02dZ', d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate() + 1, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
                    }
                },
                enumerable: false,
                writable: false,
                configurable: false
            }
        });

        Object.assign(Date, {
            loadLocalization (locale) {
                if (!Date.localizationComponents[locale]) {
                    Date.localizationComponents[locale] = dope.Components.load(`extensions.date.${locale}`);
                }
                return Date.localizationComponents[locale];
            },
            /**
             * Checks whether the specified object is a valid {@link Date} instance.
             *
             * @method
             * @static
             * @memberof Date
             * @param {*} obj - Value to check.
             * @returns {Boolean} - _true_ is the argument is valid {@link Date} instance, otherwise _false_.
             */
            isValid (obj) {
                return obj && obj instanceof Date && obj.isValid;
            },
            /**
             * Parses JSON date as {@link Date}.
             *
             * @param {String|Date} json
             * @returns {Date} - Parsed {@link Date} instance.
             */
            fromJSON (json) {
                if (json instanceof Date) {
                    return json;
                }
                if ('string' === typeof json) {
                    const fixed = json.replace(regexJsonMilliseconds, '$1');
                    return new Date(fixed);
                }
                throw new TypeError('invalid JSON date.');
            },
            fromMilliseconds (milliseconds) {
                const result = new Date();
                result.setTime(milliseconds);
                return result;
            },
            /**
             * Returns month length in days.
             *
             * @param {Number} month - Target month.
             * @param {Number} year - Target year.
             * @returns {Number} - Amount of days within the specofoed month.
             */
            getMonthLength (month, year) {
                if (month < 0 || month > 11) {
                    throw new RangeError('month out of range');
                }
                if (month !== 1) {
                    return monthLengths[month];
                }
                return (0 === year % 4 && (0 !== year % 100 || 0 === year % 400)) ? 29 : 28;
            },
            noon () {
                const now = new Date();
                return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
            }
        });

        let currentLocale = (dope.Interop && dope.Interop.getArg('current-locale')) || 'en-US';
        const currentLocaleLoaded = Date.loadLocalization(currentLocale);

        Date.setDefaultLocale = locale => {
            currentLocale = locale;
            return Date.loadLocalization(currentLocale);
        };

        Object.def(Date.prototype, {
            isValid: {
                get () {
                    return !isNaN(this.getTime());
                }
            },
            year: {
                get: Date.prototype.getFullYear,
                set: Date.prototype.setFullYear
            },
            month: {
                get: Date.prototype.getMonth,
                set: Date.prototype.setMonth
            },
            date: {
                get: Date.prototype.getDate,
                set: Date.prototype.setDate
            },
            day: {
                get: Date.prototype.getDay
            },
            hours: {
                get: Date.prototype.getHours,
                set: Date.prototype.setHours
            },
            minutes: {
                get: Date.prototype.getMinutes,
                set: Date.prototype.setMinutes
            },
            seconds: {
                get: Date.prototype.getSeconds,
                set: Date.prototype.setSeconds
            },
            milliseconds: {
                get: Date.prototype.getMilliseconds,
                set: Date.prototype.setMilliseconds
            }
        });

        const toString = String.prototype.toString;

        Object.assign(Date.prototype, {
            addMilliseconds (milliseconds) {
                return Date.fromMilliseconds(this.getTime() + milliseconds);
            },
            addSeconds (seconds) {
                return this.addMilliseconds(Math.round(seconds * Date.MillisecondsInSecond));
            },
            addMinutes (minutes) {
                return this.addMilliseconds(Math.round(minutes * Date.MillisecondsInMinute));
            },
            addHours (hours) {
                return this.addMilliseconds(Math.round(hours * Date.MillisecondsInHour));
            },
            addDays (days) {
                return this.addDays(Math.round(days * Date.MillisecondsInDay));
            },
            addMonths (months) {
                var res = this.addDays(0),
                    m,
                    y;
                if (0 < months) {
                    while (0 < months) {
                        res = res.addDays(Date.getMonthLength(res.getMonth(), res.getFullYear()) * Math.min(months, 1));
                        months = months - 1;
                    }
                } else {
                    while (0 > months) {
                        m = res.getMonth() - 1;
                        y = res.getFullYear();
                        if (m < 0) {
                            m = 11;
                            y = y - 1;
                        }
                        res = res.addDays(Date.getMonthLength(m, y) * Math.max(months, -1));
                        months = months + 1;
                    }
                }
                return res;
            },
            toString (fmt, locale) {
                var loc;
                if (!fmt) {
                    return toString.call(this);
                }
                if (locale) {
                    if (dope.undef === Date.localizations[locale]) {
                        throw new dope.Exception(`date localizations for ${locale} has not been loaded.`);
                    }
                    loc = Date.localizations[locale];
                } else {
                    loc = Date.localizations[currentLocale];
                }
                if ('function' !== typeof loc[fmt]) {
                    throw new dope.Exception(`format ${fmt} is not dupported by localization for ${locale || currentLocale}.`);
                }
                return loc[fmt].call(loc[fmt], this);
            }
        });

        return currentLocaleLoaded;
    }
});