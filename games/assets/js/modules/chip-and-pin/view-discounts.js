/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery,_ */
define('modules/chip-and-pin/view-discounts', ['domlib', 'modules/mvapi/common', 'modules/chip-and-pin/view-discounts-models', 'modules/overlay/common', 'modules/inline-scrollbar/common', 'modules/chip-and-pin/bundles', 'modules/common', 'modules/chip-and-pin/user-session', 'modules/settings/common'], function ($, mvApi, mvModels, overlay, inlineScrollbar, bundles, common, userSession, SETTINGS) {
    "use strict";

    var self,
        init,
        show,
        bindCloseEvent,
        overlayParams,
        injectDiscountOverlayContent,
        prepareDiscountOverlayData,
        resetDiscountOverlayData,
        appendDiscountOverlayData,
        formatNumbers,
        oLocalData = [],
        oDiscountOverlayData = [];

    overlayParams = {
        content: '<div class="kiosk-lightbox"></div>',
        additionalCloseButtonClassNames: 'kiosk-lightbox-close-btn',
        hideOnOverlayClick: true
    };

    bindCloseEvent = function bindCloseEvent() {
        $('#btn-close-viewDiscounts').click(function () {
            $('#overlay').remove();
            $('#lightbox').remove();
        });
    };

    injectDiscountOverlayContent = function injectDiscountOverlayContent() {
        var inlineScrollBarInstance,
            customItems;

        oLocalData = common.getLocalCheckoutData();

        $('#lightbox').addClass('no-keyboard');
        $('.dialog-content').html('');
        prepareDiscountOverlayData();
        mvApi.render('viewDiscountsModalHeader', null, function () {
            mvApi.render('viewDiscountsWalletModalContent', function () {
                mvApi.render('viewDiscountsListItems', function () {
                    inlineScrollBarInstance = $('#giftCardWalletScrollBar');
                    if (!inlineScrollBarInstance.length) {
                        customItems = [];
                        $('.viewDiscountsList > li').each(function () {
                            customItems.push($(this).outerHeight());
                        });
                        inlineScrollbar.init($('.viewDiscountsWallet'), { containerId: 'viewDiscountsWalletScrollBar', customItems: customItems, forceEnable: false });
                    }
                    mvApi.render('viewDiscountsWalletModalFooter', bindCloseEvent);
                });
            });
        });
    };

    show = function show() {
        var $lbox = $('.kiosk-lightbox');

        if ($lbox.length) {
            $lbox.remove();
        }
        overlayParams.callback = function () {
            mvApi.render('overlayLayout', injectDiscountOverlayContent);
        };
        overlay.show(overlayParams);
    };

    appendDiscountOverlayData = function appendDiscountOverlayData(sDiscountLabel, iDiscountValue) {
        oDiscountOverlayData.push({
            discountType: sDiscountLabel,
            discountValue: iDiscountValue
        });
    };

    resetDiscountOverlayData = function resetDiscountOverlayData() {
        oDiscountOverlayData = [];
    };

    formatNumbers = function formatNumbers(iNumber) {
        var iResult, iConvertToNumber;
        if (iNumber !== undefined && iNumber !== null && iNumber !== "" && iNumber !== 0) {
        	
			if(isNaN(iNumber))
				iNumber = iNumber.replace(/[^0-9.]/g, "");

            iConvertToNumber = parseFloat(iNumber).toFixed(2);
            iResult = iConvertToNumber;
        } else {
            iResult = '0';
        }
        return iResult;
    };

    prepareDiscountOverlayData = function prepareDiscountOverlayData() {
        var iExchangedVouchersTotal = 0,
            iVouchersTotal = 0,
            iPromotionTotal,
            iStaffDiscountTotal = 0,
            iEcouponsAppliedCount = 0,
            iGiftCardsUsedCount = 0,
            sEmptyDiscountsMessage,
            iSubTotal = 0,
            i = 0,
            userType = userSession.getUserType();

        oLocalData = common.getLocalCheckoutData();

        if (oDiscountOverlayData.length > 0) {
            resetDiscountOverlayData();
        }
        if (oLocalData.paymentDetails.subTotal !== undefined && oLocalData.paymentDetails.subTotal !== null) {
            iSubTotal = parseFloat((oLocalData.paymentDetails.subTotal).replace(/[^0-9.]/g, ""));
            appendDiscountOverlayData('Subtotal', formatNumbers(iSubTotal));
        }
        if (oLocalData.paymentDetails.promotion !== undefined && oLocalData.paymentDetails.promotion !== null) {
            iPromotionTotal = formatNumbers(oLocalData.paymentDetails.promotion);
            if (iPromotionTotal > 0) {
                appendDiscountOverlayData('Promotion discounts', formatNumbers(iPromotionTotal));
            }
        }
        if (oLocalData.tenderDetails.eCoupons !== undefined && oLocalData.tenderDetails.eCoupons !== null) {
            iEcouponsAppliedCount = parseFloat(oLocalData.tenderDetails.eCoupons.eCouponsApplied);
            if (iEcouponsAppliedCount > 0) {
                appendDiscountOverlayData('eCoupons', formatNumbers(oLocalData.tenderDetails.eCoupons.eCouponsTotal));
            }
        }
        if (userType !== SETTINGS.CONSTANTS.LOGIN.LOGIN_ANONYMOUS) {
            if (oLocalData.paymentDetails.staffDiscountAmount !== undefined && oLocalData.paymentDetails.staffDiscountAmount !== null) {
                iStaffDiscountTotal = formatNumbers(oLocalData.paymentDetails.staffDiscountAmount);
                if (iStaffDiscountTotal > 0) {
                    appendDiscountOverlayData('Staff discount', formatNumbers(iStaffDiscountTotal));
                }
            }
            if (oLocalData.tenderDetails.vouchers !== undefined && oLocalData.tenderDetails.vouchers !== null) {
                iVouchersTotal = formatNumbers(oLocalData.tenderDetails.vouchers.selectedVouchersTotal);
                if (iVouchersTotal > 0) {
                    appendDiscountOverlayData('Clubcard vouchers', formatNumbers(iVouchersTotal));
                }
            }
            if (oLocalData.tenderDetails.vouchers !== undefined && oLocalData.tenderDetails.vouchers !== null) {
                iExchangedVouchersTotal = formatNumbers(oLocalData.tenderDetails.vouchers.selectedExchangedVouchersTotal);
                if (iExchangedVouchersTotal > 0) {
                    appendDiscountOverlayData('Exchanged Clubcard vouchers', formatNumbers(iExchangedVouchersTotal));
                }
            }
        }
        if (oLocalData.tenderDetails.giftCards !== undefined && oLocalData.tenderDetails.giftCards !== null) {
            iGiftCardsUsedCount = parseFloat(oLocalData.tenderDetails.giftCards.giftCardsUsedCount);
            if (iGiftCardsUsedCount > 0) {
                for (i = 0; i < iGiftCardsUsedCount; i++) {
                    appendDiscountOverlayData('Giftcard', formatNumbers(oLocalData.tenderDetails.giftCards.giftCardDetails[i].giftCardAmount));
                }
            }
        }
        if (oDiscountOverlayData.length === 0) {
            sEmptyDiscountsMessage = bundles['spc.chipAndPin.discounts.viewDiscountsEmptyMessage'] || 'There are currently no discount savings applied to this order';
            appendDiscountOverlayData(sEmptyDiscountsMessage, 0);
        }
        mvApi.getModel('viewDiscountsListItems').collection.items = oDiscountOverlayData;
    };

    init = function init() {
        mvApi.cacheInitialModels(mvModels);
    };

    self = {
        init: init,
        update: init,
        show: show
    };

    return self;
});