/*global dope window*/

dope.initComponent({
    name: 'extensions.object',
    depends: 'extensions.array',
    init (dope) {
        const deepOptions = Object.freeze({
            deep: true
        });
        const callEquals = (a, b, options) => {
            // if object contains overridden equals function --> use it.
            if (a.equals) {
                return a.equals(b, options);
            }
            if (b.equals) {
                return b.equals(a, options);
            }
            return Object.equals(a, b, options);
        };

        /**
         * @param {object} [options] - Equality comparison options.
         * @param {boolean} [options.nested] - If set objects are compared by references only.
         * @param {boolean} [options.deep] - If set deep comparison is performed.
         *
         */
        // FIXME: handle Arguments
        Object.equals = (actual, expected, options) => {
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
                const nestedOptions = opts.deep ? opts : Object.assign({}, opts, {
                    nested: true
                });
                return actualKeys.zip(expectedKeys).reduce((acc, [a, e]) => acc && callEquals(a, e, nestedOptions));
            }
            return false;
        };

        Object.hashCode = object => {
            //FIXME: implement
        };

        Object.assign(Object.prototype, {
            equals (other, options) {
                return Object.equals(this, other, options);
            }
        });
    }
});
