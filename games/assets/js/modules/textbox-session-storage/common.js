/*jslint plusplus: true */
/*globals window,document,console,define,require,sessionStorage */
define('modules/textbox-session-storage/common', ['domlib'], function ($) {
    'use strict';

    var retrieve,
        save,
        init,
        $textInputs;

    retrieve = function retrieve() {
        $textInputs.each(function () {
            var $text = $(this),
                key = $text.data('key'),
                sessionValue;

            if (sessionStorage.getItem(key)) {
                sessionValue = sessionStorage.getItem(key).toString();
                $text.val(sessionValue);
                $text.trigger('keyup');
            }
        });
    };

    save = function save() {
        $textInputs.each(function () {
            var $text = $(this),
                key = $text.data('key');

            if (!$text.hasClass("no-save")) {
                if ($text.val() !== "") {
                    sessionStorage.setItem(key, $text.val());
                } else {
                    if (sessionStorage.getItem(key)) {
                        sessionStorage.removeItem(key);
                    }
                }
            }
        });
    };

    init = function init(textboxSelectors) {
        if (sessionStorage) {
            $textInputs = $(textboxSelectors);
            retrieve();
            window.onbeforeunload = save;
            $textInputs.on('blur', save);
        }
    };

    return {
        init: init,
        save: save
    };
});