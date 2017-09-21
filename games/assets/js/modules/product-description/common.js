/* eslint-disable */

define([
        'domlib',
        'modules/common',
        'modules/breakpoint',
        'modules/tesco.data',
        'modules/tesco.utils',
        'modules/tesco.analytics',
        'modules/chip-and-pin/kmf-io',
        'modules/ajax/common',
        'modules/jargon-buster/common',
        'modules/toggle-expand-collapse/common',
        './wishlist',
        'modules/show-more/ShowMore',
        'modules/show-more/ShowMoreHandler',
        'modules/show-more/ShowMoreConfig',
        'modules/overlay/common',
        'modules/html-parser/HtmlParser',
        'modules/product-variants/ProductVariantController',
        'modules/mvc/fn'
    ],
    function (
        $,
        common,
        breakpoint,
        data,
        utils,
        analytics,
        kmfIO,
        ajax,
        jargonBuster,
        ToggleExpandCollapse,
        wishlist,
        ShowMore,
        ShowMoreHandler,
        ShowMoreConfig,
        overlay,
        HtmlParser,
        ProductVariantController,
        fn
    ) {

        var pdp = {
            clickEvent: 'click',
            tooltipMessages: {
                'unavailable': 'Not available',
                'not-in-stock': 'Not in stock'
            },
            swatchesAndSizesRules: {
                maximumAmount: 0,
                dropdownLimit: 13,
                placeholders: {
                    "select-colour": "Select a colour",
                    "select-size": "Select a size"
                }
            },
            analyticsFlag: true,
            getBasketTotalCount: function () {
                if (window.isKiosk()) {
                    var url = '/direct/?ssb_block=basket-itemcount';
                    if ($('#wrapper.spi').length) {
                        url = '/direct/my/kiosk-checkout.page?ssb_block=basket-itemcount';
                    }
                    if (window.external.navigationPanel) {
                        ajax.post({
                            'url': url,
                            'callbacks': {
                                'success': function (data) {
                                    var finalCount = JSON.parse(data);
                                    var getBasketQty = finalCount.basketCount;
                                    if (getBasketQty === '') {
                                        return false;
                                    } else if (getBasketQty > 0 && !$('#wrapper.spi.orderConfirmation').length) {
                                        window.external.navigationPanel.basketEnabled = true;
                                        if (window.external.navigationPanel.basketCountVisible !== undefined && window.external.navigationPanel.basketCount !== undefined) {
                                            window.external.navigationPanel.basketCountVisible = true;
                                            window.external.navigationPanel.basketCount = getBasketQty;
                                        }
                                    } else {
                                        window.external.navigationPanel.basketEnabled = false;
                                        if (window.external.navigationPanel.basketCountVisible !== undefined) {
                                            window.external.navigationPanel.basketCountVisible = false;
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            },
            changeColumnLayout: function () {
                if (common.isPage('PDP')) {
                    var module = $(".secondary-content"),
                        isDesktop = breakpoint.desktop || breakpoint.largeDesktop || breakpoint.vTablet || breakpoint.hTablet,
                        mainContent = $("#main-content"),
                        moduleHeight = parseInt(module.height(), 10);

                    mainContent.attr("style", "");

                    if (moduleHeight > mainContent.height() && isDesktop) {
                        //mainContent.css("min-height", moduleHeight+140);
                        mainContent.css("min-height", moduleHeight);
                    }
                }
            },

            isValidBreakpoint: function () {
                return breakpoint.desktop || breakpoint.largeDesktop || breakpoint.kiosk;
            },

            addAdditionalClass: function ($elementToCheck, $lengthToCheck, $elementToAddTo, className) {
                if ($elementToCheck.length > $lengthToCheck) {
                    $elementToAddTo.addClass(className);
                }
            },

            print: function (e) {
                e.preventDefault();
                window.print();
                return false;
            },

            // bug fix for http://jira.lbi.co.uk/browse/TDCO-1967
            // issue with trying to restore the table cells back to display: table-cell from being display: block
            // the fix only needs to be applied when in landscape mode - basically clone the existing table and
            // remove and replace on orientation change to force the correct table structure again
            priceCheckTableFix: function () {
                var $wrapper = $('#price-check');

                if (!$wrapper.length) {
                    return;
                }

                var $table = $wrapper.find('table').clone();

                $(window).on('orientationchange.priceCheck', function () {
                    if (window.screen.width > window.screen.height) {
                        $wrapper.find('table').remove();
                        $wrapper.append($table);
                    }
                });
            },

            // detect which version of bazaar voice is in use and serve the correct
            // code for that version :: [work completed for epic #2033]
            loadBazaarVoice: function () {
                if ($('#BVRRContainer').length > 0) {
                    if (breakpoint.kiosk) {
                        if (pdp.isTabViewEnabled()) {
                            pdp.checkCustomerReviewsStatus();
                        } else {
                            pdp.bazaarVoiceOverlay();
                        }
                    }
                }
            },
            equalizeBundleHeights: function (reset) {
                var bundleItems = $('.bundle .collectionItems > li').not('.collectionShelf'),
                    linksaveItems = $('.linksave .collectionItems > li').not('.collectionShelf');

                bundleItems.css('height', 'auto');
                linksaveItems.css('height', 'auto');

                bundleItems.height();
                linksaveItems.height();

                if (!reset) {
                    bundleItems.equaliseHeights();
                    linksaveItems.equaliseHeights();
                }
            },
            showView: function (obj) {
                var ulContainer = obj.find('.collectionItems');
                ulContainer.find('li:gt(4)').addClass('visually-hidden-select');
                if (ulContainer.find('li').length <= 5) {
                    obj.find('.collectionItemNext').hide();
                }
            },

            addTheRangeBlock: function () {
                var urlVal = $('.collectionContainer.range').data('url');
                if (urlVal != '') {
                    $.ajax({
                        url: urlVal,
                        complete: function (data) {
                            $('.collectionContainer.range').html(data.responseText);

                            if ($('input[name="_dynSessConf"]').length) {
                                var sUserSessionConfID = $('input[name="_dynSessConf"]').eq(0).val();
                                $('.collectionContainer.range').find('input[name="_dynSessConf"]').val(sUserSessionConfID);
                            }

                            if ($(".range ul.collectionItems li").length) {
                                $('.range, .addTheRangeButton').show();

                                /*
                                var _oWebAnalytics = new analytics.WebMetrics();
                                var v = [{
                                    'eVar17': 'Add the Range'
                                }];
                                _oWebAnalytics.submit(v);
                                */

                                var listLen = 0;
                                var origLength = $(".range ul.collectionItems li").length;
                                $(".range ul.collectionItems li").each(function (index) {
                                    if ($(this).find('div').length == 0) {
                                        listLen++;
                                        $(this).remove();
                                    }
                                    if (origLength == listLen) {
                                        $('.range, .addTheRangeButton').hide();
                                        if (window.isKiosk() && pdp.isTabViewEnabled()) {
                                            pdp.removeTabFromArray('#tab-shop-the-range');
                                        }
                                    }
                                });

                            } else {
                                $('.range, .addTheRangeButton').hide();
                                if (window.isKiosk() && pdp.isTabViewEnabled()) {
                                    pdp.removeTabFromArray('#tab-shop-the-range');
                                }
                            }

                            if (window.isKiosk() && pdp.isTabViewEnabled()) {
                                pdp.oTabViewData.iKioskAsyncTabs--;
                                pdp.updateTabViewDOMElements();
                            }
                            if (!window.isKiosk()) {
                                pdp.pdpBlock($('#range'));
                            }
                            pdp.showView($('.collectionContainer.range'));
                            pdp.showMoreItems('.collectionContainer.range');
                            picturefill();
                            pdp.truncateText();
                            pdp.handleLookAddEvent();

                           /* $('.collectionContainer.range').find('input.add-to-basket').each(function(){
                            	$(this).on(pdp.clickEvent, function(e){
    								e.preventDefault();
    								require(['modules/add-to-basket/common'], function (addRangeBasket) {
    									addRangeBasket.initAjaxFramework();
    								});
    							});
                            }); */

                            if (window.isKiosk()) {
                                pdp.addQuantityButtons();
                            }

                            var oShowMore = new ShowMore({
                                selector: '.add-the-range-block',
                                height: 600,
                                label: 'products'
                            });
                            oShowMore.fnInit();
                        }
                    });
                }
            },
            addLookBlock: function () {
                var urlVal = $('.collectionContainer.look').data('url');
                if (urlVal != '' && !window.isKiosk()) {
                    $.ajax({
                        url: urlVal,
                        complete: function (data) {
                            $('.collectionContainer.look').html(data.responseText);
                            if ($(".look ul.collectionItems li").length) {
                                $('.look, .getTheLookButton').show();
                                //Set omniture on Look block load
                                /*
                                var _oWebAnalytics = new analytics.WebMetrics();
                                var v = [{
                                    'eVar17': 'Get the look'
                                }];
                                _oWebAnalytics.submit(v);
                                */
                                var listLen = 0;
                                var origLength = $(".look ul.collectionItems li").length;
                                $(".look ul.collectionItems li").each(function (index) {
                                    if ($(this).find('div').length == 0) {
                                        listLen++;
                                        $(this).remove();
                                    }
                                    if (origLength == listLen) {
                                        $('.look, .getTheLookButton').hide();
                                    }
                                });
                            } else {
                                $('.look, .getTheLookButton').hide();
                            }

                            pdp.pdpBlock($('#look'));
                            pdp.showView($('.collectionContainer.look'));
                            pdp.showMoreItems('.collectionContainer.look');
                            picturefill();
                            pdp.truncateText();
                            pdp.handleLookAddEvent();
                        }
                    });
                }
            },
            linkSaveBlock: function () {
                var urlVal = $('.collectionContainer.linksave').data('url');
                if (urlVal != '') {
                    $.ajax({
                        url: urlVal,
                        beforeSend: function (jqXHR, settings) {
                          var _settings = settings;

                          _settings.url = urlVal;
                        },
                        complete: function (data) {

                            $('.collectionContainer.linksave').html(data.responseText);

                            var sResponseText = $.trim(data.responseText);

                            if (sResponseText !== '') {
                                if (window.isKiosk()) {
                                    var sCollectionSummary = '.linksave ul.collectionItems li.collectionSummary';
                                    if ($(sCollectionSummary).length) {
                                        $('#seeTermsTooltip').appendTo(sCollectionSummary);
                                        $('#seeTermsTooltipPopup').appendTo(sCollectionSummary);
                                    }
                                }

                                if ($(".linksave ul.collectionItems li, .linksave #linksave-container li").length) {
                                    $('.linksave, .linkSaveButton').show();
                                } else {
                                    $('.linksave, .linkSaveButton').hide();
                                }
                                if (common.isTouch()) {
                                    if (breakpoint.desktop) {
                                        pdp.equalizeBundleHeights();
                                    } else if (breakpoint.vTablet || breakpoint.hTablet) {

                                    } else {
                                        pdp.equalizeBundleHeights(true);
                                    }
                                } else {
                                    if (breakpoint.currentViewport === 'largedesktop' || breakpoint.currentViewport === 'desktop' || breakpoint.currentViewport === 'kiosk') {
                                        pdp.equalizeBundleHeights();
                                    }
                                }
                                common.richTexttooltipPopup.init();
                                if ($('#bundleTnC').val() != "") {
                                    var $p = $('#seeTermsTooltipPopup .content').find('p');
                                    $p.text($('#bundleTnC').val());
                                } else {
                                    $('#seeTermsTooltip').hide();
                                }
                                if (!window.isKiosk()) {
                                    pdp.pdpBlock($('#linksave'));
                                }
                                picturefill();
                                if (window.isKiosk() && pdp.isTabViewEnabled()) {
                                    pdp.oTabViewData.iKioskAsyncTabs--;
                                    pdp.updateTabViewDOMElements();
                                }
                            } else {
                                if (window.isKiosk() && pdp.isTabViewEnabled()) {
                                    pdp.oTabViewData.iKioskAsyncTabs--;
                                    pdp.removeTabFromArray('#tab-linksave');
                                    pdp.updateTabViewDOMElements();
                                }
                            }
                            if(!breakpoint.mobile){
                            	if($('#linksave-container li.bundleCount:first-child .bundle-header .bundle-title').hasClass('show-more-cheveron'))
                            		$('#linksave-container li.bundleCount:first-child .bundle-header .bundle-title').removeClass('show-more-cheveron').addClass('show-less-cheveron');
                            }
                        }
                    });
                }
            },
            bundleBlock: function () {
                var urlVal = $('.collectionContainer.bundle').data('url');
                if (urlVal !== '' && $('#bundleTnC').val() !== "") {
                    $.ajax({
                        url: urlVal,
                        complete: function (data) {
                            $('.collectionContainer.bundle').html(data.responseText);
                            if ($(".bundle ul.collectionItems li").length) {
                                $('.bundle, .bundleButton').show();
                            } else {
                                $('.bundle, .bundleButton').hide();
                            }
                            if (common.isTouch()) {
                                if (breakpoint.desktop) {
                                    pdp.equalizeBundleHeights();
                                } else if (breakpoint.vTablet || breakpoint.hTablet) {

                                } else {
                                    pdp.equalizeBundleHeights(true);
                                }
                            } else {
                                if (breakpoint.currentViewport === 'largedesktop' || breakpoint.currentViewport === 'desktop' || breakpoint.currentViewport === 'kiosk') {
                                    pdp.equalizeBundleHeights();
                                }
                            }

                            pdp.pdpBlock($('#bundle'));
                            picturefill();

                            pdp.selectableCollectionItem.init();
                        }
                    });
                }
            },
            scrollingTo: function (e) {
                var scrollToId = $(this).attr('href'),
                    $masthead = $('#masthead-wrapper'),
                    iMastheadHeight = $masthead.data('outerHeight'),
                    iTopValue = $(scrollToId).offset().top;
                if ($masthead.length) {
                    iTopValue = iTopValue - (iMastheadHeight * 2);
                }
                $('body, html').animate({
                    scrollTop: iTopValue
                }, 1000);

                e.preventDefault();
                e.stopPropagation();
                return false;
            },
            checkLinkSaveBlock: function(e) {
                var $wrapper = $('#linksave'),
                  domElementInScope = null,
                  elementsToActionInViewPort = [],
                  skuIds = $('#bundleOffer').length ? $('#bundleOffer').val().trim().substr(1) : '';

                elementsToActionInViewPort.push({ element: $wrapper });

                if (typeof window.inVisibleViewport === 'function') {
                  fn.loopArray(elementsToActionInViewPort, function(i) {
                    if (fn.isObject(elementsToActionInViewPort[i], { notEmpty: true })) {
                      domElementInScope = elementsToActionInViewPort[i].element.get(0);
                      if (domElementInScope) {
                        if (window.inVisibleViewport(domElementInScope)) {
                          if (pdp.analyticsFlag) {
                            pdp.analyticsFlag = false;
                            pdp.analyticsTracking(skuIds);
                          }
                        }
                      }
                    }
                  });
                }
            },
            linkSaveClickAnalytics: function(skuId) {
              var relationship = 'Link Save',
              _s = fn.copyObject(window.s);

              _s.linkTrackEvents = 'event32,event45';
              _s.linkTrackVars = 'prop19,eVar45,prop42,eVar59,events,products';
              _s.products = ';' + skuId + ';;';
              _s.prop19 = 'product click';
              _s.eVar45 = _s.prop19;
              _s.prop42 = 'pdp - ' + relationship + ' - product click';
              _s.eVar59 = _s.prop42;
              _s.events = 'event32,event45';
              _s.tl(true, 'o', relationship + ' - product click');
            },
            analyticsTracking: function (resData) {
              var relationship = 'Link Save',
                _s = fn.copyObject(window.s),
                analyticsText = resData.split(',').join(';;,;'),
                productId = '';

              _s.linkTrackEvents = 'event3,event32,event45';
              _s.linkTrackVars = 'prop19,eVar45,prop42,eVar59,events,products';
              _s.products = ';' + analyticsText + ';;';
              _s.prop19 = 'product impressions';
              _s.eVar45 = _s.prop19;
              _s.prop42 = 'pdp - ' + relationship + ' - product impressions';
              _s.eVar59 = _s.prop42;
              _s.events = 'event3,event32,event45';
              _s.tl(true, 'o', relationship + ' - product impressions');
            },
            linkSaveToggle: function () {
              var element = $('.bundle-title'),
                linksaveList = element.parent().next();

              $(linksaveList).slideToggle(function () {
                if (element.next().is(':visible')) {
                  element.next().removeAttr('style').css('display', 'none');
                  element.removeClass('show-less-cheveron').addClass('show-more-cheveron');
                  element.removeAttr('style').css('padding-bottom', '20px');
                } else {
                  element.next().removeAttr('style').css('display', 'block');
                  pdp.truncateText();
                  element.removeClass('show-more-cheveron').addClass('show-less-cheveron');
                  element.removeAttr('style').css('padding-bottom', '0px');
                }
              });
            },
            linkSaveBindEvents: function () {
              $(document).on('scroll', function () {
                pdp.checkLinkSaveBlock();
              });
              $(document).on('click', '.collectionItemImage, .collectionItemDescription', function () {
                var skuId = $(this).closest('div[data-sku]').data('sku');

                pdp.linkSaveClickAnalytics(skuId);
              });
              $(document).on('tap click', '.bundle-title', function () {
                pdp.linkSaveToggle();
              });
            },
            pdpBlock: function (blockId) {
                if ($('.collapseByDefault')) {
                    $elemContainer = $('.collapseByDefault').children().find(blockId);
                    $elemContainer.find('.toggleDetailWrapper').toggleClass('PDPchangeIcon');
                    $elemContainer.find('.detailWrapper').hide();
                }
            },
            selectableCollectionItem: {
                loading: false,
                init: function () {
                    $('.checkboxContainer .checkbox').on(pdp.clickEvent, pdp.selectableCollectionItem.toggleCollectionItem);
                },
                toggleCollectionItem: function (e) {
                    if (pdp.selectableCollectionItem.loading == false) {
                        e.preventDefault();
                        pdp.selectableCollectionItem.loading = true;
                        $(this).parent().toggleClass('selected');
                        $(this).parent().siblings('.collectionItemImageContainer').toggleClass('disabled');
                        $(this).parent().siblings('.collectionItemDetail').toggleClass('disabled');
                        $(this).closest('li').children('.collectionItemChange').toggleClass('disabled');

                        var softItemPrice = $(this).parent().siblings('.collectionItemDetail').find('.softItemPrice').val();
                        var softBundlePrice = $('#bundle').find('.currentPrice .softBundlePrice').text();
                        var softItemPriceVal = parseFloat(softItemPrice);
                        var softBundlePriceVal = parseFloat(softBundlePrice);
                        var firstItemCheckBox = $(this).parent().closest('.collectionItemContainer ').siblings('#checkBox1');
                        var secItemCheckBox = $(this).parent().closest('.collectionItemContainer ').siblings('#checkBox2');

                        if ($(this).parent().hasClass('selected')) {
                            $(this).closest('li').removeAttr('disabled');
                            var totValue = softBundlePriceVal + softItemPriceVal;
                            var finalValue = totValue.toFixed(2);

                            $('#bundle').find('.currentPrice .softBundlePrice').text(finalValue);
                            if ((firstItemCheckBox.length) && !(secItemCheckBox.length)) {
                                firstItemCheckBox.val('true');
                            } else {
                                secItemCheckBox.val('true');
                            }

                        } else {
                            $(this).closest('li').prop('disabled', true);
                            var totValue = softBundlePriceVal - softItemPriceVal;
                            var finalValue = totValue.toFixed(2);
                            $('#bundle').find('.currentPrice .softBundlePrice').text(finalValue);
                            if ((firstItemCheckBox.length) && !(secItemCheckBox.length)) {
                                firstItemCheckBox.val('false');
                            } else {
                                secItemCheckBox.val('false');
                            }
                        }

                        // pdp.getCollectionSummaryTotal($(this).closest('form')); after this method make equal height and loading false
                        pdp.selectableCollectionItem.loading = false;

                    } else {
                        return false;
                    };
                }
            },
            trackRichRelevanceProducts: function trackRichRelevanceProducts(e) {
                $('#wrapper.product').on('click', '.feature-products .rr-product a', function () {
                    var pageType,
                        productId,
                        s_eVar2 = 'Recommender_',
                        oWebAnalytics;

                    if (s && s.prop4 !== undefined) {
                        pageType = s.prop4;
                        s_eVar2 += pageType + '_';
                    }

                    productId = $(this).closest('.product').find('a.thumbnail').data('productid');
                    if (productId !== '') {
                        s_eVar2 += productId;
                    }

                    oWebAnalytics = new analytics.WebMetrics();
                    oWebAnalytics.submit([{
                        'eVar2': s_eVar2
                    }]);

                });
            },
            sSpecialOffersContainer: '#special-offers-container',
            equaliseSpecialOfferHeights: function equaliseSpecialOfferHeights() {
                var sSpecialOffersElements = '#special-offers-container div.special-offer-container-top';
                if ($(pdp.sSpecialOffersContainer).length) {
                    $(sSpecialOffersElements).removeAttr('style').equaliseHeights();
                }
            },
            initInlineSpecialOffers: function () {
                var initToggleExpandCollapse,
                    sSpecialOffersParentContainer = $('.product-description').length ? '.product-description' : '.special-offers-block';

                if (!$('body').hasClass('PDP-Version2') && $(pdp.sSpecialOffersContainer).length) {
                    $(window).on('breakpointChange', pdp.equaliseSpecialOfferHeights);
                    pdp.equaliseSpecialOfferHeights();
                    initToggleExpandCollapse = new ToggleExpandCollapse({
                        sToggleContainer: sSpecialOffersParentContainer,
                        sToggleElementParent: '.fnToggleDescription',
                        sToggleTriggerElement: 'div.special-offer-container-top',
                        bAccordionEnabled: true
                    });
                    initToggleExpandCollapse.init();
                }
            },

            initShowMore: function () {
                if (!window.isKiosk()) {
                    var oShowMoreHandler = new ShowMoreHandler(ShowMoreConfig);
                    oShowMoreHandler.init();
                }
            },

            reCalcShowMoreHeight: function () {
                var oShowMore;
                if (!window.isKiosk()) {
                    $('.section-container').each(function () {
                        if ($(this).data('ShowMore') && typeof ($(this).data('ShowMore')) === 'object') {
                            oShowMore = $(this).data('ShowMore');
                            if (oShowMore.$showMoreWrapper !== null) {
                                oShowMore.fnCalcSelectorHeight();
                                if (oShowMore.bShowMore) {
                                    oShowMore.fnSetWrapperHeight(oShowMore.iSelectorHeight);
                                }
                            }
                        }
                    });
                }
            },

            init: function () {
                if (!common.isPage('PDP')) {
                    return;
                }

                jargonBuster.init();
                pdp.initShowMore();

                if (kmfIO.checkKMFExists()) {
                    setTimeout(function () {
                        pdp.getBasketTotalCount();
                    }, 700);
                }

                pdp.initLinkSaveBlock();
                pdp.scrollToPromotions();
            },

            initPersonaliseHandler: function initPersonaliseHandler() {
                var personaliseHandler,
                    $skuIdVal = $('#skuIdVal'),
                    sSkuIdValue,
                    sPDPSelector = $('.product-description').length ? '.product-description' : 'body.PDP-Version2';
                if ($skuIdVal.length > 0) {
                    sSkuIdValue = $skuIdVal.val();
                    require(['modules/personalise-product/common'], function (PersonaliseProduct) {
                        personaliseHandler = new PersonaliseProduct({
                            sPDPSelector: sPDPSelector,
                            sPersonaliseSelector: '#personalise-button',
                            sAddToBasketSelector: '.addPersonalisedToBasketForm',
                            sPersonaliseErrorSelector: '.personalise-error',
                            sProductName: sSkuIdValue //'276-2966'
                        });
                        personaliseHandler.clearEmaginationCookies();
                        if (window.AsyncBlockController.isCachedPage() && !window.AsyncBlockController.hasCompleted()) {
                             $(window).on('AsyncBlockControllerComplete', function () {
                        personaliseHandler.init();
                             });
                        } else {
                             personaliseHandler.init();
                        }
                    });
                }
            },
            thumbnailSetup: function () {
                var $thumbnails = $('.main-details .product-carousel .thumbnails'),
                    height = 'auto';
                if ($thumbnails.is(':visible')) {
                    $('.main-details .product-carousel').removeClass('more-thumbnails');
                    var thumbnailNum = $thumbnails.find('li').length;
                    var moreLength = 8; //initially set as 8 for legacy reasons.
                    switch (breakpoint.currentViewport) {
                    case 'largedesktop':
                        if (thumbnailNum > 6) {
                            height = ($thumbnails.find('li').outerHeight(true) * 5) - 15 + 'px';
                            moreLength = 6;
                        }
                        break;
                    case 'desktop':
                        if (thumbnailNum > 4) {
                            height = ($thumbnails.find('li').outerHeight(true) * 3) - 8 + 'px';
                            moreLength = 4;
                        }
                        break;
                    }
                    pdp.addAdditionalClass($thumbnails.find('li'), moreLength, $('.main-details .product-carousel'), 'more-thumbnails');
                    $thumbnails.height(height);
                }
            },

            bindVirtualPages: function (e) {
                //$(".product-description .product-specifications-link").on("click", function(e){
                if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
                    var backLink = "<a href='#' class='back'><span class='icon' data-icon='g' aria-hidden='true'></span> Back to Product Overview</a>",
                        content = "<h1 class='page-title'>" + $(".page-title").clone().html() + "</h1><div class='product-description'><section class='product-specifications'>" + backLink + $(".product-specifications").html() + backLink + "</section></div>";
                    var opts = {
                        content: content,
                        closeSelector: '.back'
                    };
                    common.virtualPage.show(opts);
                    e.preventDefault();
                }
                if (window.isKiosk()) {
                    pdp.showVirtualPage(e);
                }

                //});
            },
            truncateText: function () {
                var truncationText = [$(".feature-products .product h3"), $(".collectionItems .collectionItemDescription"), $(".mainCollectionItem .collectionItemDescription"), $('.services .tableCellTextWrapper')];
                for (var i = 0; i < truncationText.length; i++) {
                    if (truncationText[i].length > 0) {
                        this.Ellipsis.init(truncationText[i]);
                    }
                }
            },
            Ellipsis: {
                init: function (element) {
                    element.dotdotdot({
                        ellipsis: '\u2026',
                        wrap: 'word',
                        tolerance: 0
                    });
                }
            },
            swatchesAndSizes: {
                bindTooltipEvents: function () {
                    var listItems = $("li.unavailable, li.not-in-stock");
                    this.bindHoverEvents(listItems);
                },
                showTooltip: function (trigger) {
                    var className = trigger.parent("li").attr("class");
                    var finalClass;
                    if (className.indexOf('unavailable') != -1) {
                        finalClass = 'unavailable';
                    }
                    if (className.indexOf('not-in-stock') != -1) {
                        finalClass = 'not-in-stock';
                    }
                    var html = "<p>" + pdp.tooltipMessages[finalClass] + "</p>";
                    var settings = {
                        trigger: trigger,
                        html: html,
                        isHover: true,
                        isInline: true,
                        fixedSize: false,
                        positionAboveTrigger: true
                    };
                    common.tooltip.show(settings);
                },
                bindHoverEvents: function (listItems) {
                    listItems.bind("mouseenter", function (e) {
                        if (listItems.parents().find('.dropdown-enabled').length <= 0) {
                            pdp.swatchesAndSizes.showTooltip($(this).find("a"));
                        }
                    });
                    listItems.bind("mouseleave", function (e) {
                        common.tooltip.hide();
                    });
                    listItems.find("a").bind("focus", function () {
                        if (listItems.parents().find('.dropdown-enabled').length <= 0)
                            pdp.swatchesAndSizes.showTooltip($(this));
                    });
                    listItems.find("a").bind("blur", function (e) {
                        if (pdp.isValidBreakpoint()) {
                            common.tooltip.hide();
                        }
                    });
                },
                isOverMaxiumAmount: function (module) {
                    var maximumAmountExceeded = false;
                    var list = $(module);
                    var liLength = list.find("li").length;
                    var sizeTextLen = 0;

                    if (liLength > pdp.swatchesAndSizesRules.maximumAmount) {
                        maximumAmountExceeded = true;
                        var lengthToCols = Math.ceil(liLength / pdp.swatchesAndSizesRules.dropdownLimit);
                        list.parent('div').addClass("cols-" + lengthToCols);
                    }

                    /* if text length of sizes module is >=4, change it to dropdown */
                    if (list.hasClass('sizes')) {
                        sizeTextLen = list.find('li:eq(0) > a').attr('value');
                        list.find('li > a').each(function () {
                            sizeTextLen = $(this).attr('value');
                            if (sizeTextLen.length >= 4) {
                                maximumAmountExceeded = true;
                            }
                        });
                    } else if (list.hasClass('swatch')) { /* if amy swatch does not have image, change it to dropdown */
                        if (list.find("li a img[src='']").length) {
                            maximumAmountExceeded = true;
                        }
                    }

                    return maximumAmountExceeded;
                },
                dropdown: {
                    init: function (module) {
                        var listContainer = $(module).parent("article");
                        pdp.swatchesAndSizes.dropdown.setup(module);
                        pdp.swatchesAndSizes.dropdown.bindEvents(listContainer);

                    },
                    isSelectedItem: function (list) {
                        return list.find("li.selected").length > 0;
                    },
                    getInitialValue: function (module) {
                        var isSelectedItem = pdp.swatchesAndSizes.dropdown.isSelectedItem(module),
                            className = module.parent("article").attr("class"),
                            dropdownValue = pdp.swatchesAndSizesRules.placeholders[className],
                            selectedItem = module.find("li.selected"),
                            selectedItemValue = (className === "select-colour") ? selectedItem.find(".variantDisplayName_title").text() : selectedItem.find('a > span').text();
                        if (isSelectedItem) {
                            dropdownValue = selectedItemValue;
                        }
                        module.parent("article").addClass("dropdown-enabled");

                        return dropdownValue;
                    },
                    insertTrigger: function (module) {
                        var initialDropDownValue = pdp.swatchesAndSizes.dropdown.getInitialValue(module);
                        module.parent("article").prepend("<a href='#' class='trigger'>" + initialDropDownValue + "<span class='icon'></span></a>");
                    },
                    insertCheckbox: function (module) {
                        var checkboxHtml = "<div class='checkbox'></div>";
                        module.find("li a").append(checkboxHtml);
                    },
                    insertText: function (module) {
                        module.find("li").each(function () {
                            try {
                                var className = $(this).attr("class");
                                var finalClass;
                                if (className.indexOf('unavailable') != -1) {
                                    finalClass = 'unavailable';
                                }
                                if (className.indexOf('not-in-stock') != -1) {
                                    finalClass = 'not-in-stock';
                                }
                                if (className.val == "") {
                                    finalClass = "";
                                }
                                var availabilityText = pdp.tooltipMessages[finalClass];
                                var imgTag = $(this).find("img");
                                if (imgTag.length > 0) {
                                    var textValue = $(imgTag).attr('alt');

                                    if (availabilityText) {
                                        textValue = textValue + ' - ' + availabilityText;
                                    }

                                    $(imgTag).after("<span>" + textValue + "</span>");
                                } else {
                                    if (availabilityText) {
                                        $(this).find("span").append(" - " + availabilityText);
                                    }
                                }
                                if (availabilityText == "Not in stock") {
                                    $(this).closest("li").removeClass("not-in-stock");
                                }

                            } catch (e) {}

                        });
                    },
                    addBodyOverlay: function (trigger) {
                        common.tooltip.insertOverlay();
                        $('body').on(pdp.clickEvent, function () {
                            $(".filter-options").removeClass("show-overlay");
                            $(trigger).removeClass("open");
                            $(trigger).parent("article").siblings("article").find(".trigger").removeClass("closed");

                        });
                    },
                    addColumns: function (list) {

                        var liLength = list.find("li").length;
                        if (liLength > pdp.swatchesAndSizesRules.maximumAmount) {
                            var lengthToCols = Math.ceil(liLength / pdp.swatchesAndSizesRules.dropdownLimit);
                            list.addClass("cols-" + lengthToCols);
                            var listEl = list.find("li");
                            listEl.each(function (i, val) {
                                if (i % pdp.swatchesAndSizesRules.dropdownLimit === 0 && i !== 0) {
                                    var toInsert = $(this);
                                    $('<ul>').insertAfter(toInsert.parent()).append(toInsert.nextAll().andSelf());
                                }
                            });
                        }

                    },
                    checkSizeDropdown: function (dropdown) {
                        var sizeDropDown = $(dropdown).hasClass("select-size");

                        if (sizeDropDown) {
                            if (!$(dropdown).siblings("article").hasClass("dropdown-enabled")) {
                                $(dropdown).addClass("lone-dropdown");
                            }
                        }
                    },
                    bindEvents: function (module) {
                        $(module).find(".trigger").bind("click", function (e) {
                            e.preventDefault();
                            $(this).siblings(".filter-options").toggleClass("show-overlay");
                            $(this).addClass("open");
                            $(this).parent("article").siblings("article").find(".trigger").addClass("closed");
                            pdp.swatchesAndSizes.dropdown.addBodyOverlay(this);
                        });

                    },
                    setup: function (list) {
                        var articleWrapper = list.parent("article");
                        articleWrapper.wrapInner("<div class='filter-options'/>");
                        pdp.swatchesAndSizes.dropdown.insertCheckbox(list.parent(".filter-options"));
                        pdp.swatchesAndSizes.dropdown.insertTrigger(list.parent(".filter-options"));
                        pdp.swatchesAndSizes.dropdown.insertText(list.parent(".filter-options"));
                        pdp.swatchesAndSizes.dropdown.checkSizeDropdown(articleWrapper);
                        if (window.isKiosk()) {
                            pdp.swatchesAndSizes.dropdown.addColumns(list.parent(".filter-options"));
                        }
                    }
                },

                convertListToSelect: {
                    init: function () {


                        $(".availability").each(function () {
                            pdp.swatchesAndSizes.convertListToSelect.buildSelect(this);
                        });
                    },
                    buildSelect: function (list) {

                        var selectedListVal = pdp.swatchesAndSizes.convertListToSelect.getInitialSelectedVal(list),
                            selectName = pdp.swatchesAndSizes.convertListToSelect.getVariantName(list),
                            $article = $(list).parent('article'),
                            parentClass = $article.attr('class'),
                            dropdownValue = pdp.swatchesAndSizesRules.placeholders[parentClass],
                            selectContainer = $("<select><select>").attr('name', selectName);

                        selectedListVal = (selectedListVal === "") ? dropdownValue : selectedListVal;
                        $(selectContainer).append("<option value='-1'>" + dropdownValue + "</option>");
                        $article.find('p').css('display', 'none');

                        var selectButton = $("<a class='select-trigger'>" + selectedListVal + "<span class='icon'></span></a>");

                        $(list).find('li').each(function () {
                            try {
                                var imgTag = $(this).find("img"),
                                    className = $(this).attr("class"),
                                    finalClass = "",
                                    disabled = "",
                                    selected = "",
                                    availabilityText = "",
                                    textValue = "";

                                if (className.indexOf('unavailable') != -1) {
                                    finalClass = 'unavailable';
                                    disabled = 'disabled';
                                }
                                if (className.indexOf('not-in-stock') != -1) {
                                    finalClass = 'not-in-stock';
                                    //disabled = 'disabled';
                                }
                                if (className.indexOf('selected') != -1) {
                                    selected = 'selected';
                                }

                                availabilityText = pdp.tooltipMessages[finalClass];

                                if (imgTag.length > 0) {
                                    value = $(imgTag).attr('alt');
                                } else {
                                    value = $(this).find('a span')[0].innerHTML;
                                }
                                text = value;
                                if (availabilityText) {
                                    text = value + ' - ' + availabilityText;
                                }
                                $(selectContainer).append("<option " + disabled + " " + selected + " value='" + value + "'>" + text + "</option>");
                            } catch (e) {}

                        });

                        $(list).before(selectButton).before(selectContainer).remove();
                        pdp.swatchesAndSizes.convertListToSelect.bindOnSelectEvent(selectContainer, selectButton);

                    },
                    bindOnSelectEvent: function (selectList, button) {

                        $(selectList).on("change", function () {
                            var selectedVal = $(selectList).find("option:selected").text();
                            $(selectList).siblings(".select-trigger").html(selectedVal + "<span class='icon'></span>");
                        });
                    },
                    getInitialSelectedVal: function (list) {
                        if ($(list).find("li.selected").length === 0) {
                            return "";
                        }
                        var selectedListItem = $(list).find("li.selected");
                        var hasImg = $(selectedListItem).find("img");
                        if (hasImg.length > 0) {
                            return hasImg[0].alt;
                        } else {
                            return $(selectedListItem).find("a > span").text();
                        }

                    },
                    getVariantName: function (list) {
                        return $(list).find("li:eq(0) a").attr('name');
                    }
                },

                init: function init() {

                    var isTouchDevice = common.isTouch();
                    if (isTouchDevice && !window.isKiosk()) {
                        //pdp.swatchesAndSizes.convertListToSelect.init();
                    } else {

                        $(".product-description").each(function () {

                            /*
                            $(this).find(".availability").each(function () {
                                var isOverMaxiumAmount = pdp.swatchesAndSizes.isOverMaxiumAmount($(this));
                                if (isOverMaxiumAmount || breakpoint.mobile || breakpoint.vTablet) {
                                    pdp.swatchesAndSizes.dropdown.init($(this));
                                } else {
                                    pdp.swatchesAndSizes.bindTooltipEvents();
                                }
                            });
                            */

                        });

                        $('.pre-order-price-promise').on(pdp.clickEvent, pdp.preOrderPriceOverlay);
                        $(document).on(pdp.clickEvent, '.customer-review-link,.BVRRRatingSummaryLinkRead a', function () {
                            if (!$(this).closest('ul.products').hasClass('compare')) {
                                pdp.customerReviewOverlay();
                            }
                        });

                        $('.blinkbox-banner').on(pdp.clickEvent, pdp.blinkboxOverlay);
                    }

                    wishlist.init();
                }
            },
            formatCustomisedBlocks: function () {

                var $elemContainer;

                $('.collapseByDefault').each(function (i, e) {
                    var $elem = $(this);

                    if ($elem.find('#PDP-inline-content').length) {
                        var $elemContainer = $elem.next('section');
                        $elemContainer.find('.toggleDetailWrapperIC').toggleClass('PDPchangeIcon');
                        $('#inline-content').hide();
                    } else {
                        // Product spec
                        if ($elem.children().eq(0).is('div')) {
                            if ($elem.children().eq(0).is('.openByDefault') || $elem.children().eq(0).is('.collapseByDefault')) {
                                return; // we have duplicate here, let's do in next loop.
                            }
                            if ($elem.children().eq(0).find('.product-promotions')) {
                                $elemContainer = $elem.children().eq(0).find('.product-promotions');
                            } else {
                                $elemContainer = $elem.children().eq(0).find('.product-specifications');
                            }
                        } else {
                            $elemContainer = $elem.children().eq(0);
                        }
                        $elemContainer.find('.toggleDetailWrapper').toggleClass('PDPchangeIcon');
                        $elemContainer.find('.detailWrapper').hide();
                    }
                });
            },

            formatCustomisedBV: function () {
                // Wrap link around BV heading to allow expand/collapse
                var $elemContainer = $('#BVRRContainer');
                var $moduleHeader = $elemContainer.find('.bv-action-bar-header');
                $moduleHeader.wrap('<a href="#" class="toggleDetailWrapperBV"></a>');

                if ($elemContainer.parent().parent('.collapseByDefault').length) {
                    $elemContainer.addClass('hideBVReviews');
                    $moduleHeader = $elemContainer.find('.bv-action-bar-header').parent().toggleClass('PDPchangeIcon');
                }
            },
            showMoreItems: function (objBut) {
                // Show more products when link is clicked
                var noPerBlock = 5;

                $('#main-content, .tab-content-body').on(pdp.clickEvent, '.collectionItemNext a', function (e) {
                    e.preventDefault();
                    var allItems = $(this).parents(objBut).find('.collectionItems li'),
                        $parent = $(this).closest('.collectionContainer'),
                        visibleItems = allItems.filter(':visible'),
                        currentPage = ($(this).data('currentPage') ? $(this).data('currentPage') : 1);
                    if (window.isKiosk() && $parent.hasClass('range')) {

                        /*
                         * show all 'add the range' elements
                         * as we use kiosk scrollbar instead
                         * of pagination
                         */
                        allItems.removeClass('visually-hidden-select');
                        picturefill();
                        $parent.find('.collectionItemNext').hide();
                    } else {
                        if ((currentPage * noPerBlock) < allItems.length) {
                            currentPage++;
                            $(this).data('currentPage', currentPage);
                            visibleItems.nextAll(':lt(' + ((currentPage * noPerBlock) - 1) + ')').removeClass('visually-hidden-select');
                            if (currentPage >= allItems.length / noPerBlock) {
                                $(objBut).find('.collectionItemNext').hide();
                            }
                        }
                    }
                });
            },
            handleRangeAddEvent: function (e) {
            	 $('.collectionContainer.range').off(pdp.clickEvent, 'input.addCollectionItem');
                 $('.collectionContainer.range').on(pdp.clickEvent, 'input.addCollectionItem', function (e) {
                     var $addToBasketBtn = $(this),
                         $form = utils.getFormByElement($addToBasketBtn),
                         $quantityBox = $form.find('.quantity-display'),
                         $inputVal = $quantityBox.val();

                     e.preventDefault();

                     if (!(/^\d{1,2}$/.test($inputVal))) {

                         var html = "<span class='error'><span class='icon' data-icon='8' aria-hidden='true'></span>" + $quantityBox.data("error-text") + "</span>";
                         require(['modules/buy-from/common'], function (buyFrom) {
                             buyFrom.errorTooltip($quantityBox, html);
                         });
                         $quantityBox.val(1);
                         return false;
                     } else {
                     	/* require(['modules/add-to-basket/common'], function (addToBasket) {
                     		 addToBasket.initAjaxFramework();
                     		 addToBasket.bindEvents(events);
                          });*/
                     }

                 });

             },
             handleLookAddEvent: function (e) {
                 $('.collectionContainer.look, .collectionContainer.range').off(pdp.clickEvent, 'input.addCollectionItem');
                 $('.collectionContainer.look, .collectionContainer.range').on(pdp.clickEvent, 'input.addCollectionItem', function (e) {
                     var $addToBasketBtn = $(this),
                         $form = utils.getFormByElement($addToBasketBtn),
                         $quantityBox = $form.find('.quantity-display'),
                         $inputVal = $quantityBox.val();

                     e.preventDefault();

                     if (!(/^\d{1,2}$/.test($inputVal))) {

                         var html = "<span class='error'><span class='icon' data-icon='8' aria-hidden='true'></span>" + $quantityBox.data("error-text") + "</span>";
                         require(['modules/buy-from/common'], function (buyFrom) {
                             buyFrom.errorTooltip($quantityBox, html);
                         });
                         $quantityBox.val(1);
                         return false;
                     } else {
                         pdp.rangeAddtoBasket($addToBasketBtn, $form, $quantityBox);
                     }

                 });

             },
            rangeAjaxResponseHandler: function (result, $addToBasketBtn) {

                var responseText = '',
                    currentMsg = $addToBasketBtn.closest('.collectionActions').find('.collectionResponse');

                if (result.hasOwnProperty('basketRangeAddSuccess') && result.basketRangeAddSuccess != '') {
                    responseText = result.basketRangeAddSuccess;

                    if (currentMsg.length) {
                        currentMsg.replaceWith(responseText);
                    } else {
                        $addToBasketBtn.after(responseText);
                    }

                } else if (result.hasOwnProperty('basketRangeAddFailure') && result.basketRangeAddFailure != '') {
                    responseText = result.basketRangeAddFailure;

                    var html = "<span class='error'><span class='icon' data-icon='8' aria-hidden='true'></span>" + responseText + "</span>";

                    require(['modules/buy-from/common'], function (buyFrom) {
                        buyFrom.errorTooltip($addToBasketBtn, html);
                    });
                }

            },
            rangeAddBtnStatus: function ($addToBasketBtn, inProgress) {

                var originalText = $addToBasketBtn.val();

                if (inProgress) {
                    $addToBasketBtn.prop('disabled', true).addClass('inProgress').val('Adding to basket');
                } else {
                    $addToBasketBtn.prop('disabled', false).removeClass('inProgress').val($addToBasketBtn.data('success-text'));
                }

                $addToBasketBtn.data('success-text', originalText);

            },

            rangeAddtoBasket: function ($addToBasketBtn, $form, $quantityBox) {

                var DL = new data.DataLayer(),
                    productData = $form.serialize(),
                    request = 'addTheRange',
                    _url = utils.getFormAction($form);
                params = {
                    'inlineRequests': [],
                    'requests': {
                        'addTheRange': ['basketContainer', 'basketRangeAddSuccess', 'basketRangeAddFailure']
                    },
                    'modules': {
                        'basketContainer': ['#masthead .basket-items', '', true, true],
                        'basketRangeAddSuccess': ['.collectionContainer .collectionItems .result', '', false],
                        'basketRangeAddFailure': ['.collectionContainer .collectionItems .collectionQuantity div', '', false]
                    }
                };

                data.Global.init(params);
                pdp.rangeAddBtnStatus($addToBasketBtn, true);

                DL.get(null, productData, $addToBasketBtn, null, request, function (result) {
                    pdp.rangeAjaxResponseHandler(result, $addToBasketBtn);
                    pdp.rangeAddBtnStatus($addToBasketBtn, false);
                    $quantityBox.val(1);
                    if($('#masthead #basket-link .basket-items').length > 0){
                        $('#masthead #basket-link .basket-items').html(result.basketContainer);
	                 } else{
	                        $('#masthead #basket-link').append($('<span class="badge"><span class="basket-items">' + result.basketContainer + '</span></span>'));
	                 }
                    if (window.isKiosk() && kmfIO.checkKMFExists()) {
                        setTimeout(function () {
                            kmfIO.enableBasketButton();
                        }, 2000);
		            }
                });
            },
            setSellerUrl: function () {
                var fileLocation = "/directuiassets/SiteAssets/NonSeasonal/en_GB/sellers/seller popup/",
                    sellerLogo = "#product-promotions a.sellerImageContainer",
                    target = ".content a";

                var sellerId = $(sellerLogo).attr('data-sellerid');

                if (sellerId === undefined) return;

                if (sellerId !== "1000001") {

                    var sellerFile = fileLocation + sellerId + ".html";

                    $.get(sellerFile, function (data) {
                        var link = $(data.trim()).find(target).attr('href');
                        if (link.length) {
                            $(sellerLogo).attr('href', link);
                        } else {
                            pdp.removeSellerLink();
                        }
                    }).fail(function () {
                        pdp.removeSellerLink();
                    });
                } else {
                    pdp.removeSellerLink();
                }

            },

            removeSellerLink: function () {
                var sellerLogoImg = "#product-promotions a.sellerImageContainer img";
                $(sellerLogoImg).unwrap();
            },
            initAddTheRangeBlock: function initAddTheRangeBlock() {
                if ($('.collectionContainer.range').length) {
                    pdp.addTheRangeBlock();
                    if (window.isKiosk()) {
                        pdp.oTabViewData.iKioskAsyncTabs++;
                    }
                }
            },
            initCompleteTheLookBlock: function initCompleteTheLookBlock() {
                if ($('.collectionContainer.look').length) {
                    pdp.addLookBlock();
                }
            },
            initLinkSaveBlock: function initLinkSaveBlock() {
                if ($('.collectionContainer.linksave').length) {
                    pdp.linkSaveBlock();
                    if (window.isKiosk()) {
                        pdp.oTabViewData.iKioskAsyncTabs++;
                    }
                }
                pdp.linkSaveBindEvents();
            },
            initBundleBlock: function initBundleBlock() {
                if ($('.collectionContainer.bundle').length) {
                    pdp.bundleBlock();
                }
            },
            displayInlineContent: function () {
                if ($("#inline-content").length !== 0) {
                    var a, b;
                    a = $("div#inlineContentURL").html() || null;
                    b = $("div#inlineContentURLType").html() || null;
                    if (a !== null && b !== null) {
                        a = a.replace(/&amp;/g,"&");
                        if (b === "CMS") {
                            $.get(a, function(data) {
                                $("div#inhouse-data").html(data);
                            });
                        } else {
                            $.getScript(a, function(c, e, d) {
                            	try {
	                            	if (window.Webcollage !== undefined) {
	                            		Webcollage.loadContent('tescodirect-uk', window.TescoData.skuID);
	                            	}
                            	} catch (ex) {}
                            });
                        }
                    }
                }
            },

            scrollToPromotions: function scrollToPromotions() {
                var el = document.querySelector('div.promotions-view');

                if ((window.location.href.indexOf('expand=true') > -1) && el) {
                    el.scrollIntoView();
               }
            }
        };
        breakpoint.mobileIn.push(function () {
            if (common.isPage('PDP')) {
                pdp.truncateText();
                pdp.equalizeBundleHeights(false);
            }
        });
        breakpoint.vTabletIn.push(function () {
            if (common.isPage('PDP')) {
                pdp.changeColumnLayout();
                pdp.truncateText();
                pdp.equalizeBundleHeights(true);
            }
        });
        breakpoint.hTabletIn.push(function () {
            if (common.isPage('PDP')) {
                pdp.changeColumnLayout();
                pdp.truncateText();
                pdp.equalizeBundleHeights(true);
            }
        });
        breakpoint.desktopIn.push(function () {
            if (common.isPage('PDP')) {
                pdp.changeColumnLayout();
                pdp.thumbnailSetup();
                pdp.truncateText();
                setTimeout(function () {
                    pdp.equalizeBundleHeights(false);
                }, 1000);
            }
        });
        breakpoint.largeDesktopIn.push(function () {
            if (common.isPage('PDP')) {
                pdp.changeColumnLayout();
                pdp.thumbnailSetup();
                pdp.truncateText();
                pdp.equalizeBundleHeights(false);
            }
        });
        breakpoint.desktopOut.push(pdp.changeColumnLayout);
        breakpoint.largeDesktopOut.push(pdp.changeColumnLayout);
        breakpoint.kioskIn.push(function () {
            pdp.changeColumnLayout();
            pdp.showMoreItems();
        });

        common.deferredInit.push(function () {
            if (common.isPage('PDP')) {
                pdp.changeColumnLayout();
            }
            // Need to invoke picturefill to replace images loaded through lazy loaded modules
            picturefill();
        });

        return pdp;

    });
