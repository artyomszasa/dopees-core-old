/*global dope window*/

dope.initComponent({
    name: "polyfill.weakmap",
    init: function (dope) {
        "use strict";
        const x = {},
            win = window,
            udef = dope.undef;
        x.checkObj = function (o) {
            if (o === udef || o === null) {
                throw new TypeError("WeakMap: key must be object");
            }
        };

        if (!win.WeakMap) {
            x.mkKey = function () {
                if (win.Symbol) {
                    return win.Symbol("weakmap");
                }
                return `__weakmap_${Date.now()}_${Math.round(Math.random() * 10)}`;
            };

            win.WeakMap = class {
                constructor () {
                    Object.def(this, {
                        key: {
                            value: x.mkKey(),
                            enumerable: false,
                            writable: false,
                            configurable: false
                        }
                    });
                }
                delete (key) {
                    x.checkObj(key);
                    delete key[this.key];
                }
                get (key) {
                    x.checkObj(key);
                    return key[this.key];
                }
                has (key) {
                    return !!this.get(key);
                }
                set (key, value) {
                    key[this.key] = value;
                }
            };
        }
    }
});
