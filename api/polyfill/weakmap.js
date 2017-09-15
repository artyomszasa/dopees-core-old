/*global dope window*/

(function () {
    const w = window;
    if (!w.WeakMap) {
        const checkObj = o => {
            if (o === dope.udef || o === null) {
                throw new TypeError("WeakMap: key must be object");
            }
        };
        const mkKey =
            w.Symbol
                ? w.Symbol("weakmap")
                : `__weakmap_${Date.now()}_${Math.round(Math.random() * 10)}`;

        w.WeakMap = class {
            constructor () {
                Object.def(this, {
                    key: {
                        value: mkKey(),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    }
                });
            }
            delete (key) {
                checkObj(key);
                delete key[this.key];
            }
            get (key) {
                checkObj(key);
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
}());