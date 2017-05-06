/*global dope window*/

dope.initComponent({
    name: "core.polyfill",
    init: function (fw) {

        const flatten = item => {
            const result = [];
            if (Array.isArray(item)) {
                item.forEach(x => {
                    if (Array.isArray(x)) {
                        flatten(x).forEach(y => result.push(y));
                    } else {
                        result.push(x);
                    }
                });
            } else {
                result.push(item);
            }
            return result;
        };

        const timeout = fw.ployfillTimeout || 3000;
        const checkAndLoad = (check, uri) => {
            if (!check()) {
                return new Promise((resolve, reject) => {
                    const started = Date.now();
                    const wait = () => {
                        if (!!check()) {
                            alert("success...");
                            resolve();
                        } else if (Date.now() - started > timeout) {
                            reject(new Error(`Timeout while loading polyfill: ${uri}`));
                        } else {
                            setTimeout(wait, 5);
                        }
                    };
                    fw.load(uri).then(wait, reject);
                });
            }
            return Promise.resolve();
        };

        const polyfills = {
            WeakMap () {
                if (!window.WeakMap) {
                    return fw.Components.load("polyfill.weakmap");
                }
                return Promise.resolve();
            },
            fetch () {
                if (!window.fetch) {
                    return fw.Components.load("polyfill.fetch");
                }
                return Promise.resolve();
            },
            DOMParser () {
                return checkAndLoad(() => window.DOMParser, fw.prefix + "/polyfill/domparser.js");
            },
            ["Element.classList"] () {
                if (!document.createElement("div").classList) {
                    return fw.Components.load("core.classlist");
                }
                return Promise.resolve();
            }
        };

        const loaded = { };

        fw.polyfill = function (...args) {
            const todo = flatten(args);
            return Promise.all(todo.map(key => {
                if ("string" !== typeof key) {
                    throw new TypeError("polyfill: argument must be string");
                }
                if (loaded[key]) {
                    return loaded[key];
                }
                const poly = polyfills[key];
                if (!poly) {
                    throw new Error(`No polyfill found for ${key}`);
                }
                const result = poly();
                loaded[key] = result;
                return result;
            }));
        };
    }
});