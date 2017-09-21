/*globals define*/
/*jslint plusplus:true*/
define([
    'domlib',
    'modules/breakpoint',
    'modules/common'
], function () {
    'use strict';
    var subscribers = [];

    return {
        subscribe: function (subscribeFn) {
            subscribers.push(subscribeFn);
            return subscribers;
        },
        update: function () {
            var len = subscribers.length,
                i;

            for (i = 0; i < len; i++) {
                subscribers[i].apply(this, arguments);
            }
        }
    };
});