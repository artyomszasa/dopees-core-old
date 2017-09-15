/*global dope window*/

(function () {
    const w = window,
        d = document;
    const timeout = dope.ployfillTimeout || 3000;
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
                dope.script(uri).then(wait, reject);
            });
        }
        return Promise.resolve();
    };

    const resolved = Promise.resolve();

    const hasClassList = !!d.createElement("div").classList;

    const polyfills = {
        WeakMap () {
            return !w.WeakMap ? dope.component('polyfill.weakmap') : resolved;
        },
        Map () {
            return !w.Map ? dope.component('polyfill.map') : resolved;
        },
        fetch () {
            return !w.fetch ? dope.component("polyfill.fetch") : resolved;
        },
        DOMParser () {
            return checkAndLoad(() => window.DOMParser, dope.prefix + "/polyfill/domparser.js");
        },
        ["Element.classList"] () {
            return !hasClassList ? dope.component("core.classlist") : resolved;
        }
    };

    const loaded = { };
    dope.polyfill = function (...args) {
        return w.Promise.all(args.map(arg => {
            if (Array.isArray(arg)) {
                return Promise.all(arg.map(sub => dope.polyfill(sub)));
            }
            if (loaded[arg]) {
                return loaded[arg];
            }
            const poly = polyfills[arg];
            if (!poly) {
                throw new Error(`No polyfill found for ${arg}`);
            }
            const result = poly();
            loaded[arg] = result;
            return result;
        }));
    };
}());