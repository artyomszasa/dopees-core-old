/*global dope window */

dope.initComponent({
    name: "core.classlist",
    depends: "core.polyfill",
    init: fw => fw.polyfill("WeakMap").then(() => {
        if (!document.createElement('div').classList) {
            const ws = /\s+/;
            const instances = new WeakMap();
            /**
             * Creates {@link dope.ClassList} for specified node.
             *
             * @class ClassList
             * @classdesc Element.classList polyfill loaded on demand.
             * @memberof dope
             * @param {Element} node - target node.
             */
            dope.ClassList = class {
                constructor (node) {
                    if (!node) {
                        throw new TypeError("Node must be defined");
                    }
                    if (!(node instanceof Node)) {
                        throw new TypeError(`Invalid node: ${node}`);
                    }
                    this.node = node;
                }
                parse () {
                    return this.node.className.split(ws);
                }
                apply (classNames) {
                    this.className = classNames.join(' ');
                }
                /**
                 * Add specified class values. If these classes already exist in attribute of the element, then they
                 * are ignored.
                 *
                 * @param {...String} classes - Class values to add.
                 */
                add (...classes) {
                    const toAdd = classes.reduce((a, b) => a.concat(b), []);
                    const actual = this.parse();
                    toAdd.forEach(cls => {
                        if (-1 === actual.indexOf(cls)) {
                            actual.push(cls);
                        }
                    });
                    this.apply(actual);
                }
                /**
                 * Remove specified class values.
                 *
                 * @param {...String} classes - Class values to remove.
                 */
                remove (...classes) {
                    const toRemove = classes.reduce((a, b) => a.concat(b), []);
                    const actual = this.parse();
                    toRemove.forEach(cls => {
                        const index = actual.indexOf(cls);
                        if (-1 !== index) {
                            actual.splice(index, 1);
                        }
                    });
                    this.apply(actual);
                }
                /**
                 * Return class value by index in collection.
                 *
                 * @param {Number} index - Index of the class value to return.
                 * @return {undefined|String} Either class value at the specified position or undefined.
                 */
                item (index) {
                    return this.parse()[index];
                }
                /**
                 * Toggle class value; i.e., if class exists then remove it and return false, if not, then add it and
                 * return true.
                 *
                 * @param {String} className - Class value to toggle.
                 * @return {Boolean} _true_, if class value has been added, _false_ otherwise.
                 *//**
                 *
                 * If the second argument evaluates to true, add specified class value, and if it evaluates to false,
                 * remove it.
                 *
                 * @param {String} className - Class value to set or remove.
                 * @param {Boolean} force - Whether to set or to remove the specified class.
                 */
                toggle (...args) {
                    var result;
                    if (0 === args.length) {
                        return;
                    }
                    const cls = args[0];
                    if (args.length >= 2) {
                        const force = args[1];
                        if (force) {
                            this.add(cls);
                        } else {
                            this.remove(cls);
                        }
                    } else {
                        const actual = this.parse();
                        const index = actual.indexOf(cls);
                        if (-1 === index) {
                            actual.push(cls);
                            result = true;
                        } else {
                            actual.splice(index, 1);
                            result = false;
                        }
                        this.apply(actual);
                    }
                    return result;
                }
                /**
                 * Checks if specified class value exists in class attribute of the element.
                 *
                 * @param {String} className - Value to check.
                 */
                contains (cls) {
                    return -1 !== this.parse().indexOf(cls);
                }
            };

            Object.def(Element.prototype, {
                /**
                 * Polyfilled property, see
                 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList|MDN} for details.
                 *
                 * @member {dope.ClassList|DOMTokenList} classList
                 * @memberof Element
                 */
                classList: {
                    enumerable: true,
                    get () {
                        var classList = instances.get(this);
                        if (classList) {
                            return classList;
                        }
                        classList = new dope.ClassList(this);
                        instances.set(this, classList);
                        return classList;
                    }
                }
            });
        }
    })
})