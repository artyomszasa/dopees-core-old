/*global dope window*/

dope.initComponent({
    name: 'core.activation',
    init (dope) {
        'use strict';
        const create = (scope, qualifiedName, args, throwOnError) => {
            const ctor = dope.Activator.resolve (scope, qualifiedName);
            if (args && !Array.isArray(args)) {
                throw new TypeError('Activator: args must be an array!');
            }
            if (null === ctor) {
                if (false === throwOnError) {
                    return null;
                }
                throw new Error(`Activator: could not resolve ${qualifiedName}`);
            }
            if (args && args.length) {
                const binding = [ctor].concat(args);
                const boundCtor = Function.prototype.bind.apply(ctor, binding);
                return new boundCtor();
            }
            return new ctor();
        };
        const tryCreate = (qualifiedName, args, throwOnError) => {
            const tryDope = create (dope, qualifiedName, args, false);
            if (tryDope) {
                return tryDope;
            }
            const tryWindow = create (window, qualifiedName, args, false);
            if (tryWindow) {
                return tryWindow;
            }
            if (false === throwOnError) {
                return null;
            }
            throw new Error(`Activator: could not resolve ${qualifiedName} neither in window nor in dope`);
        };
        dope.Activator = class Activator {
            static resolve (scope, qualifiedName) {
                if (!('string' === qualifiedName)) {
                    throw new Error('Activator: qualifiedName must be specified!');
                }
                const implementation = (obj, name) => {
                    if (!obj) {
                        return null;
                    }
                    const iDot = name.indexOf('.');
                    if (-1 === iDot) {
                        return obj[name] || null;
                    }
                    return implementation(obj[name.substring(0, iDot)], name.substring(iDot + 1));
                };
                return implementation(scope, qualifiedName);
            }
            /**
             * Creates new instance of the class specified by name.
             *
             * @param {string} qualifiedName - Qualified name of the class to instaniate.
             * @param {object} [options] - Activation options.
             * @param {any} [options.scope] - Object to resolve the name within. Both dope and window will be tried if
             * not specified.
             * @param {Array} [options.args=] - Arguments to pass to the constructor.
             * @param {boolean} [options.throwOnError=true] - Whether to throw exception if unable to resolve class.
             */
            static create (qualifiedName, options) {
                const opts = Object.assign({}, options);
                if (opts.scope) {
                    return create(opts.scope, qualifiedName, opts.args || [], false === opts.throwOnError ? false : true);
                }
                return tryCreate(qualifiedName, opts.args || [], false === opts.throwOnError ? false : true);
            }
        };
    }
});