/*globals define,require,window */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/fixed-header/init', ['modules/fixed-header/common', 'modules/searchify/common', 'modules/common'], function (FixedHeader, Searchify, common) {
    'use strict';

    var oFixedHeader = new FixedHeader(),
        oSearchify = new Searchify();

    window.FixedHeader = oFixedHeader;
    window.Searchify = oSearchify;

    common.init.push(function () {
        oFixedHeader.init(true);
        oSearchify.init();
    });

});