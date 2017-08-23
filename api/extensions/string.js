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
    }
});