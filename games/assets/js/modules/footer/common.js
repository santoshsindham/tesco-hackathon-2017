/**
 * Footer Module
 */
/*global common: true*/
define(['domlib', 'modules/breakpoint', 'modules/common'], function ($, breakpoint, common) {
    'use strict';

    var footer = {
        //footer accordion selector
        accordion: '.accordion',

        showAccordianItem: function showAccordianItem(accordionItem) {
            this.hideAccordianItem($('.accordion-element'));
            accordionItem.addClass('accordion-item-active');
        },

        hideAccordianItem: function hideAccordianItem(accordionItem) {
            accordionItem.css('min-height', 0)
                .removeClass('accordion-item-active');

        },

        checkAccordianItemsHeight: function checkAccordianItemsHeight(accordion) {
            if (accordion.length > 0) {
                accordion.each(function () {
                    var content = $(this).find('.content');
                    if (breakpoint.mobile) {
                        $(window).load(function () {
                            /*jslint unparam:true*/
                            //To stop unused variable error with JSLint (i  & e)
                            content.each(function (i, e) {
                                var self = $(this),
                                    myHeight = self.height();
                                self.data('contentHeight', myHeight);
                            });
                            content.each(function (i, e) {
                                var self = $(this);
                                self[0].style.minHeight = self.data('contentHeight') + 'px';
                            });
                            /*jslint unparam:false*/
                        });
                    } else {
                        content.css('min-height', '0');
                    }
                });

            }
        },

        bindEvents: function bindEvents(accordion) {
            accordion.on('tap click', '.title-box', function () {
                if (breakpoint.mobile) {
                    //check if mobile
                    var self = $(this),
                        accordionItem = self.parent('.accordion-element');

                    if (accordionItem.hasClass('accordion-item-active')) {
                        footer.hideAccordianItem(accordionItem);
                    } else {
                        footer.showAccordianItem(accordionItem);
                    }
                }
                return false;
            });
        },

        mobileInOut: function mobileInOut() {
            footer.checkAccordianItemsHeight($(footer.accordion));
        },

        setup: function setup(accordion) {
            accordion.each(function () {
                var self = $(this);
                footer.bindEvents(self);
            });
        },

        init: function init() {
            var accordion = $(footer.accordion);
            //check footer element exists
            if (accordion.length) {
                footer.setup(accordion);

                /** Add functions to breakpoint arrays **/
                breakpoint.mobileIn.push(footer.mobileInOut);
                breakpoint.mobileOut.push(footer.mobileInOut);

                if (!common.checkPreviewEnvironment(document.URL)) {
                    common.showCookieBanner();
                }
            }
        }

    };

    //Initialise this module
    common.init.push(footer.init);

});
