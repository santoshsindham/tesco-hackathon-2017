/*jslint plusplus: true, nomen: true, regexp: true */
/*globals window,document,console,define,require,jQuery,$ */
define('modules/chip-and-pin/payment-details-controller', ['modules/mvapi/common', 'modules/ajax/common', 'modules/settings/common', 'modules/chip-and-pin/voucher', 'modules/common', 'modules/chip-and-pin/eCoupons', 'modules/chip-and-pin/giftCards', 'modules/chip-and-pin/view-discounts', 'modules/chip-and-pin/payment-details-view', 'modules/chip-and-pin/kmf-io', 'modules/chip-and-pin/user-session', 'modules/chip-and-pin/login','modules/chip-and-pin/atg-data','modules/chip-and-pin/payment'], function(mvApi, ajax, SETTINGS, vouchersOverlay, common, eCouponsOverlay, giftCardsOverlay, discountSummaryOverlay, paymentDetailsView, kmfIO, userSession, login, atgData, payment) {

    "use strict";

    var init,
        localData,
        sendRequest,
        processResponse,
        bindEventListener,
        bindPaymentSummaryDiscountButtonEvents,
        updateVoucherData,
        paymentSummaryModel,
        currentDiscount;

    processResponse = function processResponse(res) {
        var globalData = common.getLocalCheckoutData();
        localData = JSON.parse(res);

        globalData.paymentDetails = localData.paymentDetails;
        globalData.tenderDetails = localData.tenderDetails;
        if (globalData.header === undefined) {
            globalData.header = {
                success: localData.header.success
            };
        } else {
            globalData.header.success = localData.header.success;
        }

        switch (currentDiscount) {
            case "vouchers":
                vouchersOverlay.update();
                break;

            case "eCoupons":
                eCouponsOverlay.update(res);
                break;

            case "giftCards":
                giftCardsOverlay.update(res);
                break;
        }

        discountSummaryOverlay.update();
        paymentDetailsView.update();
    };

    bindPaymentSummaryDiscountButtonEvents = function bindPaymentSummaryDiscountButtonEvents() {
        $('.review').off('click');

        $('.review').on('click', '.paymentSummary .fnOpenOverlay', function(e) {
            e.stopPropagation();
            mvApi.navigateTo('review&termsAndConditions');
        });

        $('.review').on('click', '.paymentSummary .primary-button', function(e) {
            e.stopPropagation();

			paymentSummaryModel = mvApi.getModel('paymentSummary');
            
            if (paymentSummaryModel.defaults.totalCost <= 0) {
            	payment.triggerPaymentCall();
            }           
			else{
				mvApi.navigateTo('payment');
			}            
        });

        $('.review').on('click', '.vouchersContainer .addVouchers', function(e) {
            e.stopPropagation();
            var oLocalData = common.getLocalCheckoutData(),
                replace = true;

            if (oLocalData.tenderDetails && oLocalData.tenderDetails.vouchers && oLocalData.tenderDetails.vouchers.voucherScroller && oLocalData.tenderDetails.vouchers.voucherScroller.length > 0) {
                vouchersOverlay.show(vouchersOverlay.MODE.LISTING);
                mvApi.navigateTo('review&addVouchers', replace);
                setTimeout(function() {
                    kmfIO.hideKeyboard();
                }, 100);
            }

            currentDiscount = "vouchers";
        });

        $('.review').on('click', '.vouchersContainer .addECoupons', function(e) {
            e.stopPropagation();
            eCouponsOverlay.show(eCouponsOverlay.MODE.ADDITEM);
            currentDiscount = "eCoupons";
        });

        $('.review').on('click', '.vouchersContainer .addGiftCards', function(e) {
            e.stopPropagation();
            giftCardsOverlay.show(giftCardsOverlay.MODE.ADDITEM);
            currentDiscount = "giftCards";
        });

        $('.review').on('click', '.discountsTotal .viewDiscounts', function(e) {
            e.stopPropagation();
            discountSummaryOverlay.show();
        });
        
        $('.review').on('click tap', '.deliveryGroup .kioskWhatsThisCharge', function(e){
        	e.stopPropagation();
        	mvApi.navigateTo('review&whatsThisCharge');
        	
        });
    };

    bindEventListener = function bindEventListener() {
        $('body').on('addItem', '#lightbox button', function(e) {
            var requestData = {
                id: "paymentDetailsSection",
                action: e.type,
                type: e.discountType,
                code: e.code
            },
			oLocalData = common.getLocalCheckoutData(),
			td = oLocalData.tenderDetails,
			atg_data;
 			
			if(e.discountType == 'giftCards'){
				atg_data = atgData.parse(td.giftCards.atgData);
				$.extend(requestData, atg_data.atgData);
				requestData.giftcardpin = e.pin;
                requestData.giftcardcode = e.code;
			}
			
			if(e.discountType == 'eCoupons'){
				atg_data = atgData.parse(td.eCoupons.atgData);
				$.extend(requestData, atg_data.atgData);
				requestData.couponcode = e.code;
			}

			sendRequest(requestData, processResponse);
        });
        
        $('body').on('removeItem', '#lightbox button', function(e) {
           
			var requestData = {
                id: "paymentDetailsSection",
                action: e.type,
                type: e.discountType,
                code: e.code
            },
			oLocalData = common.getLocalCheckoutData(),
			td = oLocalData.tenderDetails,
			atg_data;

			if(e.discountType == 'giftCards'){
				atg_data = atgData.parse(td.giftCards.atgData_removeGiftCard);
				$.extend(requestData, atg_data.atgData);
				requestData.removeGiftCard = e.code;
			}
			
			if(e.discountType == 'eCoupons'){
				atg_data = atgData.parse(td.eCoupons.atgData_deleteEcoupon);
				$.extend(requestData, atg_data.atgData);
				requestData.removeECouponFromOrder = e.code;
			}
			
			sendRequest(requestData, processResponse);
        });

        $('body').on('updateStatus', '#lightbox .custom-checkbox', function(e) {
            sendRequest({
                id: "paymentDetailsSection",
                action: e.type,
                type: e.discountType,
                code: e.code
            }, function(res) {
                vouchersOverlay.update(JSON.parse(res));
            });
        });
        $('body').on('updatePaymentSummary', function(e) {
            if (e.checkoutData) {
                paymentDetailsView.update(e.checkoutData);
            }
        });
    };

    init = function init(data) {
        localData = JSON.parse(data);
        vouchersOverlay.init();
        eCouponsOverlay.init();
        giftCardsOverlay.init(localData);
        discountSummaryOverlay.init(localData);
        paymentDetailsView.update(localData);
        bindEventListener();
        bindPaymentSummaryDiscountButtonEvents();
    };

    sendRequest = function sendRequest(data, callback) {
        ajax.post({
            'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            'data': data || {},
            'callbacks': {
                'success': callback || processResponse
            }
        });
    };

    updateVoucherData = function(oVoucherData) {
        vouchersOverlay.parseVoucherData(oVoucherData);
    };

    return {
        init: init,
        updateVoucherData: updateVoucherData
    };
});