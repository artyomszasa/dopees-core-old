/*global dope dopeVars window*/

dope.async(
    dopeVars.component,
    dope.component('extensions.array')
        .then(() => {

            const w = window;

            /**
             * Native class. Only extension members are covered.
             * @class Object
             * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object|MDN}.
             */
            /**
             * Extends existing object by copying property descriptors of extension objects.
             * In contraversal with Object.assign property declarations are copied not their values.
             * In contraversal with Object.create extend uses existent object instead of creating new one.
             *
             * @memberof Object
             * @static
             * @param {Object} target - Object to copy property descriptors to.
             * @param {...Object} extensions - One or more object to copy property descriptors from. Order is significant.
             * @returns {Object} - Target object.
             */
            Object.extend = (target, ...extensions) => {
                if (null === target || dope.undef === target) {
                    throw new TypeError('target must not be null or undefined');
                }
                extensions.forEach(ext => Object.defineProperties(target, Object.getOwnPropertyDescriptors(ext)));
                return target;
            };

            /**
             * Gets descriptor for property that is declared either on the object (own property) or any of its prototoypes.
             *
             * @memberof Object
             * @static
             * @param {Object} obj - Target object.
             * @param {*} property - Property key.
             * @returns {Object|null} - Either property defined on target object or any of its prototypes or null.
             */
            Object.getRuntimePropertyDescriptor = (obj, property) => {
                while (obj) {
                    const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(obj, property);
                    if (ownPropertyDescriptor) {
                        return ownPropertyDescriptor;
                    }
                    obj = Object.getPrototypeOf(obj);
                }
                return null;
            };

            Object.prototype.hasRuntimeProperty = function (property) {
                let obj = this;
                while (obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, property)) {
                        return true;
                    }
                    obj = Object.getPrototypeOf(obj);
                }
                return false;
            };

            const keyEquals = window.Symbol ? window.Symbol('equals') : '___dope_extensions_equals';
            const keyHashCode = window.Symbol ? window.Symbol('hashCode') : '___dope_extensions_hashCode';

            Object.defineProperties(dope, {
                /**
                 * @member {String|Symbol} keyEquals - dope equality key (constant).
                 * @static
                 * @readonly
                 * @memberof dope
                 */
                keyEquals: {
                    value: keyEquals,
                    configurable: false,
                    writable: false,
                    enumerable: false
                },
                /**
                 * @member {String|Symbol} keyHashCode - dope hash code key (constant).
                 * @static
                 * @readonly
                 * @memberof dope
                 */
                keyHashCode: {
                    value: keyHashCode,
                    configurable: false,
                    writable: false,
                    enumerable: false
                }
            });

            const deepOptions = Object.freeze({ deep: true });

            /**
             * Checks two generic objects for equality.
             *
             * @memberof Object
             * @static
             * @param {*} actual - First object.
             * @param {*} expected - Second object.
             * @param {object} [options] - Equality comparison options.
             * @param {boolean} [options.nested] - If set objects are compared by references only.
             * @param {boolean} [options.deep] - If set deep comparison is performed.
             *
             */
            // FIXME: handle Arguments
            Object.dopeEquals = (actual, expected, options) => {
                const opts = 'boolean' === typeof options ? deepOptions : Object.assign({}, options);
                if (actual === expected) {
                    // Applies to: strings, symbols, null and undefined.
                    return true;
                }
                if (actual instanceof Date && expected instanceof Date) {
                    // Date === Date
                    return actual.getTime() === expected.getTime();
                }
                if (dope.undef === actual || dope.undef === expected) {
                    return false;
                }
                if (null === actual || null === expected) {
                    // null === null
                    return false;
                }
                if ('object' === typeof actual && 'object' === typeof expected) {
                    if (opts.nested) {
                        // reference equality handled by first branch
                        return false;
                    }
                    if (Object.hasRuntimeProperty.call(actual, keyEquals)) {
                        return actual[keyEquals](expected, options);
                    }
                    if (Object.hasRuntimeProperty.call(expected, keyEquals)) {
                        return expected[keyEquals](actual, options);
                    }
                    if (actual.prototype !== expected.prototype) {
                        return false;
                    }
                    const actualKeys = Object.keys(actual);
                    const expectedKeys = Object.keys(expected);
                    if (actualKeys.length !== expectedKeys.length) {
                        return false;
                    }
                    actualKeys.sort();
                    expectedKeys.sort();
                    const nestedOptions = opts.deep ? opts : Object.assign({}, opts, { nested: true });
                    return actualKeys.zip(expectedKeys).reduce((acc, [a, e]) => acc && Object.dopeEquals(a, e, nestedOptions));
                }
                return false;
            };

            var getDoubleHashCode;

            if (w.ArrayBuffer && w.Float64Array && w.Int32Array) {
                const kBuf = new ArrayBuffer(8);
                const kBufAsF64 = new Float64Array(kBuf);
                const kBufAsI32 = new Int32Array(kBuf);
                getDoubleHashCode = value => {
                    kBufAsF64[0] = value;
                    return kBufAsI32[0] ^ kBufAsI32[1];
                };
            } else {
                const rdot = /^([0-9]*)\.([0-9]*)$/;
                getDoubleHashCode = value => {
                    const m = rdot.exec(Number.prototype.toFixed.call(value, 5));
                    const a = parseInt(m[1] || '0', 10);
                    const b = parseInt(m[2] || '0', 10);
                    return a ^ b;
                };
            }

            Object.dopeHashCode = obj => {
                if (Object.prototype.hasRuntimeProperty.call(obj, keyHashCode)) {
                    return obj[keyHashCode];
                }
                if (obj === dope.undef || obj === null) {
                    return 0;
                }
                if (obj instanceof Date) {
                    return obj.getTime();
                }
                if ('boolean' === typeof obj) {
                    return obj ? 1 : 0;
                }
                if ('number' === typeof obj) {
                    if (obj % 1 === 0) {
                        return obj;
                    }
                    return getDoubleHashCode(obj);
                }
                if ('function' === typeof obj) {
                    return Object.dopeHashCode(obj.toString());
                }
                if ('string' === typeof obj) {
                    let hash = 0;
                    for (let i = 0; i < obj.length; i = i + 1) {
                        const chr = obj.charCodeAt(i);
                        hash = ((hash << 5) - hash) + chr;
                    }
                    return hash;
                }
                if ('object' === typeof obj) {
                    const keys = Object.keys(obj);
                    let hash = 0;
                    for (let i = 0; i < keys.length; i = i + 1) {
                        const value = obj[keys[i]];
                        if ('function' !== typeof value) {
                            hash = ((hash << 5) - hash) + Object.dopeHashCode(value);
                        }
                    }
                    return hash;
                }
                return -1;
            };

            Object.defineProperties(Object.prototype, {
                dopeEquals: {
                    value (other) { return Object.dopeEquals(this, other); },
                    configurable: false,
                    writable: false,
                    enumerable: true
                },
                dopeHashCode: {
                    get () { return Object.dopeHashCode(this); },
                    configurable: false,
                    enumerable: true
                }
            });
        })
);