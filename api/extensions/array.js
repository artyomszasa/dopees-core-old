/*global Array*/

'use strict';
/**
 * Native class. Only extension members are covered.
 * @class Array
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array|MDN}.
 */
Object.assign(Array.prototype, {
    /**
     * Returns new array containing only unique elements (with respect to the eqaulity check if specified).
     *
     * @memberof Array
     * @instance
     * @param {Function} [equals] - Optional function to check elemet equality.
     * @returns {Array} - Array that contains unique elements.
     */
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
    /**
     * Zips two arrays into new array each element of that is a result of applying zipper function (or two
     * value array if not specified).
     *
     * @memberof Array
     * @instance
     * @param {Array} other - Second array.
     * @param {Function} [zipper] - Optional zipper function to apply.
     * @returns {Array} - Result array.
     */
    zip (other, zipper) {
        const z = zipper || ((a, b) => [a, b]);
        if (!Array.isArray(other)) {
            throw new TypeError('other must be an array.');
        }
        const len = Math.max(this.length, other.length);
        const result = [];
        for (let i = 0; i < len; i = i + 1) {
            result[i] = z(this[i], other[i]);
        }
        return result;
    }
});