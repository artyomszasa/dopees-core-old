/*global dope window*/

dope.initComponent({
    name: 'extensions.string',
    init (dope) {
        'use strict';
        /**
         * Native class. Only extension members are covered.
         * @class String
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String|MDN}.
         */

        /**
         * Returns a number indicating whether a reference string comes before or after or is the same as the given
         * string in sort order.
         *
         * Polyfill ({@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare|MDN}).
         * This method may be implemented by browser. Existing implementation
         * will be used if possible.
         *
         * @method localeCompare
         * @memberof String
         * @instance
         * @param {String} compareString - The string against which the referring string is compared.
         * @param {String} [locales] - Not supported by polyfill, for original usage see
         * {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare|MDN}).
         * @param {Object} [options] - Comparison options.
         * @param {String} [options.sensitivity] - Which differences in the strings should lead to non-zero result
         * values. Only _case_ value is supported by polyfill.
         * @return {Number} - A _negative_ number if the reference string occurs before the compare string; _positive_
         * if the reference string occurs after the compare string; _0_ if they are equivalent.
         **/
        if (!String.prototype.localeCompare || 0 !== 'a'.localeCompare('A', undefined, { sensitivity: 'accent'})) {
            dope.pushMsg('Polyfilling String.localeCompare: only case insensitive comparison will be supported!');
            String.prototype.localeCompare = function (other, locales, options) {
                const opts = Object.assign({
                    sensitivity: 'base'
                }, options);
                if ('case' === opts.sensitivity) {
                    return this === other ? 0 : (this < other ? -1 : 1);
                }
                const a = this.toUpperCase();
                const b = other.toUpperCase();
                return a === b ? 0 : (a < b ? -1 : 1);
            };
        }
        const toSolidByte = (_, num) => String.fromCharCode('0x' + num);

        const regexNum = /%([0-9A-F]{2})/g;

        /**
         * Encodes string as UTF-8 encoded base64 string.
         *
         * @method toBase64String
         * @memberof String
         * @instance
         * @return {String} UTF-8 encoded base64 string.
         */
        String.prototype.toBase64String = function () {
            const fixed = encodeURIComponent(this).replace(regexNum, toSolidByte);
            return window.btoa(fixed);
        };
        /**
         * Decodes UTF-8 encoded base64 string.
         *
         * @method fromBase64String
         * @memberof String
         * @static
         * @param {String} encoded - UTF-8 encoded base64 string.
         * @return Decoded string.
         */
        String.fromBase64String = encoded => {
            const fixed = window.atob(encoded)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('');
            return decodeURIComponent(fixed);
        };

        /* ------------------------------------------- */
        /* sprintf */

        const r = {
            text: /^[^\u0025]+/,
            percent: /^\u0025{2}/,
            arg: /^\u0025([+0\u0020\u002d]*)([0-9]*)(\.[0-9]+)?(b|d|i|f|s)/
        };
        const fun = {
            b (arg) {
                return arg ? 'true' : 'false';
            },
            d (arg) {
                const x = parseInt(arg, 10);
                const sign = (x < 0) ? '-' : (this.sign && !isNaN(x) ? '+' : '');
                return `${sign}${Math.abs(x)}`;
            },
            f (arg) {
                const x = parseFloat(arg);
                const sign = (x < 0) ? '-' : (this.sign && !isNaN(x) ? '+' : '');
                return (this.precision) ? `${sign}${Math.abs(x).toFixed(this.precision)}` : `${sign}${Math.abs(x)}`;
            },
            s (arg) {
                return arg;
            }
        };
        // aliases
        Object.assign(fun, {
            i: fun.d
        });
        // cached fun
        dope.sprintf = function (key) {
            if (undefined === key) {
                throw new Error('[sprintf] format must be specified');
            }
            const cache = dope.sprintf.cache;
            if (!(cache[key] && Object.prototype.hasOwnProperty.call(cache, key))) {
                cache[key] = dope.sprintf.parse(key);
            }
            return dope.sprintf.format.call(null, cache[key], arguments);
        };
        // cache
        dope.sprintf.cache = Object.create(null);
        // format parser
        dope.sprintf.parse = function (fmt) {
            var rest = fmt,
                m,
                result = [],
                flags,
                width,
                prec,
                ty,
                o;
            while (0 !== rest.length) {
                m = r.text.exec(rest);
                if (m) {
                    result.push(m[0]);
                } else {
                    m = r.percent.exec(rest);
                    if (m) {
                        result.push('%');
                    } else {
                        m = r.arg.exec(rest);
                        if (m) {
                            o = Object.create(null);
                            flags = m[1];
                            width = m[2];
                            prec = m[3];
                            ty = m[4];
                            if (!fun[ty]) {
                                throw new Error('[sprintf] invalid type: ' + ty);
                            }
                            o.fun = fun[ty];
                            // flags feldolgozása
                            if (flags) {
                                if (-1 !== flags.indexOf('-')) {
                                    o.left = true;
                                }
                                if (-1 !== flags.indexOf('+')) {
                                    o.sign = true;
                                }
                            }
                            if (width) {
                                o.width = parseInt(width, 10);
                                if (-1 !== flags.indexOf('0')) {
                                    o.pad = '0';
                                } else {
                                    o.pad = ' ';
                                }
                            }
                            if (prec) {
                                o.precision = parseInt(prec.substr(1), 10);
                            }
                            result.push(o);
                        } else {
                            throw new Error('[sprintf] could not parse: ' + rest);
                        }
                    }
                }
                rest = rest.substring(m[0].length);
            } // while
            return result;
        }; // parse

        dope.sprintf.format = function (items, args0) {
            const args = Array.prototype.slice.call(args0, 1);
            return items.map(function (item) {
                var s,
                    i,
                    pad,
                    arg;
                if ('string' === typeof item) {
                    s = item;
                } else {
                    arg = args.shift();
                    s = item.fun.call(item, arg);
                    if (item.width) {
                        i = item.width - s.length;
                        if (i > 0) {
                            pad = item.pad.repeat(i);
                            if (item.left) {
                                s = s + pad;
                            } else {
                                s = pad + s;
                            }
                        }
                    }
                }
                return s;
            }).join('');
        };

        /* ------------------------------------------------- */
        /* offset extensions */

        const search = String.prototype.search,
            exec = RegExp.prototype.exec;

        String.prototype.search = function (regexp, offset) {
            if (offset) {
                return search.call(this.substring(offset), regexp);
            }
            return search.call(this, regexp);
        };
        RegExp.prototype.exec = function (input, offset) {
            var m;
            if (offset) {
                m = exec.call(this, input.substring(offset));
                if (m) {
                    m.index = m.index + offset;
                }
            } else {
                m = exec.call(this, input);
            }
            return m;
        };
    }
});