/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require,pca,loadCapturePlus */

define([ 'domlib', 'modules/common', 'modules/breakpoint', 'modules/checkout/delivery/refresh-all', 'modules/checkout/resetForm', 'modules/validation', 'modules/editable-addresses/common', 'modules/tesco.utils', 'modules/tesco.data', 'modules/order-amendments/constants', 'modules/order-amendments/store-change', 'modules/tesco.analytics', 'modules/custom-dropdown/common'
    ], function ($, common, breakpoint, refreshAll, resetForm, validationExtras, PCA_EditableAddress, utils, data, constants, storeChange, analytics, dropdown) {
    'use strict';

    var oGroupFields = '[name=companyname], [name=flatnumber], [name=buildingname]',
        $loadingSpinney = $('<div class="loader">Updating your address...</div>'),
        newAddress = {
            group: null,
            $currentContent: null,
            editButtonClicked: false, // use globally used variable name.
            bEditButtonEnabled: false,
            pcaAddressSelected: false,
            sVirtualPageSelector: '#virtual-page',
            bContainerSelector: '.new-address',
            sUpdateButtonSelector: '.update-button',
            enableSaveFields: '[name=nick-names], [name=postal-code-pca], ' + oGroupFields,

            initAjaxFramework: function () {
                data.Global.init({
                    'inlineRequests': {'addNewAddress': []},
                    'requests': {
                        'addNewAddress': ['addNewAddress']
                    },
                    'modules': {
                        'addNewAddress': ['div.isActiveAmendSection .content', 'Updating new address...', true],
                        'dialogMessage': ['', '', false],
                        'errorType': ['', '', false],
                        'updatedDatePickerMarkup': ['', '', false],
                        'amendCourierInstructionContainer': ['', '', false]
                    },
                    'actions': {
                        'addNewAddress': ['/stubs/checkout/deliveryAddressFragment.php']
                    }
                });
            },

            hideAjaxSpinney: function ($currentContent) {
                if ($('.loader').length > 0) {
                    $loadingSpinney.detach();
                    $currentContent.find('.loader').remove();
                    $('.amendDeliveryAddress .content').removeAttr('style');
                }
            },

            updateHiddenNickNameField: function ($activeContent) {
                var sShippingGroupId = $activeContent.closest('.amendDeliveryGroup').attr('id'),
                    $hiddenNickNameField = $activeContent.find('input[name=nick-names]');

                if ($hiddenNickNameField.length > 0 && $hiddenNickNameField.val() === 'deliveryGroupIDaddedFromATG') {
                    $hiddenNickNameField.val(sShippingGroupId);
                }
            },

            amendDialogOverlays: function () {
                $('#overlay').css('z-index', '9991');
                $('#lightbox').css('z-index', '9993');// change this to add a class instead
            },

            breakpointReset: function () {
                var $amendDeliveryAddress = $('.amendDeliveryAddress.isActiveAmendSection');

                if ($amendDeliveryAddress.length > 0) {
                    $amendDeliveryAddress.find(newAddress.sUpdateButtonSelector).trigger('click');
                }
                if (breakpoint.mobile) {
                    common.virtualPage.close();
                }
            },

            clearNewAddress: function (context) {// reset values and clear the errors just for the new address section
                if (breakpoint.mobile) {
                    resetForm.init($('#virtual-page form'));
                } else {
                    resetForm.init($('form', context));
                }
            },

            clearPCAField: function () {
                var _oPCAElem = $(newAddress.bContainerSelector).find('input[name="postal-code-pca"]');
                if (_oPCAElem.data('isAddressSelected')) {
                    _oPCAElem.val('').data('isAddressSelected', false).valid();
                }

                newAddress.editButtonClicked = false;// Reset edit button clicked

                newAddress.manualAddressSignUpSlideUp();
            },

            removeHTMLFromDom: function () {
                $(newAddress.bContainerSelector).find('table.pcaCapturePlusTable, div#ed59pz86tg22kf685176, input.postal-code-pca, button.edit-address-button, .manually-add-address').remove();
            },

            manualAddressSignUpSlideUp: function () {// hide the panel
                var $el,
                    $elem,
                    $saveButton;

                $el = $(newAddress.bContainerSelector).find('.manually-add-address');
                $saveButton = $el.parent().find("div.form-actions input.save").first();
                if (!$el.is(':visible')) {// only slide up and reset form if visible
                    return;
                }

                $elem = $(newAddress.bContainerSelector).eq(0).find('form');
                if (breakpoint.mobile) {
                    $elem = $('#virtual-page .new-address').find('form');
                }

                $elem.find('[name=companyname], [name=flatnumber], [name=buildingname]').removeClass('valid').val('');
                $elem.validate().resetForm();
                newAddress.validation.enableSave($elem);
                $el.hide();
                $saveButton.removeAttr('style');
                newAddress.editButtonClicked = false;
                newAddress.pcaAddressSelected = false;
            },

            manualAddressSignUpSlideDown: function () {// show the panel
                var $el = $(newAddress.bContainerSelector).find('.manually-add-address'),
                    $addressInputs = $el.find('input:text'),
                    $saveButton = $el.parent().find("div.form-actions input.save").first();

                $el.show();
                $saveButton.show();
                validationExtras.updatePlaceholders('.manually-add-address');

                if (common.isIE9OrLower()) {
                    $addressInputs.each(function () {
                        if ($(this).val()) {
                            $(this).closest('.placeholder').find('label').hide();
                        } else {
                            $(this).closest('.placeholder').find('label').show();
                        }
                    });
                }
            },

            enableEditButton: function () {
                var $el = $(newAddress.bContainerSelector).find('.edit-address-button');
                $el.attr('disabled', false);
                $el.removeClass('disabled');
                newAddress.bEditButtonEnabled = true;
            },

            disableEditButton: function () {
                var $el = $(newAddress.bContainerSelector).find('.edit-address-button');
                $el.attr('disabled', true);
                $el.addClass('disabled');
                newAddress.bEditButtonEnabled = false;
            },

            createMessage: function () {
                if ($(newAddress.bContainerSelector).find('.pcaCapturePlusTable .message').length) {// if message element doesn't exist, create it
                    return;
                }
                $(newAddress.bContainerSelector).find('.pcaCapturePlusTable .pcaAutoCompleteSmall').before('<div class="message"></div>');
            },

            showMessage: function (showError) {
                newAddress.createMessage();
                var $el = $(newAddress.bContainerSelector).find('.pcaCapturePlusTable .message'),
                    message = 'If you can\'t find the right address enter the full postcode and select Edit',
                    errorClass = 'error-text';

                $el.removeClass(errorClass);
                if (showError) {
                    message = 'Sorry, we don\'t recognise this postcode. Please enter another postcode.';
                    $el.addClass(errorClass);
                }
                $el.html(message).show();
            },

            hideMessage: function () {
                $(newAddress.bContainerSelector).find('.pcaCapturePlusTable .message').hide();
            },

            hideOpenDeliveryBlocks: function ($currentBlock) {
                if ($('.new-address').length > 1) {
                    $('.new-address').not($currentBlock).each(function () {
                        if ($(this).is(':visible')) {
                            $(this).find('.cancel').trigger('click');
                        }
                    });
                }
            },

            hidePaymentBlock: function () {
                if (($('.billing-address .add-new-address').is(':visible'))) {
                    $('.billing-address .add-new-address .cancel').trigger('click');// close payment block
                }
            },

            toggleNewAddress: function (e) {
                e.preventDefault();
                newAddress.editButtonClicked = false;
                var $target  = $(e.target),
                    $details = $target.parents('.amendDeliveryAddress'),
                    //$wrapper = $details.find('.address'),
                    $content = $details.find('.new-address'),
                    $saveButton = $details.find('.form-actions input.save'),
                    hideCallback,
                    showCallback;

                $('.manually-add-address').remove();
                newAddress.hidePaymentBlock();

                if ($target.hasClass('cancel')) {
                    $content.find('.invalid2').hide();
                }
                if ($content.is(':visible')) {// hide
                    hideCallback = function () {
                        newAddress.clearNewAddress($content);
                        newAddress.manualAddressSignUpSlideUp();
                        newAddress.removeHTMLFromDom();
                    };
                    $content.hide();
                    $saveButton.removeAttr('style');
                    hideCallback();
                } else {// show
                    showCallback = function () {
                        newAddress.validation.enableSave();
                        validationExtras.updatePlaceholders($content);
                        newAddress.updateHiddenNickNameField($content);
                        newAddress.initialisePCAField($details);
                    };
                    $content.show();
                    showCallback();
                }
                return false;
            },

            initialisePCAField: function ($container) {
                var $el,
                    fieldLimits = { companyName: 60, flatNumber: 30, buildingName: 55, primaryStreet: 70 };

                if ($("#postal-code-pca").length === 0) {
                    $container.find('div.post-code').append('<input id="postal-code-pca" class="input postal-code-pca required highlight" type="text" title="Enter a postcode" placeholder="Enter a postcode" name="postal-code-pca" maxlength="8"><div id="ed59pz86tg22kf685176"></div>');
                }
                $el = $container.find('input[name="postal-code-pca"]');
                $el.data('isAddressSelected', false);

                loadCapturePlus();// global function defined in PCA library
                if ($(".edit-address-button").length === 0) {
                    $container.find('.pcaCapturePlusTable').after('<button class="primary-button disabled edit-address-button">Edit</button>');
                }
                $container.find('div.post-code').after('<div class="manually-add-address"><div class="field-wrapper"><label for="nv-Company">Company name</label><input id="nv-Company" title="Please complete one of the following three fields" placeholder="Company name" name="companyname" value="" type="text" class="highlight" maxlength="' + fieldLimits.companyName + '"></div><div class="field-wrapper"><label for="nv-FlatNumber" class="hidden">Flat / unit number</label><input id="nv-FlatNumber" title="Please complete one of the following three fields" placeholder="Flat / unit number" name="flatnumber" value="" type="text" class="highlight" maxlength="' + fieldLimits.flatNumber + '"></div><div class="field-wrapper"><label for="nv-BuildingName" class="hidden">Building number / name</label><input id="nv-BuildingName" title="Please complete one of the following three fields" placeholder="Building number / name" name="buildingname" value="" type="text" class="highlight" maxlength="' + fieldLimits.buildingName + '"></div><div class="field-wrapper"><label for="nv-PrimaryStreet" class="hidden">Street</label><input id="nv-PrimaryStreet" title="Street" placeholder="Street" name="street" value="" type="text" maxlength="' + fieldLimits.primaryStreet + '"></div><div class="field-wrapper"><input id="nv-Locality" title="Locality"  name="locality" value="" type="hidden" /><input id="nv-City" title="City" placeholder="City" name="city" value="" type="hidden" /><div class="locality-city"></div><input id="nv-Country" name="country" value="" type="hidden"/></div></div>');
                newAddress.validation.init($container);// initialise validation since new fields are added
                return new PCA_EditableAddress(newAddress, $container, true, newAddress.updatePostCodePlaceholder);
            },

            updatePostCodePlaceholder: function () {
                if (common.isIE9OrLower()) {
                    var $tdContainer = $('#postal-code-pca').closest('td'),
                        $inputPostcode = $('#postal-code-pca');

                    validationExtras.updatePlaceholders('.post-code');
                    $inputPostcode.prependTo($tdContainer);
                    $tdContainer.css({
                        'position': 'relative'
                    });
                    $tdContainer.find('.placeholder').css({
                        'height': '36px',
                        'position': 'absolute',
                        'top': '0',
                        'overflow': 'auto',
                        'white-space': 'nowrap',
                        'width': $tdContainer.width()
                    });
                }
            },

            update: function ($activeContent, $courierInstructionContainer) {
                if ($courierInstructionContainer !== undefined && $courierInstructionContainer !== 'undefined') {
                    $activeContent.closest('.amendDeliveryGroup').find('.amendCourierInstruction').html($courierInstructionContainer);
                }

                newAddress.hideAjaxSpinney($activeContent);
                if ($(newAddress.sVirtualPageSelector).length > 0) {
                    common.virtualPage.close();
                } else {
                    $activeContent.find('.content').removeAttr('style');
                    $activeContent.find(newAddress.sUpdateButtonSelector).trigger("click");
                    $activeContent.removeClass('isActiveAmendSection');
                }
                $activeContent.trigger(constants.EVENTS.ORDER_DETAILS_AMENDED);
            },

            save: function ($form) {
                var request,
                    url,
                    $elem,
                    DL,
                    myData,
                    $currentContent = $('.amendSection.isActiveAmendSection'),
                    $previousContent = $currentContent.find('.content').clone(true),
                    sCurrentDeliveryGroup = $currentContent.closest('.amendDeliveryGroup').attr('id');

                if ($(newAddress.sVirtualPageSelector).length > 0) {
                    $currentContent = $(newAddress.sVirtualPageSelector).find('.amendSection.isActiveAmendSection');
                    $previousContent = $currentContent.find('.content').clone(true);
                    $(newAddress.sVirtualPageSelector).find('.fnNewHomeDeliveryAddress').trigger('click');
                }
                $currentContent.append($loadingSpinney);

                request = 'addNewAddress';
                url = utils.getFormAction($form);
                $elem = $form;
                DL = new data.DataLayer();
                myData = $form.serialize();

                DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function complete(result) {
                	var oJsonResponse;
                	    try {
                	        oJsonResponse = $.parseJSON(result.responseText);
                	    } catch (e) {
                	        storeChange.common.errorResponseHandler(result); // handles all errors.
                	        return;
                	    }

                	 common.virtualPage.courierInstruction = oJsonResponse.amendCourierInstructionContainer;

                    /*
                     * error codes should be updated during integration of this work
                     * do not use these error codes as they have not been verified
                     */
                    if (oJsonResponse.errorType !== undefined) {

                    	if (oJsonResponse.analytics) {
                    	    var _oWebAnalytics = new analytics.WebMetrics();
                    	    _oWebAnalytics.submit(oJsonResponse.analytics[0]);
                    	}

                        switch (oJsonResponse.errorType) {

                        case '1': // result is blocked, no changes to DOM
                            $('.simpleOrderAmend').trigger({
                                type: 'showDialog',
                                dialogConfig: {
                                	className: 'dialogWarning',
                                    content: oJsonResponse.dialogMessage,
                                    buttons: [{
                                        className: 'button tertiary-button buttonDefault buttonOK',
                                        title: 'OK',
                                        callback: function () {
                                            $currentContent.find('.fnNewHomeDeliveryAddress').trigger('click');
                                            newAddress.hideAjaxSpinney($currentContent);
                                        }
                                    }]
                                }
                            });
                            newAddress.amendDialogOverlays();
                            break;

                        case '2': // result requires new delivery date
                            $('.simpleOrderAmend').trigger({
                                type: 'showDialog',
                                dialogConfig: {
                                    content: oJsonResponse.dialogMessage,
                                    buttons: [{
                                        className: 'button tertiary-button buttonDefault buttonBack',
                                        title: 'Keep previous address',
                                        callback: function () {
                                            $currentContent.find('.content').replaceWith($previousContent);
                                            newAddress.hideAjaxSpinney($currentContent);
                                            if ($(newAddress.sVirtualPageSelector).length > 0) {
                                                $currentContent.find('.fnNewHomeDeliveryAddress').trigger('click');
                                                common.virtualPage.close();
                                            } else {
                                                $currentContent.find(newAddress.sUpdateButtonSelector).trigger('click');
                                            }
                                        }
                                    }, {
                                        className: 'button tertiary-button',
                                        title: 'Change date',
                                        callback: function () {
                                        	newAddress.hideAjaxSpinney($currentContent);
                                            $currentContent.trigger(constants.EVENTS.ORDER_DETAILS_AMENDED);
                                            $('#order-details #' + sCurrentDeliveryGroup).find('.amendDeliveryDate .content').html(oJsonResponse.updatedDatePickerMarkup);
                                            $('#order-details #' + sCurrentDeliveryGroup + ' .amendDeliveryDate').data('dateChangeIsRequired', 'true');

                                            if ($(newAddress.sVirtualPageSelector).length > 0) {
                                                common.virtualPage.close(null, function () {
                                                    $('#order-details #' + sCurrentDeliveryGroup).find('.amendDeliveryDate .update-button').trigger('click');
                                                });
                                            } else {
                                                $('#order-details #' + sCurrentDeliveryGroup).find('.amendDeliveryDate .update-button').trigger('click');
                                            }
                                        }
                                    }]
                                }
                            });
                            newAddress.amendDialogOverlays();
                            break;
                        }
                    } else {
                        newAddress.update($currentContent, common.virtualPage.courierInstruction);
                        $currentContent.closest('.amendDeliveryGroup').find('.amendCourierInstruction').html(common.virtualPage.courierInstruction);
                        var newAddr = $('#savedAddressesDropdown_' + sCurrentDeliveryGroup).find('option[selected]'),
                            newOption = '<option value="' + newAddr.val() + '">' + newAddr.text().trim() + '</option>';

                        /* Add newly added address to other delivery groups. */
                        $.each($('[id^="savedAddressesDropdown_"]'), function (i, val) {
                            if ($(val).attr('id') != 'savedAddressesDropdown_' + sCurrentDeliveryGroup) { //ignore if current delviery group.
                                $(val).append(newOption); //TODO - append to current location as in current delivery group.
                                $(val).removeClass('been-customised'); // TODO-required?
                                $(val).parents('div.singleDeliveryAddress').removeClass('singleDeliveryAddress');
                                dropdown.init($(val));
                            }
                        });
                    }
                });
            },

            validation: {
                $form: [],

                enableSave: function (myForm) {
                    var self = newAddress.validation;
                    myForm = $(myForm);
                    if (myForm) {
                        validationExtras.enableSave(
                            myForm.find('[name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]'),
                            myForm.find('input.save')
                        );
                    } else {
                        validationExtras.enableSave(
                            self.$form.find('[name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]'),
                            self.$form.find('input.save')
                        );
                    }
                },

                init: function (context, $target, callback) {
                    var self = newAddress.validation,
                        $toCompare = [];

                    self.$form = $('.new-address form', context);

                    $(newAddress.bContainerSelector).find('input[name="postal-code-pca"]').data('isAddressSelected', false);

                    validationExtras.customMethods.isUnique();// add the custom validation methods to the validation library before form validation setup
                    validationExtras.customMethods.checkEditableAddresses();

                    if ($target && $target.length) {// locate the field to compare the new address nickname against
                        $toCompare = ($target.hasClass('delivery-block')) ? $target.find('.amendDeliveryAddress') : $target.parents('.amendDeliveryAddress');
                    } else {
                        $toCompare = self.$form.parents('.amendDeliveryAddress');
                    }

                    if ($('#singleAddressNickname').length) {
                        $toCompare = $toCompare.find('.new-address #singleAddressNickname');
                    } else {
                        $toCompare = $toCompare.find('.address-nickname select');
                    }

                    if (callback) {// store the callback (comes from different address JS)
                        newAddress.callback = callback;
                    }

                    self.$form.each(function () {
                        $(this).validate({
                            errorClass: 'error',
                            validClass: 'valid',
                            onkeyup: function (elm) {
                                if (this.check(elm)) {
                                    $(elm).addClass('valid');
                                } else {
                                    $(elm).removeClass('valid');
                                }
                                self.enableSave(this.currentForm);// save enabler must be placed after the element validation
                            },
                            focusInvalid: false,
                            onfocusout: function (elm) {
                                this.element(elm);
                                self.enableSave(this.currentForm);// save enabler must be placed after the element validation
                            },
                            errorElement: 'span',
                            groups: {
                                editableAddressesError: "companyname flatnumber buildingname"
                            },
                            rules: {
                                'nick-names': {
                                    required: true,
                                    isUnique: {
                                        fieldToCompare: $toCompare
                                    }
                                },
                                'postal-code-pca': {
                                    required: true
                                },
                                'companyname': {
                                    checkEditableAddresses: true
                                },
                                'flatnumber': {
                                    checkEditableAddresses: true
                                },
                                'buildingname': {
                                    checkEditableAddresses: true
                                }
                            },
                            messages: {
                                'nick-names': {
                                    required: validationExtras.msg.newAddressNickname.required,
                                    isUnique: validationExtras.msg.isUnique.inValid
                                },
                                'postal-code-pca': {
                                    required: validationExtras.msg.postcode.required
                                }
                            },
                            errorPlacement: function (error, element) {// this is allowing duplicate ERRORS, possibly a double binding to events is causing this?
                                switch (element.attr("name")) {
                                case "postal-code-pca":
                                    error.insertBefore(element.parents('form').find(".pcaCapturePlusTable"));
                                    break;
                                case "companyname":
                                case "flatnumber":
                                case "buildingname":
                                    error.insertBefore(element.parents('form').find("input[name='companyname']"));
                                    break;
                                default:
                                    error.insertBefore(element);
                                }
                            }
                        });
                        validationExtras.focusoutFix($(this));// apply focus fix for android devices
                        validationExtras.limitCharacters($(this).find('[name=nick-names]'), 20);// set up max character limits
                        self.enableSave($(this));// check if the save should be enabled
                    });
                }
            },

            init: function () {
                $(document).on('click', '.amendDeliveryAddress .content .fnNewHomeDeliveryAddress', function (e) {
                    var $currentBlock = $(this).parents('.amendDeliveryAddress').find('.new-address');

                    newAddress.hideOpenDeliveryBlocks($currentBlock);
                    newAddress.toggleNewAddress(e);
                });
                $(document).on('click', '.amendDeliveryAddress .new-address .cancel', newAddress.toggleNewAddress);
                $(document).on('focus', '.new-address input[name="postal-code-pca"]', newAddress.clearPCAField);
                $(document).on('click', '.amendDeliveryAddress .new-address input.save', function (e) {
                    var $form;

                    if (!newAddress.pcaAddressSelected) {
                        e.preventDefault();
                    } else if (!$(this).hasClass('disabled')) {
                        e.preventDefault();
                        $form = $(this).closest('form');
                        var $container = $(newAddress.bContainerSelector),
                        	mapFields = ['postal-code-pca', 'companyname', 'flatnumber', 'buildingname', 'street', 'locality', 'city', 'country'],
                            fieldLength = mapFields.length,
                            fieldValue = '',
                            fieldNameHdn = '';
                        for (var m = 0; m < fieldLength; m++) {
                            fieldValue = $container.find('[name=' + mapFields[m] + ']').val();
                            fieldNameHdn = mapFields[m].replace(/-/g, "");
                            $container.find("#form-values-" + fieldNameHdn).val(fieldValue);
                        }

                        newAddress.save($form);
                    }
                });
                newAddress.initAjaxFramework();

                refreshAll.reInit.push(function () {
                    newAddress.validation.init($('.amendDeliveryAddress'));
                });
            }
        };

    breakpoint.mobileIn.push(function () {
        newAddress.breakpointReset();
    });

    breakpoint.vTabletIn.push(function () {
        newAddress.breakpointReset();
    });

    breakpoint.hTabletIn.push(function () {
        newAddress.breakpointReset();
    });

    breakpoint.desktopIn.push(function () {
        newAddress.breakpointReset();
    });

    breakpoint.largeDesktopIn.push(function () {
        newAddress.breakpointReset();
    });

    return newAddress;
});
