/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require */
define('modules/chip-and-pin/delivery-home', ['domlib', 'modules/mvapi/common', 'modules/chip-and-pin/atg-data', 'modules/chip-and-pin/delivery-group', 'modules/chip-and-pin/delivery-models', 'modules/overlay/common', 'modules/validation', 'modules/ajax/common', 'modules/chip-and-pin/user-session', 'modules/inline-scrollbar/common', 'modules/chip-and-pin/kmf-io', 'modules/settings/common', 'modules/chip-and-pin/delivery-home-datepicker', 'modules/chip-and-pin/bundles'], function ($, mvApi, atg, deliveryGroup, mvModels, overlay, validationExtras, ajax, userSession, inlineScrollbar, kmfIO, SETTINGS) {
    'use strict';
    var init,
        self,
        fRenderPostcodeForm,
        fRenderAnotherPostCodeForm,
        fShowOverlay,
        fUpdateOverlay,
        fSendRequest,
        abSendRequest,
        aAddressList,
        aGetAddressList,
        sSearchPostcode = '',
        fRenderDeliveryAddressList,
        fRenderDeliveryAddressListItems,
        fRenderSavedDeliveryAddressList,
        fRenderManualAddressFrom,
        fSetDeliveryAddress,
        fClickHandlersDelivery,
        fSetupPostcodeValidation,
        callbackRenderPostcodeForm,
        callbackAddressListItems,
        callbackSavedAddressListItems,
        callbackSelectListItems,
        displayDatePickerOverlay,
        completeDeliveryGroup,
        createDatePicker,
        bIsError = false,
        bIsPostCodeInSession = false,
        oMessages = {
            'noResultsFound': "We can't find a match for what you've entered, please try again.",
            'blockedPostcode': "Sorry but we can't deliver to this postcode. Please enter a different postcode or select another delivery type."
        },
        deliveryPostCode = '',
        bSearchedBefore = false,
        bDisplayCantDeliverToThisPostcodeErrorMessage = false;

    fSetDeliveryAddress = function fSetDeliveryAddress() {
        var userType = userSession.getUserType();

        if (userType === SETTINGS.CONSTANTS.LOGIN.LOGIN_REGISTERED || bIsPostCodeInSession) {
            mvApi.navigateTo('delivery&savedAddressList', false);
        } else if (userType === SETTINGS.CONSTANTS.LOGIN.LOGIN_HALF) {
            mvApi.navigateTo('delivery&searchAddress', false);
        } else if (userType === SETTINGS.CONSTANTS.LOGIN.LOGIN_ANONYMOUS) {
            mvApi.navigateTo('delivery&searchAddress', false);
        }

        fClickHandlersDelivery();
    };

    fRenderAnotherPostCodeForm = function fRenderAnotherPostCodeForm() {

        var oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup(),
            modelChange = {};
        if (oDeliveryGroup.postCode) {
            if (bSearchedBefore === false) {
                deliveryPostCode = oDeliveryGroup.postCode;
            } else {
                deliveryPostCode = '';
            }
        }

        modelChange = {
            'defaults': {
                'statusMessageText': '',
                'statusMessageClass': '',
                'defaultDelPostcode': deliveryPostCode
            },
            request: {
                'url': '/direct/my/kiosk-checkout.page?ssb_block=add-address-form',
                'callbacks': {
                    'success': function () {
                        bSearchedBefore = true;
                    }
                }
            }
        };
        mvApi.render('findDeliveryAddressForm', modelChange, callbackRenderPostcodeForm);
    };

    fRenderPostcodeForm = function fRenderPostcodeForm() {
        $('#lightbox').removeClass('no-keyboard');
        var oSubmitData, modelChange,
            oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup(),
            oCurrentDeliveryMethod = deliveryGroup.getSelectedDeliveryMethod(oDeliveryGroup),
            sDeliveryMethodID = oCurrentDeliveryMethod.deliveryMethod;

        oCurrentDeliveryMethod = deliveryGroup.parseATGDataForDeliveryMethod(oCurrentDeliveryMethod);
        oSubmitData = {
            "deliveryGroupID": oDeliveryGroup.deliveryGroupId,
            "deliveryMethodID": sDeliveryMethodID
        };
        $.extend(oSubmitData, oCurrentDeliveryMethod.atgData);

        if (oDeliveryGroup.postCode) {
            if (bSearchedBefore === false) {
                deliveryPostCode = oDeliveryGroup.postCode;
            } else {
                deliveryPostCode = '';
            }
        }

        modelChange = {
            'defaults': {
                'statusMessageText': '',
                'statusMessageClass': '',
                'defaultDelPostcode': deliveryPostCode
            },
            request: {
                'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
                'data': oSubmitData || {},
                'callbacks': {
                    'success': function () {
                        bSearchedBefore = true;
                    }
                }
            }
        };

        if (bIsError) {
            modelChange = {
                'defaults': {
                    'statusMessageText': oMessages.noResultsFound,
                    'statusMessageClass': 'error'
                }
            };
            bIsError = false;
        }
        mvApi.render('findDeliveryAddressForm', modelChange, callbackRenderPostcodeForm);
    };

    fRenderDeliveryAddressList = function fRenderDeliveryAddressList() {
        $('#lightbox').addClass('no-keyboard');
        var modelChange = {
            'defaults': {
                'listType': 'getPostcodeAddress'
            }
        };
        mvApi.render('selectDeliveryAddressForm', modelChange, fRenderDeliveryAddressListItems('getPostcodeAddress'));
    };

    fRenderSavedDeliveryAddressList = function fRenderSavedDeliveryAddressList() {
        $('#lightbox').addClass('no-keyboard');
        var modelChange = {
            'defaults': {
                'listType': 'getSavedAddress'
            }
        };
        mvApi.render('selectDeliveryAddressForm', modelChange, fRenderDeliveryAddressListItems('getSavedAddress'));
    };
    fRenderManualAddressFrom = function fRenderManualAddressFrom() {
        $('#lightbox').removeClass('no-keyboard');
        mvApi.render('manualEnterAddressForm', null);
    };

    fRenderDeliveryAddressListItems = function fRenderDeliveryAddressListItems(type) {
        var data, _getType = type;
        data = {
            id: _getType
        };
        if (_getType === 'getPostcodeAddress') {
            fSendRequest(data, callbackAddressListItems);
        } else if (_getType === 'getSavedAddress') {
            fSendRequest(data, callbackSavedAddressListItems);
        }
    };

    aGetAddressList = function aGetAddressList() {
        var findDeliveryAddressFormModel = mvApi.getModel('findDeliveryAddressForm'),
            txtPostcodeName = $('#txtPostcode').attr('name'),
            requestData = {
                id: 'getPostcodeAddress'
            },
            selectDeliveryAddressListModel = mvApi.getModel('selectDeliveryAddressList');

        if (findDeliveryAddressFormModel.atgData) {
            $.extend(requestData, findDeliveryAddressFormModel.atgData);
        }

        requestData[txtPostcodeName] = sSearchPostcode;

        if (sSearchPostcode !== '') {
            ajax.post({
                'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
                'data': requestData,
                'callbacks': {
                    'success': function (d) {
                        aAddressList = JSON.parse(d);
                        if (aAddressList.header && aAddressList.header.success === false) {
                            mvApi.navigateTo('delivery&searchAnotherAddress', false);
                            var modelChange = {
                                'defaults': {
                                    'statusMessageText': aAddressList.header.errorMessage,
                                    'statusMessageClass': 'error'
                                }
                            };
                            mvApi.render('findDeliveryAddressForm', modelChange, callbackRenderPostcodeForm);
                        } else {
                            $.extend(selectDeliveryAddressListModel, atg.parse(aAddressList.atgData));

                            aAddressList = aAddressList.address;

                            fUpdateOverlay("Please select an address for '" + sSearchPostcode + "'", fRenderDeliveryAddressList);
                        }
                    }
                }
            });
        }
    };

    fClickHandlersDelivery = function fClickHandlersDelivery() {
        var userHasComeFromDeliverySearchAnotherAddress = false;

        $('.kiosk-lightbox').unbind()
            .on('click tap', '#btnSubmitPostcode', function (e) { // Search address for Postcode
                e.preventDefault();
                fSetupPostcodeValidation();
                if ($('#frmFindAddress').valid()) {
                    sSearchPostcode = $('#txtPostcode').val().toUpperCase();
                    userHasComeFromDeliverySearchAnotherAddress = true;
                    mvApi.navigateTo('delivery&addressList', false);
                }
            }).on('click tap', '.findAddressBtn', function (e) {
                e.preventDefault();
                userHasComeFromDeliverySearchAnotherAddress = false;
                bDisplayCantDeliverToThisPostcodeErrorMessage = false;
                mvApi.navigateTo('delivery&searchAnotherAddress', false);
            }).on('click', '.selectAddressBtn', function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
                var $self = $(this),
                    address = $self.parent('li').find('.address').html(),
                    addressIndex = $self.parent('li').find('.address').data('nickname'),
                    delModel = mvApi.getModel('selectDeliveryAddressList'),
                    shippingGroupId = deliveryGroup.getCurrentDeliveryGroupID() === undefined ? 'sg54160004' : deliveryGroup.getCurrentDeliveryGroupID(),
                    currentDelMethod = deliveryGroup.getSelectedDeliveryMethod(),
                    data = {
                        id: 'isDeliveryDateRequired',
                        address: address,
                        addressIndex: addressIndex,
                        shippingGroupId: shippingGroupId,
                        deliveryMethod: currentDelMethod.deliveryMethod
                    };

                $self.attr('disabled', true);

                if (delModel.atgData) {
                    $.extend(data, delModel.atgData);
                }

                abSendRequest(data, function (d) {
                    var userType = userSession.getUserType(),
                        labelErrorMessage = '';

                    if (userType !== SETTINGS.CONSTANTS.LOGIN.LOGIN_REGISTERED) {
                        bIsPostCodeInSession = true;
                    }
                    if (d !== null) {
                        d = JSON.parse(d);
                        if (d.isBlockedAddress !== undefined && d.isBlockedAddress === true) {
                            // If the customer has come from the post code search dialog
                            if (userHasComeFromDeliverySearchAnotherAddress) {
                                bDisplayCantDeliverToThisPostcodeErrorMessage = true;
                                mvApi.navigateTo('delivery&searchAnotherAddress', false);
                            } else {
                                labelErrorMessage = d.header.errorMessage !== undefined ? d.header.errorMessage : '';
                                self.hide().after('<span class="labelErrorMessage">' + labelErrorMessage + '</span>');
                            }
                        } else if (d.isDeliveryDateRequired === "true") {
                            displayDatePickerOverlay(d);
                        } else {
                            completeDeliveryGroup();
                        }
                    }
                });
            }).on('click tap', '.manuallyAddAddressBtn', function (e) {
                e.preventDefault();
                fUpdateOverlay("Enter address", fRenderManualAddressFrom);
            }).on('click tap', '#findAdifferentDelviery', function (e) {
                e.preventDefault();
                overlay.hide();
            });
    };

    completeDeliveryGroup = function completeDeliveryGroup() {
        overlay.hide();
        require(['modules/chip-and-pin/delivery-group'], function (deliveryGroup) {
            deliveryGroup.setCompleted();
            deliveryGroup.handleDeliveryGroup();
        });
    };

    callbackRenderPostcodeForm = function callbackRenderPostcodeForm() {
        $('#lightbox').removeClass('no-keyboard');
        fSetupPostcodeValidation();
        $('#txtPostcode').focus();
        kmfIO.showKeyboard();

        if (bDisplayCantDeliverToThisPostcodeErrorMessage) {
            $('.findStoreFormWrapper').parent().find('.fnModal.message span').addClass('error').text(oMessages.blockedPostcode);
        }
    };

    callbackAddressListItems = function callbackAddressListItems() {
        var addressBookModel = mvApi.getModel('selectDeliveryAddressList');

        addressBookModel.defaults.listType = 'getPostcodeAddress';
        addressBookModel.collection.items = aAddressList;

        mvApi.render('selectDeliveryAddressList', callbackSelectListItems);
    };

    callbackSavedAddressListItems = function callbackSavedAddressListItems(data) {

        var parsedJSON = JSON.parse(data),
            selectDeliveryAddressListModel = mvApi.getModel('selectDeliveryAddressList'),
            modelChange = {
                'listType': 'getPostcodeAddress',
                'collection': {
                    'items': parsedJSON.address
                }
            };

        selectDeliveryAddressListModel.collection.items = {};
        selectDeliveryAddressListModel.atgData = {};

        $.extend(modelChange, atg.parse(parsedJSON.atgData));

        mvApi.render('selectDeliveryAddressList', modelChange, callbackSelectListItems);
    };

    callbackSelectListItems = function callbackSelectListItems() {
        inlineScrollbar.init($('.deliveryList'), null);
    };

    fShowOverlay = function fShowOverlay(title, callback) {
        var overlayParams = {
            content: '<div class="kiosk-lightbox"></div>',
            hideOnOverlayClick: true,
            onHideCallback: function () {
                mvApi.navigateTo('delivery', false, false);
            },
            callback: function () {
                var modelChange = {
                    'defaults': {
                        'overlayHeader': title
                    }
                };
                mvApi.render('overlayLayout', modelChange, callback);
            }
        };
        overlay.show(overlayParams);
    };
    abSendRequest = function abSendRequest(data, callback) {

        ajax.post({
            'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            'data': data || {},
            'callbacks': {
                'success': callback || null
            }
        });

        //completeDeliveryGroup();
    };
    fUpdateOverlay = function fUpdateOverlay(title, callback, model) {
        if ($('.kiosk-lightbox').length) {
            var modelChange = model || {
                'defaults': {
                    'overlayHeader': title
                }
            };
            mvApi.render('overlayLayout', modelChange, callback);
        } else {
            var overlayParams = {
                content: '<div class="kiosk-lightbox"></div>',
                hideOnOverlayClick: true,
                onHideCallback: function () {
                    mvApi.navigateTo('delivery', false, false);
                },
                callback: function () {
                    var modelChange = {
                        'defaults': {
                            'overlayHeader': title
                        }
                    };
                    mvApi.render('overlayLayout', modelChange, callback);
                }
            };
            overlay.show(overlayParams);
        }
    };
    fSendRequest = function fSendRequest(data, callback) {
        var oSubmitData,
            oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup(),
            oCurrentDeliveryMethod = deliveryGroup.getSelectedDeliveryMethod(oDeliveryGroup),
            sDeliveryMethodID = oCurrentDeliveryMethod.deliveryMethod;

        oCurrentDeliveryMethod = deliveryGroup.parseATGDataForDeliveryMethod(oCurrentDeliveryMethod);
        oSubmitData = {
            "id": data.id,
            "deliveryGroupID": oDeliveryGroup.deliveryGroupId,
            "deliveryMethodID": sDeliveryMethodID
        };
        $.extend(oSubmitData, oCurrentDeliveryMethod.atgData);

        ajax.post({
            'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            'data': oSubmitData || {},
            'callbacks': {
                'success': callback || null
            }
        });
    };
    fSetupPostcodeValidation = function fSetupPostcodeValidation() {
        validationExtras.customMethods.postcodeUK();

        /*** IMPORTANT - This probably needs to be moved (RD 23-Jul-2014) ***/
        jQuery.validator.addMethod("onlyLetterNumbersSpace", function (value) {
            var regex = new RegExp("^[a-zA-Z0-9 ]+$"),
                key = value;

            if (!regex.test(key)) {
                return false;
            }
            return true;
        });
        /*** END IMPORTANT ***/

        var $form = $('#frmFindAddress');
        $form.validate({
            debug: true,
            ignore: "",
            focusInvalid: false,
            errorElement: 'span',
            showErrors: function () {
                this.defaultShowErrors();
            },
            errorPlacement: function (error, element) {
                $('.dialog-content .fnModal .error').hide();
                error.insertAfter(validationExtras.errorPlacementElement(element));
                switch (element.attr("name")) {
                case "txtPostcode":
                    error.insertAfter(element.parents('#txtPostcode').find('#btnSubmitPostcode '));
                    break;
                default:
                    error.insertBefore(validationExtras.errorPlacementElement(element));
                }
            },
            rules: {
                'txtPostcode': {
                    required: true,
                    postcodeUK: true,
                    onlyLetterNumbersSpace: true
                }
            },
            messages: {
                'txtPostcode': {
                    required: 'Please enter a postcode',
                    onlyLetterNumbersSpace: validationExtras.msg.postcodeUK.inValid
                }
            }
        });
        validationExtras.limitCharacters($('#txtPostcode'), 8);
    };

    displayDatePickerOverlay = function displayDatePickerOverlay(dates) {
        fUpdateOverlay('Select a delivery date', function () {
            var dateModel = {
                'defaults': {
                    'deliveryDate': '',
                    'deliveryCharge': '',
                    'deliveryDateMessage': ''
                }
            };
            $('.kiosk-lightbox').addClass('kiosk-lightbox-datepicker');
            mvApi.render('deliveryDatePicker', dateModel, function () {
                createDatePicker(dates);
            });
        });
    };

    createDatePicker = function createDatePicker(dates) {
        //var dates  =  JSON.parse(date);

        var formData = atg.parse(dates.atgData);

        $('.delivery-datePicker').datepicker({
            available: dates.availableDates,
            update: function (e, d) {
                var date = new Date(e),
                    collectionTime = '3pm';

                $(".delivery-datePickerWrapper").toggleClass("selected", !!e);

                $('.selected-date').text(this.longDayNames[date.getDay()] + ' ' + date.getDate() +
                    this.suffix(date.getDate()) + ' ' + this.monthNames[date.getMonth()] + ' ' + date.getFullYear());

                $('.cost span').html('&pound;' + d);

                $('.date').val(e);
                $('.charge').val(d);
                if (dates.isClickAndCollect !== undefined && dates.isClickAndCollect === "true") {
                    try {
                        collectionTime = window.TescoData.ChipAndPin.checkoutData.cmsContent.collectionTime;
                    } catch (ex) {
                        console.log('A TescoData property is not defined', ex);
                    }

                    $('.deliveryDateMessage').text("Your order will be ready to collect after " + collectionTime + " on:");
                    $('.kiosk-lightbox-datepicker').find('.dialog-header h2').text('Choose a collection date');
                } else {
                    $('.deliveryDateMessage').text("Your order will be delivered on:");
                }
            }
        });

        $('.delivery-datePickerWrapper .confirm-date').on('tap click', function (dates) {
            if ($('.delivery-datePickerWrapper').hasClass('selected')) {

                var shippingGroupId = deliveryGroup.getCurrentDeliveryGroupID(),
                    date = new Date($('.date').val()),
                    selectedDate = (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear(),
                    data = {
                        'id': "setDeliveryDate",
                        'scheduled-date-selected': selectedDate
                    };

                $.extend(data, formData.atgData);

                data['deliveryGroupId'] = shippingGroupId;

                ajax.post({
                    'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
                    'data': data || {},
                    'callbacks': {
                        'success': function () {
                            completeDeliveryGroup();
                        }
                    }
                });
            }
        });

        $('.delivery-datePickerWrapper .close-button').on('tap click', function () {
            overlay.hide();
        });
    };

    // End Home Delivery Options
    init = function init() {
        mvApi.cacheInitialModels(mvModels);
    };

    //Exposing public methods
    self = {
        init: init,
        setDeliveryAddress: fSetDeliveryAddress,
        searchAddressForm: fRenderPostcodeForm,
        searchAnotherAddressForm: fRenderAnotherPostCodeForm,
        searchAddressList: aGetAddressList,
        searchSavedAddressList: fRenderSavedDeliveryAddressList,
        showOverlay: fShowOverlay,
        clickHandlers: fClickHandlersDelivery,
        updateOverlay: fUpdateOverlay,
        displayDatePickerOverlay: displayDatePickerOverlay
    };
    return self;
});