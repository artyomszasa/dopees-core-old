/*global dope window*/

dope.initComponent({
    name: 'extensions.dom',
    depends: 'core.dom',
    init () {
        'use strict';

        Object.assign(Element.prototype, {
            copyAttrsTo (target, ...names) {
                const attrs = this.attributes;
                names.forEach(name => {
                    const attr = attrs.getNamedItem(name);
                    if (attr) {
                        target.setAttribute(attr.name, attr.value);
                    }
                });
                return this;
            },
            copyAttrsFrom (source, ...names) {
                Element.prototype.copyAttrsTo.apply(source, [this].concat(names));
                return this;
            }
        });
    }
});