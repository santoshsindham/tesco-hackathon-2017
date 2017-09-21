/* eslint-disable */
define(['domlib', 'modules/breakpoint', 'modules/common', 'dotdotdot'], function ($, breakpoint, common) {
    'use strict';

    /** @namespace */
    var recent = {

        $element: null,
        carousel: {},
        oRecentlyViewedCarousel: {},
        CONSTANTS: {
            SRVICAROUSELSELECTOR: '#recently-viewed',
            SHIDDENCLASS: 'carousel-hidden',
            SHIDERVISELECTOR: '.toggle-hide button',
            SHIDETEXT: 'Hide',
            SSHOWTEXT: 'Show',
            SCLEARITEMSSELECTOR: '.clear-all',
            SCLEARITEMSBUTTONSELECTOR: '.clear-all button',
            SDISABLECAROUSELSELECOR: 'carousel-disabled',
            SCAROUSELITEMSSELECTOR: '.carousel-items-list li',
            SDISABLEDSELECTOR: 'disabled',
            SEMPTYCAROUSELMESSAGESELECTOR: '.empty-carousel-message',
            SDISABLEEMPTYCAROUSELMESSAGECLASS: 'message-disabled',
            SPDPV2SELECTOR: 'PDP-Version2',
            SOLDCAROUSELSTYLESCLASS: 'cfw-old-carousel-styles',
            SRVICOMPONENTPARENTSELECTOR: '.PDP-Version2__page',
            SPDPV2PAGECLASS: 'PDP-Version2__page'
        },
        bRVICarouselClosed: false,
        bSmallViewport: (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) ? true : false,
        label: {
            off: "Hide",
            on : "Show"
        },

        initResponsiveCarousel: function () {
            var self = this;

            this.checkPDPV2();
            $(self.CONSTANTS.SRVICAROUSELSELECTOR).carousel({
                itemSelector: self.CONSTANTS.SCAROUSELITEMSSELECTOR,
                wrapperClass: '.carousel-items-list',
                prevClass: '.product-carousel-nav li a.previous',
                nextClass: '.product-carousel-nav li a.next',
                all: true,
                elasticBounceOnEmptySwipe: true,
                bHideNextPreviousIfAllItemsVisible: true,
                setActive: true,
                enablePeep: true,
                iemHeight: $(self.CONSTANTS.SRVICAROUSELSELECTOR).find(self.CONSTANTS.SCAROUSELITEMSSELECTOR).height(),
                itemWidth: $(self.CONSTANTS.SRVICAROUSELSELECTOR).find(self.CONSTANTS.SCAROUSELITEMSSELECTOR).outerWidth(),
                bFitsItemWidthsAndPaddingForNumberOfItemsMinusOne: true
            });
            this.oRecentlyViewedCarousel = $(this.CONSTANTS.SRVICAROUSELSELECTOR).data('carousel');
            this.bindEvents();
            this.checkEmptyCarousel();
        },

        bindEvents: function () {
            this.bindRemoveItemEvents();
            this.bindClearAllItemsEvent();
            this.bindRVIToggle();
        },

        bindRemoveItemEvents: function () {
            var self = this,
                args = {},
                sCarouselItemSelector = '.carousel-items-list li',
                $currentTarget,
                iItemPosition;

            $(sCarouselItemSelector).on('click', '.remove', function (event) {
                event.preventDefault();

                $currentTarget = $(event.target);
                iItemPosition = $currentTarget.parent().data('index') + 1;
                args.position = iItemPosition;
                self.oRecentlyViewedCarousel.remove(args);
                self.removeItemFromRVICookie($currentTarget.prop('href'));
                self.checkEmptyCarousel();
            });
        },

        bindClearAllItemsEvent: function () {
            var self = this,
                args = {};

            $(self.CONSTANTS.SRVICAROUSELSELECTOR).on('click', self.CONSTANTS.SCLEARITEMSSELECTOR, function (event) {
                event.preventDefault();

                if ($(event.target).find('button').hasClass(self.CONSTANTS.SDISABLEDSELECTOR)) {
                    return false;
                }
                args.position = 'all';
                self.oRecentlyViewedCarousel.remove(args);
                self.clearRVICookie();
                self.checkEmptyCarousel();
            });
        },

        bindRVIToggle: function () {
            var self = this;

            $(self.CONSTANTS.SRVICAROUSELSELECTOR).on('click', self.CONSTANTS.SHIDERVISELECTOR, function (event) {
                event.preventDefault();

                if (self.bRVICarouselClosed) {
                    self.showRVICarousel();
                } else {
                    self.hideRVICarousel();
                }
            });
        },

        checkEmptyCarousel: function () {
            if (this.countCarouselItems() === 0) {
                this.disableClearAllButton();
            }
        },

        checkPDPV2: function () {
            if (!$('body').hasClass(this.CONSTANTS.SPDPV2SELECTOR)) {
                $(this.CONSTANTS.SRVICAROUSELSELECTOR).addClass(this.CONSTANTS.SOLDCAROUSELSTYLESCLASS);
                $(this.CONSTANTS.SRVICAROUSELSELECTOR).closest(this.CONSTANTS.SRVICOMPONENTPARENTSELECTOR).removeClass(this.CONSTANTS.SPDPV2PAGECLASS);
            }
        },

        showRVICarousel: function () {
            var $elRVICarousel = $(this.CONSTANTS.SRVICAROUSELSELECTOR);

            if ($elRVICarousel.hasClass(this.CONSTANTS.SHIDDENCLASS)) {
                $elRVICarousel.removeClass(this.CONSTANTS.SHIDDENCLASS);
                $elRVICarousel.find(this.CONSTANTS.SHIDERVISELECTOR).html(this.CONSTANTS.SHIDETEXT);
                this.bRVICarouselClosed = false;
            }
        },

        hideRVICarousel: function () {
            var $elRVICarousel = $(this.CONSTANTS.SRVICAROUSELSELECTOR);

            if (!$elRVICarousel.hasClass(this.CONSTANTS.SHIDDENCLASS)) {
                $elRVICarousel.addClass(this.CONSTANTS.SHIDDENCLASS);
                $elRVICarousel.find(this.CONSTANTS.SHIDERVISELECTOR).html(this.CONSTANTS.SSHOWTEXT);
                this.bRVICarouselClosed = true;
            }
        },

        countCarouselItems: function () {
            var iCarouselItemCount = 0;

            if ($(this.CONSTANTS.SRVICAROUSELSELECTOR).find(this.CONSTANTS.SCAROUSELITEMSSELECTOR).length > 0) {
                iCarouselItemCount = $(this.CONSTANTS.SRVICAROUSELSELECTOR).find(this.CONSTANTS.SCAROUSELITEMSSELECTOR).length;
            }

            return iCarouselItemCount;
        },

        disableClearAllButton: function () {
            $(this.CONSTANTS.SRVICAROUSELSELECTOR).find(this.CONSTANTS.SCLEARITEMSBUTTONSELECTOR)
                .removeClass(this.CONSTANTS.SDISABLEDSELECTOR)
                .addClass(this.CONSTANTS.SDISABLEDSELECTOR);
            this.disableCarouselNavigation();
        },

        disableCarouselNavigation: function () {
            $(this.CONSTANTS.SRVICAROUSELSELECTOR).addClass(this.CONSTANTS.SDISABLECAROUSELSELECOR);
        },

        getQueryParameters: function (query_string) {
            var query_params = {},
                query = query_string.split('?'),
                current,
                i = 0,
                j;

            if (query && query.length > 1) {
                query = query[1].split('&');
                for (i = 0, j = query.length; i < j; i += 1) {
                    current = query[i].split('=');
                    query_params[current[0]] = current[1];
                }
            }

            return query_params;
        },

        removeItemFromRVICookie: function (sQueryString) {
            var sURLParams = recent.getQueryParameters(sQueryString),
                sProductId,
                aRVIList,
                sTempRVI,
                oRVIData = null,
                i = 0;

            if (sURLParams.pid) {
                sProductId = sURLParams.pid.replace('#recently-viewed', '');
                oRVIData = $.cookie('tesco_rvi_');
                oRVIData = oRVIData !== null ? oRVIData.replace(/"/g, '') : '';
                aRVIList = oRVIData.split("@");

                for (i = 0; i < aRVIList.length; i += 1) {
                    if (aRVIList[i].search(sProductId) !== -1) {
                        aRVIList.splice(i, 1);
                        sTempRVI = aRVIList.join('@');
                        break;
                    }
                }
                oRVIData = '\"' + sTempRVI + '\"';
                $.cookie('tesco_rvi_', oRVIData, { path: '/', raw: true });
            }
        },

        clearRVICookie: function () {
            $.cookie('tesco_rvi_', null, { path: '/' });
        },

        init: function () {
            recent.$element = $(this.CONSTANTS.SRVICAROUSELSELECTOR);
            if (recent.$element.length > 0 && !window.isKiosk()) {
                common.Ellipsis.init($('h3', recent.$element));
                return true;
            }
        },

        asyncBlockCallbacks: function asyncBlockCallbacks() {
            var oCallbacks = {};

            oCallbacks.success = function (oResp) {
                var sBlockId = this.sBlockID,
                    oRecentlyViewed = this;

                if (typeof oResp === "string") {
                    oResp = $.parseJSON(oResp);
                }
                if (oResp[sBlockId] && !oResp[sBlockId].productIds) {
                    $(recent.CONSTANTS.SRVICAROUSELSELECTOR).replaceWith(oResp[oRecentlyViewed.sBlockID]);
                    recent.initResponsiveCarousel();
                }
            };
            return oCallbacks;
        }

    };

    common.init.push(function () {
        if (!window.AsyncBlockController.isCachedPage()) {
            recent.initResponsiveCarousel();
        }
    });

    return recent;
});
