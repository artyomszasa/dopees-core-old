/*global dope window*/

dope.initComponent({
    name: "core.cancellation",
    init (dope) {
        const w = window;

        dope.ExecutionCancelled = class ExecutionCancelled extends Error {
            constructor (message) {
                super (message);
                this.name = this.constructor.name;
                if (typeof Error.captureStackTrace === 'function') {
                    Error.captureStackTrace(this, this.constructor);
                } else {
                    this.stack = (new Error(message)).stack;
                }
            }
        };

        dope.CancellationToken = class CancellationToken {
            constructor (source) {
                if (!source) {
                    throw new TypeError('Cancellation token source must be provided.');
                }
                Object.defineProperty(this, 'source', {
                    value: source,
                    writable: false,
                    configurable: false,
                    enumerable: true
                });
            }
            get isCancelled () {
                return this.source.isCancelled;
            }
            throwIfCancelled () {
                if (this.isCancelled) {
                    throw new dope.ExecutionCancelled();
                }
            }
            onCancelled (callback) {
                return this.source.onCancelled(callback);
            }
            offCancelled (callback) {
                this.source.offCancelled(callback);
            }
        };

        const setTimeout = (that, milliseconds) => w.setTimeout(() => {
            that.cancel();
            delete that.timeout;
        }, milliseconds);

        dope.CancellationTokenSource = class CancellationTokenSource {
            constructor (milliseconds) {
                this.isCancelled = false;
                this.callbacks = [];
                if (milliseconds) {
                    this.timeout = setTimeout(this, milliseconds);
                }
            }
            get token () {
                return new dope.CancellationToken(this);
            }
            cancel () {
                if (!this.isCancelled) {
                    this.isCancelled = true;

                }
            }
            cancelAfter (milliseconds) {
                if (this.timeout) {
                    w.clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(this, milliseconds);
            }
            offCancelled (callback) {
                var index = this.callbacks.findIndex(value => Object.equals(value, callback));
                if (-1 !== index) {
                    this.callbacks.splice(index, 1);
                }
            }
            onCancelled (callback) {
                const that = this;
                this.callbacks.push(callback);
                return {
                    dispose () {
                        that.offCancelled(callback);
                    }
                };
            }
        };
    }
});