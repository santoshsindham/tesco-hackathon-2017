/*globals define*/
define([
    'domlib',
    'modules/pdp-configurator/observer',
    'modules/breakpoint',
    'modules/common'
], function ($, observer) {
    'use strict';
    var init,
        initListeners,
        $parentContainer;

    init = function init(containerSelector) {
        $parentContainer = $(containerSelector);
        initListeners();
    };

    initListeners = function initListeners() {
        $parentContainer.find('a').on('click', function (e) {
            e.preventDefault();
            observer.publish('inspiration-panel,' + $(this).data('action'), e);
        });
    };

    return {
        init: init
    };
});