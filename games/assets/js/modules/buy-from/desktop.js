/*global define:true */
/*jslint plusplus: true, regexp: true */
define(['domlib', './common', '../common'], function ($, buyFrom, common) {
    'use strict';
    common.init.push(function () {
        if (!window.AsyncBlockController.isCachedPage()) {
            buyFrom.init($(".buy-from"));
        }
    });

});