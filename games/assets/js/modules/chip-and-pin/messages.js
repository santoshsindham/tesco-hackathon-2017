/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,$ */
define('modules/chip-and-pin/messages', ['domlib', 'modules/mvapi/common'], function ($, mvApi) {
    'use strict';

    var model, placeholder, messageTypes = ['error', 'info', 'warning'],
        isOneOfAcceptedTypes = function isOneOfAcceptedTypes(type) {
            return ($.inArray(type, messageTypes) !== -1);
        },
        show = function show(text, type, placeholderClass) {
            if (placeholderClass) {
                placeholder = placeholderClass;
            } else {
                placeholder = ($('.kiosk-lightbox').length) ? 'fnModal.message' : 'message';
            }
            model = {
                'placeholderClass': placeholder,
                'defaults': {
                    'type': (isOneOfAcceptedTypes(type)) ? type : 'info',
                    'text': text || ''
                }
            };
            mvApi.render('message', model);
        },

        remove = function remove(className) {
            var placeholderClass = className || '.content';
            $(placeholderClass + ' > .message').empty();
        };

    (function init() {
        console.log('[Kiosk Chip&Pin] Messages initialized...');
    }());

    return {
        show: show,
        remove: remove
    };
});