/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,$ */
define('modules/chip-and-pin/payment', ['modules/mvapi/common', 'modules/chip-and-pin/payment-models', 'modules/chip-and-pin/breadcrumb', 'modules/chip-and-pin/user-session', 'modules/chip-and-pin/kmf-io', 'modules/chip-and-pin/bundles', 'modules/chip-and-pin/review', 'modules/ajax/common', 'modules/settings/common'], function(mvApi, mvModels, breadcrumb, userSession, kmfIO, bundles, review, ajax, SETTINGS) {
    'use strict';

    var self, renderLayout, init, paymentResponseCallback, paymentSummaryModel, paymentConcatenateResult, triggerPaymentCall, renderCopy, modelChange;

    paymentResponseCallback = function paymentResponseCallback(oResult) {
        if (oResult) {
            paymentSummaryModel = mvApi.getModel('paymentSummary');
            var test = $(paymentSummaryModel.atgData),
                formData;
            
            $('#paymentForm').append(test.html());
            $('#paymentForm #paymentTransactionId').val(paymentConcatenateResult(oResult));
            $('#paymentForm #yesPayResponse').val(paymentConcatenateResult(oResult));
            //$('#paymentForm').submit();
            formData = $('#paymentForm').serialize();
            ajax.post({
                'url': '/direct/my/kiosk-checkout.page',
                'data': formData || {},
                'callbacks': {
                    'success': function(data) {
                        var responseValue = JSON.parse(data),
                            finalOrderConfirmation;

                        if (responseValue.header && responseValue.header.success === false) {
                            finalOrderConfirmation = JSON.parse(responseValue.orderConfirmation);
                            $.extend(window.TescoData.ChipAndPin, {
                                'header': responseValue.header,
                                'orderConfirmation': finalOrderConfirmation
                            });
                            mvApi.navigateTo('review', true);
                            //review.init();
                        } else {
                            window.location.href = '/direct/my/kiosk-order-confirmation.page';
                            $.extend(window.TescoData.ChipAndPin, {
                                'header': responseValue.header
                            });
                        }
                    }
                }
            });
        }
    };

    paymentConcatenateResult = function paymentConcatenateResult(oResult) {
        var sConcat = '';
        sConcat += 'Message:' + oResult.Message;
        sConcat += ';Status:' + oResult.Status;
        sConcat += ';ApplicationDate:' + oResult.ApplicationDate;
        sConcat += ';AID:' + oResult.AID;
        sConcat += ';ApplicationLabel:' + oResult.ApplicationLabel;
        sConcat += ';PAN:' + oResult.PAN;
        sConcat += ';AuthCode:' + oResult.AuthCode;
        sConcat += ';CardholderName:' + oResult.CardholderName;
        sConcat += ';CardVerificationMethod:' + oResult.CardVerificationMethod;
        sConcat += ';EntryMode:' + oResult.EntryMode;
        sConcat += ';MerchantAddress:' + oResult.MerchantAddress;
        sConcat += ';MerchantID:' + oResult.MerchantID;
        sConcat += ';MerchantName:' + oResult.MerchantName;
        sConcat += ';PGTR:' + oResult.PGTR;
        sConcat += ';TerminalID:' + oResult.TerminalID;
        sConcat += ';TransactionDate:' + oResult.TransactionDate;
        sConcat += ';TransactionResult:' + oResult.TransactionResult;
        sConcat += ';EFTNo:' + oResult.EFTNo;
        sConcat += ';TransactionTime:' + oResult.TransactionTime;
        sConcat += ';TransactionType:' + oResult.TransactionType;
        sConcat += ';ReceiptNo:' + oResult.ReceiptNo;
        sConcat += ';ExpiryDate:' + oResult.ExpiryDate;
        sConcat += ';TotalAmount:' + oResult.TotalAmount;
        sConcat += ';IssueNo:' + oResult.IssueNo;
        sConcat += ';CardType:' + oResult.CardType;
        sConcat += ';Receipt:' + oResult.Receipt;
        return sConcat;
    };

    triggerPaymentCall = function triggerPaymentCall() {
    	
    	if (kmfIO.checkKMFExists()) {
    		window.external.navigationPanel.logoutEnabled = true;
        }

    	paymentSummaryModel = mvApi.getModel('paymentSummary');

        // currently here to test payment device
        userSession.isAgeRestricted();
        // should be set to 'true'
        paymentSummaryModel.reference = paymentSummaryModel.defaults.orderId;
        paymentSummaryModel.totalCost = paymentSummaryModel.defaults.totalCost;
        if (paymentSummaryModel.totalCost > 0) {
            paymentSummaryModel.requiresPayment = true;
        } else {
            paymentSummaryModel.requiresPayment = false;
        }

        if (paymentSummaryModel) {
            if (paymentSummaryModel.requiresPayment) {
                kmfIO.registerCallback('paymentDeviceResponse', paymentResponseCallback);
                kmfIO.triggerPaymentDevice(paymentSummaryModel.reference, paymentSummaryModel.totalCost);
            } else {
            	paymentSummaryModel = mvApi.getModel('paymentSummary');
                var $paymentForm = $(paymentSummaryModel.atgData),
                    formData; 
                               
                formData = $paymentForm.serialize();
                ajax.post({
                    'url': '/direct/my/kiosk-checkout.page',
                    'data': formData || {},
                    'callbacks': {
                        'success': function(data) {
                            var responseValue = JSON.parse(data),
                                finalOrderConfirmation;

                            if (responseValue.header && responseValue.header.success === false) {
								finalOrderConfirmation = JSON.parse(responseValue.orderConfirmation);
                                $.extend(window.TescoData.ChipAndPin, {
                                    'header': responseValue.header,
                                    'orderConfirmation': finalOrderConfirmation
                                });
                                require(['modules/chip-and-pin/review'], function(review) {
									review.init();
								});
                            } else {
                                window.location.href = '/direct/my/kiosk-order-confirmation.page';
                                $.extend(window.TescoData.ChipAndPin, {
                                    'header': responseValue.header
                                });
                            }
                        }
                    }
                });
            }
        }
    };

    renderCopy = function renderCopy() {
        modelChange = {
            'defaults': {
                'paymentInstructionsMessage': bundles['spc.chipAndPin.payment.instructionsMessage'],
                'paymentCardsMessage': bundles['spc.chipAndPin.payment.cardsMessage']
            }
        };
        mvApi.render('paymentLayout', modelChange, triggerPaymentCall);
    };

    renderLayout = function renderLayout() {
        mvApi.render('paymentLayout', renderCopy);
    };

    init = function init() {
        mvApi.cacheInitialModels(mvModels);
        renderLayout();
        breadcrumb.set(4);
        $('header h1').hide();
    };

    //Exposing public methods
    self = {
        init: init,
        pageModel: mvModels.pageModel,
        paymentResponseCallback: paymentResponseCallback,
        triggerPaymentCall: triggerPaymentCall
    };

    return self;
});