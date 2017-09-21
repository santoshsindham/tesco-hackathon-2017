/*globals define*/
define([
    'domlib',
    'modules/common',
    'modules/pdp-configurator/configurator'
], function ($, common, configurator) {
    'use strict';
    var init = function init() {
        if ($('.pdp-configurator').length > 0) {
            configurator.init();
        }
    };

    common.init.push(init);
});