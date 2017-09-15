/*global window dope dopeVars*/

dope.async(
    dopeVars.component,
    dope.component('extensions.array', 'extensions.object', 'extensions.iterable')
        .then(() => {
            const w = window;
            if (!w.Map) {

                const mkNode = (k, v) => Object.create(null, {
                    key: {
                        value: k,
                        configurable: false,
                        writable: false,
                        enumerable: true
                    },
                    value: {
                        value: v,
                        configurable: false,
                        writable: true,
                        enumerable: true
                    }
                });

                class MapIterator {
                    constructor (map) {
                        this.map = map;
                        this.i = 0;
                        this.j = 0;
                    }
                    next () {
                        if (this.i >= this.map.__buckets.length) {
                            return { done: true };
                        }
                        const bucket = this.map.__buckets[this.i];
                        if (this.j >= bucket.length) {
                            this.i = this.i + 1;
                            this.j = 0;
                            return this.next();
                        }
                        const node = bucket[this.j];
                        return {
                            value: [node.key, node.value],
                            done: false
                        };
                    }
                };

                w.Map = class Map {
                    // FIXME: handle iterable argument
                    constructor () {
                        this.__buckets = {};
                    }
                    get size () {
                        return this.__buckets.reduce((count, bucket) => count + bucket.length, 0);
                    }
                    __findNode (key) {
                        const hash = Object.dopeHashCode(key);
                        const bucket = this.__buckets[hash];
                        if (bucket) {
                            const node = bucket.find(node => Object.dopeEquals(key, node.key));
                            return node;
                        }
                        return null;
                    }
                    clear () {
                        this.__buckets = {};
                    }
                    delete (key) {
                        const hash = Object.dopeHashCode(key);
                        const bucket = this.__buckets[hash];
                        if (bucket) {
                            const index = bucket.findIndex(node => Object.dopeEquals(key, node.key));
                            if (-1 !== index) {
                                bucket.splice(index, 1);
                                return true;
                            }
                        }
                        return false;
                    }
                    entries () {
                        return new MapIterator(this);
                    }
                    forEach (callback, thisArg) {
                        Object.keys(this.__buckets).forEach(bucketKey => {
                            this.__buckets[bucketKey].forEach(node => {
                                callback.call(thisArg, node.value, node.key, this);
                            });
                        });
                    }
                    get (key) {
                        const node = this.__findNode(key);
                        return (node && node.value) || dope.undef;
                    }
                    has (key) {
                        return !!this.__findNode(key);
                    }
                    keys () {
                        return dope.Iterable.map(this.entries(), item => item[0]);
                    }
                    set (key, value) {
                        const hash = Object.dopeHashCode(key);
                        let bucket = this.__buckets[hash];
                        if (!bucket) {
                            bucket = [mkNode(key, value)];
                            this.__buckets[hash] = bucket;
                        } else {
                            const node = bucket.find(n => Object.dopeEquals(key, n.key));
                            if (node) {
                                node.value = value;
                            } else {
                                bucket.push(mkNode(key, value));
                            }
                        }
                        return this;
                    }
                    values () {
                        return dope.Iterable.map(this.entries(), item => item[1]);
                    }
                };

                if (w.Symbol && w.Symbol.iterator) {
                    Object.defineProperty(w.Map.prototype, w.Symbol.iterator, {
                        value: w.Map.prototype.entries,
                        configurable: true,
                        enumerable: false,
                        writable: true
                    });
                }
            }
        })
);