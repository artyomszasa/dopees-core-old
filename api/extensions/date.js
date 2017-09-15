/*global window*/

(function () {
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

    Object.defineProperties(Date, {
        MillisecondsInSecond: cc(1000),
        MillisecondsInMinute: cc(1000 * 60),
        MillisecondsInHour: cc(1000 * 60 * 60),
        MillisecondsInDay: cc(1000 * 60 * 60 * 24)
    });

    Object.assign(Date, {
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
        fromTime (milliseconds) {
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

    Object.defineProperties(Date.prototype, {
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

    Object.assign(Date.prototype, {
        addMilliseconds (milliseconds) {
            const res = Date.fromTime(this.getTime() + milliseconds);
            const offsetDelta = this.getTimezoneOffset() - res.getTimezoneOffset();
            if (offsetDelta !== 0) {
                const adjust = offsetDelta * Date.MillisecondsInMinute;
                res.setTime(res.getTime() - adjust);
            }
            return res;
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
            return this.addMilliseconds(Math.round(days * Date.MillisecondsInDay));
        },
        addMonths (months) {
            if (0 === months) {
                return this.addDays(0);
            }
            if (0 < months) {
                const full = Math.floor(months) + this.month;
                const fm = full % 12;
                const fy = Math.floor(full / 12);
                let res = new Date(this.year + fy, fm, Math.min(Date.getMonthLength(fm, this.year + fy), this.date), this.hours, this.minutes, this.seconds, this.milliseconds);
                const part = months % 1;
                if (0 === part) {
                    return res;
                }
                return res.addDays(Date.getMonthLength(res.month, res.year) * part);
            } else {
                const abs = Math.abs(months);
                let m = this.month - Math.floor(abs);
                let y = this.year;
                while (0 > m) {
                    y = y - 1;
                    m = m + 12;
                }
                const part = abs % 1;
                if (0 === part) {
                    return new Date(y, m, this.date, this.hours, this.minutes, this.seconds, this.milliseconds);
                }
                if (0 === m) {
                    y = y - 1;
                    m = 11;
                } else {
                    m = m - 1;
                }
                const days = Date.getMonthLength(m, y);
                const toAdd = days * (1 - part);
                return new Date(y, m, this.date, this.hours, this.minutes, this.seconds, this.milliseconds).addDays(toAdd);
            }
        }
    });
}());