
(function (win, doc) {
    "use strict";
    const mimeApplicationXml = "application/xml";
    const mimeImageSvgXml = "image/svg+xml";
    const mimeTextHtml = "text/html";
    const mimeTextXml = "text/xml";
    const nsXHTML = "http://www.w3.org/1999/xhtml";
    const nsSVG = "http://www.w3.org/2000/svg";
    const impl = doc.implementation;
    const parsers = {};

    const checkSupported = type => {
        const domParser = new win.DOMParser();
        var supported = false;
        try {
            if (domParser.parseFromString("", type)) {
                return true;
            }
        } catch (e) {}
        return supported;
    };

    if (!win.DOMParser) {
        win.DOMParser = function () {};
        win.DOMParser.prototype.parseFromString = (markup, type) => {
            const parser = parsers[type];
            if (!parser) {
                throw new Error(`Unsupported mime type: ${type}`);
            }
            return parser(markup);
        };
    } else {
        const nativeParser = win.DOMParser.prototype.parseFromString;
        win.DOMParser.prototype.parseFromString = function parseFromString (markup, type) {
            const parser = parsers[type];
            if (!parser) {
                nativeParser.call(this, markup, type);
            }
            return parser(markup);
        };
    }

    if (!checkSupported(mimeApplicationXml)) {
        if (win.ActiveXObject) {
            parsers[mimeApplicationXml] = markup => {
                const xmlDoc = new win.ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                while (xmlDoc.readyState !== 4) {};
                xmlDoc.load(markup);
                return xmlDoc;
            };
        } else {
            parsers[mimeApplicationXml] = markup => {
                const xmlDoc = document.implementation.createDocument("", "", null);
                xmlDoc.load(markup);
                return xmlDoc;
            };
        }
    }
    if (!checkSupported(mimeTextXml)) {
        parsers[mimeTextXml] = markup => new win.DOMParser().parseFromString(markup, mimeApplicationXml);
    }

    if (!checkSupported(mimeTextHtml)) {
        if (impl.createDocument) {
            if (!impl.createHTMLDocument) {
                impl.createHTMLDocument = function (title) {
                    const document = this.createDocument(nsXHTML, "html", null);
                    document.title = title;
                    return document;
                };
            }
            const regexBody = /<body[^>]+>/i;
            parsers[mimeTextHtml] = markup => {
                const d = impl.createHTMLDocument("");
                if (regexBody.test(markup)) {
                    d.documentElement.innerHTML = markup;
                } else {
                    const body = document.createElementNS(nsXHTML, "body");
                    d.documentElement.appendChild(body);
                    body.innerHTML = markup;
                }
                return d;
            };
        } else if (win.console) {
            win.console.log(`Could not polyfill ${mimeTextHtml} parsing for DOMParser!`);
        }
    }

    if (!checkSupported(mimeImageSvgXml)) {
        if (impl.createDocument) {
            parsers[mimeImageSvgXml] = markup => {
                const d = impl.createDocument(nsSVG, "svg", null);
                d.documentElement.innerHTML = markup;
                return d;
            };
        } else if (win.console) {
            win.console.log(`Could not polyfill ${mimeImageSvgXml} parsing for DOMParser!`);
        }
    }

}(window, document));