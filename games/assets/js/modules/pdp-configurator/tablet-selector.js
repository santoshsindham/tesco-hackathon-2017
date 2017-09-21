/*globals window, define*/
define([
    'domlib',
    'modules/pdp-configurator/product-factory',
    'modules/breakpoint',
    'modules/common'
], function ($, ProductFactory) {
    'use strict';
    var tabletSelector = new ProductFactory('tablet');

    tabletSelector.initRatings = function () {
        if (window.$BV && window.$BV.configure && window.$BV.ui) {
            window.$BV.configure('global', {
                productId: $.trim(tabletSelector.currentSKU)
            });
            window.$BV.ui("rr", "show_reviews");
        }
    };

    tabletSelector.inits.push(tabletSelector.initRatings);
    return tabletSelector;
});