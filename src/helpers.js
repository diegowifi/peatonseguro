define(function() {
    function extend(target) {
        var sources = [].slice.call(arguments, 1);
        var si;
        for (si = 0; si < sources.length; si++) {
            var source = sources[si], prop;
            for (prop in source) {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    function format(s) {
        // String formatting function.
        // From http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
        var i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i + 1]);
        }

        return s;
    }

    function url(f) {
        var params = Array.prototype.slice.call(arguments, 1).map(function(param) {
            return encodeURIComponent(param);
        });

        return format.apply(this, [f].concat(params));
    }


    return {
        extend: extend,
        format: format,
        url: url
    };
});
