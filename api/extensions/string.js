/*global dope window*/

dope.initComponent({
    name: "extensions.array",
    init (dope) {
        "use strict";
        if (!String.prototype.localeCompare || 0 !== "a".localeCompare("A", undefined, { sensitivity: 'accent'})) {
            dope.pushMsg("Polyfilling String.localeCompare: only cae insensitive comparison will be supported!");
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
    }
});