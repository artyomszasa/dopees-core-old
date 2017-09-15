/*global dopeVars, window, document*/

(function (w, d, undef) {
    'use strict';

    // create namespace
    const dope = w.dope = w.dope || {};

    // check ES6 compatiblity
    const checkES6 = () => {
        if (!Object.freeze || !Object.assign) {
            return false;
        }
        try {
            eval("(function(){(class{});const x = () => 1;for(var b of []){}})");
            return true;
        } catch(e) {
            w.console && w.console.log("No ES6 support, falling back to ES5.");
            return false;
        }
    };

    const prefix = dopeVars.prefix + ((dopeVars.isES6 && checkES6()) ? "/es6_" : "/es5_") + dopeVars.version;

    Object.defineProperties(dope, {
        prefix: {
            get () { return prefix; }
        },
        undef: {
            value: undef,
            configurable: false,
            writable: false,
            enumerable: false
        }
    });

    const head = document.getElementsByTagName('head')[0];
    const loadScript = (src, resolve, reject) => {
        let done = false;
        const scriptElement = document.createElement('script');
        const resolveOnce = () => {
            if (!done) {
                done = true;
                resolve(src);
            }
        };
        const rejectOnce = () => {
            if (!done) {
                done = true;
                reject(src);
            }
        };
        scriptElement.onload = resolveOnce;
        scriptElement.onerror = rejectOnce;
        scriptElement.onreadystatechange = function () {
            if ('complete' === scriptElement.readyState || 'loaded' === scriptElement.readyState) {
                // Needed by IE9- for some reason...
                scriptElement.children;
                if ('loading' === scriptElement.readyState) {
                    rejectOnce(src);
                } else {
                    resolveOnce(src);
                }
            }
        };
        scriptElement.type = 'text\/javascript';
        scriptElement.async = true;
        scriptElement.src = src;
        head.appendChild(scriptElement);
    };

    const init = () => {
        // here all required polyfills (Promise, etc...) had been loaded e.g. are safe to use.

        dope.ready = new Promise(resolve => {
            var resolved = false;
            if (d.readyState === 'complete' || (d.readyState !== 'loading' && !d.documentElement.doScroll)) {
                // Document has already been loaded.
                resolve();
            } else {
                // Document is still loading -- wait for events (whichever comes first).
                const resolveOnce = () => {
                    if (!resolved) {
                        resolved = true;
                        d.removeEventListener('DOMContentLoaded', resolveOnce, false);
                        w.removeEventListener('load', resolveOnce, false);
                        resolve();
                    }
                };
                d.addEventListener('DOMContentLoaded', resolveOnce, false);
                w.addEventListener('load', resolveOnce, false);
            }
        });

        dope.Exception = class Exception extends Error {
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

        // script loader with debouncing
        const loadedScripts = {};
        dope.script = src => {
            if (!loadedScripts[src]) {
                loadedScripts[src] = new w.Promise((resolve, reject) => loadScript(src, resolve, reject));
            }
            return loadedScripts[src];
        };

        const resolved = w.Promise.resolve();

        // component handling
        const loadedComponents = {};
        const cload = name => {
            if (!loadedComponents[name]) {
                const src = `${prefix}/${name.replace('.', '/')}.js`;
                loadedComponents[name] = dope.script(src).then(() => {
                    return (dope.component.async[name] || w.Promise.resolve()).then(() => src);
                });
            }
            return loadedComponents[name];
        };
        dope.component = function () {
            const a = arguments;
            if (!a.length) {
                return resolved;
            }
            if (1 === a.length && 'string' === typeof a[0]) {
                return cload(a[0]);
            }
            return w.Promise.all(Array.prototype.slice.apply(a).map(arg => 'string' === typeof arg ? cload(arg) : dope.component(...arg)));
        };
        dope.component.async = {};
        dope.async = (name, initialization) => dope.component.async[name] = initialization;

        // logging
        dope.eventLog = 'dope-log';
        dope.pushMsg = (msg, severity) => {
            const ev = document.createEvent('CustomEvent');
            ev.initCustomEvent(dope.logEvent, false, false, {
                message: msg,
                severity: severity || 'log'
            });
            w.dispatchEvent(ev);
        };

        dope.pushErr = (err) => dope.pushMsg(err, 'error');

        w.addEventListener(dope.logEvent, evt => {
            if (w.console) {
                const data = evt.detail;
                const severity = data.severity;
                const log = w.console[severity] || w.console.log || (() => {});
                log.call(w.console, data.message);
            }
        }, false);
        dope.run = f => ('string' === typeof f || Array.isArray(f)) ? dope.component(f) : f(dope);
        dope._d.forEach(dope.run);
        delete dope._d;
    };

    // **********************************************************************
    // Execution starts here!!!
    // **********************************************************************
    // polyfill basic functionality
    const missingFeatures = [];
    // "must have" features
    const mustHaveFeatures = [{
        s: Array.prototype,
        m: 'every find filter forEach indexOf lastIndexOf map reduce reduceRight some'.split(' '),
        p: 'arr'
    }, {
        s: Array,
        m: ['isArray'],
        p: 'isarr'
    }, {
        s: String.prototype,
        m: ['repeat'],
        p: 'str'
    }, {
        s: window,
        m: 'atob btoa'.split(' '),
        p: 'b64'
    }, {
        s: Function.prototype,
        m: ['bind'],
        p: 'fun'
    }, {
        s: Object,
        m: 'assign freeze'.split(' '),
        p: 'obj'
    }, {
        s: Number,
        m: 'MIN_SAFE_INTEGER MAX_SAFE_INTEGER isFinite isInteger isNaN isSafeInteger parseFloat parseInt'.split(' '),
        p: 'num'
    }, {
        s: window,
        m: ['Promise'],
        p: 'promise'
    }];
    for (let i = 0; i < mustHaveFeatures.length; i = i + 1) {
        const x = mustHaveFeatures[i];
        let missing = false;
        for (let j = 0; !missing && j < x.m.length; j = j + 1) {
            if (!x.s[x.m[j]]) {
                missing = true;
                missingFeatures.push(x.p);
            }
        }
    }
    if (missingFeatures.length) {
        // if there is missing required functionality -- load polyfills.
        let loaded = 0;
        const onOneLoaded = () => {
            loaded = loaded + 1;
            if (loaded === missingFeatures.length) {
                init();
            }
        };
        for (let i = 0; i < missingFeatures.length; i = i + 1) {
            const uri = `${prefix}/external/${missingFeatures[i]}.js`;
            loadScript(uri, onOneLoaded, () => window.alert(`Unable to load polyfill (${uri})`));
        }
    } else {
        init();
    }
}(window, document, undefined));