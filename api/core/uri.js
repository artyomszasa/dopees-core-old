/*global dope window*/

dope.initComponent({
    name: 'core.uri',
    init (dope) {
        'use strict';
        // see: https://tools.ietf.org/html/rfc3986
        const regexUri = /^(([a-z][a-z0-9+.-]*):)?(\/\/(([!$&\\'()*,;=a-z0-9._~-]|%[0-9a-f][0-9a-f])*)(\:([0-9]+))?)?(([\/!$&\\'()*,;=:@a-z0-9._~-]|%[0-9a-f][0-9a-f])*)(\?([!$&\\'()*,;=:@a-z0-9._~\/?-]|%[0-9a-f][0-9a-f])*)?(\#.*)?$/i;

        const parseQuery = (params, raw) => {
            raw
                .split('&')
                .forEach(one => {
                    if (one) {
                        const i = one.indexOf('=');
                        if (-1 === i) {
                            params[one] = null;
                        } else {
                            params[one.substring(0, i)] = one.substring(i + 1);
                        }
                    }
                });
        };
        const parse = (uri, raw) => {
            const m = regexUri.exec(raw);
            if (m) {
                uri.scheme = m[2];
                uri.host = m[4];
                uri.path = m[8];
                uri.port = parseInt(m[7], 10) || dope.Uri.defaultPorts[uri.scheme] || 0;
                uri.query = (m[10] && m[10].substr(1) || '');
                uri.fragment = (m[12] && m[12].substr(1) || '');
            }
        };
        /**
         * Simple and straightforward Uri wrapper.
         *
         * @class dope.Uri
         * @param {String} raw - string representation of the Uri.
         */
        dope.Uri = class Uri {
            /**
             * @member {String} scheme - Gets or sets scheme of the Uri.
             * @instance
             * @memberof dope.Uri
             */
            /**
             * @member {String} host - Gets or sets hostname of the Uri.
             * @instance
             * @memberof dope.Uri
             */
            /**
             * @member {String} path - Gets or sets path component of the Uri.
             * @instance
             * @memberof dope.Uri
             */
            /**
             * @member {Number} port - Gets or sets port of the Uri.
             * @instance
             * @memberof dope.Uri
             */
            /**
             * @member {String} fragment - Gets or sets fragment of the Uri.
             * @instance
             * @memberof dope.Uri
             */
            /**
             * @member {String} queryParams - Gets or sets query component of the Uri as object. Allows accessing and
             * manipulating individual arguments within query component.
             * @instance
             * @memberof dope.Uri
             */
            /**
             * Alias for {@link dope.Uri.from}.
             *
             * @deprecated Use {@link dope.Uri.from} instead.
             * @method create
             * @memberof dope.Uri
             * @static
             * @param {String|dope.Uri} uri - Source uri.
             * @returns {dope.Uri} - {@link dope.Uri} object.
             */
            static create (uri) {
                if (uri instanceof dope.Uri) {
                    return uri;
                }
                return new dope.Uri(uri);
            }
            /**
             * Creates {@link dope.Uri} form an argument.
             *
             * @method from
             * @memberof dope.Uri
             * @static
             * @param {String|dope.Uri} uri - Source uri.
             * @returns {dope.Uri} - {@link dope.Uri} object.
             */
            static from (uri) {
                return dope.Uri.create(uri);
            }
            constructor (raw) {
                parse(this, raw);
            }
            /**
             * Is _true_ if the wrapper Uri is relative.
             *
             * @type {Boolean}
             * @readonly
             */
            get isRelative () {
                return !this.scheme;
            }
            /**
             * Is _true_ if the wrapper Uri is absolute.
             *
             * @type {Boolean}
             * @readonly
             */
            get isAbsolute () {
                return !!this.scheme;
            }
            /**
             * Gets or sets authority of the Uri (i.e. hostname and port if non standard).
             *
             * @type {String}
             */
            get authority () {
                if (this.port && this.port !== dope.Uri.defaultPorts[this.scheme]) {
                    return `${this.host}:${this.port}`;
                }
                return this.host;
            }
            set authority (authority) {
                const i = authority.indexOf(':');
                if (-1 === i) {
                    this.host = authority;
                    this.port = 0;
                } else {
                    this.host = authority.substr(0, i);
                    this.port = parseInt(authority.substr(i + 1), 10) || 0;
                }
            }
            /**
             * Gets or sets the wrapped Uri.
             *
             * @type {String}
             */
            get href () {
                const query = this.query;
                const queryString = query ? `?${query}` : '';
                const fragment = this.fragment ? `#${this.fragment}` : '';
                const authority = this.authority ? `//${this.authority}` : '';
                const scheme = this.scheme ? `${this.scheme}:` : '';
                return `${scheme}${authority}${this.path}${queryString}${fragment}`;
            }
            set href (href) {
                parse(this, href);
            }
            /**
             * Gets or sets query component of the Uri. To access or manipulate individual query arguments use
             * {@link dope.Uri#queryParams}.
             *
             * @type {String}
             */
            get query () {
                const queryParams = this.queryParams || {};
                return Object.keys(queryParams)
                    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
                    .join('&');
            }
            set query (query) {
                this.queryParams = {};
                parseQuery(this.queryParams, query);
            }
            toString () {
                return this.href;
            }
        };
        Object.def(dope.Uri, {
            ABSOLUTE: {
                value: 0,
                enumerable: true,
                writable: false,
                configurable: false
            },
            RELATIVE: {
                value: 0,
                enumerable: true,
                writable: false,
                configurable: false
            },
            ABSOLUTE_OR_RELATIVE: {
                value: 0,
                enumerable: true,
                writable: false,
                configurable: false
            },
            defaultPorts: {
                value: {
                    'http': 80,
                    'https': 443
                },
                enumerable: true,
                writable: false,
                configurable: false
            }
        });
    }
});