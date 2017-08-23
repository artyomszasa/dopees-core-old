/*global dopeVars, window, document*/

/**
 * Global namespace for all the dope.
 *
 * @namespace dope
 */
(function (win, doc, undef) {
    "use strict";
    // es6 detection
    const checkES6 = () => {
        if (!Object.freeze || !Object.assign) {
            return false;
        }
        try {
            eval("(function(){(class{});const x = () => 1;for(var b of []){}})");
            return true;
        } catch(e) {
            if (win.console) {
                win.console.log("No ES6 support, falling back to ES5.");
            }
            return false;
        }
    };
    // initializers
    const missing = [];
    const initOrigin = () => {
        try {
            const element = doc.getElementById('jversus-api');
            if (element && element.src && 'h' === element.src.substring(0, 1)) {
                let match = /^https?:\/\/[^\/]+/.exec(element.src);
                if (match) {
                    return match[0];
                }
            }
        } catch(e) { }
        return undef;
    };
    // constants
    const fw = win.dope || {};
    const origin = initOrigin() || '';
    /**
     * Guaranteed always to be _undefined_.
     *
     * @member {undefined} undef
     * @memberof dope
     */
    Object.defineProperty(fw, "undef", {
        value: undef,
        enumerable: false,
        writable: false,
        configurable: false
    });
    // **********************************************************************
    // feature detection
    {
        const arrPoly = 'every find filter forEach indexOf lastIndexOf map reduce reduceRight some'.split(' ');
        const funPoly = ['bind'];
        const strPoly = ['repeat'];
        const b64Poly = 'atob btoa'.split(' ');
        const objPoly = 'assign freeze'.split(' ');
        const numPoly = 'MIN_SAFE_INTEGER MAX_SAFE_INTEGER isFinite isInteger isNaN isSafeInteger parseFloat parseInt'.split(' ');
        const check = function (name, proto, keys) {
            for (let i = 0; i < keys.length; i = i + 1) {
                if (!proto[keys[i]]) {
                    missing.push(name);
                    return;
                }
            }
        };
        // Array polyfill
        if (check('arr', Array.prototype, arrPoly)) {
            if (!Array.isArray) {
                missing.push('arr');
            }
        }
        // Function polyfill
        check('fun', win.Function.prototype, funPoly);
        // String polyfill
        check('str', String.prototype, strPoly);
        // base64 polyfill
        check('b64', win, b64Poly);
        // Object polyfill
        check('obj', Object, objPoly);
        // Number polyfill
        check('num', Number, numPoly);
    }
    // **********************************************************************
    // Constants
    let prefix = dopeVars.prefix + ((dopeVars.isES6 && checkES6()) ? "/es6_" : "/es5_") + dopeVars.version;
    const externalPrefix = prefix + '/external';
    const promisePolyfillUri = externalPrefix + '/npo.js';

    // **********************************************************************
    // asynchronous script load implementation for inner use.
    const head = document.getElementsByTagName('head')[0];
    const load = (uri, onload, onerror) => {
        const scriptElement = document.createElement('script');
        const onloadOnce = () => {
            if (!done) {
                done = true;
                if (onload) {
                    onload(uri);
                }
            }
        };
        var done = false;
        onerror = onerror || win.alert.bind(win);
        scriptElement.onload = onloadOnce;
        scriptElement.onerror = () => onerror(uri);
        scriptElement.onreadystatechange = function () {
            if ('complete' === scriptElement.readyState || 'loaded' === scriptElement.readyState) {
                // Needed by IE9- for some reason...
                scriptElement.children;
                if ('loading' === scriptElement.readyState) {
                    onerror(uri);
                } else {
                    onloadOnce(uri);
                }
            }
        };
        scriptElement.type = 'text\/javascript';
        scriptElement.async = true;
        if (uri.substring(0, 2) === '//' && origin) {
            scriptElement.src = (origin + uri.substring(1));
        } else if (uri.substring(0, 5) === 'http:' || uri.substring(0, 6) === 'https:') {
            scriptElement.src = uri;
        } else if (uri[0] === '/') {
            scriptElement.src = (origin + uri);
        } else {
            scriptElement.src = uri;
        }
        head.appendChild(scriptElement);
    };

    /**
     * Origin of the script file (used by cross-domain script loading)
     *
     * @member {String} origin
     * @memberof dope
     */
    fw.origin = origin;
    /**
     * Alerts fatal error.
     *
     * @method die
     * @memberof dope
     * @param {String} message - Message of the fatal error.
     */
    fw.die = msg => win.alert('Fatal error: ' + msg);

    // 'init'' called when promises has been ensured.
    const init = () => {
        // internal caching (for script/component loading).
        const mkCache = init => {
            const cache = init || {};
            return (key, factory) => {
                if (undef === cache[key]) {
                    cache[key] = new Promise(factory);
                }
                return cache[key];
            };
        };
        // 'ready' called when all needed features has been polyfilled.
        const ready = () => {
            const rDot = /\./g;
            const promiseTrue = Promise.resolve(true);
            /**
             * Promise that is resolved once DOM is loaded. If the page is
             * considered not-loaded during the dope initialization then
             * both DOMContentLoaded and load events are being watched
             * and whichever triggered first resolves the promise.
             *
             * @member {Promise} ready
             * @memberof dope
             */
            fw.ready = new Promise(resolve => {
                var resolved = false;
                if (doc.readyState === 'complete' || (doc.readyState !== 'loading' && !doc.documentElement.doScroll)) {
                    // Document has already been loaded.
                    resolve();
                } else {
                    // Document is still loading -- wait for events.
                    const resolveOnce = () => {
                        if (!resolved) {
                            resolved = true;
                            doc.removeEventListener('DOMContentLoaded', resolveOnce, false);
                            win.removeEventListener('load', resolveOnce, false);
                            resolve();
                        }
                    };
                    doc.addEventListener('DOMContentLoaded', resolveOnce, false);
                    win.addEventListener('load', resolveOnce);
                }
            });
            // ****************************************************************
            // Built-in extensions

            Object.def = Object.defineProperties;

            // ****************************************************************
            // Extendable exception

            fw.Exception = class Exception extends Error {
                constructor (message) {
                    super(message);
                    this.name = this.constructor.name;
                    this.message = message;
                    if (typeof Error.captureStackTrace === 'function') {
                        Error.captureStackTrace(this, this.constructor);
                    } else {
                        this.stack = (new Error(message)).stack;
                    }
                }
            };

            // ****************************************************************
            // Component manager.
            const resolvers = {};
            const rejecters = {};
            const componentCache = mkCache();
            const clearHandlers = name => {
                delete resolvers[name];
                delete rejecters[name];
            };
            const mkComponentUri = name => prefix + '/' + name.replace(rDot, '/') + '.js';
            /**
             * Static class that implements components loading.
             *
             * @class Components
             * @memberof dope
             */
            const components = {
                resolve (name) {
                    const resolve = resolvers[name];
                    if (!resolve) {
                        throw new Error('Resolving non-peding component: ' + name);
                    }
                    clearHandlers(name);
                    resolve(name);
                },
                reject (name, message) {
                    const reject = rejecters[name];
                    if (!reject) {
                        throw new Error('Rejecting non-peding component: ' + name);
                    }
                    clearHandlers(name);
                    reject(message);
                },
                /**
                 * Loads one or more components.
                 *
                 * @method load
                 * @memberof dope.Components
                 * @param {String|Array.<String>} component - Either a component name or an array of component names.
                 * @return {Promise} Promise that is resolved once all components specified be the pararameter are
                 * successfully loaded.
                 */
                load (component) {
                    if (!component) {
                        return promiseTrue;
                    }
                    if (Array.isArray(component)) {
                        return Promise.all(component.map(components.load.bind(components)));
                    }
                    const self = this;
                    return componentCache(component, (resolve, reject) => {
                        const url = mkComponentUri(component);
                        resolvers[component] = resolve;
                        rejecters[component] = reject;
                        fw.load(url).then(null, () => self.reject(component, 'Failed to load: ' + component));
                    });
                }
            };

            Object.assign(fw, {
                Components: components,
                /**
                 * Event name used for framework level logging.
                 *
                 * @member {String} logEvent
                 * @memberof dope
                 */
                logEvent: 'dope.log',
                /**
                 * Inilializes component. All dope components intended to call this method.
                 *
                 * @method initComponent
                 * @memberof dope
                 * @param {Object} options - Initialization options.
                 * @param {String} options.name - Name of the component.
                 * @param {Function} options.init - Component body. Framework object is passed to this function to
                 * ease access to its fascilities.
                 * @param {String|Array<String>} [options.depends] - Component dependencies to be loaded prior
                 * initializing the component.
                 */
                initComponent (options) {
                    fw.run(() => {
                        const opts = options || {};
                        if (!options.name) {
                            throw new Error('Component name must be specified');
                        }
                        const name = options.name;
                        const init = opts.init || (() => {});
                        components.load(opts.depends)
                            .then(() => init.call(opts, fw))
                            .then(() => components.resolve(name), reason => components.reject(name, reason));
                    });
                },
                /**
                 * Triggers custom dope event used by the dope logging fascility.
                 *
                 * @method pushMsg
                 * @memberof dope
                 * @param {String|*} msg - Either string message or arbitrary object handled by assigned loggers.
                 * Objects should override toString method to provide compatibility with default loggers.
                 * @param {String} severity - Severity of the message. One of the following: _notice_, _log_, _warn_,
                 * _error_, _fatal_.
                 */
                pushMsg (msg, severity) {
                    const evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent(fw.logEvent, false, false, {
                        message: msg,
                        severity: severity || 'log'
                    });
                    window.dispatchEvent(evt);
                },
                /**
                 * Triggers custom dope event used by the dope logging fascility with _error_ severity.
                 *
                 * @method pushErr
                 * @memberof dope
                 * @param {String|*} error - Either string message or arbitrary object handled by assigned loggers.
                 * Objects should override toString method to provide compatibility with default loggers.
                 */
                pushErr (err) {
                    fw.pushMsg(err, 'error');
                }
            });
            win.addEventListener(fw.logEvent, evt => {
                if (win.console && win.console.log) {
                    const data = evt.detail;
                    const severity = data.severity;
                    const log = win.console[severity] || win.console.log || (() => {});
                    log.call(win.console, data.message);
                }
            }, false);

            /**
             * Executes provided function once the core functionality has been initialized.
             *
             * @method run
             * @memberof dope
             * @param {Function} action - function to execute after initialization of the core functionality.
             */
            fw.run = f => f(fw);
            fw._d.forEach(fw.run);
            delete fw._d;
        };
        const scripts = mkCache();

        /**
         * Web prefix of the components directory.
         *
         * @member prefix
         * @memberof dope
         */
        Object.defineProperty(fw, "prefix", {
            value: prefix,
            enumerable: true
        });

        /**
         * Loads abritrary javascript through &lt;script&gt; tag. Tracks loaded scripts thus each provided url is
         * loaded only once.
         *
         * @method load
         * @memberof dope
         * @param {String} uri - Script uri to load.
         * @return {Promise} Promise which is resolved once script has been loaded and rejected if error has occured.
         */
        fw.load = (src) => scripts(src, (resolve, reject) => load(src, resolve, reject));
        /**
         * Loads abritrary javascript from extrnal directory through &lt;script&gt; tag. Tracks loaded scripts thus
         * each provided url is loaded only once.
         *
         * @method load
         * @memberof dope
         * @param {String} name - Script name to load (_prefix_/external/_name_.js).
         * @return {Promise} Promise which is resolved once script has been loaded and rejected if error has occured.
         */
        fw.loadExternal = (name) => fw.load(externalPrefix + '/' + name + '.js');

        // apply polyfills if needed
        if (missing.length) {
            const promises = [];
            // Before polyfills we may not have Array.map...
            for (let i = 0; i < missing.length; i = i + 1) {
                promises.push(load(externalPrefix + '/' + missing[i] + '.js'));
            }
            Promise.all(promises).then(ready, fw.die);
        } else {
            ready();
        }
    };

    if (Object.prototype.hasOwnProperty.call(win, 'Promise')) {
        init();
    } else {
        load(promisePolyfillUri, init, () => fw.die('Could not load Promise polyfill'));
    }

    win.dope = fw;
}(window, document));
