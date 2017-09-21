/*global define: true */
define(['domlib'], function ($) {
    'use strict';

    var setMessage,
        createLoaderMessage,
        cycleThroughMessages;

    setMessage = function setMessage($loaderMsg, i, params) {
        var timeout = params.timeout || 1500;

        setTimeout(function () {
            if (i < params.messages.length) {
                $loaderMsg.text(params.messages[i]);
                i = i + 1;
                setMessage($loaderMsg, i, params);
            }
        }, timeout);
    };

    createLoaderMessage = function createLoaderMessage($loader) {
        var $newLoaderMsg;

        $newLoaderMsg = $(document.createElement("div"));
        $newLoaderMsg.addClass("loaderMsg");

        $loader.append($newLoaderMsg);
    };

    cycleThroughMessages = function cycleThroughMessages($loader, params) {
        var i,
            messagesLength,
            $loaderMsg;

        if (typeof params === 'object' && (typeof params.messages === 'object')) {
            messagesLength = params.messages.length;

            if (messagesLength > 0) {
                $loaderMsg = $loader.find('.loaderMsg');

                if (!$loaderMsg.length) {
                    $loaderMsg = createLoaderMessage($loader);
                }

                i = 0;
                setMessage($loaderMsg, i, params);
            }
        }
    };

    /*
    *  Generate loader
    */
    return function (element, message, small, params) {
        var loader;

        if ($(element).is('body')) {
            loader = $('<div class="loader"><div class="loaderMsg">' + message + '</div></div>');
        } else {
            loader = $('<div class="loader"></div>').text(message);
        }

        if (small) {
            loader.addClass('small');
        }
        if ($(element).is('body')) {
            loader.css({
                'height': $(window).height(),
                'opacity': '.7',
                'position': 'fixed'
            });
        }
        if ($(element).is('input')) {
            $(element).addClass('btnLoader');
        } else {
            if ($(element).css('position') !== 'absolute') {
                $(element).css('position', 'relative');
            }
            $(element).append(loader);
        }

        cycleThroughMessages(loader, params);
    };

});