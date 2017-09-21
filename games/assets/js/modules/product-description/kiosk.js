/* eslint-disable */
/*jslint plusplus: true */
/*globals window,document,console,define,require, $ */
define(['domlib', './common', 'modules/common', 'modules/overlay/common', 'modules/tabview/common', 'modules/tesco.analytics', 'modules/jargon-buster/common'], function ($, pdp, common, overlay, tabView, analytics, jargonBuster) {

    pdp.oTabViewData = {};
    pdp.oTabViewData.iKioskAsyncTabs = 0;
    pdp.oTabViewData.bKioskAsyncTabsActive = false;
    pdp.oTabViewData.buttonStates = [];

    pdp.swatchesAndSizes.bindTooltipEvents = function () {
            var listItems = $("li.unavailable, li.not-in-stock");
            this.bindClickAndTouchEvents(listItems);
        },
        pdp.swatchesAndSizes.bindClickAndTouchEvents = function (listItems) {
            listItems.find("a").on("touchstart", function (e) {
                e.preventDefault();
                if (listItems.parents().find('.dropdown-enabled').length <= 0)
                    pdp.swatchesAndSizes.showTooltip($(this));
                return false;
            });
        },
        pdp.swatchesAndSizes.showTooltip = function (trigger) {
            if (pdp.isValidBreakpoint()) {
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
                    isInline: true,
                    fixedSize: false,
                    positionAboveTrigger: true
                };
                common.tooltip.show(settings);
            }
        },
        pdp.swatchesAndSizesRules.maximumAmount = 8;
    pdp.swatchesAndSizesRules.dropdownLimit = 13;

    pdp.showVirtualPage = function (e) {
        e.preventDefault();
        overlay.show({
            content: $('#product-spec-container .section-content').html(),
            customClass: 'product-description product-spec-section-content',
            fixedWidth: 1280,
            enablePagination: true,
            paginationHeader: '<h1>Product specifications</h1>'
        });
    };
    pdp.showDescriptionVirtualPage = function (e) {
            e.preventDefault();
            overlay.show({
                content: $('#product-details-container .section-content').html(),
                customClass: 'product-description product-details-section-content',
                fixedWidth: 1280,
                enablePagination: true,
                paginationHeader: '<h1>Product Details</h1>'
            });
        },

        pdp.preOrderPriceOverlay = function (e) {
            overlay.show({
                content: $('.pre-order-price-promise').html(),
                customClass: "scrolling-overlay price-promise-overlay",
                fixedWidth: 1280,
                enablePagination: true,
                paginationHeader: '<h1>Price promise</h1>'
            });
        };

    /* C2013 bazaar voice implementation for kiosk [EPIC #2033]*/
    pdp.bazaarVoiceOverlay = function (e) {
        var reviewsLoaded = $('.bv-cleanslate');
        var reviewsReady = false;

        //show customer reviews in overlay
        function showReviewsOverlay(e) {
            if (reviewsReady) {
                e.stopPropagation();
                e.preventDefault();
                var bvContent = $('#BVRRContainer').detach();

                //trigger overlay with review vars configured
                overlay.show({
                    content: bvContent,
                    customClass: "scrolling-overlay customer-review-overlay",
                    fixedWidth: 1586,
                    enablePagination: true,
                    preserveContent: true,
                    paginationHeader: '<h1>Customer reviews</h1>'
                });

                bvContent // tidy element
                    .removeClass('kiosk')
                    .removeAttr('style')
                    .addClass('kiosk');
            }
        }

        //validate if the bazaar voice external content has loaded
        function setReviewsReady() {
            var initBvTimer = setInterval(function () {
                bvCheck()
            }, 600);

            //reset timer
            function stopbvCheck() {
                clearInterval(initBvTimer);
            }

            //check logic
            function bvCheck() {
                var reviewsLoaded = $('.bv-rating-ratio');
                var customerReviewsBtn = '<section class="customer-review-link" style="display: block;"><a href="#" class="slide-in-trigger" data-show="customer-reviews"><h3>Customer reviews</h3></a></section>';

                if (reviewsLoaded.length) {
                    var starRating = $('#BVRRSummaryContainer .bv-rating-ratio-count');
                    reviewsReady = true;
                    stopbvCheck();

                    //remove star rating if there are no reviews
                    if (!starRating.length > 0) {
                        $('#BVRRSummaryContainer .bv-rating-ratio').remove();
                    } else {
                        $('.product-spec-container').append(customerReviewsBtn);
                        $('.customer-review-link, #BVRRSummaryContainer').on(pdp.clickEvent, showReviewsOverlay);
                    }
                }
            }
        }

        //check if the bazaar voice reviews have loaded
        setReviewsReady();
    };

    /* legacy bazaar voice implementation for kiosk */
    pdp.customerReviewOverlay = function (e) {
        var bvContent = $('.customer-review').clone();
        var paginationContent = bvContent.find('.BVPaginationContainer');

        if (paginationContent.find('span.BVRRPageLink').length) {
            paginationContent.find('span.BVRRPageLink a').each(function () {
                $(this).click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $('#BVIFrame').attr("src", $(this).attr("href"));
                });
            });
        }

        $('#BVReviewsContainer').on('DOMNodeInserted', function () {
            $('#pagination-nav').remove();
            overlay.bindScrollEvents($('#lightbox'), true);
            $('.pagination-up').trigger('click');
        });

        overlay.show({
            content: bvContent,
            customClass: "scrolling-overlay customer-review-overlay",
            fixedWidth: 1586,
            enablePagination: true,
            paginationHeader: '<h1>Customer reviews</h1>'
        });
    };

    pdp.checkCustomerReviewsStatus = function () {
        var checkTimer,
            customerReviewsReady = false,
            resetTimer,
            checkStatus;

        resetTimer = function resetTimer() {
            clearInterval(checkTimer);
        };

        checkStatus = function checkStatus() {
            if ($('.bv-rating-ratio').length) {
                resetTimer();
                pdp.resetCustomerReviewsUI();
                pdp.hideEmptyCustomerReviews();
                pdp.customerReviewsSummaryEventBinds();
                customerReviewsReady = true;
                return customerReviewsReady;
            }
        };

        checkTimer = setInterval(function () {
            checkStatus();
        }, 450);
    };

    pdp.resetCustomerReviewsUI = function () {
        $('#BVRRSummaryContainer .bv-rating-ratio').removeAttr('style');
    };

    pdp.customerReviewsSummaryEventBinds = function () {
        $('#BVRRSummaryContainer, #BVRRSummaryContainer a.bv-rating-stars-container').unbind('click').on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (pdp.isTabViewEnabled()) {
                $('#tab-product-reviews').trigger('click');
            } else {
                var bvContent = $('#BVRRContainer').detach();

                overlay.show({
                    content: bvContent,
                    customClass: "scrolling-overlay customer-review-overlay",
                    fixedWidth: 1586,
                    enablePagination: true,
                    preserveContent: true,
                    paginationHeader: '<h1>Customer reviews</h1>'
                });
                bvContent.removeClass('kiosk hideBVReviews').removeAttr('style').addClass('kiosk');
            }
        });
    };

    pdp.removeCustomerReviewsMarkupInTabs = function () {
        $('.tab-content-body #BVRRContainer, .tab-content-head #BVRRSummaryContainer').remove();
    };

    pdp.hideEmptyCustomerReviews = function () {
        if (pdp.isTabViewEnabled()) {
            pdp.oTabViewData.iKioskAsyncTabs--;
        }
        if ($('#BVRRSummaryContainer .bv-rating-ratio-count').length === 0) {
            $('.rating-container').hide();
            pdp.removeTabFromArray('#tab-product-reviews');
            pdp.updateTabViewDOMElements();
        }
        pdp.updateTabViewDOMElements();
    };

    pdp.addQuantityButtons = function () {
        var sQuantityIncreaseButton = '<a href="#" class="increase tertiary-button">+</a>',
            sQuantityDecreaseButton = '<a href="#" class="decrease tertiary-button">-</a>',
            sQuantityContainers = '#range .collectionQuantity';

        if ($(sQuantityContainers + ' a.increase').length === 0 && $(sQuantityContainers + ' a.decrease').length === 0) {
            $(sQuantityContainers).each(function () {
                $(this).prepend(sQuantityDecreaseButton).append(sQuantityIncreaseButton);
            });
        }
    };

    pdp.showTabViewDOMElements = function () {
        var $tabContainer = $('.tab-view .tab-buttons');
        $tabContainer.removeAttr('style');
    };

    pdp.setAsyncTabViewState = function (iNumberOfAsyncLoadedBlocks) {
        pdp.oTabViewData.bKioskAsyncTabsActive = iNumberOfAsyncLoadedBlocks !== undefined && iNumberOfAsyncLoadedBlocks > 0 ? true : false;
    };

    pdp.removeTabFromArray = function (sSelector) {
        for (var i = 0; i < pdp.oTabViewData.buttonStates.length; i++) {
            if (pdp.oTabViewData.buttonStates[i].selector === sSelector) {
                pdp.oTabViewData.buttonStates.splice(i, 1);
                break;
            }
        }
        $(sSelector).removeAttr('style');
    };

    pdp.updateTabViewDOMElements = function () {
        if (pdp.isTabViewEnabled()) {
            if (!pdp.oTabViewData.bKioskAsyncTabsActive) {
                pdp.setTabViewParentClass(pdp.calculateTabViewButtonCount());
                pdp.showTabViewDOMElements();
            } else {
                if (pdp.oTabViewData.iKioskAsyncTabs === 0) {
                    pdp.setTabViewParentClass(pdp.calculateTabViewButtonCount());
                    pdp.showTabViewDOMElements();
                }
            }
        }
    };

    pdp.setTabViewParentClass = function (iNumberOfTabs) {
        var $tabContainer = $('.tab-view .tab-buttons'),
            sNewTabCount;

        if (iNumberOfTabs === 2) {
            sNewTabCount = 'two';
        } else if (iNumberOfTabs === 3) {
            sNewTabCount = 'three';
        } else if (iNumberOfTabs === 4) {
            sNewTabCount = 'four';
        } else if (iNumberOfTabs === 5) {
            sNewTabCount = 'five';
        } else if (iNumberOfTabs === 6) {
            sNewTabCount = 'six';
        } else if (iNumberOfTabs > 6) {
            sNewTabCount = 'six-plus';
        }
        $tabContainer.removeClass().addClass(sNewTabCount + '-tabs tab-buttons');
    };

    pdp.setAvailableTabViewButtons = function () {
        var $overviewTab = $('#tab-close-btn'),
            $productDetailsTab = $('#tab-product-details'),
            $productSpecificationTab = $('#tab-product-specifications'),
            $productSynopsisTab = $('#tab-product-synopsis'),
            $customerReviewsTab = $('#tab-product-reviews'),
            $authorBiographyTab = $('#tab-product-biography'),
            $shopTheRangeTab = $('#tab-shop-the-range'),
            $bundleAndSaveTab = $('#tab-linksave');

        if ($('#wrapper.product').length) {
            pdp.oTabViewData.buttonStates.push($overviewTab);
            $overviewTab.css('display', 'inline-block');
        }

        if ($('#wrapper #product-details-section-content').length) {
            pdp.oTabViewData.buttonStates.push($productDetailsTab);
            $productDetailsTab.css('display', 'inline-block');
        }
        if ($('#wrapper #product-spec-container').length) {
            pdp.oTabViewData.buttonStates.push($productSpecificationTab)
            $productSpecificationTab.css('display', 'inline-block');
        }
        if ($('#wrapper.product #product-details.synopsis').length) {
            pdp.oTabViewData.buttonStates.push($productSynopsisTab);
            $productSynopsisTab.css('display', 'inline-block');
        }
        if ($('#wrapper.product #reviews.customer-review #BVRRContainer').length) {
            pdp.oTabViewData.buttonStates.push($customerReviewsTab);
            $customerReviewsTab.css('display', 'inline-block');
            pdp.oTabViewData.iKioskAsyncTabs++;
        }
        if ($('#wrapper.product #product-details.biography').length) {
            pdp.oTabViewData.buttonStates.push($authorBiographyTab);
            $authorBiographyTab.css('display', 'inline-block');
        }
        if ($('#wrapper.product .collectionContainer.range').length) {
            pdp.oTabViewData.buttonStates.push($shopTheRangeTab);
            $shopTheRangeTab.css('display', 'inline-block');
        }
        if ($('#wrapper.product .collectionContainer.linksave').length) {
            pdp.oTabViewData.buttonStates.push($bundleAndSaveTab);
            $bundleAndSaveTab.css('display', 'inline-block');
        }
    };

    pdp.calculateTabViewButtonCount = function () {
        var iActiveTabCount = 0;
        for (var i = 0; i < pdp.oTabViewData.buttonStates.length; i++) {
            if (pdp.oTabViewData.buttonStates[i]) {
                iActiveTabCount++;
            }
        }
        return iActiveTabCount;
    };

    pdp.resetTabViewButtons = function () {
        $('.tab-view .tab-buttons button').removeAttr('style');
    };

    pdp.initTabViewDOMElements = function () {
        pdp.resetTabViewButtons();
        pdp.setAvailableTabViewButtons();
        pdp.setAsyncTabViewState(pdp.oTabViewData.iKioskAsyncTabs);
    };

    pdp.showCustomerReviewsTab = function (pdpTabView) {
        var $starsContainer;

        $starsContainer = $('#BVRRSummaryContainer').clone(false, false);
        pdpTabView.returnContent();
        pdpTabView.$currentContent = $('#BVRRContainer');
        pdpTabView.$currentContentContainer = pdpTabView.$currentContent.parent();
        pdpTabView.$currentContent.detach();

        $starsContainer.insertAfter($('.tab-content-head h2'));
        $('.tab-content-head #BVRRSummaryContainer a').click(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
        });
        pdpTabView.$tabContent.find('.tab-content-body').html(pdpTabView.$currentContent);
        pdpTabView.showContent();
    };

    pdp.blinkboxOverlay = function (e) {
        overlay.show({
            content: $('.blinkbox-banner .expanded').html(),
            customClass: "scrolling-overlay blinkbox-overlay",
            enablePagination: true,
            paginationHeader: '<h1>What is Blinkbox?</h1>'
        });
    };

    pdp.shiftInfoIfNoFeatures = function () {
        if (common.isPage('PDP')) {
                if (!$('.product-description ul.features li').length) {
                $('.product-description .format-release').css("margin-left", "42.5%");
            }
            if (($('.book ul.features li').length) && ($('.age-restriction').length)) {
                $('.product-description .format-release').css("margin-left", "42.5%").css("margin-top", "80px");
            }

            if ((!$('.product-description .format-release .format, .product-description .format-release .release, .product-description .format-release .age-restriction').length) && (!$('.product-description ul.features li').length)) {
                $('#main-content').addClass('kiosk-pdp-no-features');
            }
        }
    };

    pdp.kioskMetaData = function () {
        window.setTimeout(function () {
            var catNo = $("#main-content .cat-no");
            var sellerName = $(".header-wrapper h2 span");
            var productDesc = $(".product-description h1.page-title");
            var currentPrice = $(".current-price");
            var deliveryOptionsOld = $(".delivery ul li");
            var deliveryOptionsNew = $(".newDeliveryOptions ul li a");
            var allowPrint = "true";
            var currentPriceRaw,
                deliveryOptions,
                productDescRaw,
                productDescTmp,
                textRaw,
                textClean;

            if (catNo.length) {
                var catNo = catNo.first().clone().children().remove().end().text();
            }

            if (sellerName.length) {
                var sellerName = sellerName.text(); // test this on multiple sellers
            }

            if (productDesc.length) {
                var productDescRaw = productDesc.text();
                var productDescTmp = $.trim(productDescRaw);
                var productDesc = productDescTmp.replace(/"/g, "&quot;");
            }

            if (currentPrice.length) {
                var currentPriceRaw = currentPrice.first().text().replace(/\u00A3/g, '');
                var currentPrice = $.trim(currentPriceRaw);
            }

            if (deliveryOptionsNew.length) {
                var deliveryOptions = '';
                deliveryOptionsNew.each(function () {
                    var textRaw = $(this).text();
                    var textClean = $.trim(textRaw);
                    deliveryOptions += textClean + '|';
                });
            } else {
                var deliveryOptions = '';
                deliveryOptionsOld.each(function () {
                    var textRaw = $(this).text();
                    var textClean = $.trim(textRaw);
                    deliveryOptions += textClean + '|';
                });
            }

            function removeLastPipe(deliveryOptions) {
                if (deliveryOptions.substring(deliveryOptions.length - 1) === "|") {
                    deliveryOptions = deliveryOptions.substring(0, deliveryOptions.length - 1);
                }
                return deliveryOptions;
            }
            deliveryOptions = removeLastPipe(deliveryOptions);

            if (sellerName === 'Tesco') {
                $('head').append('<meta name="sellerName" content="' + sellerName + '" />')
                    .append('<meta name="productDesc" content="' + productDesc + '" />')
                    .append('<meta name="catNo" content="' + catNo + '" />')
                    .append('<meta name="price" content="' + currentPrice + '" />')
                    .append('<meta name="deliveryOptions" content="' + deliveryOptions + '" />')
                    .append('<meta name="allowPrint" content="' + allowPrint + '" />');
            } else {
                $('head').append('<meta name="sellerName" content="" />')
                    .append('<meta name="productDesc" content="" />')
                    .append('<meta name="catNo" content="" />')
                    .append('<meta name="price" content="" />')
                    .append('<meta name="deliveryOptions" content="" />')
                    .append('<meta name="allowPrint" content="false" />');
            }
        }, 1300);
    };



    // -------------------------------

    pdp.isTabViewEnabled = function () {
        var $tabViewMarkup = 'div.tab-view',
            bEnabled;

        if ($($tabViewMarkup).length > 0) {
            bEnabled = true;
        } else {
            if ($('#product-spec-container').length) {
                $('#product-spec-container').css('display', 'block');
            }
            if ($('.customer-review-link').length) {
                $('.customer-review-link').css('display', 'block');
            }
            bEnabled = false;
        }
        return bEnabled;
    };

    common.init.push(function () {
        var bPDPV2 = $('body').hasClass('PDP-Version2') ? true : false;

        if (!bPDPV2) {
            pdp.clickEvent = 'touchstart click';
            //pdp.addAdditionalClass($('.product-carousel .thumbnails li'), 8, $('.main-details .product-carousel'), 'more-thumbnails');
            pdp.shiftInfoIfNoFeatures();
            pdp.kioskMetaData();
            pdp.init();

            try {
                var oEllipsisOnKiosk = pdp.EllipsisOnKiosk();
                oEllipsisOnKiosk.fnInit();
            } catch (e) {
                console.info('EllipsisOnKiosk:', e.message);
            }


            if (pdp.isTabViewEnabled()) {
                pdp.v = [{
                    'eVar59': '',
                    'events': 'event32'
                }];
                pdp.tabView = new tabView({
                    tabButtonsContainer: '.tab-buttons',
                    tabContent: '.tab-content-mask',
                    callbacks: {
                        'tab-close-btn': function (e) {
                            e.data.ctx.hideContent();
                            //Omniture
                            pdp.v[0].eVar59 = pdp.v[0].eVar59 == '' ? '' : pdp.v[0].eVar59 + ',';
                            var omniVal = pdp.v[0].eVar59 + 'PDP_Kiosk_overview_tab';
                            var _oWebAnalytics = new analytics.WebMetrics();
                            pdp.v = [{
                                'eVar59': omniVal,
                                'events': 'event32'
                            }];
                            _oWebAnalytics.submit(pdp.v);
                        },
                        'tab-product-details': function (e) {
                            var self = e.data.ctx;
                            self.returnContent();
                            // required to remove ellipsis so that entire content is cloned and not just ellipsed content
                            var $contentSelector = $('#product-details-container .section-content');
                            if ($contentSelector.data('Ellipsis')) {
                                var oEllipsis = $contentSelector.data('Ellipsis');
                                if (oEllipsis.bIsEllipsed) {
                                    oEllipsis.fnRemoveEllipsis();
                                }
                            }
                            self.$tabContent.find('.tab-content-body').html($('#product-details-container .section-content').clone());
                            self.showContent();
                            //Omniture
                            pdp.v[0].eVar59 = pdp.v[0].eVar59 == '' ? '' : pdp.v[0].eVar59 + ',';
                            var omniVal = pdp.v[0].eVar59 + 'PDP_Kiosk_productdetails_tab';
                            var _oWebAnalytics = new analytics.WebMetrics();
                            pdp.v = [{
                                'eVar59': omniVal,
                                'events': 'event32'
                            }];
                            _oWebAnalytics.submit(pdp.v);
                        },
                        'tab-product-synopsis': function (e) {
                            var self = e.data.ctx;
                            self.returnContent();
                            // required to remove ellipsis so that entire content is cloned and not just ellipsed content
                            var $contentSelector = $('#synopsis-container .section-content');
                            if ($contentSelector.data('Ellipsis')) {
                                var oEllipsis = $contentSelector.data('Ellipsis');
                                if (oEllipsis.bIsEllipsed) {
                                    oEllipsis.fnRemoveEllipsis();
                                }
                            }
                            self.$tabContent.find('.tab-content-body').html($('#synopsis-container .section-content').clone());
                            self.showContent();
                            //Omniture
                            pdp.v[0].eVar59 = pdp.v[0].eVar59 == '' ? '' : pdp.v[0].eVar59 + ',';
                            var omniVal = pdp.v[0].eVar59 + 'PDP_Kiosk_synopsis_tab';
                            var _oWebAnalytics = new analytics.WebMetrics();
                            pdp.v = [{
                                'eVar59': omniVal,
                                'events': 'event32'
                            }];
                            _oWebAnalytics.submit(pdp.v);
                        },
                        'tab-product-biography': function (e) {
                            var self = e.data.ctx;
                            self.returnContent();
                            self.$tabContent.find('.tab-content-body').html($('#biography-container .section-content').clone());
                            self.showContent();
                            //Omniture
                            pdp.v[0].eVar59 = pdp.v[0].eVar59 == '' ? '' : pdp.v[0].eVar59 + ',';
                            var omniVal = pdp.v[0].eVar59 + 'PDP_Kiosk_authorbiography_tab';
                            var _oWebAnalytics = new analytics.WebMetrics();
                            pdp.v = [{
                                'eVar59': omniVal,
                                'events': 'event32'
                            }];
                            _oWebAnalytics.submit(pdp.v);
                        },
                        'tab-product-specifications': function (e) {
                            var self = e.data.ctx;
                            self.returnContent();
                            self.$tabContent.find('.tab-content-body').html($('#product-spec-container .section-content').clone());
                            jargonBuster.init();
                            self.showContent();
                            pdp.removeCustomerReviewsMarkupInTabs();
                            //Omniture
                            pdp.v[0].eVar59 = pdp.v[0].eVar59 == '' ? '' : pdp.v[0].eVar59 + ',';
                            var omniVal = pdp.v[0].eVar59 + 'PDP_Kiosk_productspec_tab';
                            var _oWebAnalytics = new analytics.WebMetrics();
                            pdp.v = [{
                                'eVar59': omniVal,
                                'events': 'event32'
                            }];
                            _oWebAnalytics.submit(pdp.v);
                        },
                        'tab-product-reviews': function (e) {
                            var self = e.data.ctx;
                            if (!$('.tab-content-body #BVRRContainer').length) {
                                pdp.showCustomerReviewsTab(self);
                            }
                            self.$tabContent.on('mouseup', '.bv-content-btn-pages-load-more', function () {
                                self.scrollbarApi.reinitialise({
                                    maintainPosition: true
                                });
                            });
                            //Omniture
                            pdp.v[0].eVar59 = pdp.v[0].eVar59 == '' ? '' : pdp.v[0].eVar59 + ',';
                            var omniVal = pdp.v[0].eVar59 + 'PDP_Kiosk_customerreviews_tab';
                            var _oWebAnalytics = new analytics.WebMetrics();
                            pdp.v = [{
                                'eVar59': omniVal,
                                'events': 'event32'
                            }];
                            _oWebAnalytics.submit(pdp.v);
                        },
                        'tab-shop-the-range': function (e) {
                            var decreaseBtn = $('.collectionQuantity .decrease'),
                                inpElm = $('a.decrease').siblings('.quantity-display'),
                                currentVal = inpElm.val(),
                                maxVal = 99,
                                minVal = 1,
                                minLessThanMax = 98,
                                self = e.data.ctx,
                                checkLoop,
                                kioskProductQuantity = function kioskProductQuantity() {
                                    $(decreaseBtn).each(function () {
                                        checkLoop = $(this).siblings('.quantity-display').val();
                                        if (checkLoop === minVal) {
                                            $(this).addClass('disabled');
                                        }
                                        if (checkLoop > minVal) {
                                            $(this).removeClass('disabled');
                                        }
                                    });

                                    $('.collectionContainer.range').off('click', '.collectionQuantity a.tertiary-button');
                                    $('.collectionContainer.range').on('click', '.collectionQuantity a.tertiary-button', function (e) {
                                        e.preventDefault();

                                        if ($(this).hasClass('increase')) {
                                            inpElm = $(this).siblings('.quantity-display');
                                            currentVal = inpElm.val();
                                            currentVal = parseInt(currentVal, 10);
                                            currentVal = currentVal + minVal;
                                            inpElm.val(currentVal);

                                            if (currentVal > minVal) {
                                                $(this).parent('.collectionQuantity').find('.decrease').removeClass('disabled');
                                            }
                                            if (currentVal > minLessThanMax) {
                                                $(this).parent('.collectionQuantity').find('.increase').addClass('disabled');
                                                $(inpElm).val(maxVal);
                                            }
                                        }

                                        if ($(this).hasClass('decrease')) {
                                            inpElm = $(this).siblings('.quantity-display');
                                            currentVal = inpElm.val();
                                            currentVal = parseInt(currentVal, 10);
                                            currentVal = currentVal - minVal;
                                            inpElm.val(currentVal);
                                            if (currentVal <= minVal) {
                                                $(this).parent('.collectionQuantity').find('.decrease').addClass('disabled');
                                                $(inpElm).val(minVal);
                                            }
                                            if (currentVal < maxVal) {
                                                $(this).parent('.collectionQuantity').find('.increase').removeClass('disabled');
                                            }
                                        }
                                    });
                                };

                            self.returnContent();
                            self.$currentContent = $('.collectionContainer.range');
                            self.$currentContentContainer = self.$currentContent.parent();
                            self.$tabContent.find('.tab-content-body').append(self.$currentContent);
                            self.$tabContent.find('.tab-content-body .collectionItemNext a').trigger('click');
                            self.showContent();
                            kioskProductQuantity();
                            //Omniture
                            pdp.v[0].eVar59 = pdp.v[0].eVar59 == '' ? '' : pdp.v[0].eVar59 + ',';
                            var omniVal = pdp.v[0].eVar59 + 'PDP_Kiosk_shoptherange_tab';
                            var _oWebAnalytics = new analytics.WebMetrics();
                            pdp.v = [{
                                'eVar59': omniVal,
                                'events': 'event32'
                            }];
                            _oWebAnalytics.submit(pdp.v);
                        },
                        'tab-linksave': function (e) {
                            var self = e.data.ctx;
                            self.returnContent();
                            self.$currentContent = $('.collectionContainer.linksave');
                            self.$currentContentContainer = self.$currentContent.parent();
                            self.$tabContent.find('.tab-content-body').append(self.$currentContent);
                            self.showContent();

                            $('.jspPane').addClass('full-width-jsPane').addClass('bundle-container');
                            //Text is different in kiosk only
                            $('.bundleLink').text('Build your own bundle');
                            $('.collectionTermsLink').text('Terms and conditions');
                            $('.tab-view').addClass('link-save-tab');

                            //Omniture
                            pdp.v[0].eVar59 = pdp.v[0].eVar59 == '' ? '' : pdp.v[0].eVar59 + ',';
                            var omniVal = pdp.v[0].eVar59 + 'PDP_Kiosk_bundleandsave_tab';
                            var _oWebAnalytics = new analytics.WebMetrics();
                            pdp.v = [{
                                'eVar59': omniVal,
                                'events': 'event32'
                            }];
                            _oWebAnalytics.submit(pdp.v);
                        }
                    },
                    closeButtonCallback: function (e) {
                        e.data.ctx.$tabButtonsContainer.find('#tab-close-btn').click();
                    },
                    scrollbar: {
                        showArrows: true,
                        maintainPosition: false,
                        isKmf: false,
                        animateScroll: true,
                        speed: 500,
                        autoReinitialise: true
                    }
                });

                pdp.tabView.$tabButtonsContainer.on('tabButtonClicked', function (e) {
                    var buttonId = e.$buttonClicked.attr('id');

                    if (buttonId !== 'tab-product-reviews') {
                        pdp.removeCustomerReviewsMarkupInTabs();
                    }

                    if (buttonId !== 'tab-linksave') {
                        $('.jspPane').removeClass('full-width-jsPane').removeClass('bundle-container');
                        $('.tab-view').removeClass('link-save-tab');
                    }
                });

            } else {
                /*
                 * This is here as a temporary switch incase tabview is switched off.
                 * Ideally it should be removed once tabview is in production.
                 */
                $('#wrapper.product #footer').show();
            }
        }
    });

});
