/*global dope*/

dope.Iterable = {

    map (iterator, selector, thisArg) {
        let i = -1;
        return {
            next () {
                const orig = iterator.next();
                if (orig.done) {
                    return { done: true };
                }
                i = i + 1;
                return {
                    done: false,
                    value: selector.call(thisArg, orig.value, i)
                };
            }
        };
    },
    filter (iterator, predicate, thisArg) {
        let i = -1;
        return {
            next () {
                while (true) {
                    const orig = iterator.next();
                    if (orig.done) {
                        return { done: true };
                    }
                    i = i + 1;
                    if (predicate.call(thisArg, orig.value, i)) {
                        return {
                            done: false,
                            value: orig.value
                        };
                    }
                }
            }
        };
    }

};