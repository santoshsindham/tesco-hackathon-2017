/*jslint plusplus: true, nomen: true, regexp: true, indent: 4 */
/*globals window,document,console,define,require,jQuery,$ */
define('modules/chip-and-pin/review', [
    'modules/chip-and-pin/template-renderer',
    'modules/mvapi/common',
    'modules/textbox-session-storage/common',
    'modules/chip-and-pin/review-models',
    'modules/chip-and-pin/breadcrumb',
    'modules/chip-and-pin/user-detail-form',
    'modules/overlay/common',
    'modules/inline-scrollbar/common',
    'modules/validation',
    'modules/ajax/common',
    'modules/settings/common',
    'modules/chip-and-pin/kmf-io',
    'modules/chip-and-pin/receipt',
    'modules/chip-and-pin/bundles',
    'modules/chip-and-pin/payment-details-controller',
    'modules/chip-and-pin/delivery-group',
    'modules/chip-and-pin/user-session',
    'modules/chip-and-pin/atg-data',
    'modules/chip-and-pin/voucher',
    'modules/chip-and-pin/eCoupons',
    'modules/chip-and-pin/giftCards',
    'modules/chip-and-pin/user-session',
    'modules/chip-and-pin/view-discounts',
    'modules/chip-and-pin/common'
], function (templateRenderer,
    mvApi,
    giftMessageSession,
    mvModels,
    breadcrumb,
    userDetails,
    overlay,
    inlineScrollbar,
    validationExtras,
    ajax,
    SETTINGS,
    kmfIO,
    receipt,
    bundles,
    paymentDetailsController,
    deliveryGroup,
    userSession,
    atg) {
    'use strict';


    var self,
        init,
        preloadTemplates,
        getValidationRules,
        getValidationMessages,
        requestDeliveryGroupsData,
        handleDeliveryGroupsData,
        onReviewLayoutReady,
        chosenDeliveryGroupId,
        deliveryGroupComponentsComplete,
        displayLoginForm,
        bindChangeDetailsClick,
        initScrollbar,
        overlayParams,
        displayCustomerEmail,
        renderOverlayLayout,
        renderUserDetailsForm,
        updateUserDetailsComplete,
        bindChangeCourierInstrClick,
        displayCourierInstrForm,
        renderCourierInstrLayout,
        renderCourierInstructionsList,
        fSendRequest,
        callbackSelectListItems,
        updateDomReferences,
        bindFormBtnsClicks,
        $lightboxInstance,
        $formWrapper,
        $continueButton,
        handleDisabledAttributes,
        form = '#customerDetailsForm',
        disableFilter = '.disabledField',
        bindChangeDeliveryTypeBtn,
        changeDeliveryTypeBtn = '.fnChangeDeliveryTypeBtn',
        inputFieldTypes = 'input[type=text], input[type=email]',
        setupFormValidation,
        orderFailModal,
        orderFailModalMainText,
        orderFailModalRetryButton,
        orderFailModalCancelButton,
        deliveryGroupsData = {},
        numberOfDeliveryGroups = 0,
        deliveryGroupsAutoscrollTo = 0,
        displayTermsAndConditionsOverlay,
        renderTermsAndConditionsOverlayContent,
        renderPrivacyPolicyOverlayContent,
        initTermsAndConditionsScrollbar,
        bindTermsAndConditionsOverlayBtns,
        displayWhatsThisChargeOverlay,
        renderWhatsThisChargeOverlayContent,
        handleFocus,
        getAutoscrollIndex,
        bindGiftMessages,
        renderGiftMessageOverlayLayout,
        displayGiftMessageOverlay,
        renderGiftMessageForm,
        checkGiftMessagesEnabled,
        bGiftMessagesEnabled = false,
        initGiftMessagesReminder;

    bindTermsAndConditionsOverlayBtns = function bindTermsAndConditionsOverlayBtns() {
        var $changeOverlayBtn = $('.kiosk-lightbox').find('.fnChangeOverlay'),
            $closeOverlayBtn = $('.kiosk-lightbox').find('.fnCloseOverlay');

        $changeOverlayBtn.off().on('click', function (e) {
            e.preventDefault();
            displayTermsAndConditionsOverlay(this);
        });
        $closeOverlayBtn.off().on('click', function (e) {
            e.preventDefault();
            overlay.hide();
            mvApi.navigateTo('review', true, false);
        });
    };

    initTermsAndConditionsScrollbar = function initTermsAndConditionsScrollbar() {
        var fullContentHeight = $('#kiosk-checkout-termsAndConditionsOverlayContent').height(),
            visibleContentHeight = 810,
            numberOfPages = Math.ceil(fullContentHeight / visibleContentHeight),
            customItems = [],
            i = 0;

        for (i = 0; i < numberOfPages; i++) {
            customItems.push(visibleContentHeight);
        }

        if ($('.kiosk-lightbox .inline-scrolling').length === 0) {
            inlineScrollbar.init($('#kiosk-checkout-termsAndConditionsOverlayContent'), {
                containerId: 'termsAndConditions-Scrollbar',
                customItems: customItems,
                autoscrollToItem: 2
            });
        }
    };

    renderPrivacyPolicyOverlayContent = function renderPrivacyPolicyOverlayContent() {
        var oCmsContent;

        if (window.TescoData.ChipAndPin.checkoutData.cmsContent.privacyPolicy !== 'undefined') {
            oCmsContent = window.TescoData.ChipAndPin.checkoutData.cmsContent.privacyPolicy;
        }

        mvApi.render('termsAndConditionsOverlayHeader', {
            defaults: {
                'overlayHeader': bundles['spc.chipAndPin.review.privacyPolicy.headerText'] || 'Privacy and cookies policy'
            }
        }, function () {
            mvApi.render('termsAndConditionsOverlayContent', {
                defaults: {
                    'overlayContent': oCmsContent
                }
            }, function () {
                mvApi.render('termsAndConditionsOverlayFooter', {
                    defaults: {
                        'overlayBtnRequest': 'get-termsandconditions-content',
                        'overlayBtnText': bundles['spc.chipAndPin.review.privacyPolicy.backBtnText'] || 'Back'
                    }
                }, function () {
                    $('#kiosk-checkout-termsAndConditionsOverlayContent a').each(function () {
                        $(this).off().on('click', function (e) {
                            e.preventDefault();
                        });
                    });
                    initTermsAndConditionsScrollbar();
                    bindTermsAndConditionsOverlayBtns();
                });
            });
        });
    };

    renderWhatsThisChargeOverlayContent = function renderWhatsThisChargeOverlayContent(){
    	var aCmsContent, bCmsContent;

    	if (window.TescoData.ChipAndPin.checkoutData.cmsContent.whatsThisChargeHeader !== 'undefined') {
    		aCmsContent = window.TescoData.ChipAndPin.checkoutData.cmsContent.whatsThisChargeHeader;
    		if (window.TescoData.ChipAndPin.checkoutData.cmsContent.whatsThisChargeCnC !== 'undefined') {
                bCmsContent = window.TescoData.ChipAndPin.checkoutData.cmsContent.whatsThisChargeCnC;
            }
        }

    	 mvApi.render('whatsThisChargeOverlayHeader', {
             defaults: {
                 'overlayHeader': aCmsContent
             }
         }, function () {
             mvApi.render('whatsThisChargeOverlayContent', {
                 defaults: {
                     'overlayContent': bCmsContent
                 }
             });
         });
    };

    renderTermsAndConditionsOverlayContent = function renderTermsAndConditionsOverlayContent() {
        var oCmsContent;

        if (window.TescoData.ChipAndPin.checkoutData.cmsContent.termsAndConditions !== 'undefined') {
            oCmsContent = window.TescoData.ChipAndPin.checkoutData.cmsContent.termsAndConditions;
        }

        mvApi.render('termsAndConditionsOverlayHeader', {
            defaults: {
                'overlayHeader': bundles['spc.chipAndPin.review.termsAndConditions.headerText'] || 'Terms and Conditions'
            }
        }, function () {
            mvApi.render('termsAndConditionsOverlayContent', {
                defaults: {
                    'overlayContent': oCmsContent
                }
            }, function () {
                mvApi.render('termsAndConditionsOverlayFooter', {
                    defaults: {
                        'overlayBtnRequest': 'get-privacypolicy-content',
                        'overlayBtnText': bundles['spc.chipAndPin.review.privacyPolicy.btnText'] || 'Privacy and cookies policy'
                    }
                }, function () {
                    $('#kiosk-checkout-termsAndConditionsOverlayContent a').each(function () {
                        $(this).off().on('click', function (e) {
                            e.preventDefault();
                        });
                    });
                    initTermsAndConditionsScrollbar();
                    bindTermsAndConditionsOverlayBtns();
                });
            });
        });
    };

    displayWhatsThisChargeOverlay = function displayWhatsThisChargeOverlay(){
    	opts = {
                content: '<div class="kiosk-lightbox"></div>',
                hideOnOverlayClick: true,
                customClass: 'no-keyboard',
                callback: function () {
                    mvApi.render('overlayLayout');
                    renderWhatsThisChargeOverlayContent();
                },
                onHideCallback: function () {
                    mvApi.navigateTo('review', true, false);
                }
            };
    	overlay.show(opts);

    };

    displayTermsAndConditionsOverlay = function displayTermsAndConditionsOverlay(el) {
        var request = $(el).attr('data-overlay-request'),
            opts = {
                content: '<div class="kiosk-lightbox"></div>',
                hideOnOverlayClick: true,
                customClass: 'termsAndConditionsLightbox no-keyboard',
                callback: function () {
                    mvApi.render('overlayLayout');
                    renderTermsAndConditionsOverlayContent();
                },
                onHideCallback: function () {
                    mvApi.navigateTo('review', true, false);
                }
            };

        if (!$('.kiosk-lightbox').length) {
            overlay.show(opts);
        } else {

            if (request === 'get-termsandconditions-content') {
                mvApi.navigateTo('review&termsAndConditions');
            } else if (request === 'get-privacypolicy-content') {
                mvApi.navigateTo('review&privacyPolicy');
            }
        }
    };

    getValidationMessages = function getValidationMessages() {
        var messages = {};

        messages[$('.honorific-prefix').attr('name')] = {
            required: validationExtras.msg.title.required
        };

        messages[$('.fnFirstName').attr('name')] = {
            required: validationExtras.msg.firstname.required,
            nameCheck: validationExtras.msg.firstname.inValid
        };

        messages[$('.fnLastName').attr('name')] = {
            required: validationExtras.msg.lastname.required,
            nameCheck: validationExtras.msg.lastname.inValid
        };

        messages[$('.fnContactNumber').attr('name')] = {
            required: validationExtras.msg.phone.required,
            phone: validationExtras.msg.phone.inValid
        };

        return messages;
    };

    getValidationRules = function getValidationRules() {
        var rules = {};

        rules[$('.honorific-prefix').attr('name')] = 'required';

        rules[$('.fnFirstName').attr('name')] = {
            required: true,
            nameCheck: {
                isLastname: false
            }
        };

        rules[$('.fnLastName').attr('name')] = {
            required: true,
            nameCheck: {
                isLastname: true
            }
        };

        rules[$('.fnContactNumber').attr('name')] = {
            required: true,
            phone: {
                depends: function () {
                    var val = $(this).val();
                    $(this).val($.trim(val.replace(/[^0-9]/g, '')));
                    return true;
                }
            }
        };

        return rules;
    };

    setupFormValidation = function setupFormValidation() {
        var $form = $(form);

        validationExtras.customMethods.nameCheck();
        validationExtras.customMethods.phone();

        $form.validate({
            ignore: "",
            onkeyup: function (e) {
                if (this.check(e)) {
                    $(e).addClass('valid');
                } else {
                    $(e).removeClass('valid');
                }
            },
            focusInvalid: true,
            onfocusout: function (e) {
                this.element(e);
            },
            errorElement: 'span',
            showErrors: function () {
                this.defaultShowErrors();
            },
            errorPlacement: function (error, element) {
                error.insertAfter(validationExtras.errorPlacementElement(element));
            },
            rules: getValidationRules(),
            messages: getValidationMessages()
        });

        validationExtras.limitCharactersPhone($form.find('.fnContactNumber'), 11);
        validationExtras.limitCharacters($form.find('.fnFirstName'), 20);
        validationExtras.limitCharacters($form.find('.fnLastName'), 25);
    };

    handleDisabledAttributes = function handleDisabledAttributes($disableFilter) {
        var $inputFields = $(inputFieldTypes, $formWrapper).filter($disableFilter);
        $inputFields.each(function () {
            var $inputFieldValue = $(this).val();
            if ($inputFieldValue !== '' && $inputFieldValue !== undefined) {
                $(this).attr('readonly', true);
            }
        });
    };

    updateDomReferences = function updateDomReferences() {
        $formWrapper = $('#user-detail-form-wrapper');
        $continueButton = $('#continueButton');
    };

    bindFormBtnsClicks = function bindFormBtnsClicks() {
        $continueButton.off().on('click', function (e) {
            var userData = {
                    'id': 'receipiantDetails'
                },
                recipModel = mvApi.getModel('updateCustomerDetails');

            e.preventDefault();
            e.stopPropagation();

            $.extend(userData, recipModel.atgData);

            userData.title = $('#userTitle .innerText').text() || '';
            userData['register-firstname'] = $('.fnFirstName').val() || '';
            userData['register-lastname'] = $('.fnLastName').val() || '';
            userData['register-email'] = $('.fnEmail').val() || '';
            userData['register-phone'] = $('.fnContactNumber').val() || '';
            userData.deliveryGroupId = chosenDeliveryGroupId;

            if ($('#customerDetailsForm').valid()) {
                ajax.post({
                    'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
                    'data': userData || {},
                    'callbacks': {
                        'success': function () {
                            overlay.hide();
                            init();
                        }
                    }
                });
            }
        });
    };

    updateUserDetailsComplete = function updateUserDetailsComplete() {
        updateDomReferences();
        userDetails.initCustomDropdown($('#honorific-prefix'));
        handleDisabledAttributes($(disableFilter));
        bindFormBtnsClicks();
        setupFormValidation();
    };

    bindChangeCourierInstrClick = function bindChangeCourierInstrClick() {
        var $deliveryGroupContainer;
        $(".fncourierInstructionsBtn").off().on('click', function () {
            $deliveryGroupContainer = $(this).closest('.deliveryGroup');
            deliveryGroupsAutoscrollTo = getAutoscrollIndex($deliveryGroupContainer);
            chosenDeliveryGroupId = $deliveryGroupContainer.data('groupid') || 0;
            displayCourierInstrForm();
        });
    };

    displayCourierInstrForm = function displayCourierInstrForm() {
        overlayParams = {
            content: '<div class="kiosk-lightbox"></div>',
            onHideCallback: function () {
                mvApi.navigateTo('review', true, false);
            },
            hideOnOverlayClick: true,
            callback: renderCourierInstrLayout
        };
        overlay.show(overlayParams);
    };

    renderCourierInstrLayout = function renderCourierInstrLayout($lightbox) {
        var layoutChange = {
            'defaults': {
                'overlayHeader': 'Change courier instructions'
            }
        };
        $lightboxInstance = $lightbox;
        mvApi.render('overlayLayout', layoutChange, renderCourierInstructionsList);
    };

    renderCourierInstructionsList = function renderCourierInstructionsList() {
        $('#lightbox').addClass('no-keyboard');
        var modelChange = {};
        mvApi.render('courierInstrHolder', modelChange, fSendRequest);
    };

    fSendRequest = function fSendRequest() {
        var oSubmitData;

        oSubmitData = {
            "id": 'getDataForCourierInstrModal',
            'shippingGroupId': chosenDeliveryGroupId
        };

        ajax.post({
            'url': SETTINGS.ENV === 'buildkit' ? SETTINGS.CONSTANTS.URL.KIOSK_DATA + '?id=' + 'getDataForCourierInstrModal' : '/direct/my/kiosk-checkout.page?ssb_block=kiosk-courier-instruction',
            'data': oSubmitData || {},
            'callbacks': {
                'success': function (data) {
                    var courierInstrModel = mvApi.getModel('courierInstrListItems'),
                        courierInstrData = JSON.parse(data),
                        modelChange = {
                            'atgData': courierInstrData.atgData
                        };
                    courierInstrModel.collection.items = courierInstrData.deliveryInstructions;

                    mvApi.render('courierInstrListItems', modelChange, callbackSelectListItems);
                }
            }
        });
    };

    callbackSelectListItems = function callbackSelectListItems() {
        inlineScrollbar.init($('.courierInstrList'), null);

        $(".leaveWithNeigh").off().on('click', function () {
        	$('.lwnError').hide();
            $(".leaveWithNeighContent").slideToggle("slow");
        });

		if($('.courierInstrListCollections').find('a[disabled]').length > 1){
			$('.noneBtn').removeAttr('disabled');
        }

		$('.ciTextArea').off().on('keypress', function(){
			$('.lwnError').hide();
			$(this).closest('li').find('.selectcourierInstructionsBtn').removeAttr('disabled');
		});

        $(".selectcourierInstructionsBtn").off().on('click', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();

			$('.lwnError').hide();

			if($(this).closest('li').find('textarea').length && $(this).closest('li').find('textarea').val() == ''){
				$('.lwnError').show();
				return false;
			}

            var $self = $(this),
                ciText = $self.closest('li').find('.ciList').data('citext'),
                delModel = mvApi.getModel('courierInstrListItems'),
                oSubmitData = {
                    id: 'getDeliveryGroupsForCI'
                };

            $('.selectcourierInstructionsBtn').attr('disabled', true);

            if (delModel.atgData) {
                $.extend(oSubmitData, atg.parse(delModel.atgData).atgData);
            }

            if(ciText.indexOf('Neigh') > 0)
				oSubmitData['deliveryInstructionsOne'] = $self.closest('li').find('textarea').val();

            oSubmitData['deliveryInstruction'] = ciText;
            oSubmitData['shippingGroupId'] = chosenDeliveryGroupId;

            ajax.post({
                'url': SETTINGS.ENV === 'buildkit' ? SETTINGS.CONSTANTS.URL.KIOSK_DATA + '?id=' + 'getDeliveryGroupsForCI' : '/direct/my/kiosk-checkout.page',
                'data': oSubmitData || {},
                'callbacks': {
                    'success': function (data) {
                        overlay.hide($lightboxInstance);
                        init();
                    }
                }
            });
        });
    };

    renderUserDetailsForm = function renderUserDetailsForm() {
        var modelChange = {
                'request': {
                    'data': {
                        'id': 'getDataForCustomerDetailsModal',
                        'deliveryGroupId': chosenDeliveryGroupId || null
                    },
                    'url': SETTINGS.ENV === 'buildkit' ? SETTINGS.CONSTANTS.URL.KIOSK_DATA + '?id=' + 'getDataForCustomerDetailsModal' : '/direct/my/kiosk-checkout.page?ssb_block=recepient-detail'
                }
            },
            updateCustomerDetailsModel = mvApi.getModel('updateCustomerDetails');

        if (!userSession.isRegisteredUser()) {
            updateCustomerDetailsModel.defaults.formName_state = '';
        }

        kmfIO.showKeyboard();
        mvApi.render('updateCustomerDetails', modelChange, updateUserDetailsComplete);
    };

    renderOverlayLayout = function renderOverlayLayout($lightbox) {
        var layoutChange = {
            'defaults': {
                'overlayHeader': 'Change your details'
            }
        };
        $lightboxInstance = $lightbox;
        mvApi.render('overlayLayout', layoutChange, renderUserDetailsForm);
    };

    displayLoginForm = function displayLoginForm() {
        mvApi.navigateTo('review&userDetailsForm', false, false);
        overlayParams = {
            content: '<div class="kiosk-lightbox"></div>',
            onHideCallback: function () {
                mvApi.navigateTo('review', true, false);
            },
            hideOnOverlayClick: true,
            callback: renderOverlayLayout
        };
        overlay.show(overlayParams);
    };

    initScrollbar = function initScrollbar() {
        var customItems = [];

        $('.deliveryGroups > li').each(function () {
            customItems.push($(this).height());
        });

        if ($('.inline-scrolling').length === 0) {
            inlineScrollbar.init($('.deliverySummary'), {
                containerId: 'reviewItemsScrollbar',
                customItems: customItems,
                autoscrollTo: deliveryGroupsAutoscrollTo
            });
        }
    };

    getAutoscrollIndex = function getAutoscrollIndex($chosenDeliveryGroup) {
        var $allDeliveryGroupContainers = $('.deliveryGroup'),
            $deliveryGroupContainer = $chosenDeliveryGroup || $('.deliveryGroup')[0];
        return $allDeliveryGroupContainers.index($deliveryGroupContainer);
    };

    bindChangeDetailsClick = function bindChangeDetailsClick() {
        var $deliveryGroupContainer;
        $(".fnChangeDetailsBtn").off().on('click', function () {
            $deliveryGroupContainer = $(this).closest('.deliveryGroup');
            deliveryGroupsAutoscrollTo = getAutoscrollIndex($deliveryGroupContainer);
            chosenDeliveryGroupId = $deliveryGroupContainer.data('groupid') || 0;
            displayLoginForm();
        });

        //Due to 3rd party API dependency
        /*jslint unparam: true*/
        orderFailModal = function orderFailModal(sID, sButton) {
            if (sButton === 'NO') {
                window.location.href = "/direct";
            }
        };
        /*jslint unparam: false*/

        if (window.TescoData.ChipAndPin.header !== undefined) {
            if (window.TescoData.ChipAndPin.header.success === false || window.TescoData.ChipAndPin.header.success === "false") {
                if (window.TescoData.ChipAndPin.header.checkoutFailure === true || window.TescoData.ChipAndPin.header.checkoutFailure === "true") {
                    orderFailModalMainText = window.TescoData.ChipAndPin.header.checkoutFailureMessage || bundles['spc.chipAndPin.payment.paymentDeclinedText'];
                    orderFailModalRetryButton = bundles['spc.chipAndPin.payment.paymentDeclinedRetryButton'] || 'PAY AGAIN';
                    orderFailModalCancelButton = bundles['spc.chipAndPin.payment.paymentDeclinedCancelButton'] || 'CANCEL ORDER';
                    receipt.printReceipt();
                    kmfIO.showDialog('paymentFailed', 'Payment Failed', orderFailModalMainText, orderFailModalRetryButton, orderFailModalCancelButton, orderFailModal);
                } else {
                    orderFailModalMainText = bundles['spc.chipAndPin.payment.paymentDeclinedText'] || 'Unfortunately your card payment has been declined. What would you like to do?';
                    orderFailModalRetryButton = bundles['spc.chipAndPin.payment.paymentDeclinedRetryButton'] || 'PAY AGAIN';
                    orderFailModalCancelButton = bundles['spc.chipAndPin.payment.paymentDeclinedCancelButton'] || 'CANCEL ORDER';
                    receipt.printReceipt();
                    kmfIO.showDialog('paymentFailed', 'Payment Failed', orderFailModalMainText, orderFailModalRetryButton, orderFailModalCancelButton, orderFailModal);
                }
            }
        }
    };

    displayCustomerEmail = function displayCustomerEmail() {
        var $fnEmailAddress = jQuery('.customerDetails .fnEmailAddress');
        if (!$fnEmailAddress.text().trim().length) {
            $fnEmailAddress.parents('.itemHolder').hide();
        }
    };

    bindChangeDeliveryTypeBtn = function bindChangeDeliveryTypeBtn() {
        $(changeDeliveryTypeBtn).off().on('click tap', function () {
            deliveryGroupsAutoscrollTo = getAutoscrollIndex($(this).closest('.deliveryGroup'));
            mvApi.updateModel('deliveryItems', {
                defaults: {
                    'section': null
                }
            });
            self.callbacks.displayDeliverySection();
        });
    };

    //as the delivery groups are removed from DOM and re-rendered, focus is being set to first element automatically, even if user was focusing on something at the bottom - this is to prevent this from happening
    handleFocus = function handleFocus() {
        $(':focus').blur();
    };

    deliveryGroupComponentsComplete = function deliveryGroupComponentsComplete() {
        bindGiftMessages();
        initScrollbar();
        displayCustomerEmail();
        bindChangeCourierInstrClick();
        bindChangeDetailsClick();
        bindChangeDeliveryTypeBtn();
        handleFocus();

        $('.productDetail').dotdotdot({
            'height': 60
        });
        $('.productSchoolName').dotdotdot({
            'height': 60
        });
    };

    handleDeliveryGroupsData = function handleDeliveryGroupsData(data) {
        var x, y, z, deliveryGroup, deliveryOptions, storeInfoDetails, deliveryAddress, deliveryDate, deliveryContact, deliveryGroupMessage, deliveryGroupItems, deliveryGroupItemsNotParsed, extraItem,
            deliveryGroupModel = {
                'collection': {
                    'tagName': 'li',
                    'items': []
                }
            },
            collectionMessage, isProofOfDeliveryRequired = false,
            deliveryMessage;

        if (data && typeof data === 'string') {
            data = JSON.parse(data);
        }

        deliveryGroupsData = {};

        if (data.deliveryGroups) {
            $.extend(true, deliveryGroupsData, data.deliveryGroups);
            numberOfDeliveryGroups = data.deliveryGroups.length;

            for (x = 0; x < numberOfDeliveryGroups; x++) {
                deliveryGroup = deliveryGroupsData[x];
                deliveryGroupItemsNotParsed = deliveryGroup.deliveryGroupItems;
                deliveryGroupItems = [];
                deliveryGroupMessage = null;
                deliveryOptions = deliveryGroup.deliveryOptions.availableDeliveryOptions[0];
                deliveryAddress = (deliveryOptions.deliveryAddress && deliveryOptions.deliveryAddress.address) ? deliveryOptions.deliveryAddress.address : null;
                storeInfoDetails = deliveryOptions.storeInfoDetails || null;
                deliveryContact = deliveryOptions.collectionDetails.deliveryContact;
                deliveryDate = deliveryOptions.expectedDelivery || deliveryOptions.deliveryDate;
                collectionMessage = (storeInfoDetails !== null) ? bundles['clickAndCollect.collectionMessage'] : '';
                isProofOfDeliveryRequired = false;
                deliveryMessage = bundles['spc.chipAndPin.review.proofOfDeliveryMessage'];

                for (y = 0; y < deliveryGroupItemsNotParsed.length; y++) {
                    deliveryGroupItemsNotParsed[y].deliveryGroupId = deliveryGroup.deliveryGroupId;
                    if (deliveryGroupItemsNotParsed[y].errorMessage) {
                        deliveryGroupMessage = deliveryGroupItemsNotParsed[y].errorMessage;
                    }
                    if (deliveryGroupItemsNotParsed[y].isProofOfDeliveryRequired === true) {
                        isProofOfDeliveryRequired = true;
                    }
                    deliveryGroupItems.push(deliveryGroupItemsNotParsed[y]);

                    if (deliveryGroupItemsNotParsed[y].serviceItems && deliveryGroupItemsNotParsed[y].serviceItems.length) {
                        for (z = 0; z < deliveryGroupItemsNotParsed[y].serviceItems.length; z++) {
                            extraItem = {
                                itemName: deliveryGroupItemsNotParsed[y].serviceItems[z].serviceItem,
                                productQuantity: deliveryGroupItemsNotParsed[y].serviceItems[z].quantity,
                                price: deliveryGroupItemsNotParsed[y].serviceItems[z].serviceItemPrice,
                                type: 'service'
                            };
                            deliveryGroupItems.push(extraItem);
                        }
                    }
                }

                deliveryGroupModel.collection.items.push({
                    'deliveryGroupId': deliveryGroup.deliveryGroupId || '',
                    'deliveryGroupMessage': deliveryGroupMessage || '',
                    'deliveryGroupMessageType': 'error',
                    'deliveryGroupNumber': deliveryGroup.deliveryGroupNumber || '',
                    'soldBy': deliveryGroupItems[0].soldBy || '',
                    'deliveryMethod': deliveryOptions.deliveryMethod || '',
                    'deliveryType': deliveryOptions.deliveryMethodName || '',
                    'deliveryCost': deliveryOptions.deliveryCost || '',
                    'collectFrom': deliveryOptions.collectFrom || null,
                    'collectPostalCode': (storeInfoDetails && storeInfoDetails.storeAddress && storeInfoDetails.storeAddress.postalCode) ? storeInfoDetails.storeAddress.postalCode : '',
                    'deliveryDate': deliveryDate || '',
                    'deliveryTime': deliveryOptions.collectionTime || '',
                    'storeInfoDetails': storeInfoDetails || '',
                    'expectedDelivery': deliveryOptions.expectedDelivery || '',
                    'deliveryAddress': deliveryAddress || '',
                    'deliveryAddressOne': (deliveryAddress && deliveryAddress.addressLine1) ? deliveryAddress.addressLine1 : null,
                    'deliveryAddressTwo': (deliveryAddress && deliveryAddress.addressLine2) ? deliveryAddress.addressLine2 : null,
                    'deliveryPostCode': (deliveryAddress && deliveryAddress.postCode) ? deliveryAddress.postCode : null,
                    'courierInstructions': (deliveryOptions && deliveryOptions.deliveryAddress && deliveryOptions.deliveryAddress.courierInstructions) ? deliveryOptions.deliveryAddress.courierInstructions : 'None',
                    'courierInstructionsOne': (deliveryOptions && deliveryOptions.deliveryAddress && deliveryOptions.deliveryAddress.courierInstructions1) ? deliveryOptions.deliveryAddress.courierInstructions1 : '',
                    'isDelInstAvailable': (deliveryOptions && deliveryOptions.deliveryAddress && deliveryOptions.deliveryAddress.isDelInstAvailable) ? true : false,
                    'customerDetails_name': (deliveryContact && deliveryContact.name) ? deliveryContact.name : '',
                    'customerDetails_contactNumber': (deliveryContact && deliveryContact.phone) ? deliveryContact.phone : '',
                    'customerDetails_email': (deliveryContact && deliveryContact.email) ? deliveryContact.email : '',
                    'nestedCollection': {
                        'model': mvApi.getModel('deliveryItems'),
                        'placeholderClass': 'fnItems' + deliveryGroup.deliveryGroupNumber,
                        'items': deliveryGroupItems
                    },
                    'collectionMessage': collectionMessage || '',
                    'deliveryMessage': isProofOfDeliveryRequired ? deliveryMessage : '',
                    'resiliencyDeliveryMessage': deliveryOptions.resiliencyDeliveryMessage || '',
                    'deliveryOn': deliveryOptions.deliveryOn || ''
                });
            }

            mvApi.render('deliveryGroup', deliveryGroupModel, deliveryGroupComponentsComplete);
        }

        if (data.tenderDetails) {
            if (data.tenderDetails.vouchers) {
                paymentDetailsController.updateVoucherData(data.tenderDetails.vouchers);
            }
        }

    };

    requestDeliveryGroupsData = function requestDeliveryGroupsData() {
        var data = {
            id: 'getDeliveryGroups'
        };
        ajax.post({
            'url': SETTINGS.ENV === 'buildkit' ? SETTINGS.CONSTANTS.URL.KIOSK_DATA + '?id=' + data.id : '/direct/my/kiosk-checkout.page?ssb_block=review-order',
            'data': data || {},
            'callbacks': {
                'success': function (data) {
                    var parsedData = JSON.parse(data);
                    if (parsedData.header && parsedData.header.success) {
                        $.extend(window.TescoData.ChipAndPin, {
                            'header': parsedData.header
                        });
                    }
                    handleDeliveryGroupsData(data);
                    paymentDetailsController.init(data);
                }
            }
        });

    };

    renderGiftMessageForm = function renderGiftMessageForm() {
        /**
         * updates the relevant delivery group with the message.
         * @param groupID
         * @param message
         */
        var deliveryGrouypID = $(".kiosk-lightbox").attr("data-deliveryID"),
            skuID = $(".kiosk-lightbox").attr("data-sku"),
            deliveryGroupPersonalMessage = $('.deliveryGroup[data-groupid="' + deliveryGrouypID + '"] .uiGiftMessage .personalGiftMessage[data-sku="' + skuID + '"]').parents('.personal-gift-message-wrapper .uiGiftMessage'),
            clonedPersonalMessage,
            updateModels = function (groupID, message) {
                var groups = mvApi.getModel("deliveryGroup").collection.items,
                    selectedDeliveryGroup,
                    itemIndex,
                    item;

                selectedDeliveryGroup = (function () {
                    var groupIndex,
                        dGroup;
                    for (groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                        dGroup = groups[groupIndex];
                        if (dGroup.deliveryGroupId === groupID) {
                            break;
                        }
                    }
                    return dGroup;
                }());

                if (selectedDeliveryGroup) {
                    // find the item in the delivery group that allows a gift message
                    // and update that item, if the message is empty, then delete any previously
                    // set message
                    for (itemIndex = 0; itemIndex < selectedDeliveryGroup.nestedCollection.items.length; itemIndex++) {
                        item = selectedDeliveryGroup.nestedCollection.items[itemIndex];
                        if (item.giftMessageLength) {
                            if (message !== "") {
                                item.giftMessage = message;
                            } else {
                                delete item.giftMessage;
                            }
                        }
                    }
                }

                //giftMessageSession.save();
            },
            submitGiftMessage = function (groupID, message) {
                var userData = {},
                    currDelGrp = deliveryGroup.getCurrentDeliveryGroup(),
                    requestData = $.extend(userData, atg.parse(currDelGrp.giftMessageAtgData).atgData);
                requestData['gift-message'] = $('#lightbox #gift-message').val() || '';
                requestData['shippingGrpId'] = $('#lightbox #gift-message').data('key');
                requestData['ctlgRef'] = $('#giftMessage #gift-message').data('sku');

                ajax.post({
                    'url': '/direct/my/kiosk-checkout.page',
                    'data': requestData || {}
                });
            },

            updateDeliveryGroupText = function () {
                var deliveryGroupTextbox = deliveryGroupPersonalMessage.find('.personalGiftMessage'),
                    userMessageTextbox = clonedPersonalMessage.find("textarea");
                deliveryGroupTextbox.val(userMessageTextbox.val());
                deliveryGroupTextbox.data("count").update();
                submitGiftMessage(deliveryGrouypID, deliveryGroupTextbox.val());
                updateModels(deliveryGrouypID, deliveryGroupTextbox.val());
            },
            registerEvents = function (e) {
                var element = $(e.target);
                if (element.hasClass("cancel")) {
                    clonedPersonalMessage.find("textarea").addClass("no-save");
                } else {
                    clonedPersonalMessage.find("textarea").removeClass("no-save");
                    updateDeliveryGroupText();
                }
                $("#lightbox .close").trigger("click");
            };


        // use this to populate overlay
        clonedPersonalMessage = deliveryGroupPersonalMessage.clone(true);
        $('#lightbox .close').focus();
        $("#lightbox .dialog-content").append(clonedPersonalMessage);
        clonedPersonalMessage.one("click", ".button", registerEvents);

        clonedPersonalMessage.find("textarea").val(deliveryGroupPersonalMessage.find("textarea").val());
        clonedPersonalMessage.find("textarea").data('initialised', false);
        clonedPersonalMessage.find("textarea").count({
            selector: ".count",
            warningClass: "warn",
            limitLines: 7,
            limitLineSelector: '.lineCount'
        });
    };

    renderGiftMessageOverlayLayout = function renderGiftMessageOverlayLayout($lightbox) {
        var layoutChange = {
            'defaults': {
                'overlayHeader': 'Personal Message'
            }
        };
        $lightboxInstance = $lightbox;
        mvApi.render('overlayLayout', layoutChange, renderGiftMessageForm);
    };

    displayGiftMessageOverlay = function displayGiftMessageOverlay(sDeliveryGroupID, skuID) {
        mvApi.navigateTo('review', false, false);
        overlayParams = {
            content: '<div class="kiosk-lightbox" data-deliveryID="' + sDeliveryGroupID + '" data-sku="' + skuID + '"> </div>',
            onHideCallback: function () {
                mvApi.navigateTo('review', true, false);
            },
            hideOnOverlayClick: true,
            customClass: sDeliveryGroupID,
            callback: renderGiftMessageOverlayLayout
        };
        overlay.show(overlayParams);
    };

    bindGiftMessages = function bindGiftMessages() {
        $('#wrapper.spi').on('click', '.gift-message-mask', function (e) {
            var $context = $(e.target),
                sDeliveryGroupID = $context.closest('.deliveryGroup').data('groupid'),
                skuID = $context.parents('.personal-gift-message-wrapper').find('.uiGiftMessage .personalGiftMessage').data('sku');

            displayGiftMessageOverlay(sDeliveryGroupID, skuID);
        });

        setTimeout(function () {
            giftMessageSession.init($(".personalGiftMessage"));
            $(".personalGiftMessage").count({
                selector: ".count",
                warningClass: "warn",
                limitLines: 7,
                limitLineSelector: '.lineCount'
            });
        }, 300);

        checkGiftMessagesEnabled();
        if (bGiftMessagesEnabled) {
            initGiftMessagesReminder();
        }
    };

    checkGiftMessagesEnabled = function checkGiftMessagesEnabled() {
        var $giftMessage = '#wrapper.spi .uiGiftMessage';

        if ($($giftMessage).length > 0) {
            bGiftMessagesEnabled = true;
        }
    };

    initGiftMessagesReminder = function initGiftMessagesReminder() {
        var sWarningMessage = window.TescoData.ChipAndPin.checkoutData.cmsContent.giftMessageWarning || 'Don\'t forget to add your personalised message',
            $warningMessageMarkup = '<div class="giftMessageWarning"><span>' + sWarningMessage + '</span></div>',
            $reviewContent = '#wrapper.spi .content .review';

        if (!$($reviewContent).hasClass('giftMessageWarningActive')) {
            $($reviewContent).addClass('giftMessageWarningActive').prepend($warningMessageMarkup);
        }
    };
    onReviewLayoutReady = function onReviewLayoutReady() {
        requestDeliveryGroupsData();
        $('.content').trigger("reviewLayoutReady");
    };

    preloadTemplates = function () {
        mvApi.render('deliveryItems', {
            'preload': true,
            defaults: {
                'giftMessageIndicativeText': window.TescoData.ChipAndPin.checkoutData.cmsContent.giftMessageIndicativeText,
                'giftMessageHeader': bundles['spc.chipAndPin.review.deliveryItem.giftMessage.headerText'] || 'Personal Message',
                'giftMessageLength': bundles['spc.chipAndPin.review.deliveryItem.giftMessage.length'] || '',
                'giftMessageWarn': bundles['spc.chipAndPin.review.deliveryItem.giftMessage.warn'] || '50',
                'giftMessageCharacters': bundles['spc.chipAndPin.review.deliveryItem.giftMessage.characters'] || ' Characters',
                'giftMessagePlaceholder': bundles['spc.chipAndPin.review.deliveryItem.giftMessage.placeholder'] || 'Enter your personal message here',
                'section': 'review'
            }
        });
        mvApi.render('reviewLayout', onReviewLayoutReady);
    };

    init = function init() {
        mvApi.cacheInitialModels(mvModels);
        breadcrumb.set(3);
        overlay.hide($lightboxInstance);
        preloadTemplates();
    };

    //Exposing public methods
    self = {
        init: init,
        pageModel: mvModels.pageModel,
        displayTermsAndConditionsOverlay: displayTermsAndConditionsOverlay,
        renderTermsAndConditionsOverlayContent: renderTermsAndConditionsOverlayContent,
        renderPrivacyPolicyOverlayContent: renderPrivacyPolicyOverlayContent,
        displayWhatsThisChargeOverlay: displayWhatsThisChargeOverlay,
        renderWhatsThisChargeOverlayContent: renderWhatsThisChargeOverlayContent

    };

    return self;


});