define(['domlib', 'modules/breakpoint', 'modules/common'], function ($, breakpoint, common) {
    'use strict';

    var orderConfirmation = {

        printLinks: function printLinks() {
            $('#order-confirmation-header, #order-confirmation-footer').find('.print a').on('tap click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.print();
            });
        },

        init: function init() {
            var self = orderConfirmation;

            self.printLinks();
            self.bindEvents();
            if (breakpoint.largeDesktop || breakpoint.desktop) {
                self.setAdPosition();
            }
        },
        setAdPosition: function setAdPosition() {
            if ($('#payment-summary').length && $('#order-confirmation-ad').length) {
                var containersHeight = $('#payment-summary').offset().top + $('#payment-summary').height();
                $('#order-confirmation-ad').css({
                    top: (containersHeight - 55) + 'px'
                });
                $('#order-confirmation-ad').closest('#page-container').css('min-height', '1500px');
            }
        },

        bindEvents: function bindEvents() {

            $('#fuel-save-heading').on('tap click', function (e) {
                e.preventDefault();
                orderConfirmation.triggerFuelSaveTooltip();
            });

            $('#fuel-save-mask').on('tap click', function (e) {
                e.preventDefault();
                $('#fuel-save-tooltip').hide();
                $('#fuel-save-mask').hide();
            });

            $('#fuel-save-tooltip .close').on('tap click', function (e) {
                e.preventDefault();
                $('#fuel-save-tooltip').hide();
                $('#fuel-save-mask').hide();
            });
            $(window).on('breakpointChange', function changeAdPos(event) {
                if (event.newViewport === 'mobile' || event.newViewport === 'tablet') {
                    if ($('#order-confirmation-ad').length) {
                        $('#order-confirmation-ad').css('top', 'inherit');
                        $('#order-confirmation-ad').closest('#page-container').css('min-height', 'inherit');
                    }
                }
                if (event.newViewport === 'largedesktop' || event.newViewport === 'desktop') {
                    orderConfirmation.setAdPosition();
                }
            });
        },

        triggerFuelSaveTooltip: function triggerFuelSaveTooltip() {
            var html,
                back;

            if (breakpoint.mobile) {
                html = $('#fuel-save-tooltip').find('.content').clone().wrap('<p>').parent().html();
                back = '<a href="#" class="back"><span class="icon" data-icon="g" aria-hidden="true"></span> Back</a>';

                common.virtualPage.show({
                    content: back + html + back,
                    closeSelector: '.close',
                    customClass: 'fuel-save-vp'
                });

            } else {
                $('#fuel-save-tooltip').show();
                $('#fuel-save-mask').show();
            }
        }
    };

    common.init.push(function () {
        orderConfirmation.init();
    });

    return orderConfirmation;

});