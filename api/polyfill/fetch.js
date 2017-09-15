/*global dope dopeVars window*/

dope.async(
    dopeVars.component,
    dope.component('extensions.string", "extensions.array')
        .then(() => {
            const w = window;
            const mkKey =
                w.Symbol
                    ? (key => w.Symbol(key))
                    : (key => `__dope_polyfill_fetch_${key}`);

            const polyfillHeaders = (ciEq) => {
                const keyData = mkKey("data");
                const keyImmutable = mkKey("immutable");
                const rNewline = /[\n\r]+/g;
                const parseSingleHeader = function (header) {
                    let i = header.indexOf(":");
                    if (-1 !== i) {
                        this.append(header.substr(0, i).trim(), header.substr(i + 1).trim());
                    } else {
                        dope.pushMsg(`Invalid header: ${header}`, "warn");
                    }
                };
                const parseHeaders = function (raw) {
                    raw.split(rNewline).forEach(parseSingleHeader, this);
                };

                w.Headers = class Headers {
                    constructor (init, isImmutable) {
                        Object.defineProperty(this, keyData, {
                            value: [],
                            writable: true
                        });
                        if (init) {
                            if ("string" === typeof init) {
                                parseHeaders.call(this, init);
                            } else if (init instanceof w.Headers) {
                                // own implmentation returns array...
                                init.entries().forEach(pair => this.append(pair[0], pair[1]));
                            } else {
                                // Assume init is plain object...
                                Object.keys(init).forEach(key => this.append(key, init[key]));
                            }
                        }
                        if (isImmutable) {
                            Object.defineProperty(this, keyImmutable, {
                                value: true
                            });
                        }
                    }
                    throwIfImmutable () {
                        if (true === this[keyImmutable]) {
                            throw new Error("Headers are immutable");
                        }
                    }
                    append (key, value) {
                        this.throwIfImmutable();
                        this[keyData].push([key, value]);
                    }
                    "delete" (key) {
                        this.throwIfImmutable();
                        this[keyData] = this[keyData].filter(pair => ciEq(pair[0], key));
                    }
                    entries () {
                        // If browser supports iteration then array is iterable...
                        return this[keyData];
                    }
                    "get" (key) {
                        const entry = this[keyData].find(pair => ciEq(pair[0], key));
                        if (entry) {
                            return entry[1];
                        }
                        return null;
                    }
                    getAll (key) {
                        return this[keyData]
                            .filter(pair => ciEq(pair[0], key))
                            .map(pair => pair[1]);
                    }
                    has (key) {
                        return !!this.get(key);
                    }
                    keys () {
                        return this[keyData].map(pair => pair[0]).unique();
                    }
                    "set" (key, value) {
                        this.delete(key);
                        this.append(key, value);
                    }
                    values () {
                        return this[keyData].map(pair => pair[1]);
                    }
                };
            };
            const polyfillRequest = () => {
                var keyBody = mkKey("body");
                w.Request = class Request {
                    constructor (input, init) {
                        const that = this;
                        const def = function (key, value) {
                            Object.defineProperty(that, key, {
                                value: value,
                                writable: false,
                                configurable: false,
                                enumerable: true
                            });
                        };
                        const defIf = function (key, defaultValue) {
                            if (init[key]) {
                                def(key, init[key]);
                            } else if (defaultValue) {
                                def(key, defaultValue);
                            }
                        };
                        def("url", input);
                        if (init) {
                            defIf("method", "GET");
                            def("headers", new w.Headers(init.headers));
                            if (init.body) {
                                def(keyBody, init.body);
                            }
                            defIf("mode", "same-origin");
                            defIf("credentials", "same-origin");
                            defIf("cache", "default");
                            defIf("redirect", "follow");
                        } else {
                            def("method", "GET");
                            def("headers", new w.Headers());
                            def("mode", "same-origin");
                            def("credentials", "same-origin");
                            def("cache", "default");
                            def("redirect", "follow");
                        }
                    }
                    get rawBody () {
                        return this[keyBody];
                    }
                };
            };
            const polyfillResponse = () => {
                var keyBody = mkKey("body");
                w.Response = class Response {
                    constructor (body, init) {
                        var opts = init || {};
                        Object.def(this, {
                            status: {
                                value: parseInt(opts.status, 10) || 200,
                                writable: false,
                                configurable: false,
                                enumerable: true
                            },
                            statusText: {
                                value: opts.statusText || '',
                                writable: false,
                                configurable: false,
                                enumerable: true
                            },
                            headers: {
                                value: new w.Headers(opts.headers, true),
                                writable: false,
                                configurable: false,
                                enumerable: true
                            },
                            url: {
                                value: opts.url || window.location.href,
                                writable: false,
                                configurable: false,
                                enumerable: true
                            },
                            redirect: {
                                value: false,
                                writable: false,
                                configurable: false,
                                enumerable: true
                            },
                            type: {
                                value: 'basic',
                                writable: false,
                                configurable: false,
                                enumerable: true
                            }
                        });
                        Object.defineProperty(this, keyBody, {
                            value: body
                        });
                    }
                    get ok () {
                        return 200 <= this.status && this.status <= 299;
                    }
                    arrayBuffer () {
                        return new Promise(resolve => {
                            if (!window.ArrayBuffer) {
                                throw new TypeError('ArrayBuffer is not supported by the browser');
                            }
                            const body = this[keyBody];
                            if (null === body || undefined === body) {
                                resolve(new ArrayBuffer(0));
                            } else if ('string' === typeof body) {
                                throw new Error('String to ArrayBuffer conversion is not yet polyfilled');
                            } else if (body instanceof ArrayBuffer) {
                                resolve(body);
                            } else if (body instanceof window.Blob) {
                                if (!window.FileReader) {
                                    throw new Error('Blob to ArrayBuffer conversion is not yet polyfilled');
                                }
                                const reader = new FileReader();
                                reader.onload = function () {
                                    resolve(this.result);
                                };
                                reader.readAsArrayBuffer(body);
                            } else {
                                throw new Error('Object to ArrayBuffer conversion is not yet supported');
                            }
                        });
                    }
                    blob () {
                        return new Promise(resolve => {
                            if (!window.Blob) {
                                throw new TypeError('Blob is not supported by the browser');
                            }
                            const body = this[keyBody];
                            if (null === body || undefined === body) {
                                resolve(new Blob([]));
                            } else if ('string' === typeof body || body instanceof window.ArrayBuffer) {
                                resolve(new Blob([body], this.headers.get('Content-Type') || ''));
                            } else if (body instanceof Blob) {
                                resolve(body);
                            } else {
                                resolve(new Blob([JSON.stringify(body)]));
                            }
                        });
                    }
                    formData () {
                        return new Promise(function () {
                            throw new Error('Quering response body as FormData not supported in polyfill');
                        });
                    }
                    json () {
                        return new Promise(resolve => {
                            const body = this[keyBody];
                            if (null === body || undefined === body) {
                                resolve(body);
                            } else if ('string' === typeof body) {
                                resolve(JSON.parse(body));
                            } else {
                                throw new Error('Json conversion of non-string data is not yet polyfilled');
                            }
                        });
                    }
                    text () {
                        return new Promise(resolve => {
                            var body = this[keyBody];
                            if (null === body || undefined === body) {
                                resolve(body);
                            } else if ('string' === typeof body) {
                                resolve(body);
                            } else {
                                throw new Error('Text conversion of non-string data is not yet polyfilled');
                            }
                        });
                    }
                };
            };
            const ciEq = (a, b) => 0 === a.localeCompare(b, "en", { sensitivity: "accent" });
            if (!w.Headers) {
                polyfillHeaders(dope, mkKey, ciEq, w);
            }
            if (!w.Request) {
                polyfillRequest(mkKey, w);
            }
            if (!w.Response) {
                polyfillResponse(dope, mkKey, w);
            }
            w.fetch = (input, init) => {
                if (input instanceof w.Request) {
                    const request = input;
                    return new Promise((resolve, reject) => {
                        // FIMXE: support IE...
                        const xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = function () {
                            if (4 === xhr.readyState) {
                                try {
                                    resolve(new w.Response(xhr.response, {
                                        status: xhr.status,
                                        statusText: xhr.statusText,
                                        headers: new w.Headers(xhr.getAllResponseHeaders(), true),
                                        url: request.url
                                    }));
                                } catch (e) {
                                    reject(e);
                                }
                            }
                        };
                        xhr.open(request.method || 'POST', request.url, true);
                        request.headers.entries().forEach(p => xhr.setRequestHeader(p[0], p[1]));
                        if (request.rawBody) {
                            xhr.send(request.rawBody);
                        } else {
                            xhr.send();
                        }
                    });
                }
                return w.fetch(new w.Request(input, init));
            };
        })
);