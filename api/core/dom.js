/*global dope window*/

dope.initComponent({
    name: "core.dom",
    depends: "core.polyfill",
    init: function (fw) {
        "use strict";
        return fw.polyfill(["WeakMap", "DOMParser"]).then(function () {
            const undef = fw.undefined;
            const win = window;
            const doc = document;
            const todos = [];
            const regexWS = /\s+/;

            const useOldEvents = (function () {
                try {
                    new Event("custom.string");
                    return false;
                } catch (e) {
                    return true;
                }
            }());

            // Creates and initializes event object.
            const createEvent = (function () {
                if (useOldEvents) {
                    return function (name, opts0) {
                        const opts = Object.assign({}, opts0);
                        var e;
                        if (opts.detail) {
                            e = doc.createEvent("CustomEvent");
                            e.initCustomEvent(name, opts.bubbles || false, opts.cancelable || false, opts.detail);
                        } else {
                            e = doc.createEvent("Event");
                            e.initEvent(name, opts.bubbles || false, opts.cancelable || false);
                        }
                        return e;
                    };
                }
                return (name, opts) => (opts && opts.detail) ? new CustomEvent(name, opts) : new Event(name, opts);
            }());


            /**
             * Tells the browser that you wish to perform an animation and requests that the browser call a specified
             * function to update an animation before the next repaint. The method takes as an argument a callback to
             * be invoked before the repaint.
             *
             * Polyfill ({@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame}).
             * This method may be implemented by browser. Existing implementation will be used if possible.
             *
             * @method requestAnimationFrame
             * @param {Function} callback - A parameter specifying a function to call when it's time to update your
             * animation for the next repaint.
             * @returns {Number} - A long integer value, the request id, that uniquely identifies the entry in the
             * callback list.
             **/
            /**
             * Cancels an animation frame request previously scheduled through a call to _window.requestAnimationFrame()_.
             *
             * Polyfill ({@link https://developer.mozilla.org/en-US/docs/Web/API/window/cancelAnimationFrame}).
             * This method may be implemented by browser. Existing implementation will be used if possible.
             *
             * @method cancelAnimationFrame
             * @param {Number} requestID - The ID value returned by the call to window.requestAnimationFrame() that
             * requested the callback.
             **/
            if (!win.requestAnimationFrame) {
                ["ms", "moz", "webkit", "o"].forEach(function (prefix) {
                    win.requestAnimationFrame = win.requestAnimationFrame || win[prefix + "RequestAnimationFrame"];
                    win.cancelAnimationFrame = win.cancelAnimationFrame || win[prefix + "CancelAnimationFrame"] || win[prefix + "CancelRequestAnimationFrame"];
                });
            }
            if (!win.requestAnimationFrame || !win.cancelAnimationFrame) {
                Object.assign(win, {
                    requestAnimationFrame (callback) {
                        return win.setTimeout(callback, 40);
                    },
                    cancelAnimationFrame (id) {
                        win.clearTimeout(id);
                    }
                });
            }

            /**
             * Native DOM interface. Only extension members are covered.
             * @class Node
             * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node|MDN}.
             */

            /**
             * Native DOM interface. Only extension members are covered.
             * @class Element
             * @extends Node
             * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|MDN}.
             */


            /**
             * Originally native method (see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector|MDN})
             * overridden if necessary to support _:scope_ pseudo-class.
             *
             * @method querySelector
             * @memberof Element
             * @instance
             * @param {String} selector - Returns the first element that is a
             * descendant of the element on which it is invoked that matches the
             * specified group of selectors.
             * @return {Element} Either matching element or null.
             **/
            /**
             * Originally native method (see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll|MDN})
             * overridden if necessary to support _:scope_ pseudo-class.
             *
             * @method querySelectorAll
             * @memberof Element
             * @instance
             * @param {String} selector - Returns the first element that is a
             * descendant of the element on which it is invoked that matches the
             * specified group of selectors.
             * @return {NodeList} NodeList containing matching nodes.
             **/
            try {
                doc.querySelector(":scope body");
            } catch (e) {
                const proto = Element.prototype;
                const regexScope = /(^|,)\s*:scope/;
                const regexScopeMatch = /((^|,)\s*):scope/g;
                ["querySelector", "querySelectorAll"].forEach(function (method) {
                    var uid;
                    const orig = proto[method];
                    proto[method] = function (selector) {
                        var id;
                        var idGenerated = false;
                        if (regexScope.test(selector)) {
                            if (!this.id) {
                                id = `querySelector_${Date.now()}_${++uid}`;
                                this.id = id;
                                idGenerated = true;
                            } else {
                                id = this.id;
                            }
                            const newSelector = selector.replace(regexScopeMatch, `$1#${id}`);
                            const result = doc[method].call(doc, newSelector);
                            if (idGenerated) {
                                this.id = "";
                            }
                            return result;
                        }
                        return orig.call(this, selector);
                    };
                });
            }

            todos.push(fw.polyfill("Element.classList").then(function () {
                const fAddClass = function (cls) {
                    this.add(cls);
                };
                const fRemoveClass = function (cls) {
                    this.remove(cls);
                };
                const fToggleClass = function (cls) {
                    this.toggle(cls);
                };

                Object.assign(Element.prototype, {
                    /**
                     * Adds one or more css classes to the actual element.
                     * Multiple classes must be passed as single string separated
                     * by one or more whitespace character.
                     *
                     * @method addClass
                     * @memberof Element
                     * @instance
                     * @chainable
                     * @param {String} cls - Class(es) to add.
                     * @return {Element}
                     */
                    addClass (cls) {
                        cls.split(regexWS).forEach(fAddClass, this.classList);
                        return this;
                    },
                    /**
                     * Removes one or more css classes from the actual element.
                     * Multiple classes must be passed as single string separated
                     * by one or more whitespace character.
                     *
                     * @method removeClass
                     * @memberof Element
                     * @instance
                     * @chainable
                     * @param {String} cls - Class(es) to remove.
                     * @return {Element}
                     */
                    removeClass (cls) {
                        cls.split(regexWS).forEach(fRemoveClass, this.classList);
                        return this;
                    },
                    /**
                     * Toggles one or more css classes on the actual element.
                     * Multiple classes must be passed as single string separated
                     * by one or more whitespace character.
                     *
                     * @method toggleClass
                     * @memberof Element
                     * @instance
                     * @chainable
                     * @param {String} cls - Class(es) to toggle.
                     * @return {Element}
                     */
                    toggleClass (cls) {
                        cls.split(regexWS).forEach(fToggleClass, this.classList);
                        return this;
                    },
                    /**
                     * Checks whether the actual element has specified class.
                     *
                     * @method hasClass
                     * @memberof Element
                     * @instance
                     * @param {String} cls - Class to check.
                     * @return {Boolean} true if elements has the special class,
                     * false otherwise.
                     */
                    hasClass (cls) {
                        return this.classList.contains(cls);
                    }
                });
            }));

            Object.def(Node.prototype, {
                /**
                 * Gets index of the actual node based on the DOM order.
                 * @var {Number} domIndex
                 * @instance
                 * @memberof Node
                 * @readOnly
                 */
                domIndex: {
                    enumerable: true,
                    configurable: true,
                    get () {
                        if (!this.parentNode) {
                            return -1;
                        }
                        var node = this.parentNode.firstChild;
                        var i = 0;
                        while (node !== this) {
                            node = node.nextSibling;
                            if (!node) {
                                return -1;
                            }
                            i = i + 1;
                        }
                        return i;
                    }
                }
            });

            const userData = new WeakMap();
            const getUserDataForElement = function (el) {
                var result = userData.get(el);
                if (!result) {
                    result = {};
                    userData.set(el, result);
                }
                return result;
            };

            Object.assign(Node.prototype, {
                /**
                 * Inserts a specified object after the last child of the actual
                 * node.
                 *
                 * Specified object is appended as follows:
                 *
                 * - if the object is instance of {@link Node}, then it is appended as-is;
                 * - if the object is instance of {@link NodeList}, then all nodes included in the list are appended preserving thir order within the list;
                 * - if the object is String, Boolean or Number, then its valu appended as Text node;
                 * - otherwise Text node containing `{...}` is appended.
                 *
                 * @method append
                 * @memberof Node
                 * @instance
                 * @chainable
                 * @param {Any} node - Object to add.
                 * @return {Node}
                 */
                append (node) {
                    if (undef !== node && null !== node) {
                        if (fw.isNodeList(node)) {
                            node.forEach((n) => this.appendChild(n));
                        } else {
                            const ty = typeof node;
                            if ("string" === ty || "boolean" === ty || "number" === ty) {
                                node = doc.createTextNode(node);
                            }
                            if (!(node instanceof Node)) {
                                node = doc.createTextNode("{...}");
                            }
                            this.appendChild(node);
                        }
                    }
                    return this;
                },
                /**
                 * Appends actual node to the specified node.
                 *
                 * @method appendTo
                 * @memberof Node
                 * @instance
                 * @chainable
                 * @param {Node} node - Node to append to.
                 * @return {Node}
                 */
                appendTo (node) {
                    node.appendChild(this);
                    return this;
                },
                attr (key, data) {
                    if (undef === data) {
                        if (undef === key) {
                            throw new Error("At least one argument must be specified.");
                        }
                        if ("string" === typeof key) {
                            return this.getAttribute(key);
                        }
                        Object.keys(key).forEach((k) => this.setAttribute(k, key[k]));
                        return this;
                    }
                    this.setAttribute(key, data);
                    return this;
                },
                /**
                 * Detaches actual node from DOM. The detached node is returned.
                 *
                 * @method detach
                 * @memberof Node
                 * @chainable
                 * @return {Node} Detached node.
                **/
                detach () {
                    if (this.parentNode) {
                        return this.parentNode.removeChild(this);
                    }
                    return this;
                },
                /**
                 * Returns value at named data store associated with the element.
                 *
                 * @method getUserData
                 * @memberof Node
                 * @param {String} key - Name of the data stored.
                 * @return {Any} Either data stored or undefined.
                 */
                getUserData (key) {
                    return getUserDataForElement(this)[key];
                },
                /**
                 * Returns whether named data store associated with the element
                 * has data assiciated with the specified name.
                 *
                 * @method hetUserData
                 * @memberof Node
                 * @param {String} key - Name of the data stored.
                 * @return {Any} True if named data store contains specified key,
                 * false otherwise.
                 */
                hasUserData (key) {
                    return undef !== getUserDataForElement(this)[key];
                },
                /**
                 * Inserts the specified node after the reference node as a child
                 * of the current node.
                 *
                 * If referenceNode is null, the newNode is inserted at the
                 * beginning of the list of child nodes.
                 *
                 * @method insertAfter
                 * @memberof Node
                 * @instance
                 * @chainable
                 * @param {Node} newNode - The node to be inserted.
                 * @param {Node} [referenceNode] - The node after which newNode is inserted.
                 * @return {Node} The node being inserted.
                 */
                insertAfter (newNode, refNode) {
                    if (!refNode) {
                        return this.prepend(newNode);
                    }
                    if (this !== refNode.parentNode) {
                        throw new Error("Node.insertAfter: invalid reference node.");
                    }
                    if (!refNode.nextSibling) {
                        return this.append(newNode);
                    }
                    return this.insertBefore(newNode, refNode.nextSibling);
                },
                /**
                 * Tartalmazott HTML lekérdezése String-ként.
                 *
                 * @method html
                 * @memberof Node
                 * @return {String} Tartalmazott HTML.
                **/
                /**
                 * Tartalmazott HTML beállítása (minden korábbi HTML felülírásával).
                 *
                 * @method html
                 * @memberof Node
                 * @chainable
                 * @param {String} htmlCode - Beállítandó HTML.
                 * @return {Node} Vonatkozási node.
                **/
                html (value) {
                    if (undefined === value) {
                        return this.innerHTML;
                    }
                    this.innerHTML = value;
                    return this;
                },
                /**
                 * Node(ok) hozzáadása az aktuális node-hoz (első gyerekként).
                 *
                 * @method prepend
                 * @memberof Node
                 * @chainable
                 * @param node {Node|NodeList|jVersus.FakeNodeList} Hozzáadandó Node(ok).
                 * @return {Node} Vonatkozási Node.
                **/
                prepend (node) {
                    if (fw.isNodeList(node)) {
                        node.toArray().forEach((n) => this.prepend(n));
                    } else {
                        const ty = typeof node;
                        if ("string" === ty || "boolean" === ty || "number" === ty) {
                            node = doc.createTextNode(node);
                        }
                        if (!(node instanceof Node)) {
                            node = doc.createTextNode("{...}");
                        }
                        node.prependTo(this);
                    }
                    return this;
                },
                /**
                 * Node hozzáadása egy másik Node-hez (első gyerekként).
                 *
                 * @method prependTo
                 * @memberof Node
                 * @chainable
                 * @param parentNode {Node} Node, amelyhez az aktuális elem
                 * hozzáadandó.
                 * @return {Node} Vonatkozási Node.
                **/
                prependTo (parentNode) {
                    return parentNode.insertBefore(this, parentNode.firstChild || null);
                },
                /**
                 * Set spcified value to the specified property of a node.
                 *
                 * @method prop
                 * @memberof Node
                 * @chainable
                 * @param {String} key - A string naming the property to set.
                 * @param {Any} data - The value to set.
                 * @return {Node} Actual node.
                 */
                /**
                 * Return value of the specified property.
                 *
                 * @method prop
                 * @memberof Node
                 * @param {String} key - Name of the property.
                 * @return {Any} Either data stored or undefined.
                 */
                /**
                 * Set all own properties of the argument object on the actual
                 * node to the values specified by the argument object.
                 *
                 * @method prop
                 * @memberof Node
                 * @param {Object} values - Property <=> value data to set.
                 * @return {Node} Actual node.
                 */
                prop (key, data) {
                    if (undef === data) {
                        if (undef === key) {
                            throw new Error("At least one argument must be specified.");
                        }
                        if ("string" === typeof key) {
                            return this[key];
                        }
                        Object.keys(key).forEach((k) => this[k] = key[k]);
                        return this;
                    }
                    this[key] = data;
                    return this;
                },
                remove () {
                    this.detach();
                },
                /**
                 * Remove a previously-stored piece of data.
                 *
                 * @method removeUserData
                 * @memberof Node
                 * @param {String} key - A string naming the piece of data to remove.
                 * @return {Boolean} Whether specified has been removed.
                 */
                /**
                 * Remove any previously-stored piece of data.
                 *
                 * @method removeUserData
                 * @memberof Node
                 */
                removeUserData (key) {
                    if (undef === key) {
                        userData.remove(this);
                    } else {
                        var data = getUserDataForElement(this);
                        return delete (data[key]);
                    }
                },
                /**
                 * Node lecserélése az aktuális node-ra.
                 *
                 * @method replace
                 * @memberof Node
                 * @chainable
                 * @param {Node} referenceNode - Lecserélendő Node.
                 * @return {Node} Vonatkozási Node.
                 */
                replace (node) {
                    if (this.parentNode) {
                        return this.parentNode.replaceChild(node, this);
                    }
                    return this;
                },
                /**
                 * Store arbitrary data associated with the specified element.
                 *
                 * @method setUserData
                 * @memberof Node
                 * @param {String} key - A string naming the piece of data to set.
                 * @param {Any} data - The new data value; this can be any Javascript type except undefined.
                 */
                setUserData (key, data) {
                    const udata = getUserDataForElement(this);
                    udata[key] = data;
                },
                /**
                 * Store arbitrary data associated with the specified element.
                 *
                 * @method userData
                 * @memberof Node
                 * @chainable
                 * @param {String} key - A string naming the piece of data to set.
                 * @param {Any} data - The new data value; this can be any Javascript type except undefined.
                 * @return {Node} Actual node.
                 */
                /**
                 * Return value at named data store associated with the element.
                 *
                 * @method userData
                 * @memberof Node
                 * @param {String} key - Name of the data stored.
                 * @return {Any} Either data stored or undefined.
                 */
                /**
                 * Store arbitrary data defined by the specified objects
                 * associated with the specified element.
                 *
                 * @method userData
                 * @memberof Node
                 * @param {Object} values - Key <=> value data to store
                 * represented as object.
                 * @return {Node} Actual node.
                 */
                /**
                 * Return a named data store associated with the element as a
                 * live object.
                 *
                 * @method userData
                 * @memberof Node
                 * @return {Object} Named data store.
                 */
                userData (key, data) {
                    if (undef === data) {
                        if (undef === key) {
                            return getUserDataForElement(this);
                        }
                        if ("string" === typeof key) {
                            return this.getUserData(key);
                        }
                        Object.assign(getUserDataForElement(this), key);
                        return this;
                    }
                    this.setUserData(key, data);
                    return this;
                },
                /**
                 * Node "beágyazása" egy másik Element-be. A Node lecserélésre kerül a
                 * kapott Element-tel, majd hozzáadásra kerül az Element-hez.
                 *
                 * @method wrap
                 * @memberof Node
                 * @param element {Element} Beágyazáshoz használt Element.
                 * @return {Element} Paraméterben kapott Element.
                **/
                /**
                 * Element létrehozása és aktuális Node "beágyazása" a létrehozott
                 * Element-be.
                 *
                 * @method wrap
                 * @memberof Node
                 * @param tagName {String} Létrehozandó Element tag-neve.
                 * @return {Element} Létrehozott elem.
                **/
                wrap (tagNameOrElement) {
                    if (tagNameOrElement instanceof Element) {
                        this.replace(tagNameOrElement).appendTo(tagNameOrElement);
                        return tagNameOrElement;
                    }
                    if ("string" === typeof tagNameOrElement) {
                        return this.wrap(doc.createElement(tagNameOrElement));
                    }
                    throw new TypeError("Node.wrap: Invalid parameter " + tagNameOrElement);
                }
            });

            /**
             * Non-live NodeList compatible object. Used when explicit creation is required.
             *
             * @class foo.NodeList
             * @constructor
             * @param {...*} [items] - initial set of Nodes to be contained by the list.
             */
            fw.NodeList = class extends Array {
                constructor (...items) {
                    super();
                    if (items && items.length) {
                        items.forEach(function (item, index) {
                            if (!(item instanceof Node)) {
                                throw new TypeError(`Argument #${index} is not a valid Node.`);
                            }
                            this.push(item);
                        }, this);
                    }
                };
                item (index) {
                    return this[index] || null;
                }
            };

            fw.isNodeList = obj => obj instanceof NodeList || obj instanceof fw.NodeList;
            fw.isElement = obj => obj instanceof Element;

            /**
             * Used as callback to forEach methods.
             *
             * @callback forEachCallback
             * @param {Any} currentValue - The current element being processed.
             * @param {Numeric} index - The index of the current element being processed.
             * @param {Any} source - The object that _forEach()_ is being applied to.
             */

            Object.assign(NodeList.prototype, {
                /**
                 * Executes a provided function once for each element.
                 *
                 * @method forEach
                 * @memberof NodeList
                 * @param {forEachCallback} callback - Function to execute for each element.
                 * @param {Any} thisArg - Value to use as *this* (i.e reference Object) when executing callback.
                 */
                forEach (...args) {
                    Array.prototype.forEach.apply(Array.from(this), args);
                },
                map (...args) {
                    return Array.prototype.map.apply(Array.from(this), args);
                },
                find (...args) {
                    return Array.prototype.find.apply(Array.from(this), args);
                }
            });

            const nodeListExtensions = {
                addClass (cls) {
                    this.forEach(node => fw.isElement(node) && node.addClass(cls));
                },
                removeClass (cls) {
                    this.forEach(node => fw.isElement(node) && node.removeClass(cls));
                },
                toggleClass (cls) {
                    this.forEach(node => fw.isElement(node) && node.toggleClass(cls));
                },
                detach () {
                    const result = new fw.NodeList();
                    this.forEach(node => result.push(node.detach()));
                    return result;
                },
                filter (callback, thisArg) {
                    const result = new fw.NodeList();
                    this.forEach((node, index) => {
                        if (callback.call(thisArg || this, node, index, this)) {
                            result.push(node);
                        }
                    });
                    return result;
                },
                appendTo (node) {
                    if (node instanceof Node) {
                        this.forEach(n => node.append(n));
                        return this;
                    }
                    throw new TypeError("Argument must be Node");
                },
                remove () {
                    this.detach();
                }
            };

            Object.assign(NodeList.prototype, nodeListExtensions);
            Object.assign(fw.NodeList.prototype, nodeListExtensions);

            // ******************************************************************
            // Element extensions

            if (Element.prototype.append && Element.prototype.append !== Node.prototype.append) {
                Element.prototype.append = Node.prototype.append;
            }

            Object.assign(Element.prototype, {
                css (key, data) {
                    if (!this.style) {
                        throw new TypeError("Element does not support styling.");
                    }
                    if (undef === data) {
                        if (undef === key) {
                            throw new Error("At least one argument must be specified.");
                        }
                        if ("string" === typeof key) {
                            return win.getComputedStyle(this).getPropertyValue(key);
                        }
                        Object.keys(key).forEach(k => this.style.setProperty(k, key[k]));
                        return this;
                    }
                    this.style.setProperty(key, data);
                    return this;
                },
                trigger (eventName, eventInit) {
                    if (eventName instanceof Event) {
                        this.dispatchEvent(eventName);
                    } else {
                        const evt = createEvent(eventName, eventInit);
                        this.dispatchEvent(evt);
                    }
                    return this;
                },
                on (eventName, callback, useCapture) {
                    this.addEventListener(eventName, callback, !!useCapture);
                    return  this;
                },
                off (eventName, callback, useCapture) {
                    this.removeEventListener(eventName, callback, !!useCapture);
                    return this;
                }
            });


            /**
             * Returns true if the element would be selected by the specified
             * selector string; otherwise, returns false.
             *
             * Polyfill ({@link https://developer.mozilla.org/en-US/docs/Web/API/Element/matches|MDN}).
             * This method may be implemented by browser. Existing implementation
             * will be used if possible.
             *
             * @method matches
             * @memberof Element
             * @param {String} selectorString - a string representing the
             * selector to test.
             * @return {Boolean} true if the actual elements matches the selector,
             * false otherwise.
             **/
            if (!Element.prototype.matches) {
                const matchKeys = "matchesSelector mozMatchesSelector msMatchesSelector oMatchesSelector webkitMatchesSelector".split(" ");
                const matchKey = matchKeys.find(key => !!Element.prototype[key]);
                if (matchKey) {
                    Element.prototype.matches = Element.prototype[matchKey];
                } else {
                    Element.prototype.matches = function (selector) {
                        this.ownerDocument.querySelectorAll(selector).some(x => x === this);
                    };
                }
            }

            /**
             * Returns the closest ancestor of the current element (or the current
             * element itself) which matches the selectors given in parameter. If
             * there isn't such an ancestor, it returns null.
             *
             * Polyfill ({@link https://developer.mozilla.org/en-US/docs/Web/API/Element/closest|MDN}).
             * This method may be implemented by browser. Existing implementation
             * will be used if possible.
             *
             * @method
             * @memberof Element
             * @param {String} selectorString - a string representing the
             * selector to test.
             * @return {Element} Element which is the closest ancestor of the
             * selected elements. It may be null.
             */
            if (!Element.prototype.closest) {
                Element.prototype.closest = function (selector) {
                    let ancestor = this;
                    do {
                        if (ancestor.matches(selector)) {
                            return ancestor;
                        }
                        ancestor = ancestor.parentElement || ancestor.parentNode;
                    } while (ancestor && ancestor instanceof Element);
                    return null;
                };
            }

            // ******************************************************************
            // KeyboardEvent

            window.on = function (...args) {
                Element.prototype.on.apply(this, args);
                return this;
            };
            window.off = function (...args) {
                Element.prototype.off.apply(this, args);
                return this;
            };
            window.trigger = function (...args) {
                Element.prototype.trigger.apply(this, args);
                return this;
            };

            // ******************************************************************
            // KeyboardEvent

            Object.def(KeyboardEvent.prototype, {
                whichKey: {
                    get () {
                        var res = this.which;
                        if (null === res || undefined === res) {
                            if (null === this.charCode || undefined === this.charCode) {
                                res = this.keyCode;
                            } else {
                                res = this.charCode;
                            }
                        }
                        return res;
                    },
                    enumerable: true
                }
            });
        });
    }
});