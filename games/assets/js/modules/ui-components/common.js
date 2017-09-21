/*jslint plusplus: true */
/*globals window,document,console,define,require,$ */
define('modules/ui-components/common', ['modules/ui-components/characterCount'], function (cCount) {
    'use strict';

    return {
        characterCounter: cCount
    };

});