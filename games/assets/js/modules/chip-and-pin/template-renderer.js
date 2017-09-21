define(['modules/settings/common'], function (SETTINGS) {
    "use strict";
    return {
        renderToView: function (template, options, callback) {
            var opts = $.extend(options, {section: "kiosk"}),
                url = SETTINGS.CONSTANTS.URL.GENERIC.MVAPI_TEMPLATES_PATH + opts.section + '/' + template + '.html';
            callback = callback || $.noop;
            $.get(url).done(function (result) {
                if (opts.parent) {
                    opts.parent.append(result);
                }
                callback(null, result);
            }).fail(function (e) {
                callback(e);
            });
        }
    };
});