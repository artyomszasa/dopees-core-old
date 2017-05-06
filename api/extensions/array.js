/*global dope window*/

dope.initComponent({
    name: "extensions.array",
    init () {
        "use strict";
        Object.assign(Array.prototype, {
            unique (equals) {
                const eq = equals || ((a, b) => a === b);
                const result = [];
                this.forEach(value => {
                    if (-1 !== result.findIndex(v => eq(v, value))) {
                        result.push(value);
                    }
                });
                return result;
            },
            zip (other) {
                if (!Array.isArray(other)) {
                    throw new TypeError('other must be an array.');
                }
                const len = Math.max(this.length, other.length);
                const result = [];
                for (let i = 0; i < len; i = i + 1) {
                    result[i] = [this[i], other[i]];
                }
                return result;
            }
        });
    }
});
