/* eslint-disable */

define('modules/order-amendments/store-change',
		['domlib', 
		 'modules/breakpoint', 
		 'modules/common', 
		 'modules/ajax/common', 
		 'modules/checkout/delivery/stores', 
		 'modules/checkout/delivery/store-details', 
		 'modules/tesco.data', 
		 'modules/order-amendments/constants', 
		 'modules/order-amendments/common'],
	    function ($, breakpoint, common, ajax, stores, storeDetails, data, constants, orderAmends) {
	        'use strict';
	
	    var storeChange = {},
	        bStoreAmendmentDependantsReady = false,
	        getFormDataFromHiddenInputs,
	        handleStoreInfoResponse,
	        initializeAjaxFramework,
	        initializeStoreAmendmentDependants,
	        parseResponseString,
	        requestStoreInfoForShippingGroup,
	        initializeStoreAddressChange,
	        updateStoreAddress,
	        updateSelectedStore,
	        showVirtualPage,
	        isStoreAddressTheSame,
	        injectOldStoreAddress,
	        cacheChangeStoreFormForMobile,
	        handleChangeStoreFormInDom,
	        retrieveChangeStoreFormInDom,
	        setupStoreChangeListener,
	        oChangeStoreCacheForMobile = {},
	        discardPendingChanges,
	        refreshDomReferences,
	        refreshActionForStoreDetails,
	        refreshActionForViewMoreStores,
	        refreshActionForStoresRadioButtons,
	        refreshFocusHandlerForPostcodeForm,
	        toggleFormVisibility,
	        getShippingGroupId,
	        currentVirtualPageInstance,
	        isPostcodeSearchResponse,
	        DEFAULT_SPINNY_TEXT = 'Updating your store...',
	        $loadingSpinny = $('<div class="loader"></div>'),
	        showLoadingSpinny,
	        selectors = {
	            wrapper: {
	                storesCustomRadioButtons: '#wrapper.simpleOrderAmend .stores .custom-radio'
	            },
	            virtualPage: {
	                loader: '#virtual-page.amendStoreAddress .loader',
	                deliveryOptionsContainer: '#virtual-page.amendStoreAddress .delivery-options',
	                stores: '#virtual-page .stores-container',
	                storesCustomRadioButtons: '#virtual-page.amendStoreAddress .stores .custom-radio',
	                storeDetailsLinks: '.store-options-module .stores .details'
				},
				storeAddress: 'div.adr'
	        },
	        $content,
	        storeChangeSelected,
	        isSelected = false,
	        closeOnUpdated;
	
	    showLoadingSpinny = function showLoadingSpinny(elementToAppendTo, text) {
	        if (text !== undefined) {
	            $loadingSpinny.html(text);
	        } else {
	            $loadingSpinny.html(DEFAULT_SPINNY_TEXT);
	        }
	        elementToAppendTo.append($loadingSpinny);
	    };
	
	    closeOnUpdated = function closeOnUpdated(event) {
	        $loadingSpinny.detach();
	        $content.closest('.amendSection').trigger(event).removeClass('isActiveAmendSection');
	        $content.find('.update-button').removeClass('active').html("Change");
	    };
	    
	    storeChangeSelected = function storeChangeSelected() {
	    	isSelected = true;
	    }
	
	    injectOldStoreAddress = function injectOldStoreAddress($container, id) {
	        var addressUpdated = false;
	
	        if (oChangeStoreCacheForMobile[id] && oChangeStoreCacheForMobile[id].oldAddress) {
	            $container.html(oChangeStoreCacheForMobile[id].oldAddress.toLowerCase());
	            addressUpdated = true;
	        }
	        return addressUpdated;
	    };
	
	    updateStoreAddress = function updateStoreAddress($button, sDeliveryOptionId) {
	        var $collectionAddressContainer = $button.closest('.content').find('.collectionAddress'),
	            cachedNewAddress = oChangeStoreCacheForMobile[sDeliveryOptionId].newAddress.html() || '',
	            newAddress = '<p>' + cachedNewAddress.toLowerCase() + '</p>',
	            oldAddress = $collectionAddressContainer.html();
	
	        if (cachedNewAddress !== '' && !isStoreAddressTheSame(oldAddress, newAddress)) {
	            oChangeStoreCacheForMobile[sDeliveryOptionId].oldAddress = oldAddress;
	            $collectionAddressContainer.html(newAddress);
	        }
	        
        	if (isSelected) {
        		closeOnUpdated(constants.EVENTS.ORDER_DETAILS_AMENDED);
			} else {
			closeOnUpdated(constants.EVENTS.ORDER_DETAILS_AMENDS_CANCELLED);
			}
        	history.back();//dirty hack
	    };
	
	    cacheChangeStoreFormForMobile = function cacheChangeStoreFormForMobile($button, sDeliveryOptionId) {
	        if (!oChangeStoreCacheForMobile[sDeliveryOptionId]) {
	            oChangeStoreCacheForMobile[sDeliveryOptionId] = {};
	        }
	        oChangeStoreCacheForMobile[sDeliveryOptionId].form = $button.closest('.amendDeliveryGroup').find('.amendAddressForm').html();
	    };
	
	    initializeStoreAddressChange = function initializeStoreAddressChange(e) {
	        $content = $(this).find('.content');
	        var $button = $content.find('.update-button'),
	            $storeSelectionForm = $content.find('.delivery-block form');
	
	        e.preventDefault();
	        e.stopPropagation();
	
	        updateSelectedStore($storeSelectionForm, $button);
	    };
	
	    requestStoreInfoForShippingGroup = function requestStoreInfoForShippingGroup(params) {
	        showLoadingSpinny($content.closest('.isActiveAmendSection'));
	        ajax.post({
	            url: params.url,
	            data: params.data || {},
	            callbacks: {
	                success: function (response) {
	                    var successCallbackParams = {
	                        button: params.button,
	                        renderInVirtualBox: params.renderInVirtualBox,
	                        virtualPage: params.virtualPage,
	                        shippingGroupId: params.shippingGroupId
	                    };
	                    if (params.callback) {
	                        params.callback(response, successCallbackParams);
	                    }
	                },
	                error: function (response) {
	                    storeChange.common.errorResponseHandler(response.responseText);
	                    closeOnUpdated(constants.EVENTS.ORDER_DETAILS_AMENDS_CANCELLED);
	                },
	                complete: function () {
	                    $loadingSpinny.detach();
	                }
	            }
	        });
	    };
	
	    handleStoreInfoResponse = function handleStoreInfoResponse(response, params) {
	        var oData;
	
	        try {
	            oData = parseResponseString(response);
	        } catch (e) {
	            storeChange.common.errorResponseHandler(response);
	            return;
	        }
	
	        var deliveryOptionId = 'dg-delivery-option-' + params.shippingGroupId,
	            storesHtml = oData[deliveryOptionId],
	            $deliveryOptionsContainer = $('#' + deliveryOptionId);
	
	        if (params.renderInVirtualBox) {
	            $deliveryOptionsContainer = $(selectors.virtualPage.deliveryOptionsContainer);
	        }
	        $deliveryOptionsContainer.html(storesHtml);
	        initializeStoreAmendmentDependants();
	        $(selectors.virtualPage.loader).remove();
	        refreshDomReferences();
	
	        if (breakpoint.mobile) {
	            if (params.virtualPage) {
	                currentVirtualPageInstance = params.virtualPage;
	            }
	        }
	    };
	
	    getFormDataFromHiddenInputs = function getFormDataFromHiddenInputs($form) {
	        var y, aShippingGroupFormHiddenFields = $('input[type=hidden]', $form),
	            iNumberOfHiddenFields = aShippingGroupFormHiddenFields.length,
	            oHiddenData = {};
	
	        for (y = 0; y < iNumberOfHiddenFields; y++) {
	            oHiddenData[aShippingGroupFormHiddenFields[y].name] = aShippingGroupFormHiddenFields[y].value;
	        }
	
	        return oHiddenData;
	    };
	
	    updateSelectedStore = function updateSelectedStore($storeSelectionForm, $button) {
	
	        var oShippingGroupFormData = getFormDataFromHiddenInputs($storeSelectionForm),
	            storeFormInfo = {
	                shippingGroupId: $storeSelectionForm.attr('id'),
	                url: $storeSelectionForm.attr('action'),
	                data: oShippingGroupFormData,
	                button: $button,
	                callback: handleStoreInfoResponse
	            };
	
	        if (!breakpoint.mobile) {
	            requestStoreInfoForShippingGroup(storeFormInfo);
	        } else {
	            handleChangeStoreFormInDom($button, storeFormInfo);
	        }
	    };
	
	    retrieveChangeStoreFormInDom = function retrieveChangeStoreFormInDom(sDeliveryOptionId) {
	        var $amendAddressFormContainer = $('#removed-' + sDeliveryOptionId).closest('.amendAddressForm');
	        $amendAddressFormContainer.html(oChangeStoreCacheForMobile[sDeliveryOptionId].form);
	        //$amendAddressFormContainer.find('.loader').remove();
	    };
	
	    handleChangeStoreFormInDom = function handleChangeStoreFormInDom($button, storeFormInfo) {
	        var $amendAddressFormContainer = $button.closest('.amendDeliveryGroup').find('.amendAddressForm'),
	            sDeliveryOptionId = $amendAddressFormContainer.find('.delivery-options').attr('id');
	
	        cacheChangeStoreFormForMobile($button, sDeliveryOptionId);
	
	        $amendAddressFormContainer.html('<span id="removed-' + sDeliveryOptionId + '">Content moved to Virtual Page</span>');
	        //Due to dependency on existing module returning e in virtual page callback
	        /*jslint unparam: true*/
	        showVirtualPage({
	            content: '<div class="simpleOrderAmend"><div id="order-summary"><div class="checkout"><div class="amendSection"><div class="content"><div class="delivery-group-block"><div class="amendAddressForm">' + oChangeStoreCacheForMobile[sDeliveryOptionId].form + '</div></div></div></div></div></div></div>',
	            title: 'Collection address',
	            showBack: true,
	            customClass: 'amendStoreAddress',
	            callbackReady: function (page, e, instance) {
	                $('#virtualPageBackBtn').html('<span class="icon" data-icon="g" aria-hidden="true"></span> Cancel');
	                storeFormInfo.renderInVirtualBox = true;
	                storeFormInfo.virtualPage = instance;
	                isSelected = false;
	                requestStoreInfoForShippingGroup(storeFormInfo);
	            },
	            beforeRemoval: function () {
	                oChangeStoreCacheForMobile[sDeliveryOptionId].newAddress = $(selectors.virtualPage.stores).find('.custom-radio.checked').closest('li').find(selectors.storeAddress);
	                retrieveChangeStoreFormInDom(sDeliveryOptionId);
	                updateStoreAddress($button, sDeliveryOptionId);
	            }
	        });
	        /*jslint unparam: false*/
	    };
	
	    initializeAjaxFramework = function initializeAjaxFramework() {
	        data.Global.init({
	            'inlineRequests': {},
	            'requests': {
	                'selectDeliveryOptionStore': ['deliveryCostAll', 'deliveryOptionsAll', 'loadBCVEBlock', 'loadBCVEInfo', 'storeCollectionTime', 'totalCost'],
	                'updateCollectionTime': ['deliveryCost', 'storeCollectionTime', 'totalCost'],
	                'storeSearch': ['searchStore', 'deliveryCost', 'totalCost']
	            },
	            'modules': {
	                'deliveryCost': ['div.delivery-cost-module', '', false],
	                'deliveryCostAll': ['div.delivery-cost-module', '', true],
	                'deliveryOptionsAll': ['.delivery-options', 'Updating your store...', true, false],
	                'loadBCVEBlock': ['div#bcve-ecoupon-voucher-details', 'Updating your voucher details'],
	                'loadBCVEInfo': ['p.bcve-block-text', 'Updating message', true],
	                'storeCollectionTime': ['.collection-time', 'Searching for your collection time', false],
	                'searchStore': ['div.store-search-form', 'Finding your nearest stores', false],
	                'totalCost': ['#totalCost', '', true]
	            },
	            'actions': {
	                'updateCollectionTime': ['/stubs/get-store-collection-time.php']
	            }
	        });
	    };
	
	
	    initializeStoreAmendmentDependants = function initializeStoreAmendmentDependants() {
	        var params = {
	            optionSelectors: selectors.wrapper.storesCustomRadioButtons + ', ' + selectors.virtualPage.storesCustomRadioButtons,
	            refreshViewMoreStores: true
	        };
	        if (storeChange.common.isItSimpleOrderAmendPage() && !bStoreAmendmentDependantsReady) {
	            storeDetails.init();
	            stores.init(params);
	            bStoreAmendmentDependantsReady = true;
	        }
	    };
	
	    parseResponseString = function parseResponseString(response) {
	        return (typeof response === 'string') ? JSON.parse(response) : response;
	    };
	
	    isStoreAddressTheSame = function isStoreAddressTheSame(oldAddress, newAddress) {
	        return oldAddress.replace(/ /g, '').replace(/(?:\r\n|\r|\n)/g, '').toLowerCase() === newAddress.replace(/ /g, '').replace(/(?:\r\n|\r|\n)/g, '').toLowerCase();
	    };
	
	    showVirtualPage = function showVirtualPage(params) {
	        common.virtualPage.show(params);
	    };
	
	    discardPendingChanges = function discardPendingChanges($link) {
	        var $collectionAddress = $link ? $link.closest('.amendSection').find('.collectionAddress') : $('.collectionAddress');
	
	        $collectionAddress.each(function () {
	            var $storeChange = $(this),
	                $deliveryOptions = $storeChange.closest('.amendSection').find('.delivery-options');
	
	            injectOldStoreAddress($(this), $deliveryOptions.attr('id'));
	        });
	
	    };
	
	    getShippingGroupId = function getShippingGroupId(json) {
	        var key,
	            id = null,
	            prefix = 'dg-delivery-option-';
	        for (key in json) {
	            if (json.hasOwnProperty(key) && key.indexOf(prefix) !== -1) {
	                id = key.replace(prefix, '');
	            }
	        }
	        return id;
	    };
	
	    isPostcodeSearchResponse = function isPostcodeSearchResponse(response) {
	        return response.analytics.length && response.analytics[0].prop27;
	    };
	
	    toggleFormVisibility = function toggleFormVisibility(ajaxResponse) {
	        var responseData = JSON.parse(ajaxResponse.responseText),
	            shippingGroupId = getShippingGroupId(responseData),
	            $deliveryGroup = $('#dg-delivery-option-' + shippingGroupId).closest('.delivery-group-block'),
	            sDeliveryOptionId = 'dg-delivery-option-' + shippingGroupId,
	            $collectionAddress = $deliveryGroup.find('.collectionAddress'),
	            $stores = $deliveryGroup.find('.stores-container'),
	            addressMarkup = $stores.find('.custom-radio.checked').closest('li').find(selectors.storeAddress).html();
	
	        if (!isPostcodeSearchResponse(responseData)) {
	            oChangeStoreCacheForMobile[sDeliveryOptionId] = oChangeStoreCacheForMobile[sDeliveryOptionId] || {};
	            oChangeStoreCacheForMobile[sDeliveryOptionId].oldAddress = $collectionAddress.html();
	
	            $collectionAddress.children('p').html(addressMarkup.toLowerCase());
	
	            if (currentVirtualPageInstance) {
	                currentVirtualPageInstance.close();
	            }
	
	            closeOnUpdated(constants.EVENTS.ORDER_DETAILS_AMENDED);
	            storeChange.common.enableUnsavedChangesConfirmation();
	        }
	    };
	
	    setupStoreChangeListener = function setupStoreChangeListener() {
	        $('.amendDeliveryGroup').on('customRadioClick', function (e) {
	            showLoadingSpinny($(e.target).closest('.isActiveAmendSection'), 'Updating your store...');
	        });
	        //Due to event triggering returning always event as a first param
	        /*jslint unparam: true*/
	        $(document).on(constants.EVENTS.ORDER_DETAILS_STORE_CHANGE_SUCCESSFUL, function (e, ajaxResponse) {
	            if (storeChange.common.isItSimpleOrderAmendPage()) {
	                toggleFormVisibility(ajaxResponse);
	                refreshDomReferences();
	            }
	        });
	        /*jslint unparam: false*/
	    };
	
	    refreshActionForStoreDetails = function refreshActionForStoreDetails() {
	        $(selectors.virtualPage.storeDetailsLinks).off().on('tap click', function (e) {
	            e.preventDefault();
	            e.stopPropagation();
	            storeDetails.toggle(e, {
	                removePrevious: true
	            });
	        });
	    };
	
	    refreshActionForStoresRadioButtons = function refreshActionForStoresRadioButtons() {
	        $(selectors.virtualPage.storesCustomRadioButtons).off().on('tap click', function (e) {
	            e.preventDefault();
	            e.stopPropagation();
	            storeChangeSelected();
	            $('[name=store-selection]').removeAttr('checked');
	            $(e.target).closest('li').find('input[name=store-selection]').prop('checked', true).trigger('change');
	            stores.get(e, false, false);
	        });
	    };
	
	    refreshActionForViewMoreStores = function refreshActionForViewMoreStores() {
	        $('.view-more-stores').off().on('tap click', function (e) {
	            e.preventDefault();
	            e.stopPropagation();
	            stores.toggleViewMore(e);
	        });
	    };
	
	    refreshFocusHandlerForPostcodeForm = function refreshFocusHandlerForPostcodeForm() {
	        var postalCodeFormOffset,
	            $postalCodeForm = $('#store-finder-postalcode'),
	            $virtualPage = $('#virtual-page'),
	            $virtualPageInner = $('.simpleOrderAmend', $virtualPage),
	            virtualPageCurrentHeight = parseInt($virtualPage.height(), 10),
	            virtualPageInnerHeight = parseInt($virtualPageInner.height(), 10);
	
	        if (breakpoint.mobile && common.isAndroid() && $virtualPage.length && storeChange.common.isItSimpleOrderAmendPage()) {
	            $postalCodeForm.off('focus').on('focus', function () {
	                postalCodeFormOffset = $(this).offset();
	                $virtualPageInner.height(virtualPageCurrentHeight);
	                $virtualPage.height(virtualPageCurrentHeight * 0.63).scrollTop(postalCodeFormOffset.top - 15);
	            });
	
	            $postalCodeForm.off('blur').on('blur', function () {
	                $virtualPageInner.height(virtualPageInnerHeight);
	                $virtualPage.height(virtualPageCurrentHeight).scrollTop();
	            });
	
	        }
	    };
	
	    refreshDomReferences = function refreshDomReferences() {
	        common.customRadio('.checkout');
	        stores.validation($('.store-search-form #store-search-submit').closest('.amendAddressForm'));
	        refreshActionForStoreDetails();
	        refreshActionForViewMoreStores();
	        refreshActionForStoresRadioButtons();
	        refreshFocusHandlerForPostcodeForm();
	    };
	
	    storeChange.discardPendingChanges = discardPendingChanges;
	    storeChange.retrieveChangeStoreFormInDom = retrieveChangeStoreFormInDom;
	
	    storeChange.init = function init() {
	        var amendDeliveryAddressSections = $('.amendDeliveryAddress').filter(function () {
	            return $(this).find('.collectionAddress').length !== 0;
	        });
	
	        setupStoreChangeListener();
	        initializeAjaxFramework();
	        amendDeliveryAddressSections.on(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_ACTIVE, initializeStoreAddressChange);
	    };
	
	    return storeChange;
	
	});