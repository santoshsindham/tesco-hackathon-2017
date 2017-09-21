/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/debug-bar', ['domlib', 'modules/mvapi/common', 'modules/chip-and-pin/debug-bar-models', 'modules/chip-and-pin/user-session', 'modules/chip-and-pin/eCoupon-models', 'modules/chip-and-pin/giftCards-models', 'modules/settings/common'], function ($, mvApi, mvModels, userSession, eCouponModels, giftCardModels, SETTINGS) {
    'use strict';

    var self,
        init,
        display,
        bindDebugBarClicks,
        debugSectionName = 'login',
        debugBarCallback,
        createCookie,
        deleteCookie;

    bindDebugBarClicks = function bindDebugBarClicks() {
        jQuery('#btn-debug-expand-collapse').unbind().on('click tap', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $('.chip-and-pin-debug-bar').toggleClass('is-open');
        });

        jQuery('#btn-enter-clubcard-invalid').unbind().on('click tap', function () {
            $('#login-clubcard-number').val('12345678901234567').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btn-enter-clubcard-fail').unbind().on('click tap', function () {
            $('#login-clubcard-number').val('634006789012345679').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btn-enter-clubcard-success').unbind().on('click tap', function () {
            $('#login-clubcard-number').val('634006789012345678').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnSessionAgeRestriction').unbind().on('click tap', function () {
            userSession.setAgeRestriction(18);
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });



        jQuery('#btnEnterInvalidPostcode').unbind().on('click tap', function () {
            $('#txt-verify-postcode').val('Z12 !AB').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnEnterIncorrectPostcode').unbind().on('click tap', function () {
            $('#txt-verify-postcode').val('A1 1AB').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnEnterCorrectPostcode').unbind().on('click tap', function () {
            $('#txt-verify-postcode').val('B1 1AB').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnEnterInvalidSelectAStore').unbind().on('click tap', function () {
            $('#store-finder-postalcode').val('Z12 1AB').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnEnterIncorrectSelectAStore').unbind().on('click tap', function () {
            $('#store-finder-postalcode').val('A1 1AB').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnEnterCorrectSelectAStore').unbind().on('click tap', function () {
            $('#store-finder-postalcode').val('B1 1AB').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });
        jQuery('.changeUserType').unbind().on('click tap', function (e) {
            e.preventDefault();
            if ($(this).data('action') === 'registered') {
                userSession.setRegisteredUser(true);
            } else {
                userSession.setRegisteredUser(false);
            }

            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnEnterValidUserDetails').unbind().on('click tap', function () {
            $('#userTitle ul li:nth-child(3) a').click();
            $('#register-phone').val('');
            $('#continueButton').click();
            $('#register-firstname').val('Jon').focusout();
            $('#register-lastname').val('Doe').focusout();
            $('#register-email').val('jon.doe@validemailaddress.com').focusout();
            $('#register-phone').val('01234 567 890').focusout();
            $('#register-date-day').val('10').focusout();
            $('#register-date-month').val('11').focusout();
            $('#register-date-year').val('1970').focusout();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnEnterInvalidUserDetails').unbind().on('click tap', function () {
            $('#userTitle ul li:nth-child(2)').click();
            $('#register-firstname').val('!').focusout();
            $('#register-lastname').val('0').focusout();
            $('#register-email').val('jon.doe@.nvalidemailaddress.com').focusout();
            $('#register-phone').val('01 811 8055').focusout();
            $('#continueButton').click();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('.btnRemoveClubcardVouchers').unbind().on('click tap', function () {
            deleteCookie('debugBarHasVouchers');
            createCookie('debugBarHasVouchers', 'false', 3600);
        });

        jQuery('.btnAddClubcardVouchers').unbind().on('click tap', function () {
            deleteCookie('debugBarHasVouchers');
            createCookie('debugBarHasVouchers', 'true', 3600);
        });

        jQuery('#btnSetClubcardVouchers3').unbind().on('click tap', function () {
            createCookie('debugBarNumVouchers', '3', 3600);
            createCookie('debugBarHasVouchers', 'true', 3600);
        });

        jQuery('#btnSetClubcardVouchers10').unbind().on('click tap', function () {
            createCookie('debugBarNumVouchers', '10', 3600);
            createCookie('debugBarHasVouchers', 'true', 3600);
        });

        jQuery('#btnSetClubcardVouchers20').unbind().on('click tap', function () {
            createCookie('debugBarNumVouchers', '20', 3600);
            createCookie('debugBarHasVouchers', 'true', 3600);
        });

        jQuery('#btnEnterInvalidVoucher').unbind().on('click tap', function () {
            $('#txtVoucherCode').val('1DR1S').focusout();
        });

        jQuery('#btnEnterUnavailableVoucher').unbind().on('click tap', function () {
            $('#txtVoucherCode').val('UNAVAILABLE').focusout();
        });

        jQuery('#btnEnterValidVoucher').unbind().on('click tap', function () {
            $('#txtVoucherCode').val('12345').focusout();
        });

        jQuery('#btn-payment-success').unbind().on('click tap', function () {
            debugBarCallback();
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btn-payment-fail').unbind().on('click tap', function () {
            window.alert('A failed payment/order cancelled is not here yet. Sorry!');
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnExpiredCoupon').on('click tap', function () {
            $('#txt-eCoupon').val(eCouponModels.eCouponEntryCodes.expired);
        });

        jQuery('#btnInvalidCoupon').on('click tap', function () {
            $('#txt-eCoupon').val(eCouponModels.eCouponEntryCodes.invalid);
        });

        jQuery('#btnUsedCoupon').on('click tap', function () {
            $('#txt-eCoupon').val(eCouponModels.eCouponEntryCodes.alreadyUsed);
        });

        jQuery('#btnCouponLinkedToAnotherAccount').on('click tap', function () {
            $('#txt-eCoupon').val(eCouponModels.eCouponEntryCodes.linkedToAnotherAccount);
        });

        jQuery('#btnAddedToAnotherAccount').on('click tap', function () {
            $('#txt-eCoupon').val(eCouponModels.eCouponEntryCodes.adddedToAnotherAccount);
        });

        jQuery('#btnNotFirstTimeShopper').on('click tap', function () {
            $('#txt-eCoupon').val(eCouponModels.eCouponEntryCodes.notFirstTimeShopper);
        });

        jQuery('body').on('click tap', '#btn-add-giftCards', function () {
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnValidGiftCard1').on('click tap', function () {
            $('#txt-giftCardCode').val(giftCardModels.giftCardsEntryCodes.valid1);
            $('#txt-giftCardPin').val(giftCardModels.giftCardsEntryCodes.validPin);
        });

        jQuery('#btnValidGiftCard2').on('click tap', function () {
            $('#txt-giftCardCode').val(giftCardModels.giftCardsEntryCodes.valid2);
            $('#txt-giftCardPin').val(giftCardModels.giftCardsEntryCodes.validPin);
        });

        jQuery('#btnValidGiftCard3').on('click tap', function () {
            $('#txt-giftCardCode').val(giftCardModels.giftCardsEntryCodes.valid3);
            $('#txt-giftCardPin').val(giftCardModels.giftCardsEntryCodes.validPin);
        });

        jQuery('#btnValidGiftCard4').on('click tap', function () {
            $('#txt-giftCardCode').val(giftCardModels.giftCardsEntryCodes.valid4);
            $('#txt-giftCardPin').val(giftCardModels.giftCardsEntryCodes.validPin);
        });

        jQuery('#btnBadPinGiftCard').on('click tap', function () {
            $('#txt-giftCardCode').val(giftCardModels.giftCardsEntryCodes.valid4);
            $('#txt-giftCardPin').val(giftCardModels.giftCardsEntryCodes.invalidPin);
        });

        jQuery('#btnExpiredGiftCard').on('click tap', function () {
            $('#txt-giftCardCode').val(giftCardModels.giftCardsEntryCodes.expired);
            $('#txt-giftCardPin').val(giftCardModels.giftCardsEntryCodes.validPin);
        });

        jQuery('#btnNoBalanceGiftCard').on('click tap', function () {
            $('#txt-giftCardCode').val(giftCardModels.giftCardsEntryCodes.noBalance);
            $('#txt-giftCardPin').val(giftCardModels.giftCardsEntryCodes.validPin);
        });

        jQuery('#btnInvalidGiftCard').on('click tap', function () {
            $('#txt-giftCardCode').val(giftCardModels.giftCardsEntryCodes.invalid);
            $('#txt-giftCardPin').val(giftCardModels.giftCardsEntryCodes.validPin);
        });

        jQuery('#btnForceLogout').on('click tap', function () {
            userSession.setUserType(SETTINGS.CONSTANTS.LOGIN.LOGIN_ANONYMOUS);
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnForceHalfLogin').on('click tap', function () {
            userSession.setUserType(SETTINGS.CONSTANTS.LOGIN.LOGIN_HALF);
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });

        jQuery('#btnForceFullLogin').on('click tap', function () {
            userSession.setUserType(SETTINGS.CONSTANTS.LOGIN.LOGIN_REGISTERED);
            $('.chip-and-pin-debug-bar').removeClass('is-open');
        });
    };

    createCookie = function createCookie(name, value, seconds) {
        var expires, date;

        if (seconds) {
            date = new Date();
            date.setTime(date.getTime() + (seconds * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = window.escape(name) + "=" + window.escape(value) + expires + "; path=/";
    };

    deleteCookie = function deleteCookie(name) {
        createCookie(name, '', -1);
    };

    display = function display() {
        $('.chip-and-pin-debug-bar').attr('data-section', debugSectionName);
        $('.debugBarLayout').appendTo(document.body);
        bindDebugBarClicks();
    };

    init = function init(sectionName, callback) {
        mvApi.subscribe("/chip-and-pin/display", function (e, section, callback) {
            if (e === undefined) {
                e = null;
            }
            debugSectionName = section;
            debugBarCallback = callback;
            display();
        });

        if (sectionName !== undefined || callback !== undefined) {
            console.warn('Debug Bar: ' + sectionName + " - this call to debugBar has been deprecated, please use mvAPI.publish and mvApi.subscribe instead. If possible put your publish in chip-and-pin/common.js");
        }
        mvApi.cacheInitialModels(mvModels);
        mvApi.render('debugBarLayout', null, display);
    };

    //Exposing public methods
    self = {
    	init : init,
        pageModel: mvModels.pageModel
    };

    

    return self;
});
