/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require */
define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/overlay/common', 'modules/tesco.utils'], function ($, breakpoint, common, overlay, utils) {
    'use strict';
    var viewOffers = {
            offerListURL: "/direct/blocks/catalog/productlisting/productPromotions.jsp",
            container : $('#listing'),
            init : function () {
                $("#listing .products").on('click', 'a.special-offer', viewOffers.offerHandler);
            },
            tile : {
                el: {},
                top: 0,
                left: 0,
                height: 0,
                width: 0,
                offersId: 0
            },
            isListView: function () {
                if (viewOffers.container.length === 0) {
                    viewOffers.container = $('#listing');
                }
                return viewOffers.container.hasClass("list-view");
            },
            isGrid33321View: function () {
                if (viewOffers.container.length === 0) {
                    viewOffers.container = $('#listing');
                }
                return viewOffers.container.hasClass("grid-33321");
            },
            useFixedWidthLightbox: function () {
                return !viewOffers.isListView() && !viewOffers.isGrid33321View();
            },
            offerHandler : function (e) {
                e.preventDefault();
                e.stopPropagation();
                viewOffers.tile.el = $(this).closest('.product');
                overlay.pageScroll.isEnabled = false;

                viewOffers.tile.offersId = $(this).data('offerlist');
                viewOffers.setDimensions();
                viewOffers.displayLightBox();

                viewOffers.hideOverlayOnOrientationChange();
            },
            hideOverlayOnOrientationChange: function () {
                var eventName, isMobileDevice = common.isTouch() && !breakpoint.kiosk;
                if (!isMobileDevice) {
                    return;
                }
                eventName = window.orientation === undefined ? 'resize.productOffers' : 'orientationchange.productOffers';
                $(window).on(eventName, function () {
                    overlay.hide();
                    $(window).unbind(eventName);
                });
            },
            setDimensions: function () {
                var tile = viewOffers.tile.el,
                    p = tile.offset(),
                    tileWidth = tile.width() + 16;
                viewOffers.tile.top = p.top;
                viewOffers.tile.left = p.left + tileWidth;
                viewOffers.tile.height = tile.height();
                viewOffers.tile.width = tileWidth * 2;
                overlay.defaultOptions.customClass = 'light-box-offer';
                if (viewOffers.isListView()) {
                    overlay.defaultOptions.customClass += ' centered-view';
                }
                if (viewOffers.isGrid33321View()) {
                    overlay.defaultOptions.customClass += ' grid-33321 centered-view';
                }
                overlay.pageScroll.scrollTop = viewOffers.tile.top;
                if (breakpoint.mobile) {
                    overlay.pageScroll.isEnabled = true;
                    overlay.pageScroll.scrollTop = 0;
                    $('#overlay').hide();
                }
            },
            displayLightBox : function () {
                if (!breakpoint.mobile) {
                    viewOffers.setDimensions();
                }

                var options = {
                    content: '<div class="loader" id="tempLoader"><div class="loader-overlay"></div><div class="loader-text"></div></div>',
                    fixedWidth: viewOffers.useFixedWidthLightbox() ? viewOffers.tile.width : 0,
                    hideOnOverlayClick: true,
                    lightboxPosition: function ($overlay) {
                        var p = viewOffers.tile,
                            isLastTile = (p.left + p.width / 2) > window.innerWidth;

                        if (!breakpoint.mobile) {
                            $overlay.css('top', p.top + 40);
                            if (viewOffers.useFixedWidthLightbox()) {
                                if (isLastTile) {
                                    p.left = p.left - (p.width / 2);
                                }
                                $overlay.css('left', p.left);
                                $overlay.css('height', p.height + 16);
                            }
                        } else {
                            $overlay.css('top', 0);
                        }
                    },
                    callback: function () {
                        if (!breakpoint.mobile) {
                            utils.scrollToElem(viewOffers.tile.el, 600);
                        } else {
                            $('html, body').animate({scrollTop: 0}, '600');
                        }
                    }
                };
                overlay.show(options);
                viewOffers.loadData();
            },
            displayOffers: function (d) {
                if (d.content === "") {
                    return;
                }
                if (!breakpoint.mobile) {
                    viewOffers.setDimensions();
                }
                var lb = $('#lightbox'), list, title, pdpLink, link, viewMore, i, offerTitles, offerTitle;

                lb.find('#tempLoader').remove();
                lb.append(d.content);

                list = lb.find('.productPromotionsContent');
                title = lb.find('a.title');
                pdpLink = title.attr('href');
                link = lb.find('.promoContainer');
                viewMore = lb.find('.view-more');
                offerTitles = list.find('.promoOffer');


                link.attr('href', pdpLink);
                viewMore.attr('href', pdpLink);
                $(title).dotdotdot({
                    ellipsis  : '...',
                    wrap      : 'word',
                    watch     : false,
                    tolerance : 0
                });
                for (i = 0; i < 3; i++) {
                    offerTitle = $(offerTitles[i]);
                    offerTitle.css('height', offerTitle.height());
                    offerTitle.dotdotdot({
                        ellipsis  : '...',
                        wrap      : 'word',
                        watch     : false,
                        tolerance : 0
                    });
                    offerTitle.css('display', 'table-cell');
                }
            },
            loadData: function () {
                $.ajax({
                    url: viewOffers.offerListURL + viewOffers.tile.offersId
                }).done(function (d) {
                    viewOffers.displayOffers(d);
                });
            }
        };
    common.init.push(function () {
        if (!window.isKiosk()) {
            viewOffers.init();
        }
    });
    return viewOffers;
});
