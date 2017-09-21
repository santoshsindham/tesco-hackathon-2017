/*globals define,require,window */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/product-description/wishlist', ['domlib'], function ($) {
    'use strict';

    var wishlist = {
        init: function init() {
            $(".product-description").find(".add-to-wishlist").on("click tap", function (e) {
                if ($(".user-wishlists").length) {
                    e.preventDefault();
                    require(['modules/buy-from/common'], function (buyFrom) {
                        buyFrom.triggerTooltip($(".add-to-wishlist"));
                    });

                }
            });
        },
        asyncBlockCallbacks: function asyncBlockCallbacks() {
            var oCallbacks = {},
                self = this;
            oCallbacks.success = function (oResp) {
                if (typeof oResp === "string") {
                    oResp = $.parseJSON(oResp);
                }
                $('.wishlist-button').replaceWith(oResp[this.sBlockID]);
                self.init();
            };
            return oCallbacks;
        }
    };
    return wishlist;
});