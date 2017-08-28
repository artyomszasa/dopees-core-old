/*global dope window*/

dope.initComponent({
    name: 'core.async.interator',
    init (dope) {
        'use strict';

        const w = window;
        const mkKey = w.Symbol ? (key => w.Symbol(key)) : (key => `__async_iterator_${key}`);

        const keyProduce = mkKey('producer');
        const keyState = mkKey('state');

        const mkResult = value => {
            return new {
                done: false,
                value: value
            }
        };

        dope.AsyncIterator = class AsyncIterator {
            constructor (produce, state) {
                Object.def(this, {
                    [keyProduce]: {
                        value: produce,
                        enumerable: false,
                        writable: false,
                        configurable: false
                    },
                    [keyState]: {
                        value: state,
                        enumerable: false,
                        writable: true,
                        configurable: false
                    }
                });
            }
            next () {
                return this[keyProduce](this[keyState])
                    .then(res => {
                        this[keyState] = res.state;
                        const result = { done: res.done };
                        if (!res.done) {
                            result.value = res.value;
                        }
                        return result;
                    });
            }
            map (callback, thisArg) {
                let i = -1;
                const produce = () => {
                    return this.next()
                        .then(res => {
                            if (res.done) {
                                return res;
                            }
                            i = i + 1;
                            Promise.resolve(callback.call(thisArg, res.value, i)).then(mkResult);
                        });
                };
                return new dope.AsyncIterator(produce);
            }
            filter (callback, thisArg) {
                let i = -1;
                const produce = () => {
                    return this.next()
                        .then(res => {
                            if (res.done) {
                                return res;
                            }
                            i = i + 1;
                            Promise.resolve(callback.call(thisArg, res.value, i))
                                .then(success => success ? res : produce());
                        });
                };
                return new dope.AsyncIterator(produce);
            }
            forEach (callback, thisArg) {
                let i = -1;
                const iter = () => {
                    return this.next()
                        .then(res => {
                            if (res.done) {
                                return Promise.resolve();
                            }
                            i = i + 1;
                            return Promise.resolve(callback.call(thisArg, res.value, i)).then(iter);
                        });
                };
                return iter();
            }
        };
    }
});