/*jslint regexp: true, nomen: true */
/*globals window,document,console,define,require,jQuery */
define('modules/settings/common', ['modules/settings/constants'], function (constants) {
    'use strict';
    var self = {
        ENV: window.ENV || '',
        CONTEXT_PATH: window.contextPath || '',
        CONSTANTS: constants
    };
    return self;

});