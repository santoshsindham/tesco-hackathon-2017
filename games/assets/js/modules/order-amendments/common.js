define('modules/order-amendments/common',
		['domlib',
		    'modules/tesco.data',
		    'modules/order-amendments/store-change',
		    'modules/order-amendments/amend-delivery-address',
		    'modules/breakpoint',
		    'modules/dialog-box/common',
		    'modules/order-amendments/date-change',
		    'modules/order-amendments/courier-instruction-change',
		    'modules/order-amendments/amend-confirm',
		    'modules/order-amendments/constants',
		    'modules/tesco.utils',
		    'modules/tesco.data',
		    'modules/custom-dropdown/common',
		    'modules/tesco.analytics'],
    function ($, dataLayer, storeChange, amendDeliveryAddress, breakpoint, dialogBox, dateChange, courierInstructionChange, amendConfirm, constants, utils, data, dropdown, analytics) {

		'use strict';

        var disableUnsavedChangesConfirmation,
            enableUnsavedChangesConfirmation,
            initStoreChangeModule,
            setupViewportChangeHandler,
            setupConfirmChangesFormHandler,
            discardAllPendingChanges,
            isItSimpleOrderAmendPage,
            bUnsavedChangesConfirmationEnabled = false,
            onUpdateButtonClicked,
            onShowDialog,
            initAjaxFramework,
            initCourierInstructionChangeModule,
            scrollBackToDeliveryGroup,
            initResetData,
            prepareResetData,
            sendResetDataRequest,
            $loadingSpinney = $('<div class="loader">Updating your address...</div>'),
            scrollToLinks,
            unwrapElements,
            isRegistrationPage,
            errorResponseHandler,
            unKnownError;

        initAjaxFramework = function initAjaxFramework() {
            dataLayer.Global.init({
                'inlineRequests': {},
                'requests': {
                    'amendDeliveryAddress': ['deliveryAddress'],
                    'addNewAddress': ['addNewAddress']
                },
                'modules': {
                    'deliveryAddress': ['div.deliveryAddress', 'Updating your delivery address', false],
                    'dialogMessage': ['.simpleOrderAmend', '', false],
                    'errorType': ['.simpleOrderAmend', '', false],
                    'amendCourierInstructionContainer': ['.amendCourierInstruction', '', false],
                    'amendCourierInstructionAlert': ['.amendCourierInstruction', '', false],
                    'addNewAddress': ['', '', false],
                    'updatedDatePickerMarkup': ['', '', false],
                    'updateCourierInstructionsMarkup': ['', '', false],
                    'updateSelectedDate': ['', '', false]
                },
                'actions': {
                    'amendDeliveryAddress': ['/stubs/order-amends-change-delivery-address.php'],
                    'addNewAddress': ['/stubs/order-amends-reset-delivery-details.php']
                }
            });
        };

        scrollBackToDeliveryGroup = function scrollBackToDeliveryGroup(event) {

            $('html, body').animate({
                scrollTop: $(event.target).closest('.amendDeliveryGroup').offset().top
            });
        };

        onShowDialog = function onShowDialog(event) {
            dialogBox.showDialog(event.dialogConfig);
            if ($('#virtual-page').length) { // to bring dialog over virtual dialog.
                $('#overlay').css('z-index', 99999);
                $('#lightbox').css('z-index', 999999);
            }

            if (event.dialogConfig.className === 'dialogWarning') { // push all errors to omniture.
                var v = {};
                v.events = 'event41';
                v.eVar48 = event.dialogConfig.content;
                var _oWebAnalytics = new analytics.WebMetrics();
                _oWebAnalytics.submit([v]);
            }
        };

        onUpdateButtonClicked = function onUpdateButtonClicked() {
            var btn = $(this),
                deliveryGroupID = btn.closest(".amendDeliveryGroup").attr("id"),
                deliveryAddress = $('#' + deliveryGroupID + ' div.amendDeliveryAddress');

            //Child modules subscribe to this event and handle their own discard changes code
            //See amend-delivery-address
            $(".isActiveAmendSection").trigger(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_DISCARDED);

            deliveryAddress.find("div.new-address").hide();
            deliveryAddress.find('div.form-actions .save').hide();

            if (btn.hasClass("active")) {
                /* its in cancel state
                 * swap text to change
                 * remove active class
                 * reset the state
                 * close the current edit section
                 */
                $('.amendSection').removeClass('isActiveAmendSection');
                btn.html('Change').removeClass('active');
            } else {
                /*
                 * its in change state
                 * close & reset any open amend section
                 * change text to cancel
                 * add active class
                 * open the immediate amend section
                 */
                $(".isActiveAmendSection .update-button").html("Change").removeClass("active");
                $('.amendSection').removeClass('isActiveAmendSection');
                btn.html('Cancel <span class="icon" data-icon="y" aria-hidden="true"></span>').addClass('active');
                btn.closest('.amendSection').addClass('isActiveAmendSection');

                /* To remove duplicate form bindings */
                $('.store-search-form #store-search-submit').remove();
                $('.amendStoreError').remove();

                $(".isActiveAmendSection").trigger(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_ACTIVE, {
                    groupID: deliveryGroupID
                });
            }
        };

        disableUnsavedChangesConfirmation = function disableUnsavedChangesConfirmation() {
            if (bUnsavedChangesConfirmationEnabled) {
                window.onbeforeunload = undefined;
                $('#confirm-changes').removeClass('showConfirmChagesButton').addClass('disabled');
                bUnsavedChangesConfirmationEnabled = false;
            }
        };

        enableUnsavedChangesConfirmation = function enableUnsavedChangesConfirmation() {
            if (!bUnsavedChangesConfirmationEnabled) {
            	window.onbeforeunload = amendConfirm.confirmBeforeClose;
                $('#confirm-changes').addClass('showConfirmChagesButton').removeClass('disabled').removeAttr('disabled');
                bUnsavedChangesConfirmationEnabled = true;
            }
        };

        discardAllPendingChanges = function discardAllPendingChanges() {
            if (bUnsavedChangesConfirmationEnabled) {
                storeChange.discardPendingChanges();
                disableUnsavedChangesConfirmation();
            }
        };

        setupViewportChangeHandler = function setupViewportChangeHandler() {
            var x,
                aViewports = ['mobileIn', 'mobileOut', 'vTabletOut', 'hTabletOut', 'desktopOut', 'largeDesktopOut', 'kioskOut', 'mobileIn', 'vTabletIn', 'hTabletIn', 'desktopIn', 'largeDesktopIn', 'kioskIn'],
                iViewportsLength = aViewports.length;

            for (x = 0; x < iViewportsLength; x++) {
                breakpoint[aViewports[x]].push(discardAllPendingChanges);
            }
        };

        initStoreChangeModule = function initStoreChangeModule() {
            storeChange.common = {
                disableUnsavedChangesConfirmation: disableUnsavedChangesConfirmation,
                enableUnsavedChangesConfirmation: enableUnsavedChangesConfirmation,
                isItSimpleOrderAmendPage: isItSimpleOrderAmendPage,
                errorResponseHandler: errorResponseHandler
            };
            storeChange.init();
        };

	    setupConfirmChangesFormHandler = function setupConfirmChangesFormHandler() {
	        $('#confirm-changes').on('tap click', function (e) {
	            if ($(this).hasClass('disabled')) { //for IE < 11
	                e.preventDefault();
	                return false;
	            }
	            disableUnsavedChangesConfirmation();
	            $(this).off('tap click').removeAttr('disabled');
	        });
	    };

        isItSimpleOrderAmendPage = function isItSimpleOrderAmendPage() {
            return $('.simpleOrderAmend').length > 0;
        };

        initCourierInstructionChangeModule = function initCourierInstructionChangeModule() {
            courierInstructionChange.init();
        };

        unwrapElements = function unwrapElements() {
            $("#amendOrder-details-container").unwrap().contents().unwrap();
        };

        /**
         * Handles all error response.
         * @param {String}  errorResponse: Response from Server.
         * @param {boolean} fromStores:    is from "stores.js"
         */
        errorResponseHandler = function errorResponseHandler(errorResponse, fromStores) {
            /* if (errorResponse === undefined) { // for development purpose only.
                throw new Error('Response cannot be undefined.');
            } */

            if (isRegistrationPage(errorResponse)) { //Session Expired
            	$('.simpleOrderAmend').trigger({
                    type: 'showDialog',
                    dialogConfig: {
                    	className: 'dialogWarning',
                        content: 'Your session has timed out. Please sign back in to continue using your account',
                        buttons: [{
                            className: 'button tertiary-button buttonDefault buttonOK',
                            title: 'OK',
                            callback: function () {
                            	disableUnsavedChangesConfirmation();
                            	window.location.replace("/direct/my/manage-direct-orders.page");
                            }
                        }]
                    }
                });
            } else if (fromStores) {
            	//do nothing
            } else {
                unKnownError();
            }
        };

        isRegistrationPage = function isRegistrationPage(response) {
        	try {
        		return $(response.trim()).find('.ir-login').length > 0;
			} catch (e) {
				return false; //probably valid JSON.
			}
    	};

        /**
         * Final destination.
         */
        unKnownError = function unKnownError() {
        	$('.simpleOrderAmend').trigger({
                type: 'showDialog',
                dialogConfig: {
                	className: 'dialogWarning',
                    content: 'An unknown error occured. Please try again.',
                    buttons: [{
                        className: 'button tertiary-button buttonDefault buttonOK',
                        title: 'OK'
                    }]
                }
            });
        };

        initResetData = function initResetData() {
            $(".amendDeliveryGroup").on(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_DISCARDED, '.isActiveAmendSection', function () {
                var $currentContent = $(this);

                if ($currentContent.data('dateChangeIsRequired')) {
                    prepareResetData();
                }
            });
        };

        prepareResetData = function prepareResetData() {
            var $resetForm = $('.isActiveAmendSection').parent().find('.resetDeliveryChanges');

            sendResetDataRequest($resetForm);
        };

        scrollToLinks = function (evt) {
            var id = $(evt.target).attr("href");
            $('html, body').animate({
                scrollTop: $(id).offset().top - 75
            }, 1000);
            evt.preventDefault();
        };

        sendResetDataRequest = function sendResetDataRequest($form) {
            var request,
                url,
                DL = new dataLayer.DataLayer(),
                myData,
                $elem,
                $savedAddressesDropdown,
                $currentGroup = $form.closest('.amendDeliveryGroup');

            request = 'addNewAddress';
            url = utils.getFormAction($form);
            $elem = $form;
            DL = new data.DataLayer();
            myData = $form.serialize();
            $currentGroup.append($loadingSpinney);

            DL.get(url, myData, $elem, null, request, function success(result) {
            	var oJsonResponse;
            	if (typeof result === 'string') {
            	    try {
            	        oJsonResponse = $.parseJSON(result);
            	    } catch (e) {
            	        storeChange.common.errorResponseHandler(result);
            	        return;
            	    }
            	} else {
            	    oJsonResponse = result;
            	}

            	if (oJsonResponse.errorType === undefined) {
                    $('.simpleOrderAmend').trigger({
                        type: 'showDialog',
                        dialogConfig: {
                        	className: 'dialogWarning',
                            content: oJsonResponse.dialogMessage,
                            buttons: [{
                                className: 'button tertiary-button buttonDefault buttonOK',
                                title: 'OK',
                                callback: function () {
                                    if (oJsonResponse.updateCourierInstructionsMarkup !== undefined || oJsonResponse.updateCourierInstructionsMarkup !== 'undefined') {
                                        $currentGroup.find('.amendCourierInstruction .content').html(oJsonResponse.updateCourierInstructionsMarkup);
                                    }
                                    $currentGroup.find('.amendDeliveryDate .content').html(oJsonResponse.updatedDatePickerMarkup);
                                    $currentGroup.find('.amendDeliveryDate').removeData('dateChangeIsRequired');
                                    $currentGroup.find('.amendDeliveryAddress .content').html(oJsonResponse.addNewAddress);
                                    $currentGroup.find('.amendDeliveryAddress .content a.button.active').trigger('click');
                                    $currentGroup.find('.amendDeliveryAddress .content').trigger(constants.EVENTS.ORDER_DETAILS_AMENDS_CANCELLED).trigger(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_DISCARDED);
                                    $savedAddressesDropdown = $currentGroup.find('.amendDeliveryAddress .savedDeliveryAddresses select.savedAddressesDropdown');
                                    dropdown.init($savedAddressesDropdown);
                                    $loadingSpinney.remove();
                                    $('.amendDeliveryDate .content').removeAttr('style');
                                }
                            }]
                        }
                    });
                } else {
                	unKnownError();
                }
            },
            function failure(response) {
                errorResponseHandler(response.responseText);
            },
            function complete() {
                context.find('.loader').remove();
            });
        };

        $(document).ready(function () {
	        unwrapElements(); // call first to remove any conflicts.
            var amendSections = $(".amendSection");
            initAjaxFramework();
            initStoreChangeModule();
            setupViewportChangeHandler();
            setupConfirmChangesFormHandler();

            $("#order-details").on("click", ".update-button", onUpdateButtonClicked);
            $('.simpleOrderAmend').on('showDialog', onShowDialog);
            $(".deliveryGroupLinks a").click(scrollToLinks);

            amendConfirm.init(isItSimpleOrderAmendPage());
            amendSections.on(constants.EVENTS.ORDER_DETAILS_AMENDED + ' ' + constants.EVENTS.ORDER_DETAILS_AMENDS_CANCELLED, scrollBackToDeliveryGroup);

            amendDeliveryAddress.init(dataLayer);
            dateChange.init();
            initCourierInstructionChangeModule();
            initResetData();
        });

    });