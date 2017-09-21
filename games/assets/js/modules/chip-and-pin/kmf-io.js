/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require */
define('modules/chip-and-pin/kmf-io', ['modules/chip-and-pin/user-session', 'modules/settings/common', 'modules/validation'], function (userSession, SETTINGS, validationExtras) {
    'use strict';

    var callbacks = {},
        kmfIO = {
            showDialog: function showDialog(sID, sTitle, sBodyText, sYesText, sNoText, callback) {
                if (sID === 'paymentFailed') {
                    window.dialogResult = function (sID, sButton) {
                        if (sButton === 'NO') {
                            window.external.navigateTo('ATTRACTLOOP', '');
                        }
                    };
                } else {
                    window.dialogResult = callback;
                }

                if (typeof window.external.showDialog === 'unknown') {
                    window.external.showDialog(sID, sTitle, sBodyText, sYesText, sNoText);
                }
            },
            registerCallback: function registerCallback(callbackId, callback) {
                if (typeof callback === 'function') {
                    callbacks[callbackId] = callback;
                }
            },
            showKeyboard: function showKeyboard() {
                if (typeof window.external.showKeyboard === 'unknown') {
                    window.external.showKeyboard(1);
                }
            },
            hideKeyboard: function hideKeyboard() {
                if (typeof window.external.showKeyboard === 'unknown') {
                    window.external.showKeyboard(0);
                }
            },
            triggerPaymentDevice: function triggerPaymentDevice(sRef, sAmount) {
                var oResult;
                if (typeof window.external.debitCard === 'unknown' || typeof window.external.print === "undefined" ) {
                    oResult = window.external.debitCardAsync(sAmount, sRef);
                }
            },
            printReceipt: function printReceipt(aPrinterCommands) {
                var aPrinterCommand;
                if (typeof window.external.print === "unknown") {
                    if (window.external.printerStatus === 'OK') {
                        while (aPrinterCommands.length) {
                            aPrinterCommand = aPrinterCommands.shift();
                            if (aPrinterCommand.command && aPrinterCommand.data) {
                                window.external.print(aPrinterCommand.command, aPrinterCommand.data);
                            }
                        }
                        window.external.print('Print', '');
                    }
                }
            },
            checkKMFExists: function checkKMFExists() {
            	return window.external && window.external.navigationPanel;
            },
            enableBackButton: function enableBackButton() {
            	var self = kmfIO;
            	if (self.checkKMFExists()) {
            		window.external.navigationPanel.backEnabled = true;
                }
            },
            disableBackButton: function enableBackButton() {
            	var self = kmfIO;
            	if (self.checkKMFExists()) {
            		window.external.navigationPanel.backEnabled = false;
                }
            },
            enableBasketButton: function enableBackButton(qty) {
              	var self = kmfIO;

                if (self.checkKMFExists()) {
                    var basketQty = qty ? parseInt(qty, 10) : self.getBasketQtyFromDom();

                    if (basketQty > 0) {
                        window.external.navigationPanel.basketEnabled = true;
                        window.external.navigationPanel.basketCountVisible = true;
                        window.external.navigationPanel.basketCount = basketQty;
                    } else {
                        window.external.navigationPanel.basketEnabled = false;
                        window.external.navigationPanel.basketCountVisible = false;
                    }
                }
            },
            disableBasketButton: function enableBackButton() {
            	var self = kmfIO;
            	if (self.checkKMFExists()) {
            		window.external.navigationPanel.basketEnabled = false;
                }
            },
            enableHomeButton: function enableBackButton() {
            	var self = kmfIO;
            	if (self.checkKMFExists()) {
            		window.external.navigationPanel.homeEnabled = true;
                }
            },
            disableHomeButton: function enableBackButton() {
            	var self = kmfIO;
            	if (self.checkKMFExists()) {
            		window.external.navigationPanel.homeEnabled = false;
                }
            },
            searchGTIN: function searchGTIN(barcode) {
                var bIsGTIN = false,
                    sValue = barcode;
                if (barcode.length < 14) {
                    do {
                        sValue = '0' + sValue;
                    } while (sValue.length < 14);
                }
                bIsGTIN = validationExtras.checkGTIN(sValue)
                if (bIsGTIN) {
                    document.getElementById('search-field').value = sValue;
                    document.getElementById('search-submit').click();
                }
            },
            getBasketQtyFromDom: function getBasketQtyFromDom () {
                var getBasketQty = $('#masthead .basket-items').text();
                if (getBasketQty === '') {
                    return false;
                }
                return parseInt(getBasketQty, 10);
            }
        };

    window.basketButtonPressed = function basketButtonPressed() {
    	window.location.href = SETTINGS.CONSTANTS.URL.BASKET;
	};

	window.backButtonPressed = function backButtonPressed() {
    	window.history.go(-1);
	};

	window.cancelButtonPressed = function cancelButtonPressed() {
		if(window.TescoData && window.TescoData.ChipAndPin && window.TescoData.ChipAndPin.checkoutData && window.TescoData.ChipAndPin.checkoutData.sessionLogoutForm){
			var logoutForm = window.TescoData.ChipAndPin.checkoutData.sessionLogoutForm;

			$.ajax({
			  type: "POST",
			  url: SETTINGS.CONSTANTS.URL.KIOSK_DATA,
			  data: $(logoutForm).serialize()
			});
		}
	};

    window.scannerCallback = function scannerCallback(oResult) {
        if (oResult.barcode) {
            if (userSession.canScanClubcard) {
                if (userSession.getCurrentSection() === 'login') {
                    if (callbacks.loginClubcardScan) {
                        callbacks.loginClubcardScan(oResult.barcode);
                        return;
                    }
                }
            }

            if (userSession.canScanGiftcard) {
                if (userSession.getCurrentSection() === 'review') {
                    if (callbacks.canScanGiftcard) {
                        callbacks.canScanGiftcard(oResult.barcode);
                        return;
                    }
                }
            }

            if (userSession.canScanBarcode && !userSession.isCheckout()) {
                kmfIO.searchGTIN(oResult.barcode);
            }
        }
    };

    window.debitCardAsyncResult = function debitCardAsyncResult(oResult) {
        if (typeof callbacks.paymentDeviceResponse === 'function') {
            callbacks.paymentDeviceResponse(oResult);
        }
    };

    return {
        /**
         * @method registerCallback
         * @memberof kmfIO
         * @param {string} callbackId - ID of callback
         * @param {function} callback - Function that should be executed when KMF device has finished processing
         */
        registerCallback: kmfIO.registerCallback,
        /**
         * @method showKeyboard
         * @memberof kmfIO
         *
         */
        showKeyboard: kmfIO.showKeyboard,
        /**
         * @method hideKeyboard
         * @memberof kmfIO
         *
         */
        hideKeyboard: kmfIO.hideKeyboard,
        /**
         * @method showDialog
         * @memberof kmfIO
         * @param {string} sID - ID for dialog box
         * @param {string} sTitle - Title of dialog box
         * @param {string} sBodyText - Body text of dialog box
         * @param {string} sYesText - label for "Yes" button
         * @param {string} sNoText - label for "No" button
         * @param {function} callback - Function that should be executed when either Yes or No button is pressed, callback returns sID and sButton (Yes or No)
         */
        showDialog: kmfIO.showDialog,
        /**
         * @method triggerPaymentDevice
         * @memberof kmfIO
         * @param {string} sAmount - Amount in pounds
         * @param {string} sRef - Unique reference of transaction
         */
        triggerPaymentDevice: kmfIO.triggerPaymentDevice,
        /**
         * @method printReceipt
         * @memberof kmfIO
         * @param {Array<PrinterCommand>} aPrinterCommands - Print
         */
        printReceipt: kmfIO.printReceipt,
        /**
         * @method enableBackButton
         * @memberof kmfIO
         */
        enableBackButton: kmfIO.enableBackButton,
        /**
         * @method enableBasketButton
         * @memberof kmfIO
         */
        enableBasketButton: kmfIO.enableBasketButton,
        /**
         * @method enableHomeButton
         * @memberof kmfIO
         */
        enableHomeButton: kmfIO.enableHomeButton,
        /**
         * @method disableBackButton
         * @memberof kmfIO
         */
        disableBackButton: kmfIO.disableBackButton,
        /**
         * @method disableBasketButton
         * @memberof kmfIO
         */
        disableBasketButton: kmfIO.disableBasketButton,
        /**
         * @method disableHomeButton
         * @memberof kmfIO
         */
        disableHomeButton: kmfIO.disableHomeButton,
        /**
         * @method checkKMFExists
         * @memberof kmfIO
         */
        checkKMFExists: kmfIO.checkKMFExists
    };
});
