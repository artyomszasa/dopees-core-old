/*global dope window*/

dope.initComponent({
    name: "extensions.promise",
    init () {
        'use strict';
        Promise.map = (source, func) => {
            const result = [];
            const iterate = i => {
                if (source.length === i) {
                    return Promise.resolve(result);
                }
                return Promise.resolve(func(source[i]))
                    .then(resultN => result.push(resultN))
                    .then(() => iterate(i + 1));
            };
            return iterate(0);
        };
    }
});