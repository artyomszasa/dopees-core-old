//vim: set tabstop=4 shiftwidth=4 expandtab:
if (String.prototype.repeat === undefined) {
    String.prototype.repeat = function(count) {
        var str = "",
            i;

        for (i = 0; i < count; i = i + 1) {
            str += this;
        }

        return str;
    };
}