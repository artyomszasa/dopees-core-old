// vim: set tabstop=4 shiftwidth=4 expandtab:

if (undefined === Function.prototype.bind) {
    // TODO: Megcsinálni rfc szerint: http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.5
    Function.prototype.bind = function (scope) {
        var f = this,
            args = Array.prototype.slice.call(arguments);
        return function () {
            var pass = args.concat(Array.prototype.slice.call(arguments));
            f.apply(scope, pass);
        };
    };
}


