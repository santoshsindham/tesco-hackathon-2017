/**
 * ManageStockAlerts Module
 */
/*global jQuery,common: true*/
define(['domlib', 'modules/common'], function ($, common) {
    'use strict';

    var manageStockAlerts = {

        jumpToStockAlert: function jumpToStockAlert() {
            var $anchorStock = $("div.stock-alert-block.anchor-stock:first"),
                position;
            if ($anchorStock.length) {
                position = $anchorStock.offset().top;
                if (jQuery !== undefined) {
                    $('html, body').animate({
                        scrollTop: position
                    }, 500);
                } else {
                    $(document).scrollTop(position);
                }
            }
        },

        init: function init() {
            var self = manageStockAlerts;
            self.jumpToStockAlert();
        }

    };

    common.init.push(function () {
        manageStockAlerts.init();
    });

    return manageStockAlerts;

});