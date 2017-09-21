define('modules/order-amendments/amend-delivery-address', [
    'domlib',
    'modules/breakpoint',
    'modules/common',
    'modules/custom-dropdown/common',
    'modules/order-amendments/amend-new-delivery-address',
    'modules/order-amendments/constants',
    'modules/order-amendments/store-change',
    'modules/tesco.analytics'
], function ($, breakpoint, common, dropdown, newAddress, constants, storeChange, analytics) {
    'use strict';

    var init,
        discardChanges,
        onActivation,
        onDeliveryAddressChanged,
        dataLayer,
        loadingSpinney,
        previousValue = null,
        previousIndex = null,
        selectList,
        content,
        currentSection,
        $cachedNewDeliveryAddressMarkup = null,
        $freshNewDeliveryAddressMarkup = null,
        $currentContent = null,
        handleNewDeliveryAddressMarkup,
        clearNewAddressMarkup,
        triggerVirtualPage,
        sNewDeliveryAddressSelector = '.new-address .post-code',
        bFirstLoad = true,
        initialNewAddressMarkupCaching,
        initDropdown,
        deliveryAddress;

    initDropdown = function initDropdown() {
        var dropdownList = currentSection.find('.savedDeliveryAddresses .customDropdown');

        if (dropdownList.length > 0) {
            dropdownList.remove();
        }
        selectList = currentSection.find('.savedDeliveryAddresses select.savedAddressesDropdown');
        selectList.removeClass('been-customised');
        dropdown.init(selectList);
    };

    discardChanges = function discardChanges(bResetNewAddressMarkup) {
        if (selectList !== undefined && selectList !== null && previousValue !== undefined) {
            selectList.val(previousValue);
            selectList[0].selectedIndex = previousIndex;
            var selectedPos = selectList.find('option[selected]').index();
            $(selectList[0].options[previousIndex]).attr('selected', 'selected');
            if(selectedPos !== previousIndex) {
            	$(selectList[0].options[selectedPos]).removeAttr('selected'); // Fix for iOS retaining 0th position.
            }
            $(selectList[0].options[previousIndex]).prop('selected', true);
            if (breakpoint.mobile) {
                currentSection = $('#virtual-page .amendDeliveryAddress');
            }
            initDropdown();

            selectList = null;
        }
        initialNewAddressMarkupCaching();
        if (bResetNewAddressMarkup !== false) {
            clearNewAddressMarkup();
        }
    };

    onActivation = function onActivation() {
        currentSection = $(this);
        if (selectList === undefined || selectList === null) {
            selectList = currentSection.find('.editContent select.savedAddressesDropdown');
        }
        initDropdown();

        selectList.css({
            'margin-left': -((297 / 2) - 4) + 'px',
            'margin-top': '-4px',
            left: '15%',
            height: (currentSection.find('.customDropdown').height()) + 'px'
        });

        if (currentSection.hasClass('isActiveAmendSection')) {
            previousValue = currentSection.find('select.savedAddressesDropdown').val();
            if(previousValue !== undefined) { //only when address is more than 1.
	            previousIndex = currentSection.find('select.savedAddressesDropdown')[0].selectedIndex;
	            $currentContent = currentSection.find('.content');
	            handleNewDeliveryAddressMarkup($currentContent);
            }
        }
    };

    onDeliveryAddressChanged = function onDeliveryAddressChanged() {
        var request = 'amendDeliveryAddress',
            form,
            url,
            DL = new dataLayer.DataLayer(),
            myData,
            previousContent;

        selectList = $(this);

        if (selectList.val() !== previousValue) {
            dropdown.close();
            content = selectList.closest('.content');
            form = selectList.closest('form');
            url = form.data('url');
            myData = form.serialize();

            content.closest('.amendSection').append(loadingSpinney);

            DL.get(url, myData, content, dataLayer.Handlers.Checkout, request,
                function success(result) {
                    if (result.deliveryAddress !== undefined && result.errorType === undefined) {
                        selectList = null;
                        deliveryAddress = result.deliveryAddress;
                        content.find('.deliveryAddress').html(deliveryAddress);
                        content.closest('.amendDeliveryGroup').find('.selectedDate').html(result.updateSelectedDate);
                        content.closest('.amendDeliveryGroup').trigger(constants.EVENTS.ORDER_DETAILS_DELIVERY_DETAILS_AMENDED);
                        content.closest('.amendSection').trigger(constants.EVENTS.ORDER_DETAILS_AMENDED);
                        clearNewAddressMarkup();

                        if (result.amendCourierInstructionContainer !== undefined && result.amendCourierInstructionContainer !== 'undefined') {
                            if (!breakpoint.mobile) {
                                content.closest('.amendDeliveryGroup').find('.amendCourierInstruction').html(result.amendCourierInstructionContainer);
                            } else {
                            	common.virtualPage.courierInstruction = result.amendCourierInstructionContainer; // set courier instruction after closing Virtual Page.
                            }
                        }
                    }

                	if (result.analytics) {
                	    var _oWebAnalytics = new analytics.WebMetrics();
                	    _oWebAnalytics.submit(result.analytics[0]);
                	}

                	if (result.errorType !== undefined) {
                        switch (result.errorType) {
                        case '1':
                            $('.simpleOrderAmend').trigger({
                                type: 'showDialog',
                                dialogConfig: {
                                	className: 'dialogWarning',
                                    content: result.dialogMessage,
                                    buttons: [{
                                        className: 'button tertiary-button buttonDefault buttonOK',
                                        title: 'OK'
                                    }]
                                }
                            });
                            discardChanges(false);
                            return;
                        case '3':
                            previousContent = content.find('.deliveryAddress').html();
                            content.find('.deliveryAddress').html(result.deliveryAddress);
                            $('.simpleOrderAmend').trigger({
                                type: 'showDialog',
                                dialogConfig: {
                                    content: result.dialogMessage,
                                    buttons: [{
                                        className: 'button tertiary-button buttonDefault buttonBack',
                                        title: 'Keep previous address',
                                        callback: function () {
                                            content.find('.deliveryAddress').html(previousContent);
                                            discardChanges();
                                            content.closest('.amendSection').trigger(constants.EVENTS.ORDER_DETAILS_AMENDS_CANCELLED);
                                        }
                                    }, {
                                        className: 'button tertiary-button',
                                        title: 'Change date',
                                        callback: function () {
                                            selectList = null;
                                            content.closest('.amendDeliveryGroup').find('.amendDeliveryDate .content').html(result.updatedDatePickerMarkup);
                                            content.closest('.amendDeliveryGroup').find('.amendDeliveryDate .content .update-button').trigger('click');
                                            content.closest('.amendDeliveryGroup').find('.amendDeliveryDate').data('dateChangeIsRequired', 'true');
                                            content.closest('.amendDeliveryGroup').trigger(constants.EVENTS.ORDER_DETAILS_DELIVERY_DETAILS_AMENDED);
                                        }
                                    }]
                                }
                            });
                            break;
                        }
                    }

                    if (!breakpoint.mobile) {
                        content.closest('.amendSection').removeClass('isActiveAmendSection');
                        content.find('.update-button').trigger("click");
                    } else {
                    	storeChange.common.enableUnsavedChangesConfirmation(); // Enable confirmation button.
                    	common.virtualPage.close();
                    }
                },
                function failure(response) {
                	storeChange.common.errorResponseHandler(response.responseText);
                	content.closest('.amendSection').trigger(constants.EVENTS.ORDER_DETAILS_AMENDS_CANCELLED);
                },
                function complete() {
                    loadingSpinney.detach();
                    //$('.isActiveAmendSection').removeClass('isActiveAmendSection'); //TODO-Remove.
                });
        }
    };

    handleNewDeliveryAddressMarkup = function handleNewDeliveryAddressMarkup($currentContent) {
        if ($cachedNewDeliveryAddressMarkup === null) {
            $freshNewDeliveryAddressMarkup = $currentContent.find(sNewDeliveryAddressSelector).clone(true);
        } else {
            $currentContent.find('.new-address .form-mobile-wrapper').prepend($cachedNewDeliveryAddressMarkup);
            $freshNewDeliveryAddressMarkup = $currentContent.find(sNewDeliveryAddressSelector).clone(true);
            $cachedNewDeliveryAddressMarkup = null;
        }

        $cachedNewDeliveryAddressMarkup = $(sNewDeliveryAddressSelector).length > 0 ? $(sNewDeliveryAddressSelector).first().detach() : null;
        $(sNewDeliveryAddressSelector).remove();

        $currentContent.find('.new-address .form-mobile-wrapper').prepend($freshNewDeliveryAddressMarkup);
        $freshNewDeliveryAddressMarkup.insertBefore($currentContent.find('.new-address .form-mobile-wrapper'));
        if (breakpoint.mobile) {
            triggerVirtualPage();
        }
        $currentContent.find('.post-code').eq(1).remove(); //Removes duplicate post code.
    };

    triggerVirtualPage = function triggerVirtualPage() {
    	var $detachedContent = $('.amendDeliveryAddress.isActiveAmendSection .content').detach();
        //Adding deliveryGroup property to virtualPage so it can be accessed in amend-new-delivery-address.js too
        common.virtualPage.deliveryGroup = $('.amendDeliveryAddress.isActiveAmendSection').closest('.amendDeliveryGroup').attr('id');

        common.virtualPage.show({
            content: '<div class="simpleOrderAmend"><div id="order-summary"><div class="checkout"><div class="amendDeliveryGroup" id="' + common.virtualPage.deliveryGroup + '"><div class="amendSection amendDeliveryAddress isActiveAmendSection"></div></div></div></div></div>',
            title: 'Change Delivery Address',
            showBack: true,
            customClass: 'amendDeliveryAddress',
            callbackReady: function () {
                $('#virtual-page .isActiveAmendSection').append($detachedContent);
                $('#virtual-page .savedDeliveryAddresses').on('change', 'select.savedAddressesDropdown', onDeliveryAddressChanged);
                $('#virtualPageBackBtn').html('<span class="icon" data-icon="g" aria-hidden="true"></span> Cancel');
            },
            beforeRemoval: function () {
            	$('#virtual-page .savedDeliveryAddresses').off('change');
                var $extractVirtualPageContent = $('#virtual-page .amendDeliveryAddress.isActiveAmendSection .content').detach(),
                    $activeContentContainer = $('#order-details #' + common.virtualPage.deliveryGroup + ' .amendDeliveryAddress.isActiveAmendSection');

                $activeContentContainer.append($extractVirtualPageContent);
                $activeContentContainer.find('.update-button').trigger("click");
                $activeContentContainer.trigger(constants.EVENTS.ORDER_DETAILS_AMENDS_CANCELLED);
                $activeContentContainer.removeClass('isActiveAmendSection');
                $detachedContent = null;
            },
            callbackOut: function() { // set data after virtual page is closed.
            	$('#order-details #' + common.virtualPage.deliveryGroup + ' .deliveryAddress').html(deliveryAddress);
            	$('#order-details #' + common.virtualPage.deliveryGroup + ' .amendCourierInstruction').html(common.virtualPage.courierInstruction);
            	deliveryAddress = undefined;
            	common.virtualPage.courierInstruction = undefined;
            }
        });
    };

    initialNewAddressMarkupCaching = function initialNewAddressMarkupCaching() {
        $currentContent = $('#order-details .isActiveAmendSection .content');
        if (bFirstLoad) {
            if ($cachedNewDeliveryAddressMarkup === null) {
                $freshNewDeliveryAddressMarkup = $currentContent.find(sNewDeliveryAddressSelector).clone(true);
                $cachedNewDeliveryAddressMarkup = $(sNewDeliveryAddressSelector).length > 0 ? $(sNewDeliveryAddressSelector).first().detach() : null;
                $(sNewDeliveryAddressSelector).remove();
            }
            bFirstLoad = false;
        }
    };

    clearNewAddressMarkup = function clearNewAddressMarkup() {
        if ($(sNewDeliveryAddressSelector).length > 0) {
            $(sNewDeliveryAddressSelector).remove();
        }
    };

    init = function init(data) {
        var amendDeliveryAddressSections = $('.amendDeliveryAddress').filter(function () {
            return $(this).find('.savedDeliveryAddresses').length !== 0;
        });

        if ($('.amendDeliveryAddress').length) {
            newAddress.init();
        }

        dataLayer = data;
        loadingSpinney = $('<div class="loader">Updating your address...</div>');
        amendDeliveryAddressSections.on('change', 'select.savedAddressesDropdown', onDeliveryAddressChanged);
        $(".amendDeliveryGroup").on(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_DISCARDED, '.isActiveAmendSection', discardChanges);
        amendDeliveryAddressSections.on(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_ACTIVE, onActivation);
    };

    return {
        init: init
    };
});