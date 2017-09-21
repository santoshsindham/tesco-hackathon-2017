/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require */
define('modules/chip-and-pin/common', ['modules/settings/common', 'modules/common', 'domlib', 'modules/mvapi/common', 'modules/chip-and-pin/shared-models', 'modules/chip-and-pin/login', 'modules/chip-and-pin/delivery', 'modules/chip-and-pin/review', 'modules/chip-and-pin/payment', 'modules/chip-and-pin/voucher', 'modules/chip-and-pin/eCoupons', 'modules/chip-and-pin/giftCards', 'modules/chip-and-pin/user-detail-form', 'modules/chip-and-pin/delivery-home', 'modules/chip-and-pin/delivery-store', 'modules/overlay/common', 'modules/ajax/common', 'modules/chip-and-pin/messages', 'modules/chip-and-pin/kmf-io', 'modules/chip-and-pin/bundles', 'modules/chip-and-pin/user-session', 'modules/chip-and-pin/debug-bar', 'modules/product-description/common'], function (SETTINGS, common, $, mvApi, sharedModels, login, delivery, review, payment, voucher, eCoupons, giftCards, userDetails, homeDelivery, storeCollect, overlay, ajax, messages, kmfIO, bundles, userSession, debugBar, pdp) {
    'use strict';

    var renderSection,
        registerRoutes,
        navigateToDefault,
        overlayParams,
        displayLoginSection,
        displayDeliverySection,
        renderDeliverySection,
        displayReviewSection,
        displayPaymentSection,
        goToUserDetails,
        displayUserDetailsForm,
        displayAddVouchers,
        displayEnterVoucherCode,
        displayAddECoupons,
        displayAddGiftCards,
        prePopulateModels,
        showKmfDialog,
        changeDeliveryDetails,
        handleAtgResponseHeader,
        displayDeliveryAddressForm,
        displayAnotherDeliveryAddressForm,
        displayDeliveryFindAnotherStore,
        displayDeliverySelectAnotherStore,
        displayDeliverySelectThisStore,
        displayTermsAndConditionsOverlayContent,
        displayPrivacyPolicyOverlayContent,
        displayDeliveryDataWarning,
        deliveryWarningHandler,
        deliveryWarningModalText,
        deliveryWarningModalYesButton,
        deliveryWarningModalNoButton,
        requestSessionTermination,
        displayDeliveryAddressList,
        displaySavedDeliveryAddressList,
        handleAgeRestriction,
        iPeakAgeRestriction,
        bAgeRestrictionUpdated = false,
        isKeyboardApiAvailable,
        kmfDialogParams = {},
        displayWhatsThisChargeOverlayContent;

    requestSessionTermination = function requestSessionTermination() {
        var params = {
            'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            'data': {
                'session': 'destroy'
            },
            'callbacks': {
                'success': function () {
                    userSession.setRegisteredUser(false);
                    $('#login-clubcard-number').val('');
                }
            }
        };
        console.log('[mvApi] Requesting session termination.');
        ajax.post(params);
    };

    handleAgeRestriction = function handleAgeRestriction() {
        if (!bAgeRestrictionUpdated) {
            iPeakAgeRestriction = $('#wrapper.spi').data().ageRestriction;
            if (iPeakAgeRestriction !== null) {
                userSession.setAgeRestriction(iPeakAgeRestriction);
                bAgeRestrictionUpdated = true;
            }
        }
    };

    isKeyboardApiAvailable = function isKeyboardApiAvailable() {
        if (window.external) {
            var key,
                external = window.external;
            for (key in external) {
                if (external.hasOwnProperty(key) && key === 'showKeyboard') {
                    return true;
                }
            }
        }
        return false;
    };

    showKmfDialog = function showKmfDialog(params) {
        var redirectConfirmed = false,
            id = params.id || '',
            title = params.title || '',
            message = params.message || '',
            yesBtnLabel = params.yesBtnLabel || '',
            noBtnLabel = params.noBtnLabel || '',
            callback = params.callback || function () {
                console.warn('[kmfIO] Wrong callback provided.');
            };

        if (!kmfIO.checkKMFExists()) {
            redirectConfirmed = window.confirm(params.message);
            if (redirectConfirmed) {
                renderDeliverySection();
            } else {
                mvApi.navigateTo('review', false, false);
            }
        } else {
            kmfIO.showDialog(id, title, message, yesBtnLabel, noBtnLabel, callback);
        }
    };

    //Due to 3rd party API dependency
    /*jslint unparam: true*/
    changeDeliveryDetails = function changeDeliveryDetails(sID, sButton) {
        if (sButton === 'YES') {
            renderDeliverySection();
        } else if (sButton === 'NO') {
            mvApi.navigateTo('review', false, false);
        }
    };
    /*jslint unparam: false*/

    handleAtgResponseHeader = function handleAtgResponseHeader(header) {
        var route;
        if (header) {
            if (header.errorMessage) {
                messages.show(header.errorMessage, 'error');
            }
            if (header.toPage) {
                route = header.toPage;
                if (header.toSection) {
                    route += '&' + header.toSection;
                }
                mvApi.navigateTo(route);
            }
        }
    };

    ajax.handleAtgResponseHeader = function (response) {
        if (response.header) {
            handleAtgResponseHeader(response.header);
        }
    };

    renderSection = function renderSection(section, callbacks) {
    	var $lightbox = $('.kiosk-lightbox');
        if ($lightbox.length > 0) {
            $lightbox.remove();
        }
    	mvApi.render('page', section.pageModel, section.init);
        if (callbacks) {
            section.callbacks = callbacks;
        }
    };

    displayPaymentSection = function displayPaymentSection() {
        mvApi.publish("/chip-and-pin/display", 'payment');

        renderSection(payment);
    };
    
    displayReviewSection = function displayReviewSection() {
        mvApi.publish("/chip-and-pin/display", 'review');
        voucher.overlayCoverAndButtonCoverHide(true);
        renderSection(review, {
            'displayPaymentSection': displayPaymentSection,
            'displayDeliverySection': displayDeliverySection
        });
        setTimeout(function () {kmfIO.hideKeyboard(); }, 100);
        
        if (kmfIO.checkKMFExists()) {
    		window.external.navigationPanel.logoutEnabled = true;
        }
    };

    displayLoginSection = function displayLoginSection() {
        requestSessionTermination();
        
        if (kmfIO.checkKMFExists()) {
        	setTimeout(function () {
				//window.external.navigationPanel.backEnabled = true;
				//window.external.navigationPanel.basketEnabled = true;
        		pdp.getBasketTotalCount();
			}, 700);
        }
        
        if ($('.kiosk-lightbox').length && $("#user-detail-form-wrapper").length) {
            overlay.hide();
        } else {
            overlay.hide();
            mvApi.publish("/chip-and-pin/display", 'login');
            renderSection(login, {
                'displayDeliverySection': displayDeliverySection,
                'goToUserDetails': goToUserDetails,
                'handleAtgResponseHeader': handleAtgResponseHeader
            });
        }
        setTimeout(function () {kmfIO.hideKeyboard(); }, 100);
    };

    goToUserDetails = function goToUserDetails(replace) {
        replace = replace === true ? true : false;
        mvApi.publish("/chip-and-pin/display", 'loginUserDetails');
        mvApi.navigateTo('login&userDetailsForm', replace);
    };

    displayUserDetailsForm = function displayUserDetailsForm() {
        if ($('.kiosk-lightbox').length) {
            userDetails.init(displayDeliverySection);
        } else {
            overlayParams = {
                content: '<div class="kiosk-lightbox"></div>',
                additionalCloseButtonClassNames: 'kiosk-lightbox-close-btn',
                hideOnOverlayClick: true,
                onHideCallback: function () {
                    mvApi.navigateTo('login', true);
                },
                callback: function () {
                    userDetails.init(displayDeliverySection);
                }
            };
            overlay.show(overlayParams);
        }
    };

    displayDeliverySelectAnotherStore = function displayDeliverySelectAnotherStore() {
        storeCollect.displaySelectStoreOverlay();
    };

    displayDeliveryFindAnotherStore = function displayDeliveryFindAnotherStore() {
        storeCollect.displayFindStoreOverlay();
    };

    displayDeliveryAddressForm = function displayDeliveryAddressForm() {
        if ($('.kiosk-lightbox').length) {
            homeDelivery.updateOverlay('Find an address', homeDelivery.searchAddressForm);
        } else {
            overlayParams = {
                content: '<div class="kiosk-lightbox"></div>',
                additionalCloseButtonClassNames: 'kiosk-lightbox-close-btn',
                hideOnOverlayClick: true,
                onHideCallback: function () {
                    mvApi.navigateTo('delivery', false, false);
                },
                callback: function () {
                    var modelChange = {
                        'defaults': {
                            'overlayHeader': 'Find an address'
                        }
                    };
                    mvApi.render('overlayLayout', modelChange,  homeDelivery.searchAddressForm);
                    homeDelivery.clickHandlers();
                }
            };
            overlay.show(overlayParams);
        }
    };
    
    displayAnotherDeliveryAddressForm = function displayAnotherDeliveryAddressForm() {
        if ($('.kiosk-lightbox').length) {
            homeDelivery.updateOverlay('Find an address', homeDelivery.searchAnotherAddressForm);
        } else {
            overlayParams = {
                content: '<div class="kiosk-lightbox"></div>',
                additionalCloseButtonClassNames: 'kiosk-lightbox-close-btn',
                hideOnOverlayClick: true,
                onHideCallback: function () {
                    mvApi.navigateTo('delivery', false, false);
                },
                callback: function () {
                    var modelChange = {
                        'defaults': {
                            'overlayHeader': 'Find an address'
                        }
                    };
                    mvApi.render('overlayLayout', modelChange,  homeDelivery.searchAnotherAddressForm);
                    homeDelivery.clickHandlers();
                }
            };
            overlay.show(overlayParams);
        }
    };

    displayDeliveryAddressList = function displayDeliveryAddressList() {
        homeDelivery.searchAddressList();
    };

    displaySavedDeliveryAddressList = function displaySavedDeliveryAddressList() {
        if ($('.kiosk-lightbox').length) {
            homeDelivery.updateOverlay('Please select an address for delivery',  homeDelivery.searchSavedAddressList);
        } else {
            overlayParams = {
                content: '<div class="kiosk-lightbox"></div>',
                additionalCloseButtonClassNames: 'kiosk-lightbox-close-btn',
                hideOnOverlayClick: true,
                onHideCallback: function () {
                    mvApi.navigateTo('delivery', false,  false);
                },
                callback: function () {
                    var modelChange = {
                        'defaults': {
                            'overlayHeader': 'Please select an address for delivery'
                        }
                    };
                    mvApi.render('overlayLayout', modelChange,  homeDelivery.searchSavedAddressList);
                    homeDelivery.clickHandlers();
                }
            };
            overlay.show(overlayParams);
        }
    };
    
    displayWhatsThisChargeOverlayContent = function displayWhatsThisChargeOverlayContent() {
 	   require(['modules/chip-and-pin/review'], function (review) {
          review.displayWhatsThisChargeOverlay();           
        });
     };
     
    displayTermsAndConditionsOverlayContent = function displayTermsAndConditionsOverlayContent() {
        require(['modules/chip-and-pin/review'], function (review) {
            if ($('.kiosk-lightbox').length) {
                review.renderTermsAndConditionsOverlayContent();
            } else {
                review.displayTermsAndConditionsOverlay();
            }
        });
    };

    displayPrivacyPolicyOverlayContent = function displayPrivacyPolicyOverlayContent() {
        require(['modules/chip-and-pin/review'], function (review) {
            review.renderPrivacyPolicyOverlayContent();
        });
    };

    displayAddVouchers = function displayAddVouchers() {
        mvApi.publish("/chip-and-pin/display", 'deliveryVouchers');
        //voucher.init();
        setTimeout(function () {kmfIO.hideKeyboard(); }, 100);
    };

    displayEnterVoucherCode = function displayEnterVoucherCode() {
        mvApi.publish("/chip-and-pin/display", 'deliveryVouchers');
        voucher.renderVoucherCodeOverlayLayout();
    };

    displayAddECoupons = function displayAddECoupons() {
        eCoupons.init();
    };

    displayAddGiftCards = function displayAddGiftCards() {
        giftCards.init();
    };

    renderDeliverySection = function renderDeliverySection() {
        mvApi.publish("/chip-and-pin/display", 'delivery');

        overlay.hide();
        $('#overlay, .kiosk-lightbox').remove();
        renderSection(delivery, {
            'displayReviewSection': displayReviewSection
        });
        setTimeout(function () {kmfIO.hideKeyboard(); }, 100);
    };

    displayDeliverySection = function displayDeliverySection() {
        var kmfDialogParams,
            currentSection = mvApi.getCurrentSection();
        
        if (kmfIO.checkKMFExists()) {
    		window.external.navigationPanel.backEnabled = false;
			window.external.navigationPanel.basketEnabled = false;
        }

        if (currentSection === 'review' || currentSection === 'delivery') {
            mvApi.navigateTo('delivery', true, false);
            kmfDialogParams = {
                'id': 'changeDeliveryDetails',
                'title': 'Change Delivery Details',
                'message': 'If you go back to change your delivery details, we\'ll have to clear your previous selection(s). Still want to go back?',
                'yesBtnLabel': 'YES, I WANT TO GO',
                'noBtnLabel': 'NO I\'LL LEAVE IT',
                'currentSection': currentSection,
                'callback': changeDeliveryDetails
            };
            showKmfDialog(kmfDialogParams);
        } else {
            renderDeliverySection();
        }
    };

    navigateToDefault = function navigateToDefault() {
        mvApi.navigateTo('login');
    };

    displayDeliveryDataWarning = function displayDeliveryDataWarning() {
        if (mvApi.getCurrentSection() === 'delivery') {
            deliveryWarningModalText = bundles['spc.chipAndPin.delivery.warningModal.heading'] || 'If you go back you\'ll need to re-enter all your previously selected options. Is this OK?';
            deliveryWarningModalYesButton = bundles['spc.chipAndPin.delivery.warningModal.yesButton'] || 'YES, GO BACK';
            deliveryWarningModalNoButton = bundles['spc.chipAndPin.delivery.warningModal.noButton'] || 'NO, I\'LL LEAVE IT';
            var iDeliveryGroup = window.TescoData.ChipAndPin.checkoutData.deliveryGroups, iDeliveryGroupCount = iDeliveryGroup.length;
            if (iDeliveryGroupCount > 1) {
                if (iDeliveryGroup[0].completed === true) {
                    kmfIO.showDialog('deliveryWarningReset', 'Delivery Warning', deliveryWarningModalText, deliveryWarningModalYesButton, deliveryWarningModalNoButton, deliveryWarningHandler);
                } else {
                    kmfIO.showDialog('deliveryWarningLogin', 'Delivery Warning', deliveryWarningModalText, deliveryWarningModalYesButton, deliveryWarningModalNoButton, deliveryWarningHandler);
                }
            } else {
                kmfIO.showDialog('deliveryWarningLogin', 'Delivery Warning', deliveryWarningModalText, deliveryWarningModalYesButton, deliveryWarningModalNoButton, deliveryWarningHandler);
            }
        }
    };

    deliveryWarningHandler = function deliveryWarningHandler(sID, sButton) {
        if (sID === 'deliveryWarningLogin') {
            if (sButton === 'YES') {
                mvApi.navigateTo('login', true, true);
                requestSessionTermination();
            } else if (sButton === 'NO') {
                mvApi.navigateTo('login', false, false);
                mvApi.navigateTo('delivery', false, false);
            }
        } else if (sID === 'deliveryWarningReset') {
            if (sButton === 'YES') {
                mvApi.navigateTo('login', false, false);
                mvApi.navigateTo('delivery', true, true);
            } else if (sButton === 'NO') {
                mvApi.navigateTo('login', false, false);
                mvApi.navigateTo('delivery', false, false);
            }
        }
    };

    displayDeliverySelectThisStore = function displayDeliverySelectThisStore() {
        storeCollect.displayThisStoreOverlay();
    };

    registerRoutes = function registerRoutes() {
        mvApi.registerRoutes({
            'default': navigateToDefault,
            'login': displayLoginSection,
            'login&userDetailsForm': displayUserDetailsForm,
            'deliveryDataWarning': displayDeliveryDataWarning,
            'delivery': displayDeliverySection,
            'delivery&savedAddressList': displaySavedDeliveryAddressList,
            'delivery&addressList': displayDeliveryAddressList,
            'delivery&searchAddress': displayDeliveryAddressForm,
            'delivery&searchAnotherAddress': displayAnotherDeliveryAddressForm,
            'delivery&findAnotherStore': displayDeliveryFindAnotherStore,
            //'delivery&selectAnotherStore': displayDeliverySelectAnotherStore,
            //'delivery&selectThisStore': displayDeliverySelectThisStore,
            'review': displayReviewSection,
            'review&addVouchers': displayAddVouchers,
            'review&enterVoucherCode': displayEnterVoucherCode,
            'review&addECoupons': displayAddECoupons,
            'review&addGiftCards': displayAddGiftCards,
            'payment': displayPaymentSection,
            'review&termsAndConditions': displayTermsAndConditionsOverlayContent,
            'review&privacyPolicy': displayPrivacyPolicyOverlayContent,
            'review&whatsThisCharge': displayWhatsThisChargeOverlayContent,
            'lockOnRoute': 'payment'
        });
        navigateToDefault();
        //displayReviewSection();
    };

    prePopulateModels = function prePopulateModels(data) {
        var item;
        for (item in data) {
            if (data.hasOwnProperty(item)) {
                mvApi.updateModel(item, data[item]);
            }
        }
    };

    common.init.push(function init() {
        if ($('#wrapper.spi').length && !$('#wrapper.spi.orderConfirmation').length) {
            console.log('[Kiosk Chip&Pin] Kiosk Chip&Pin initialization started...');
            if (window.TescoData && window.TescoData.ChipAndPin) {
                mvApi.cacheSessionData(window.TescoData.ChipAndPin);
                prePopulateModels(window.TescoData.ChipAndPin);
            }
            if (SETTINGS.ENV === 'buildkit') {
            	debugBar.init();
            }
            mvApi.cacheInitialModels(sharedModels);

            Backbone.history.on('route', function(e, sRoute, aRouteInfo) {
                var sBackboneRoute = aRouteInfo[0];
                if (kmfIO.checkKMFExists()) {
                    if (sBackboneRoute === 'payment') {
                        window.external.navigationPanel.logoutEnabled = false;
                    } else if(sBackboneRoute !== 'login') {
                        window.external.navigationPanel.homeEnabled = false;
                    } else {
                        window.external.navigationPanel.logoutEnabled = true;
                    }
                }
            });
            
            registerRoutes();
            handleAgeRestriction();
            console.log('[Kiosk Chip&Pin] Kiosk Chip&Pin initialization finished.');
        } else {
            if (kmfIO.checkKMFExists()) {
                window.external.navigationPanel.logoutEnabled = true;
                window.external.navigationPanel.homeEnabled = true;
            }
        }
        if ($('#wrapper.spi').length && typeof(preAnalyticsCall) !== 'undefined') {
            if ($.isFunction(preAnalyticsCall)) {
                try {
                    preAnalyticsCall();
                } catch (e) {}
            }
        }
    });
});
