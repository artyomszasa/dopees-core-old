//vim: set tabstop=4 shiftwidth=4 expandtab:

(function (w, undef) {

    const maxSafeInteger = Math.pow(2, 53) - 1;

    const toInteger = value => {
        const number = Number(value);
        if (isNaN(number)) {
            return 0;
        }
        if (number === 0 || !isFinite(number)) {
            return number;
        }
        const sign = number > 0 ? 1 : -1;
        return sign * Math.floor(Math.abs(number));
    };

    const toLength = value => Math.min(Math.max(toInteger(value), 0), maxSafeInteger);

    const isCallable = fn => 'function' === typeof fn  || Object.prototype.toString.call(fn) === '[object Function]';

    const polyfill = (target, values) => {
        for (let k in values) {
            if (values[k] && !target[k]) {
                target[k] = values[k];
            }
        }
    };

    class PolyfillArrayIterator {
        constructor (array) {
            this.index = 0;
            this.array = array;
        }
        next () {
            if (this.index >= this.array.length) {
                return { done : true };
            }
            const i = this.index;
            this.index = this.index + 1;
            return {
                done: false,
                value: this.array[i]
            };
        }
    };

    polyfill(Array, {
        isArray (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        },
        from (arrayLike, ...args) {
            var selector;
            if (undef === arrayLike || null === arrayLike) {
                throw new TypeError('Array.from: arrayLike must neither be null nor undefined.');
            }
            const length = toLength(arrayLike.length);
            const result = isCallable(this) ? new this(length) : new Array(length);
            if (args.length >= 1) {
                const mapper = args[0];
                if (!isCallable(mapper)) {
                    throw new TypeError(`Array.from: when provided, second argument must be a function.`);
                }
                if (args.length > 1) {
                    const scope = args[1];
                    selector = (value, index) => mapper.call(scope, value, index, arrayLike);
                } else {
                    selector = (value, index) => mapper(value, index, arrayLike);
                }
            } else {
                selector = index => index;
            }
            for (let index = 0; index < length; index = index + 1) {
                result[index] = selector(arrayLike[index], index);
            }
            result.length = length;
            return result;
        },
        of (...args) {
            return args;
        }
    });

    const push = (array, value) => {
        array.push(value);
        return array;
    };
    const eqq = (x, y) => x === y || ('number' === typeof x && 'number' === typeof y && isNaN(x) && isNaN(y));

    polyfill(Array.prototype, {
        copyWithin (target, ...args) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.copyWithin called on null or undefined.');
            }
            const length = this.length >>> 0;
            // target
            const relativeTarget = target >> 0;
            let to = relativeTarget < 0 ? Math.max(length + relativeTarget, 0) : Math.min(relativeTarget, length);
            // source start
            const relativeStart = (args[0] || 0) >> 0;
            let from = relativeStart < 0 ? Math.max(length + relativeStart, 0) : Math.min(relativeStart, length);
            // source end
            const relativeEnd = args.length > 1 ? (args[1] >> 0) : length;
            const final = relativeEnd < 0 ? Math.max(length + relativeEnd, 0) : Math.min(relativeEnd, length);
            let count = Math.min(final - from, length - to);
            // direction
            let direction = 1;
            if (from < to && to < (from + count)) {
                direction = -1;
                from = from + count - 1;
                to = to + count - 1;
            }
            while (0 < count) {
                if (undef !== this) {
                    this[to] = this[from];
                } else {
                    delete this[to];
                }
                from = from + direction;
                to = to + direction;
                count = count - 1;
            }
            return this;
        },
        entries () {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.entries called on null or undefined.');
            }
            if (w.Symbol && w.Symbol.iterator) {
                return this[w.Symbol.iterator];
            }
            return new PolyfillArrayIterator(this.map((item, index) => [index, item]));
        },
        every (callback, thisArg) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.every called on null or undefined.');
            }
            return this.reduce((last, item, index, array) => last && callback.call(thisArg, item, index, array), true);
        },
        fill (value, ...args) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.fill called on null or undefined.');
            }
            const length = this.length >>> 0;
            const start = (args[0] || 0) >> 0;
            let index = start < 0 ? Math.max(length + start, 0) : Math.min(start, length);
            const end = args.length > 1 ? (args[1] >> 0) : length;
            const final = end < 0 ? Math.max(length + end, 0) : Math.min(end, length);
            while (index < final) {
                this[index] = value;
                index = index + 1;
            }
            return this;
        },
        filter (predicate, thisArg) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.filter called on null or undefined.');
            }
            return this.reduce((last, item, index, array) => {
                const value = array[index];
                return predicate.call(thisArg, value, index, array) ? push(last, value) : last;
            }, []);
        },
        find (predicate, thisArg) {
            var found = false,
                item = undef;
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.find called on null or undefined.');
            }
            this.reduce((_, value, index, array) => {
                if (!found && predicate.call(thisArg, value, index, array)) {
                    found = true;
                    item = value;
                }
            }, 0);
            return item;
        },
        findIndex (predicate, thisArg) {
            var result = -1;
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined.');
            }
            this.reduce((_, value, index, array) => {
                if (-1 !== result && predicate.call(thisArg, value, index, array)) {
                    result = index;
                }
            }, 0);
            return result;
        },
        forEach (callback, thisArg) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.forEach called on null or undefined.');
            }
            this.reduce((_, value, index, array) => callback.call(thisArg, value, index, array));
        },
        includes (value, fromIndex) {
            return -1 !== this.indexOf(value, fromIndex);
        },
        indexOf (value, fromIndex) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.includes called on null or undefined.');
            }
            const predicate = x => eqq(x, value);
            return (fromIndex ? this.slice(fromIndex) : this).findIndex(predicate);
        },
        keys () {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.keys called on null or undefined.');
            }
            return new PolyfillArrayIterator(this.map((_, index) => index));
        },
        lastIndexOf (value, fromIndex) {
            var result = -1;
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.lastIndexOf called on null or undefined.');
            }
            this.reduceRight((_, v, index) => {
                if (-1 !== result && fromIndex >= index && v === value) {
                    result = index;
                }
            }, 0);
            return result;
        },
        map (selector, thisArg) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.map called on null or undefined.');
            }
            return this.reduce((last, value, index, array) => push(last, selector.call(thisArg, value, index, array)), []);
        },
        reduce (callback, ...args) {
            var value,
                index;
            if (null === this || undefined === this) {
                throw new TypeError('Array.prototype.reduce called on null or undefined.');
            }
            if ('function' !== typeof callback) {
                throw new TypeError(`Array.prototype.reduce: ${callback} is not a function.`);
            }
            const length = this.length >>> 0;
            if (args.length >= 1) {
                value = args[0];
                index = 0;
            } else {
                if (0 === length) {
                    throw new TypeError('Array.prototype.reduce: reducing empty array with no initial value.');
                }
                value = this[0];
                index = 1;
            }
            while (index < length) {
                value = callback(value, this[index], index, this);
                index = index + 1;
            }
            return value;
        },
        reduceRight (callback, ...args) {
            var value,
                index;
            if (null === this || undefined === this) {
                throw new TypeError('Array.prototype.reduceRight called on null or undefined.');
            }
            if ('function' !== typeof callback) {
                throw new TypeError(`Array.prototype.reduceRight: ${callback} is not a function.`);
            }
            const length = this.length >>> 0;
            if (args.length >= 1) {
                value = args[0];
                index = length - 1;
            } else {
                if (0 === length) {
                    throw new TypeError('Array.prototype.reduceRight: reducing empty array with no initial value.');
                }
                value = this[length - 1];
                index = length - 2;
            }
            while (0 <= index) {
                value = callback(value, this[index], index, this);
                index = index - 1;
            }
            return value;
        },
        some (predicate, thisArg) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.some called on null or undefined.');
            }
            return this.reduce((last, item, index, array) => last || predicate.call(thisArg, item, index, array), false);
        },
        toLocaleString (locales, options) {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.toLocaleString called on null or undefined.');
            }
            return this.map(x => x.toLocaleString(locales, options)).join(',');
        },
        values () {
            if (undef === this || null === this) {
                throw new TypeError('Array.prototype.values called on null or undefined.');
            }
            return new PolyfillArrayIterator(this);
        }
    });
}(window));