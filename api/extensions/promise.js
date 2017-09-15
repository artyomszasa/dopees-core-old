/*global Promise */

/**
 * Native class. Only extension members are covered.
 * @class Promise
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise|MDN}.
 */

/**
 * Maps each element using specified function sequentially resolving the results.
 *
 * @method map
 * @memberof Promise
 * @static
 * @param {Array} source - Source array.
 * @param {Function} func - Mapping function.
 * @returns {Promise<Array>} Promise containing resolved values as array.
 */
Promise.map = (source, func) => {
    const result = [];
    const iterate = i => {
        if (source.length === i) {
            return Promise.resolve(result);
        }
        return Promise.resolve(func(source[i]))
            .then(resultN => result.push(resultN))
            .then(() => iterate(i + 1));
    };
    return iterate(0);
};

Promise.prototype.finally = function (action) {
    return this.then(result => {
        action && action();
        return result;
    }, err => {
        action && action();
        return Promise.reject(err);
    });
};