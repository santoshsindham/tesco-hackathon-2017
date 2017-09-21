/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require */
define('modules/chip-and-pin/delivery-store', ['domlib', 'modules/settings/common', 'modules/mvapi/common', 'modules/ajax/common', 'modules/overlay/common', 'modules/validation', 'modules/chip-and-pin/delivery-group', 'modules/chip-and-pin/bundles', 'modules/chip-and-pin/atg-data', 'modules/chip-and-pin/accordion', 'modules/chip-and-pin/delivery-home','modules/chip-and-pin/kmf-io'], function($, SETTINGS, mvApi, ajax, overlay, validationExtras, deliveryGroup, bundles, atg, accordion, homeDelivery, kmfIO) {
    'use strict';

    var storeCollect,
        extendWithAtgData,
        overlayParams,
        verifyPostcodeRequest,
        verifyPostcodeRequestCallback,
        renderMatchingStoresOverlayLayout,
        toggleOverlayClass,
        bindMatchingStoresOverlayEvents,
        renderMatchingStoresOverlayContent,
        renderStoreDetails,
        bindStoreFinderFormEvents,
        renderStoreFinderOverlayContent,
        renderStoreFinderOverlayLayout,
        displayStoreFinderOverlay,
        setupStoreFinderFormValidation,
        bindSelectStoreClick,
        selectedStoreCallback,
        renderStoreDetailsCallback,
        updateSearchedBeforeStatus,
        getStatusOfSearchResultsUpdated,
        searchResultsUpdated = false,
        searchedBefore = false,
        sendRequest,
        setClickAndCollectPostcode,
        clickAndCollectPostcode = '',
        roundDrivingDistance;

    sendRequest = function sendRequest(data, callback) {
        var requestData = {
            url: SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            data: data,
            callbacks: {
                success: callback
            }
        };
        ajax.post(requestData);
    };

    selectedStoreCallback = function selectedStoreCallback(response) {
        response = JSON.parse(response);

        var i,
            oStore = mvApi.getModel('storeDetails');

        if (response.isDeliveryDateRequired && response.isDeliveryDateRequired === "true") {
            homeDelivery.displayDatePickerOverlay(response);
        } else {
            if (response.header && response.header.success === true) {
                for (i = 0; i < oStore.collection.items.length; i++) {
                    if (oStore.collection.items[i].ID === response.storeID) {
                        oStore.collection.items[i].isSelected = true;
                        deliveryGroup.setStoreInformation(oStore.collection.items[i]);
                    }
                }
            }

            deliveryGroup.setCompleted();
            deliveryGroup.handleDeliveryGroup();

            overlay.hide();
        }
    };

    bindSelectStoreClick = function bindSelectStoreClick() {
        var shippingGroupId = deliveryGroup.getCurrentDeliveryGroupID() === undefined ? 'sg54160004' : deliveryGroup.getCurrentDeliveryGroupID(),
            storeDetailsModel = mvApi.getModel('storeDetails');

        $('.storeContainer form').off().submit(function(e) {
            e.preventDefault();

            var storeId = $(this).find('.fnSubmitStoreSelection').data('storeid') === undefined ? '2661' : $(this).find('.fnSubmitStoreSelection').data('storeid'),
                data = {
                    'id': 'selectedStore'
                };

            if (storeDetailsModel.atgData) {
                $.extend(data, storeDetailsModel.atgData);
            }

            data.storeId = storeId;
            data.shippingGroupId = shippingGroupId;

            sendRequest(data, selectedStoreCallback);
        });
    };

    setClickAndCollectPostcode = function setClickAndCollectPostcode() {
        var currentDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup();

        if (currentDeliveryGroup.clickAndCollectPostCode !== 'undefined') {
            clickAndCollectPostcode = currentDeliveryGroup.clickAndCollectPostCode;
        }
    };

    roundDrivingDistance = function roundDrivingDistance($el) {
        var distance;

        if ($el.length) {
            $el.each(function() {
                distance = $(this).text();
                $(this).text(parseFloat(Math.round(distance * 100) / 100));
            });
        }
    };

    renderStoreDetailsCallback = function renderStoreDetailsCallback() {
        roundDrivingDistance($('p.distance span.value'));
        accordion.setAccordion($('.storeDetailsList').find('.accordionItem:not(".disabled")'));
        bindSelectStoreClick();
    };

    renderStoreDetails = function renderStoreDetails(oStore) {
        mvApi.render('storeDetails', oStore, renderStoreDetailsCallback);
    };

    bindMatchingStoresOverlayEvents = function bindMatchingStoresOverlayEvents() {
        var modelChange = {
            'defaults': {
                'overlayHeader': bundles['spc.chipAndPin.delivery.storeFinderOverlayHeader'] || 'Find a store'
            }
        };

        $('.fnFindAnotherStore').off().click(function(e) {
            e.preventDefault();
            mvApi.render('overlayLayout', modelChange, renderStoreFinderOverlayContent);
            toggleOverlayClass();
        });
    };

    renderMatchingStoresOverlayContent = function renderMatchingStoresOverlayContent(oStores) {
        mvApi.render('renderClosestStoreContent', bindMatchingStoresOverlayEvents);
        renderStoreDetails(oStores);
    };

    toggleOverlayClass = function toggleOverlayClass() {
        if ($('.storeFinderOverlay').length) {
            $('.storeFinderOverlay').removeClass('storeFinderOverlay').addClass('matchingStoresOverlay');
        } else if ($('.matchingStoresOverlay').length) {
            $('.matchingStoresOverlay').removeClass('matchingStoresOverlay').addClass('storeFinderOverlay');
        }
    };

    renderMatchingStoresOverlayLayout = function renderMatchingStoresOverlayLayout(oStores) {
        var modelChange = {
            'defaults': {
                'overlayHeader': bundles['spc.chipAndPin.delivery.matchingStoresOverlayHeader'] || 'Select a store'
            }
        };

        mvApi.navigateTo('delivery&selectAnotherStore', false);
        mvApi.render('overlayLayout', modelChange, toggleOverlayClass);
        renderMatchingStoresOverlayContent(oStores);
    };

    verifyPostcodeRequestCallback = function verifyPostcodeRequestCallback(response) {
        var oStore = mvApi.getModel('storeDetails');
        response = JSON.parse(response);

        if (response && response.header.success === true) {
            oStore.collection.items = response.stores;
            renderMatchingStoresOverlayLayout(oStore);
            searchResultsUpdated = true;
        }

        if (response.atgData) {
            $.extend(oStore, atg.parse(response.atgData));
        }

        bindStoreFinderFormEvents();
    };

    verifyPostcodeRequest = function verifyPostcodeRequest() {
        var shippingGroupId = deliveryGroup.getCurrentDeliveryGroupID() === undefined ? 'sg54160004' : deliveryGroup.getCurrentDeliveryGroupID(),
            storePostcodeInputFieldName = $('.fnPostcode').attr('name'),
            postcode = $('.fnPostcode').val(),
            data = {
                'id': 'selectDeliveryOptionStore'
            },
            findStoreFormModel = mvApi.getModel('findStoreForm');

        if (findStoreFormModel.atgData) {
            $.extend(data, findStoreFormModel.atgData);
        }

        data[storePostcodeInputFieldName] = postcode;
        data.shippingGroupId = shippingGroupId;

        sendRequest(data, verifyPostcodeRequestCallback);
    };

    setupStoreFinderFormValidation = function setupStoreFinderFormValidation() {

        validationExtras.customMethods.postcodeTownCombo();

        var $form = $('.storeFinderFormWrapper form'),
            formRules = {},
            formMessages = {},
            postcodeName = $('.kiosk-lightbox').find('.fnPostcode').attr('name');

        formRules[postcodeName] = {
            required: true,
            minlength: 3,
            postcodeTownCombo: true
        };

        formMessages[postcodeName] = {
            required: bundles['spc.chipAndPin.delivery.postcodeError'] || 'Please enter a valid town or postcode.'
        };

        $form.validate({
            ignore: "",
            onkeyup: function(e) {
                if (this.check(e)) {
                    $(e).addClass('valid');
                } else {
                    $(e).removeClass('valid');
                }
            },
            focusInvalid: true,
            onfocusout: false,
            errorElement: 'span',
            showErrors: function() {
                this.defaultShowErrors();
            },
            errorPlacement: function(error, element) {
                switch (element.attr("name")) {
                case 'dynamic-field-name':
                    error.insertAfter(element.parents('form').find('.fnSubmitStoreFinderForm'));
                    break;
                default:
                    error.insertBefore(validationExtras.errorPlacementElement(element));
                }
            },
            rules: formRules,
            messages: formMessages
        });
    };

    bindStoreFinderFormEvents = function bindStoreFinderFormEvents() {
        var $storeFinderForm = $('.storeFinderFormWrapper form'),
            $storeFinderPostcode = $('.fnPostcode');

        $storeFinderForm.off().submit(function(e) {
            e.preventDefault();
            if ($storeFinderForm.valid()) {
            	kmfIO.hideKeyboard();
                verifyPostcodeRequest();
            }
        });

        require(['modules/chip-and-pin/delivery'], function(delivery) {
            delivery.clearAllActiveOptions();
        });

        if (clickAndCollectPostcode !== '' && searchedBefore === false) {
            $storeFinderPostcode.val(clickAndCollectPostcode);
            $storeFinderPostcode.addClass('valid');
        }
        
        if($('.fnPostcode').length){
	        kmfIO.showKeyboard();
	        $storeFinderPostcode.focus();
        }

        setupStoreFinderFormValidation();
    };

    renderStoreFinderOverlayContent = function renderStoreFinderOverlayContent() {
        var modelChange = {
            request: {
                data: {
                    id: 'selectDeliveryOptionStore'
                },
                url: SETTINGS.CONSTANTS.URL.KIOSK_DATA + '?ssb_block=find-store'
            }
        };
        modelChange.request.data = extendWithAtgData('findStoreForm', modelChange.request.data);
        mvApi.render('findStoreForm', modelChange, bindStoreFinderFormEvents);
    };

    renderStoreFinderOverlayLayout = function renderStoreFinderOverlayLayout() {
        var modelChange = {
            'defaults': {
                'overlayHeader': bundles['spc.chipAndPin.delivery.storeFinderOverlayHeader'] || 'Find a store'
            }
        };
        mvApi.render('overlayLayout', modelChange, renderStoreFinderOverlayContent);
    };

    getStatusOfSearchResultsUpdated = function getStatusOfSearchResultsUpdated() {
        return searchResultsUpdated;
    };

    updateSearchedBeforeStatus = function updateSearchedBeforeStatus(status) {
        searchedBefore = status;
    };

    displayStoreFinderOverlay = function displayStoreFinderOverlay() {
        overlayParams = {
            content: '<div class="kiosk-lightbox"></div>',
            hideOnOverlayClick: true,
            onHideCallback: function() {
                mvApi.navigateTo('delivery', true, false);
            },
            customClass: 'storeFinderOverlay',
            callback: function() {
                if (searchedBefore) {
                    renderMatchingStoresOverlayLayout();
                } else {
                    renderStoreFinderOverlayLayout();
                }
            }
        };
        overlay.show(overlayParams);
        setClickAndCollectPostcode();
    };

    extendWithAtgData = function extendWithAtgData(id, data) {
        var model = mvApi.getModel(id);
        if (model && data) {
            $.extend(data, model.atgData);
        }
        return data;
    };

    storeCollect = {
        displayFindStoreOverlay: displayStoreFinderOverlay,
        getStatusOfSearchResultsUpdated: getStatusOfSearchResultsUpdated,
        updateSearchedBeforeStatus: updateSearchedBeforeStatus
    };

    return storeCollect;
});