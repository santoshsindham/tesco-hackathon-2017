/*global define: true */
define([
    'domlib',
    'modules/common',
    'modules/breakpoint',
    '../loader',
    'modules/custom-dropdown/common',
    './refresh-all',
    'modules/checkout/resetForm',
    'modules/validation',
    './courier',
    './edit-collection-details',
    'modules/editable-addresses/common',
    'modules/tesco.utils',
    'modules/tesco.data',
    'modules/tesco.analytics',
    './flowers-recipient-details',
    'modules/bfpo/common'
], function ($, common, breakpoint, loader, customDropdown, refreshAll, resetForm, validationExtras, courier, editCollectionDetails, PCA_EditableAddress, utils, data, analytics, flowersRecipientDetails, bfpo) {

    var newAddress = {

        groupFields: '[name=companyname], [name=flatnumber], [name=buildingname]',
        group: null,
        editButtonClicked: false,
        editButtonEnabled: false,
        containerSelector: '.new-address',
        pcaAddressSelected: false,
        enableBfpo: true,

        breakpointReset: function () {
            $('#virtual-page').remove();

            if (breakpoint.mobile) {
                $('.collection-details').find('.address').show();
                $('.collection-details').find('.new-address').hide();
                newAddress.removeHTMLFromDom();
            }
        },

        clearNewAddress: function (context) {
            if (breakpoint.mobile) {
                resetForm.init($('#virtual-page form'));
            } else {
                resetForm.init($('form', context));
            }
        },

        clearPCAField: function (event) {
            var _oPCAElem = $(newAddress.containerSelector).find('input[name="postal-code-pca"]'),
                $container = null;

            if (_oPCAElem.data('isAddressSelected')) {
                _oPCAElem.val('').data('isAddressSelected', false).valid();
            }

            newAddress.editButtonClicked = false;
            newAddress.manualAddressSignUpSlideUp();

            if (event !== undefined && newAddress.enableBfpo) {
                if (breakpoint.mobile) {
                    $container = utils.getFormByElement(event.target);
                } else {
                    $container = utils.getDeliveryGroup(event.target);
                }

                bfpo.close($container);
            }
        },

        removeHTMLFromDom: function () {
            $(newAddress.containerSelector).find('table.pcaCapturePlusTable, div#ed59pz86tg22kf685176, input.postal-code-pca, button.edit-address-button, .manually-add-address').remove();
        },

        manualAddressSignUpSlideUp: function () {
            var el,
                $elem;

            el = $(newAddress.containerSelector).find('.manually-add-address');

            if (!el.is(':visible')) {
                return;
            }

            $elem = $(newAddress.containerSelector).eq(0).find('form');

            if (breakpoint.mobile) {
                $elem = $('#virtual-page .new-address').find('form');
            }

            $elem.find('[name=companyname], [name=flatnumber], [name=buildingname]').removeClass('valid').val('');
            $elem.validate().resetForm();
            newAddress.validation.enableSave($elem);
            el.slideUp('fast', function () {
                newAddress.editButtonClicked = false;
                newAddress.pcaAddressSelected = false;
            });
        },

        manualAddressSignUpSlideDown: function () {
            var el = $(newAddress.containerSelector).find('.manually-add-address'),
                self = this,
                $addressInputs = el.find('input:text'),
                $form = el.closest('form');

            el.slideDown('fast', function () {
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

                if ($form.data('isBfpoAddress')) {
                    bfpo.open($form);
                }
            });
        },

        enableEditButton: function () {
            var el = $(newAddress.containerSelector).find('.edit-address-button');

            el.attr('disabled', false);
            el.removeClass('disabled');
            newAddress.editButtonEnabled = true;
        },

        disableEditButton: function () {
            var el = $(newAddress.containerSelector).find('.edit-address-button');

            el.attr('disabled', true);
            el.addClass('disabled');
            newAddress.editButtonEnabled = false;
        },

        createMessage: function () {
            if ($(newAddress.containerSelector).find('.pcaCapturePlusTable .message').length) {
                return;
            }

            $(newAddress.containerSelector).find('.pcaCapturePlusTable .pcaAutoCompleteSmall').before('<div class="message"></div>');
        },

        showMessage: function (showError) {
            var el = null,
                message = 'If you can\'t find the right address enter the full postcode and select Edit',
                errorClass = 'error-text';

            newAddress.createMessage();
            el = $(newAddress.containerSelector).find('.pcaCapturePlusTable .message');
            el.removeClass(errorClass);

            if (showError) {
                message = 'Sorry, we don\'t recognise this postcode. Please enter another postcode.';
                el.addClass(errorClass);
            }

            el.html(message).show();
        },

        hideMessage: function () {
            $(newAddress.containerSelector).find('.pcaCapturePlusTable .message').hide();
        },

        hideOpenDeliveryBlocks: function ($currentBlock) {
            if ($('.edit-da-block.new-address').length > 1) {
                $('.edit-da-block.new-address').not($currentBlock).each(function () {
                    if ($(this).is(':visible')) {
                        $(this).find('.cancel').trigger('click');
                    }
                });
            }

            if($('.flowers-module').length){
                var $flowerContainer = $('.flowers-module .flowers-recipient').find('.edit-new-recipient').length ? $('.flowers-recipient .edit-new-recipient') : $('.flowers-recipient .editNewFlowersRecipientInfo');
                var $addressConatiner = $flowerContainer.find('.new-flower-address');

                if($addressConatiner.hasClass('open')){
                    $addressConatiner.hide();
                    $addressConatiner.removeClass('open');
                    flowersRecipientDetails.clearPCAField();
                    flowersRecipientDetails.removeHTMLFromDom();
                    $flowerContainer.find('.address-link').show();
                }
                else {
                    if($('.edit-da-block.new-address').length && !$addressConatiner.hasClass('open')){
                        $('.edit-da-block.new-address').not($currentBlock).each(function () {
                            if ($(this).is(':visible')) {
                                $(this).find('.cancel').trigger('click');
                            }
                        });
                    }
                    else {
                        $addressConatiner.show();
                        $addressConatiner.addClass('open');
                        flowersRecipientDetails.initialisePCAField($('.flowers-recipient'));
                        $flowerContainer.find('.address-link').hide();
                    }
                }
            }
        },

        hidePaymentBlock: function () {
            if (($('.billing-address .add-new-address').is(':visible'))) {
                $('.billing-address .add-new-address .cancel').trigger('click');
            }
        },

        toggleNewAddress: function (e) {
            var $target = $(e.target),
                $details = $target.parents('.collection-details'),
                $wrapper = $details.find('.address'),
                $content = $details.find('.new-address'),
                $container = null,
                newContactChk = null,
                editCourierChk = null,
                html = null,
                hideCallback = null,
                showCallback = null;

            e.preventDefault();
            newAddress.editButtonClicked = false;
            $('.manually-add-address').remove();
            newAddress.hidePaymentBlock();

            newContactChk = function () {
                if ($('.edit-contact-details').show()) {
                    $('.edit-contact-details').hide();
                    $('.delivery-contact-snippet').show()
                } else {
                    $('.edit-contact-details').show();
                    $('.delivery-contact-snippet').hide();
                }
            };

            editCourierChk = function () {
                if ($('.edit-d-instruction-block').show()) {
                    $('.edit-d-instruction-block').hide();
                    $('.courier-instructions').show()
                } else {
                    $('.edit-d-instruction-block').show();
                    $('.courier-instructions').hide();
                }
            };

            hideCallback = function () {
                newAddress.clearNewAddress($content);
                newAddress.manualAddressSignUpSlideUp();
                newAddress.removeHTMLFromDom();
            };

            showCallback = function () {
                newAddress.validation.enableSave();
                validationExtras.updatePlaceholders($content);
                newAddress.initialisePCAField($details);
            };

            if ($target.hasClass('cancel')) {
                $content.find('.invalid2').hide();
            }

            if (breakpoint.mobile) {
                html = $.trim($('<div></div>').html($content.clone().css('display', '')).html());

                common.virtualPage.show({
                    content: html,
                    closeSelector: '.back, .cancel',
                    callbackIn: function (currentVirtualPage, event) {
                        if (event && event.target && event.target.className === bfpo.sToggleContentClassName) {
                            return;
                        }

                        newAddress.validation.init('#virtual-page', $target);
                        validationExtras.updatePlaceholders('#virtual-page');
                        newAddress.initialisePCAField($('#virtual-page .new-address'));

                        if (newAddress.enableBfpo) {
                            bfpo.bindToggle($('div#virtual-page div.new-address'));
                        }
                    },
                    callbackOut: function () {
                        newAddress.clearNewAddress();
                        newAddress.manualAddressSignUpSlideUp();
                        newAddress.removeHTMLFromDom();
                    }
                });
            } else {
                if ($content.is(':visible')) {
                    if (newAddress.enableBfpo) {
                        bfpo.close(utils.getDeliveryGroup(e.target));
                    }

                    if (typeof jQuery !== 'undefined') {
                        $content.not(':animated').slideUp(function () {
                            hideCallback();
                        });
                    } else {
                        $content.hide();
                        hideCallback();
                    }

                    newContactChk();
                    editCourierChk();
                } else {
                    if (typeof jQuery !== 'undefined') {
                        $content.not(':animated').slideDown(function () {
                            showCallback();
                        });
                    } else {
                        $content.show();
                        showCallback();
                    }

                    newContactChk();
                    editCourierChk();
                }
            }

            return false;
        },

        initialisePCAField: function ($container) {
            var el = null,
                pca = null,
                fieldLimits = {
                    companyName: 60,
                    flatNumber: 30,
                    buildingName: 55,
                    primaryStreet: 70
                },
                sManualAddressMarkup = '<div class="manually-add-address"><div class="field-wrapper"><label for="nv-Company">Company name</label><input id="nv-Company" title="Please complete one of the following three fields" placeholder="Company name" name="companyname" value="" type="text" class="highlight" maxlength="' + fieldLimits.companyName + '"></div><div class="field-wrapper"><label for="nv-FlatNumber">Flat / unit number</label><input id="nv-FlatNumber" title="Please complete one of the following three fields" placeholder="Flat / unit number" name="flatnumber" value="" type="text" class="highlight" maxlength="' + fieldLimits.flatNumber + '"></div><div class="field-wrapper"><label for="nv-BuildingName">Building number / name</label><input id="nv-BuildingName" title="Please complete one of the following three fields" placeholder="Building number / name" name="buildingname" value="" type="text" class="highlight" maxlength="' + fieldLimits.buildingName + '"></div><div class="field-wrapper"><label for="nv-PrimaryStreet">Street</label><input id="nv-PrimaryStreet" title="Street" placeholder="Street" name="street" value="" type="text" maxlength="' + fieldLimits.primaryStreet + '"></div><div class="field-wrapper"><input id="nv-Locality" title="Locality"  name="locality" value="" type="hidden" /><input id="nv-City" title="City" placeholder="City" name="city" value="" type="hidden" /><div class="locality-city"></div></div></div>',
                $bfpoContainer = $container.find(bfpo.sContainer);

            if ($('#postal-code-pca').length === 0) {
                $container.find('div.post-code').append('<input id="postal-code-pca" class="input postal-code-pca required highlight" type="text" title="Enter a postcode" placeholder="Enter a postcode" name="postal-code-pca" maxlength="8"><div id="ed59pz86tg22kf685176"></div>');
            }

            el = $container.find('input[name="postal-code-pca"]');
            el.data('isAddressSelected', false);
            loadCapturePlus();

            if ($('.edit-address-button').length === 0) {
                $container.find('.pcaCapturePlusTable').after('<button class="primary-button disabled edit-address-button">Edit</button>');
            }

            if ($bfpoContainer.length && newAddress.enableBfpo) {
                $bfpoContainer.after(sManualAddressMarkup);
            } else {
                $container.find('.post-code').after(sManualAddressMarkup);
            }

            if ($container.find('.edit-da-block').length) {
                $container = $container.find('.edit-da-block');
            }

            pca = new PCA_EditableAddress(newAddress, $container, true, newAddress.updatePostCodePlaceholder);
            newAddress.validation.init($container);
        },

        updatePostCodePlaceholder: function () {
            var $tdContainer = $('#postal-code-pca').closest('td'),
                $inputPostcode = $('#postal-code-pca');

            if (common.isIE9OrLower()) {
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

        update: function (result, $target) {
            newAddress.getInitialDeliveryDetails();
            customDropdown.init($('div.billing-address').find('select'));

            if (newAddress.callback) {
                newAddress.callback($parent);
            }
        },

        save: function ($form, $target) {
            var $loader = null,
                request = 'addNewAddress',
                url = null,
                $elem = null,
                DL = new data.DataLayer(),
                myData = null;

            if (breakpoint.mobile) {
                if ($('#virtual-page').hasClass('checkout-different-address')) {
                    $loader = $form.parents('.form-mobile-wrapper');
                } else {
                    $loader = $form.find('.form-mobile-wrapper');
                }

                $target.parents('.address').next().html($('#virtual-page .new-address').html());
                $target.parents('.address').next().find('input[name="nick-names"]').val($('#virtual-page .new-address input[name="nick-names"]').val());
                $target.parents('.address').next().find('#postal-code-pca').val($('#virtual-page .new-address #postal-code-pca').val());
                $form = $target.parents('.address').next().find('form');
                common.virtualPage.close();
            } else {
                if ($('#lightbox').hasClass('checkout-different-address')) {
                    $loader = $form.parents('.form-mobile-wrapper');
                } else {
                    $loader = $form.parents('.collection-details');
                }
            }

            url = utils.getFormAction($form);
            $elem = $form;
            myData = $form.serialize();

            DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (result) {
                if (breakpoint.mobile) {
                    if ($('#virtual-page').hasClass('checkout-different-address')) {
                        newAddress.callback($target);
                        newAddress.callback = null;
                    } else {
                        $loader = $target.parents('.collection-details');
                        newAddress.update(result, $loader);
                    }
                } else {
                    if ($('#lightbox').hasClass('checkout-different-address')) {
                        newAddress.callback($target);
                        newAddress.callback = null;
                    } else {
                        newAddress.update(result, $loader);
                    }
                }
            });
        },

        validation: {
            $form: [],

            enableSave: function (myForm) {
                var self = newAddress.validation,
                    sRequiredFields = '[name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]';

                myForm = $(myForm);

                if (myForm.data('isBfpoAddress')) {
                    sRequiredFields = '[name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber]';
                }

                if (myForm) {
                    validationExtras.enableSave(
                        myForm.find(sRequiredFields),
                        myForm.find('input.save')
                    );
                } else {
                    validationExtras.enableSave(
                        self.$form.find(sRequiredFields),
                        self.$form.find('input.save')
                    );
                }
            },

            init: function (context, $target, callback) {
                var self = newAddress.validation,
                    $toCompare = [],
                    mapFields = ['postal-code-pca', 'companyname', 'flatnumber', 'buildingname', 'street', 'locality', 'city'];

                self.$form = $('.new-address form', context);
                $(newAddress.containerSelector).find('input[name="postal-code-pca"]').data('isAddressSelected', false);
                validationExtras.customMethods.isUnique();
                validationExtras.customMethods.checkEditableAddresses();
                validationExtras.customMethods.validateSpecialInvalidCharacters();

                if ($target && $target.length) {
                    $toCompare = ($target.hasClass('delivery-block')) ? $target.find('.collection-details') : $target.parents('.collection-details');
                } else {
                    $toCompare = self.$form.parents('.collection-details');
                }

                if ($('#singleAddressNickname').length) {
                    $toCompare = $toCompare.find('.new-address #singleAddressNickname');
                } else {
                    $toCompare = $toCompare.find('.address-nickname select');
                }

                if (callback) {
                    newAddress.callback = callback;
                }

                self.$form.each(function () {
                    $(this).validate({
                        ignore: '.cancel, :hidden',
                        errorClass: 'error',
                        validClass: 'valid',
                        onkeyup: function(elm) {
                            if (this.check(elm)) {
                                $(elm).addClass('valid');
                            } else {
                                $(elm).removeClass('valid');
                            }
                            self.enableSave(this.currentForm);
                        },
                        focusInvalid: false,
                        onfocusout: function(elm) {
                            this.element(elm);
                            self.enableSave(this.currentForm);
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
                                },
                                validateSpecialInvalidCharacters: true
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
                            },
                            'street':{
                            	validateSpecialInvalidCharacters: true
                            }
                        },
                        messages: {
                            'nick-names': {
                                required: validationExtras.msg.newAddressNickname.required,
                                isUnique: validationExtras.msg.isUnique.inValid,
                                validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
                            },
                            'postal-code-pca': {
                                required: validationExtras.msg.postcode.required
                            },
                            'companyname': {
                            	checkEditableAddresses: validationExtras.msg.editableAddress.required,
                            	 validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
                            },
                            'flatnumber': {
                            	checkEditableAddresses: validationExtras.msg.editableAddress.required,
                            	 validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
                            },
                            'buildingname': {
                            	checkEditableAddresses: validationExtras.msg.editableAddress.required,
                            	 validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
                            },
                            'street':{
                            	validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
                            }
                        },
                        errorPlacement: function(error, element) {
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
                        },
                        submitHandler: function(form) {
                            var $container = $(newAddress.containerSelector),
                                fieldLength = mapFields.length,
                                fieldValue = '';
                            for (var m = 0; m < fieldLength; m++) {
                                fieldValue = $container.find('[name=' + mapFields[m] + ']').val();
                                fieldNameHdn = mapFields[m].replace(/-/g, "");
                                $container.find("#form-values-" + fieldNameHdn).val(fieldValue);
                            }

                            newAddress.save($(form), $target);
                        }
                    });

                    validationExtras.focusoutFix($(this));
                    validationExtras.limitCharacters($(this).find('[name=nick-names]'), 20);
                    self.enableSave($(this));
                });
            }
        },

        init: function () {
            $(document).on('tap click', '.collection-details .address .edit', function (e) {
                var $currentBlock = $(this).parents('.collection-details').find('.new-address'),
                    _oWebAnalytics = new analytics.WebMetrics();

                e.stopImmediatePropagation();
                newAddress.hideOpenDeliveryBlocks($currentBlock);
                newAddress.toggleNewAddress(e);
                _oWebAnalytics.submit([{
                    'eVar65': 'EDA_P1',
                    'events': 'event65'
                }]);
            });

            $(document).on('tap click', '.collection-details .new-address .cancel', newAddress.toggleNewAddress);

            $(document).on('click', '.new-address input.save', function (e) {
                var _oWebAnalytics = null;

                if (!newAddress.pcaAddressSelected) {
                    e.preventDefault();
                }

                $('.new-address input.save').each(function () {
                    if (!$(this).hasClass('disabled')) {
                        _oWebAnalytics = new analytics.WebMetrics();
                        _oWebAnalytics.submit([{
                            'eVar65': 'EDA_S1',
                            'events': 'event65'
                        }]);
                    }
                });
            });

            newAddress.validation.init($('.checkout'));
            refreshAll.reInit.push(function () {
                newAddress.validation.init($('.checkout'));
            });

            if (newAddress.enableBfpo) {
                bfpo.init();
            }
        },

        getInitialDeliveryDetails: function () {
            var $elem = null;

            $('.delivery-block').each(function () {
                $elem = $(this).find('.tabs input[type=radio]:checked');

                if ($elem.length > 0) {
                    $elem.trigger('click');
                }
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
