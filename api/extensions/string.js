/*global dope window*/

dope.initComponent({
    name: "extensions.string",
    init (dope) {
        "use strict";
        if (!String.prototype.localeCompare || 0 !== "a".localeCompare("A", undefined, { sensitivity: 'accent'})) {
            dope.pushMsg("Polyfilling String.localeCompare: only case insensitive comparison will be supported!");
            String.prototype.localeCompare = function (other, locales, options) {
                const opts = Object.assign({
                    sensitivity: "base"
                }, options);
                if ("case" === opts.sensitivity) {
                    return this === other ? 0 : (this < other ? -1 : 1);
                }
                const a = this.toUpperCase();
                const b = other.toUpperCase();
                return a === b ? 0 : (a < b ? -1 : 1);
            };
        }
        const toSolidByte = (_, num) => String.fromCharCode('0x' + num);
        /**
         * Encodes string as UTF-8 encoded base64 string.
         *
         * @method toBase64String
         * @memberof String
         * @instance
         * @return {String} UTF-8 encoded base64 string.
         */
        String.prototype.toBase64String = function () {
            const fixed = encodeURIComponent(this).replace(/%([0-9A-F]{2})/g, toSolidByte);
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