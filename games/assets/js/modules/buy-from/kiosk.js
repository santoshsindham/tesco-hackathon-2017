/*jslint plusplus: true */
/*globals window,document,console,define,require, $ */
define([
    'domlib',
    'modules/common',
    './common',
    'modules/overlay/common',
    'modules/inline-scrollbar/common',
    'modules/toggle-expand-collapse/common',
    'modules/promotions-manager/PromotionsManager',
    'mustache'
], function ($, common, buyFrom, overlay, inlineScrollbar, ToggleExpandCollapse, PromotionsManager, mustache) {
    'use strict';

    buyFrom.copy = {
        "sellerTrigger": "View all buying &amp; delivery options",
        "overlayHeader": "All buying &amp; delivery options",
        "priceCheckOverlayHeader": "Price check details",
        "sellerHeaderLinks": "Available from "
    };

    buyFrom.setup = function ($module) {
        if ($module.find(".delivery ul").length > 0) {
            this.initAccordians($module.find(".delivery ul"));
        }
        if ($module.find(".quantity input").length > 0) {
            this.setButtonStates($module.find(".quantity input"));
        }
        this.bindEvents($module);
        this.addSellerTriggers($module);
        this.bindSellerOverlayEvents($module);
        this.truncateTitle($module.find(".other-sellers .header h2"));
        buyFrom.initPromotionsManager();
        $('div.offers ul:not(.productPromotionsContent) li a').each(function () {
            $(this).replaceWith($(this).text());
        });
    };

    buyFrom.addSellerTriggers = function ($module) {
        var sellerHeadings = $module.find(".header h2");
        sellerHeadings.each(function () {
            $(this)[0].firstChild.textContent = buyFrom.copy.sellerHeaderLinks;
        });

        sellerHeadings.wrapInner("<a href='#' />");
        if ((!$module.find('.choice-of-seller').length) && $('.buy-from .options').length) {
            if ($module.find('a.primary-button').length) {
                $module.find('a.primary-button').remove();
                $module.append("<a href='#' class='primary-button'>" + buyFrom.copy.sellerTrigger + "</a>");
            } else {
                $module.append("<a href='#' class='primary-button'>" + buyFrom.copy.sellerTrigger + "</a>");
            }
        }
    };

    buyFrom.afterLoadingSellerOverlayActions = function () {
        var lightboxContent = $("#lightbox-content"),
            sSpecialOffersElements = '.offers li .special-offer-container .offer-title',
            $checkbox = lightboxContent.find('.custom-checkbox'),
            eventBoundCheckbox = $checkbox.siblings(".checkbox");

        buyFrom.removeHeaderLinks(lightboxContent);
        lightboxContent.find(".seller").unbind("click");
        lightboxContent.find("#page-container .promoContainer").unbind("click");
        lightboxContent.find(".price-check").bind("click", function (e) {
            buyFrom.animateToEndOfOverlay(lightboxContent);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        buyFrom.removeTriggers(lightboxContent);
        buyFrom.moveToSeller(lightboxContent);
        buyFrom.bindEvents(lightboxContent);
        eventBoundCheckbox.removeClass('eventBound');
        common.customCheckBox.init(lightboxContent);
        lightboxContent.find(".services .fnToolTip").on("click", function (e) {
            var clickedElement = $(e.target),
                $elem = $(this),
                serviceLink = $elem.parent().children('.tooltipPopup');

            if (clickedElement.is($('span.price')) || clickedElement.is($('div.dotdotdot'))) { return false; }
				if (!serviceLink.parent('li').hasClass('open')) {
					serviceLink.show();
					serviceLink.parent('li').addClass('open');
                if (serviceLink.parent('li').hasClass('open')) {
						$('#pagination-nav').removeClass('hidden');
                    $('#lightbox-content').css('height', '600');
					}
				} else {
					serviceLink.hide();
					serviceLink.parent('li').removeClass('open');
				}
				$elem.parent().children('.tooltipPopup').find("a.close").hide();
        });
        if ($(sSpecialOffersElements).length > 0) {
            buyFrom.initToggleExpandCollapse = new ToggleExpandCollapse({
                sToggleContainer: '#lightbox .buy-from',
                sToggleElementParent: '.fnToggleDescription',
                sToggleTriggerElement: '.special-offer-container .special-offer-container-top',
                bEnableCustomEvent: true,
                sToggleCustomEventName: 'ToggleSpecialOffersFired',
                bAccordionEnabled: true
            });
            buyFrom.initToggleExpandCollapse.init();
        }
    };

    buyFrom.animateToEndOfOverlay = function (lightboxContent) {
        var y = -(lightboxContent.find(".overlay-wrapper").outerHeight() - lightboxContent.outerHeight());
        inlineScrollbar.animate(y);
    };

    buyFrom.removeTriggers = function (lightboxContent) {
        lightboxContent.find(".options li").attr("style", "");
        lightboxContent.find(".buy-from").children(".primary-button").remove();
        lightboxContent.find(".options .show-more").remove();
    };

    buyFrom.moveToSeller = function (lightboxContent) {
        var selectedItem = lightboxContent.find(".selected"),
            y;
        if (selectedItem.length > 0) {
            y = -(parseInt((selectedItem.offset().top - lightboxContent.offset().top), 10));
            inlineScrollbar.animate(y);
            buyFrom.deselectSeller();
        }
    };

    buyFrom.removeHeaderLinks = function (lightboxContent) {
        lightboxContent.find(".header h2 a").each(function () {
            var title = $(this).attr('data-original-title');
            $(this).parents('h2').html(title || $(this).html());
        });
    };

    buyFrom.isElementThatTriggersSellerOverlay = function isElementThatTriggersSellerOverlay(clickedElement) {
        if (clickedElement.is($('.add-to-basket, .quantity *, #personalise-button, .added-to-basket'))) {
            return false;
        }
        return true;
    };
    buyFrom.bindSellerOverlayEvents = function ($module) {
        $module.find(".primary-button").bind("click", function (e) {
            var clickedElement = $(e.target);
            if (!buyFrom.isElementThatTriggersSellerOverlay(clickedElement)) { return; }
                buyFrom.triggerOverlay($module);
                e.preventDefault();
                e.stopPropagation();
                return false;
        });
        $module.find(".seller").bind("click", function (e) {
            var clickedElement = $(e.target),
                isPriceCheck = clickedElement.hasClass("price-check") || clickedElement.parent("a").hasClass("price-check");

            if (!buyFrom.isElementThatTriggersSellerOverlay(clickedElement)) { return; }
            if (clickedElement.is($('span.price'))) { return false; }
                if (isPriceCheck) {
                    buyFrom.triggerPriceCheckOverlay($module);
            } else {
                    buyFrom.selectSeller(clickedElement);
                if ($('.buy-from .options .delivery, .buy-from .options .offers').length) {
                        buyFrom.triggerOverlay($module);
                    }
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
        });

        $('#special-offers-container').on('click', function (e) {
            buyFrom.triggerOverlay($module);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    };

    buyFrom.selectSeller = function (clickedElement) {
        clickedElement.parents(".buy-from").find(".seller.selected").removeClass("selected");
        clickedElement.parents(".seller").addClass("selected");
    };

    buyFrom.deselectSeller = function deselectSeller() {
        $(buyFrom.module).find('.seller.selected').removeClass('selected');
    };

    buyFrom.triggerPriceCheckOverlay = function () {
        var overlayContent = "<div class='product-description'><section class='price-check-details'>" + $(".price-check-details").clone().not(">h3").html() + "</section></div>",
            options = {
                content: overlayContent,
                fixedWidth: 1586,
                enablePagination: true,
                paginationHeader: "<h1>" + buyFrom.copy.priceCheckOverlayHeader + "</h1>"
            };
        overlay.show(options);
    };

    buyFrom.triggerOverlay = function ($module) {
        var overlayContent = "<div class='buy-from'>" + $module.clone().html() + "</div><div class='product-description'><section class='price-check-details' id='price-check'>" + $(".price-check-details").clone().html() + "</section></div>",
            options = {
                content: overlayContent,
                fixedWidth: 1650,
                customClass: 'allBuying-delOptions',
                callback: buyFrom.afterLoadingSellerOverlayActions,
                enablePagination: true,
                paginationHeader: "<h1>" + buyFrom.copy.overlayHeader + "</h1>"
            };
        overlay.show(options);
        if ($('.buy-from-kiosk-cp').length) {
            $('#lightbox').find('#lightbox-content').addClass('buy-from-kiosk-cp');
        }
        $("#lightbox-content .buy-from .seller").each(function () {
            var seller_image = $(this).find('.header-wrapper img');
            $(this).find('.price-info').before($(seller_image));
            $(this).find('.header-wrapper .available-from').text('Buy from');
            $(this).find('.content.kiosk-cp-enabled').addClass('page');
            if ($(this).parent().hasClass('other-sellers')) {
                $(this).find('.options h3, .details, .options .offers h3').remove();
            }
        });

        if (!$('#lightbox .price-check-details table').length) {
            $('.price-check-details').css("display", "none");
        }
        $("#lightbox .buy-from").find(".options .delivery.newDeliveryOptions ul").each(function () {
            $(this).find("li:last-child p.deliveryTimeAndCost").show();
            $(this).find("li:last-child p.ndo-returns").show();
            $(this).find("li:last-child p.terms.description").show();
        });
    };
    buyFrom.serviceTooltip = function serviceTooltip() {
    	$('#lightbox.streamline-basket').find(".more-options .fnToolTip").on("click", function (e) {
    		
    		var clickedElement = $(e.target),
                $elem = $(this),
                tooltipPopup = $elem.parent().children('.tooltipPopup'),
                tooltipLeft = $(this).width() + 45 + "px",
                tooltipPos = "-" + ($(this).offset().top - (tooltipPopup.height() / 2) + 20 + "px");
    		
            if (clickedElement.is($('span.price')) || clickedElement.is($('div.dotdotdot'))) { return false; }
            if ($('.tooltipPopup:visible')) {
                $('.tooltipPopup').hide();
				}
				
				$(this).next('.tooltipPopup').toggle();
				tooltipPopup.css({
					"top": tooltipPos,
                "left": tooltipLeft
				});
            $('.tooltipPopup .close').on('click', function (e) {
					$(e.target).closest('.tooltipPopup').hide();
				});
        });
    };
    buyFrom.truncateTitle = function (selector) {
        selector.find('a').dotdotdot({
            ellipsis: '',
            after: '<span class="ellipsis"></span>',
            wrap: 'letter',
            watch: true,
            tolerance: 0,
            callback: function () {
                $(this).attr('data-original-title', $(this).triggerHandler('originalContent').text());
                $(this).find('.ellipsis').html('<span class="icon" data-icon="&hellip;"></span></span>');
            }
        });
    };

    buyFrom.renderPromotionsTemplateForKioskOverlay = function renderPromotionsTemplate(aPromotionsData, sSellerID) {
        var template = $('#promotionsTemplateForKioskOverlay').html(),
            html = mustache.render(template, aPromotionsData),
            $sellerContainer = $(buyFrom.module).find('[data-sellerid="' + sSellerID + '"]'),
            $optionsContainer = $sellerContainer.find('.options'),
            $offersContainer = $optionsContainer.find('.offers');

        if ($offersContainer.length > 0) {
            $offersContainer.replaceWith(html);
        } else {
            $optionsContainer.append(html);
        }
    };

    buyFrom.splitPromotionsBySellerID = function splitPromotionsBySellerID() {
        var aSellerIDs = buyFrom.getSellerIDsFromBuyBox(),
            i,
            aPromotionsData,
            sSellerID;

        for (i = 0; i < aSellerIDs.length; i++) {
            sSellerID = aSellerIDs[i];
            aPromotionsData = buyFrom.oPromotionsManager.getSellerPromotionsData(buyFrom.sSkuID, sSellerID);
            if (aPromotionsData && aPromotionsData.length !== 0) {
                buyFrom.renderPromotionsTemplateForKioskOverlay(aPromotionsData, sSellerID);
            }
        }
    };

    buyFrom.getPromotionsTemplateForKioskOverlay = function getPromotionsTemplateForKioskOverlay() {
        var sTemplatesPath = window.globalStaticTemplatesPath || "/../assets/js/templates/";

        $.ajax({
            url: sTemplatesPath + "kiosk/promotionsTemplateForKioskOverlay.html"
        }).done(function (data) {
            var template = data;
            $('body').append(template);
            $(buyFrom.module).find('#bbSeller1 .options').append('<div class="offers"><h3>Special offers</h3></div>');
            buyFrom.getSellersAndPromotionsData(buyFrom.sSkuID);
        }).fail(function (jqXHR) {
            throw new Error("PromotionsManager: " + jqXHR.status + " " + jqXHR.statusText);
        });
    };

    buyFrom.getSellersAndPromotionsData = function getSellersAndPromotionsData(sSkuID) {
        var sDataURL = "/direct/blocks/catalog/productdetail/productPromo.jsp?format=json",
            aSellersAndPromotionsData;
        $.ajax({
            url: sDataURL,
            data: {
                "skuId": sSkuID
            }
        }).done(function (data) {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            aSellersAndPromotionsData = data;
            buyFrom.oPromotionsManager.createProducts(sSkuID, aSellersAndPromotionsData);
            buyFrom.splitPromotionsBySellerID();
        }).fail(function (jqXHR) {
            throw new Error("PromotionsManager: " + jqXHR.status + " " + jqXHR.statusText);
        });
    };

    buyFrom.initPromotionsManager = function initPromotionsManager(sSkuID) {
        buyFrom.sSkuID = sSkuID || "";
        if (buyFrom.sSkuID === "" && window.TescoData !== undefined && window.TescoData.skuID !== undefined) {
            buyFrom.sSkuID = window.TescoData.skuID;
        }
        if (buyFrom.sSkuID && buyFrom.sSkuID !== "") {
            if (buyFrom.oPromotionsManager !== undefined) {
                if (buyFrom.oPromotionsManager.skuIdInArray(buyFrom.sSkuID)) {
                    buyFrom.splitPromotionsBySellerID();
                } else {
                    buyFrom.getSellersAndPromotionsData(buyFrom.sSkuID);
                }
            } else {
                buyFrom.oPromotionsManager = new PromotionsManager();
                if (!$('#promotionsTemplateForKioskOverlay').length) {
                    buyFrom.getPromotionsTemplateForKioskOverlay();
                }
            }
        }
    };

    buyFrom.getSellerIDsFromBuyBox = function getSellerIDsFromBuyBox() {
        var $sellerContainer = $('.buy-from .seller'),
            aSellerIDs = [],
            sSellerID;

        $sellerContainer.each(function () {
            sSellerID = $(this).data('sellerid');
            if (sSellerID !== undefined) {
                if (typeof sSellerID === 'number') {
                    sSellerID = sSellerID.toString();
                }
                aSellerIDs.push(sSellerID);
            }
        });
        return aSellerIDs;
    };

    common.init.push(function () {
        if (!window.AsyncBlockController.isCachedPage()) {
            buyFrom.init($(".buy-from"));
        }
    });
});