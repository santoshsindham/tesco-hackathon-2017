/*global define, window, history, document, setTimeout */
/**
 * Breadcrumb Module : Manage breadcrumb
 */
define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/breadcrumb-cache/common'], function ($, breakpoint, common, breadcrumbCache) {

    'use strict';

    var crumb = {

        element: null,
        itemNum: 0,
        isOpen: false,
        totalWidth: 0,
        maxMobileLength: 35,
        maxTabletLength: 90,
        sBreadcrumbElementId: '#breadcrumb',

        /**
         * Get li height from mobile viewport for open / close animation
         * @return {int} LI line hight for an individual breadcrumb item.
         */
        liHeight: function () {
            return $('li', crumb.element).eq(0).outerHeight();
        },

        ulHeight: function () {
            return $('ul', crumb.element).eq(0).outerHeight();
        },

        supportsHistoryApi: function () {
            return !!(window.history && history.pushState);
        },

        /**
         * Add interaction for mobile
         * @param  {boolean} setMobile Run mobile JS?
         */
        mobileIn: function () {
            setTimeout(function () {
                crumb.close(false);
                crumb.element.css({
                    height: crumb.liHeight()
                }).addClass('animate');
            }, 25);
        },

        mobileOut: function () {
            crumb.open(false);
            crumb.element.css({
                height: 'auto'
            }).removeClass('animate');
        },


        /**
         * Open breadcrumb (Mobile and Vertical tablet only)
         */
        open: function (animate) {

            if (crumb.element.hasClass('noAnimate')) {
                crumb.element.removeClass('noAnimate');
            }

            //show all breadcrumbs
            if (animate) {
                if (crumb.sBreadcrumbElementId === '#breadcrumb-v2') {
                    if (!common.isModern()) {
                        crumb.element.animate({
                            // height: (crumb.liHeight() * crumb.itemNum)
                            height: crumb.ulHeight()
                        }, 600, 'easeInOutQuart');
                    } else {
                        crumb.element.css({
                            // height: (crumb.liHeight() * crumb.itemNum)
                            height: crumb.ulHeight()
                        });
                    }
                } else {
                    if (!common.isModern()) {
                        crumb.element.animate({
                            // height: (crumb.liHeight() * crumb.itemNum)
                            height: crumb.ulHeight()
                        }, 600, 'easeInOutQuart');
                    } else {
                        crumb.element.css({
                            // height: (crumb.liHeight() * crumb.itemNum)
                            height: crumb.ulHeight()
                        });
                    }
                }
            } else {
                crumb.element.css({
                    // height: (crumb.liHeight() * crumb.itemNum)
                    height: crumb.ulHeight()
                });
            }

            $('.toggle', crumb.element).attr('data-icon', 'c');
            crumb.isOpen = true;

        },


        /**
         * Close breadcrumb (Mobile and Vertical tablet only)
         */
        close: function (animate, override) {

            //hide all items except the last one
            if (!override) {
                if (animate) {
                    if (!common.isModern()) {
                        crumb.element.animate({
                            height: crumb.liHeight()
                        }, 600, 'easeInOutQuart');
                    } else {
                        crumb.element.css({
                            height: crumb.liHeight()
                        });
                    }
                } else {
                    crumb.element.css({
                        height: crumb.liHeight()
                    });
                }
            } else {
                if ($(document).scrollTop() > crumb.element.height()) {
                    crumb.scroll();
                    crumb.element.addClass('noAnimate').css({
                        height: crumb.liHeight()
                    });
                } else {
                    crumb.element.css({
                        height: crumb.liHeight()
                    });
                }
            }

            $('.toggle', crumb.element).attr('data-icon', 'a');
            crumb.isOpen = false;

        },


        /**
         * Toggle the breadcrumb open/closed
         */
        toggle: function (e) {

            var $target = $(e.target);

            if (e) {
                e.stopPropagation();
            }

            if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
                if (crumb.isOpen) {
                    if (($target.hasClass('toggle') && $target.parent(crumb.sBreadcrumbElementId))) {
                        crumb.close(true);
                    } else if (!($target.parents(crumb.sBreadcrumbElementId).length)) {
                        crumb.close(true, true);
                    }
                } else {
                    if ($target.hasClass('toggle') && $target.parent(crumb.sBreadcrumbElementId)) {
                        crumb.open(true);
                    }
                }
            }
        },


        /**
         * If the length of a breadcrumb item is greater than 28 characters then truncate and add ellipses
         * @param  {object} el Breadcrumb item element
         */
        truncate: function () {
            var text,
                fullString,
                truncated;

            $('li a', crumb.element).each(function () {
                text = $.trim($(this).text());
                if (crumb.maxMobileLength <= text.length) {
                    fullString = text;
                    $(this).data('fullString', fullString);
                    truncated = fullString.slice(0, crumb.maxMobileLength - 3) + '...';
                    $(this).text(truncated);
                }
            });
        },

        /**
         * Undo mobileTruncate()
         */
        unTruncate: function () {
            $('li a', crumb.element).each(function () {
                var fullString = $(this).data('fullString');
                if (fullString) {
                    $(this).text(fullString);
                }
            });
        },

        bindEvents: function () {
            $(crumb.sBreadcrumbElementId + ' .toggle').on('click', crumb.toggle);
        },

        scroll: function () {
            $('html, body').scrollTop(($(document).scrollTop() - crumb.element.height()) + crumb.liHeight());
        },

        init: function () {

            var sBackToSearchText = "Back to search results",
                sPattern = "direct\\/search-results\\/results.page",
                sReferrerURL = document.referrer;

            if (crumb.sBreadcrumbElementId === '#breadcrumb-v2' && sReferrerURL.search(sPattern) > 0) {
                $(crumb.sBreadcrumbElementId + ' .first').removeClass("first");
                $(crumb.sBreadcrumbElementId + ' ul').prepend('<li class="back-to-results first"><a href="' + sReferrerURL + '"><span>' + sBackToSearchText + '</span></a></li>');
            }

            crumb.element = $(crumb.sBreadcrumbElementId);
            if (crumb.element.length) {
                crumb.bindEvents();
                //get number of items
                crumb.itemNum = $('li', crumb.element).length;

                //if only one item then hide the button
                if (crumb.itemNum < 2) {
                    $('.toggle', crumb.element).hide();
                }

                // do truncate by javascript only on old pdp.
                if (crumb.sBreadcrumbElementId === '#breadcrumb') {
                    crumb.truncate();
                }

                if (!crumb.supportsHistoryApi() || window.isKiosk()) {
                    $('.last_applied_filter').show();
                }

                breakpoint.mobileIn.push(crumb.mobileIn);
                breakpoint.vTabletIn.push(crumb.mobileIn);
                breakpoint.hTabletIn.push(crumb.mobileIn);
                breakpoint.mobileOut.push(crumb.mobileOut);
                breakpoint.vTabletOut.push(crumb.mobileOut);
                breakpoint.hTabletOut.push(crumb.mobileOut);

                breadcrumbCache.init({});
                return true;
            }
            return false;
        }

    };

    common.init.push(function () {
        if ($("#breadcrumb-v2").length > 0) {
            crumb.sBreadcrumbElementId = '#breadcrumb-v2';
        }
        crumb.init();
    });

    return crumb;
});
