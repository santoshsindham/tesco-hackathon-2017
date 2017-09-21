/*global define: true */
define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/overlay/common'], function ($, breakpoint, common, overlay) {

    'use strict';

    var delivery = {
        el : '',
        visible : false,
        content : '#templt-delivery-options',

        show : function (e) {

            e.preventDefault();

            var opts,
                url = $('.delivery-options-flyout').data('overlay-url');

            $.ajax({
                url : url,
                success : function (data) {
                    if (breakpoint.mobile || breakpoint.vTablet) {
                        opts = {
                            content : data,
                            closeSelector : '.back'
                        };
                        common.virtualPage.show(opts);
                    } else {
                        opts = {
                            content : data,
                            // targetElement: 'body',
                            // overlayVisible: true,
                            // overlayType: 'lightbox',
                            callback : '',
                            defaultBreakPointBehavior : true,
                            customClass : '',
                            isError : false,
                            fixedWidth : 713
                        };
                        overlay.show(opts);
                    }
                }
            });

            return false;
        },

        init : function () {
            delivery.el = $(".delivery-options-flyout");
            delivery.el = $(delivery.el);
            delivery.bindEvents();
            if (delivery.el.length) {
                delivery.content = $(delivery.content).html();
                window.location.hash = '';
                // moved into init to stop all overlays from being hidden across
                // the site on viewport change
                breakpoint.hTabletIn.push(common.virtualPage.close);
                if (!$('.page-error').length) {
                    breakpoint.vTabletIn.push(overlay.hide);
                }
            }
        }
    };

    return delivery;

});