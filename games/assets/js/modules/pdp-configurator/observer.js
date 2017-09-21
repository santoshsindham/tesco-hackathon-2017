/*globals define*/
define([
    'domlib',
    'modules/breakpoint',
    'modules/common'
], function () {
    'use strict';
    var subscribers = [],
        subscribe,
        unsubscribe,
        publish,
        loopThroughSubscribers;

    subscribe = function (callback) {
        subscribers.push(callback);
    };

    unsubscribe = function (callback) {
        loopThroughSubscribers('unsubscribe', callback);
    };

    publish = function () {
        loopThroughSubscribers('publish', arguments);
    };

    loopThroughSubscribers = function (action, arg) {
        var i, max = subscribers.length;

        for (i = 0; i < max; i += 1) {
            if (action === 'publish') {
                subscribers[i].apply(this, arg);
            } else if (subscribers[i] === arg) {
                subscribers.splice(i, 1);
            }
        }
    };

    return {
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish
    };
});