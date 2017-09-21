/* eslint-disable */
/*globals define, window*/
/*jslint plusplus:true*/
define([
    'domlib',
    'modules/common',
    'modules/tesco.analytics',
    'modules/validation',
    'modules/checkout/loader',
    'modules/tesco.utils',
    'modules/tesco.data',
    'modules/textbox-session-storage/common',
    'modules/editable-addresses/common',
    'modules/enhanced-password/common',
    'modules/bfpo/common'
], function ($, common, analytics, validationExtras, loader, utils, tescoData, textboxSessionStorage, PCA_EditableAddress, EnhancedPassword, bfpo) {
    'use strict';

    var oIr,
        oIrExisting,
        oIrNew,
        oIrPCA,
        sDOMSELECTORS = {
            body: 'body',
            HEADER: '#header',
            checkout: '.checkout',
            container: '#integrated-registration',
            ABOUTYOUCOMPLETE: '#about-you-complete',
            aboutYouMod: '#about-you-mod',
            existingCustomer: '#ir-sign-in-mod',
            signInForm: '#ir-sign-in',
            newCustomer: '#ir-register1-mod',
            newCustomerForm: '#ir-register1',
            pcaInputField: 'input.postal-code-pca',
            loader: '.loader'
        },
        sDOMSELECTORSFromOneAccountiFrame = {
            irspcSignin : 'irspc-SigninIframe',
            irspcRegistration : 'irspc-RegistrationIframe'
        },
        oDomElements = {
            $body: null,
            $checkout: null,
            $container: null,
            $aboutYouMod: null,
            $existingCustomer: null,
            $signInForm: null,
            $newCustomer: null,
            $newCustomerForm: null,
            $pcaInputField: null,
            $loader: null
        },
        oSECTIONS = {
            existing: 'existingCustomer',
            newUser: 'newCustomer'
        },
        oPCA_FIELDS = {
            pca: '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.postalCode',
            companyname: '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName',
            flatnumber: '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber',
            buildingname: '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.buildingNameNumber'
        },
        oPCA_FIELDSELECTORS = {
            pca: '[name="' + oPCA_FIELDS.pca + '"]',
            companyname: '[name="' + oPCA_FIELDS.companyname + '"]',
            flatnumber: '[name="' + oPCA_FIELDS.flatnumber + '"]',
            buildingname: '[name="' + oPCA_FIELDS.buildingname + '"]'
        },

        /*
         * Initial SP Reg
         */
        integratedRegistration = {

            editButtonClicked: false,
            pcaAddressSelected: false,
            typingStarted: false,
            isEditPage: false,
            initialised: false,
            groupFields: oPCA_FIELDSELECTORS.companyname + ', ' + oPCA_FIELDSELECTORS.flatnumber + ', ' + oPCA_FIELDSELECTORS.buildingname,
            enableSaveFields: '[name=reg-title], [name=register-firstname], [name=register-lastname], [name=register-email], ' + oPCA_FIELDSELECTORS.pca + ', ' + oPCA_FIELDSELECTORS.companyname + ', ' + oPCA_FIELDSELECTORS.flatnumber + ', ' + oPCA_FIELDSELECTORS.buildingname,
            enableBfpo: true,

            domLookup: function domLookup() {
                oDomElements = {
                    $body: $(sDOMSELECTORS.body),
                    $checkout: $('#wrapper.checkout'),
                    $container: $(sDOMSELECTORS.container),
                    $aboutYouMod: $(sDOMSELECTORS.aboutYouMod, $(sDOMSELECTORS.container)),
                    $newCustomer: $(sDOMSELECTORS.newCustomer, $(sDOMSELECTORS.container)),
                    $existingCustomer: $(sDOMSELECTORS.existingCustomer, $(sDOMSELECTORS.container)),
                    $signInForm: $(sDOMSELECTORS.signInForm, $(sDOMSELECTORS.container)),
                    $newCustomerForm: $(sDOMSELECTORS.newCustomerForm, $(sDOMSELECTORS.container)),
                    $loader: $('.loader')
                };
            },

            applyCustomRadioButtons: function applyCustomRadioButtons() {
                common.customRadio(sDOMSELECTORS.aboutYouMod);
            },

            bindEvents: function bindEvents() {
                oDomElements.$container.on('click', '#existingCustomer, #newCustomer', function () {
                    var section = $(this).attr('id');
                    oIr.sectionToggle(section);
                    oIr.hidePageError();
                });

                oDomElements.$container.on('click', '.tabs label', function () {
                    $(this).parents('li').find('input').trigger('click');
                });

                oDomElements.$body.on('click', '.irSPC .place-order', function (e) {
                    var $paymentError = $('#payment-submit-error');
                    $paymentError.show();
                    validationExtras.scrollToError($paymentError);
                    e.preventDefault();
                });

                oDomElements.$newCustomerForm.find('.custom-radio').each(function () {
                    common.customRadioBindEvent(this);
                });
            },

            hidePageError: function hidePageError() {
                $('.page-error', oDomElements.$container).hide();
            },

            postMessageToOneAccount: function postMessageToOneAccount(iframeId, message) {
                var iframeWindow = document.getElementById(iframeId).contentWindow;

                iframeWindow.postMessage(message, '*');
            },

            setIframeHeight: function setIframeHeight(id, height) {
                var oneAccountIframe = $('#' + id);

                oneAccountIframe.css({ 'height' : height || oneAccountIframe.contents().find('html').height() + 'px', 'visibility' : 'visible' });
            },

            sectionToggle: function sectionToggle(section) {
                var irspcRegIframePath = $('#' + sDOMSELECTORSFromOneAccountiFrame.irspcRegistration).data('src');

                switch (section) {
                case oSECTIONS.existing:
                    oIr.animateSections(oDomElements.$newCustomer, oDomElements.$existingCustomer, function () {
                        if ($('#' + sDOMSELECTORSFromOneAccountiFrame.irspcSignin).length > 0) {
                            integratedRegistration.postMessageToOneAccount(sDOMSELECTORSFromOneAccountiFrame.irspcSignin, 'calculate_height');
                        }
                        oIr.validation.resetForm(oDomElements.$signInForm);
                        if (!oIrExisting.instantiated) {
                            oIrExisting.init();
                        }
                    });
                    break;
                case oSECTIONS.newUser:
                    if ($('#' + sDOMSELECTORSFromOneAccountiFrame.irspcRegistration).length &&
                            !$('#' + sDOMSELECTORSFromOneAccountiFrame.irspcRegistration).contents().find('.register').length) {
                        $('#' + sDOMSELECTORSFromOneAccountiFrame.irspcRegistration).attr('src', irspcRegIframePath);
                    }

                    oIr.animateSections(oDomElements.$existingCustomer, oDomElements.$newCustomer, function () {
                        if ($('#' + sDOMSELECTORSFromOneAccountiFrame.irspcRegistration).length > 0) {
                            integratedRegistration.postMessageToOneAccount(sDOMSELECTORSFromOneAccountiFrame.irspcRegistration, 'calculate_height');
                        }
                        if (!oIrPCA.instantiated) {
                            oIrPCA.init();
                        }
                    });
                    oIr.applyWebAnalytics();
                    break;
                }
            },

            animateSections: function animateSections($a, $b, callback) {
                $a.removeClass('open').hide(function () {
                    $b.addClass('open').slideDown(function () {
                        if (callback) {
                            callback();
                        }
                    });
                });
            },

            applyWebAnalytics: function applyWebAnalytics() {
                var oWebMetrics = new analytics.WebMetrics(),
                    aEvents = [{
                        'eVar14': 'Some Details about You 1',
                        'prop19': 'New Customer',
                        'events': 'event10,event19'
                    }];
                oWebMetrics.submit(aEvents);
            },

            aboutYouComplete: function aboutYouComplete() {
                var self = this;

                if ($(sDOMSELECTORS.ABOUTYOUCOMPLETE).length > 0 && !$('#wrapper.checkout').length) {
                    self.bindHideAboutYouCompleteClickEvent();

                    setTimeout(function () {
                        self.hideAboutYouComplete();
                    }, 3000);
                }
            },

            bindHideAboutYouCompleteClickEvent: function bindHideAboutYouCompleteClickEvent() {
                $(sDOMSELECTORS.HEADER).on('click', sDOMSELECTORS.ABOUTYOUCOMPLETE, this.hideAboutYouComplete);
            },

            hideAboutYouComplete: function hideAboutYouComplete() {
                $(sDOMSELECTORS.ABOUTYOUCOMPLETE).addClass('hideAboutYouComplete');

                if (window.Modernizr.csstransitions) {
                    $(sDOMSELECTORS.ABOUTYOUCOMPLETE).on('transitionend', function () {
                        $(sDOMSELECTORS.ABOUTYOUCOMPLETE)[0].style.display = 'none';
                    });
                    return;
                }

                $(sDOMSELECTORS.ABOUTYOUCOMPLETE)[0].style.display = 'none';
            },

            manualAddressSignUpSlideUp: function manualAddressSignUpSlideUp() {
                oIrPCA.manualAddressSignUpSlideUp.call(this);
            },

            manualAddressSignUpSlideDown: function manualAddressSignUpSlideDown(oParams) {
                oIrPCA.manualAddressSignUpSlideDown.call(this, oParams);
            },

            displayInlineAjaxErrors: function displayInlineAjaxErrors(sResponse) {
                if (sResponse && typeof sResponse === 'string') {
                    $('#dg-ir-page-error', oDomElements.$checkout).html(sResponse);
                }
            },
            receiveMessageFromOneAccount: function receiveMessageFromOneAccount(e) {
                var url = window.location.href,
                    arrayOfUrl = url.split('/direct/'),
                    siteContext = arrayOfUrl[0],
                    frames = document.getElementsByTagName('iframe'),
                    i = 0,
                    receivedData = '';

                e.preventDefault();
                e.stopPropagation();

                if (e.originalEvent.origin !== siteContext) {
                    return;
                }

                for (i = 0; i < frames.length; i++) {
                    if (frames[i].contentWindow === e.originalEvent.source
                            && frames[i].src.indexOf(e.originalEvent.origin) === 0) {
                        receivedData = e.originalEvent.data;
                        if (receivedData === 'login_success') {
                            oIrExisting.submitSignInViaAjax(e.originalEvent, receivedData);
                        } else if (receivedData === 'register_success') {
                            oIrNew.handleRegisterSubmit(receivedData);
                        } else if (receivedData.type === 'height_change') {
                            integratedRegistration.setIframeHeight(e.originalEvent.source.name, receivedData.height);
                        }
                        break;
                    }
                }
            },

            init: function init() {
                oIr = integratedRegistration;
                oIrExisting = oIr.existingCustomerSection;
                oIrNew = oIr.newCustomerSection;
                oIrPCA = oIr.postCodeAnywhereSetup;

                oIr.domLookup();
                oIr.applyCustomRadioButtons();
                oIr.bindEvents();
                oIrExisting.init();
                oIr.initialised = true;
                window.picturefill();

                var iFrameDetection = (window === window.parent) ? false : true;

                // If the registration is already selected in the HTML, show the new customer section
                if (common.isPage(common.constants.PAGE_SPC)) {
                    if (oDomElements.$existingCustomer.length > 0 || $('.oneAccountEnabled').length > 0) {
                        if (!iFrameDetection) {
                            oDomElements.$checkout.addClass('irSPC');
                        }
                    }
                }

                if ($(('#newCustomer'), oDomElements.$container).prop('checked')) {
                    oIr.sectionToggle(oSECTIONS.newUser);
                }

                $(window).on('message', oIr.receiveMessageFromOneAccount);
            }

        };
    /*s
     * Generic validation object
     */
    integratedRegistration.validation = {

        setupCheckbox: function setupCheckbox($form) {
            $('.custom-checkbox', $form).on('change', function () {
                oIr.validation.checkboxErrorSwitcher.call(this, true);
            });
            common.customCheckBox.init($form);

            $('#register-terms').attr('title', validationExtras.msg.terms.required);
        },
        checkboxErrorSwitcher: function checkboxErrorSwitcher(isValid, message) {
            var $this = $(this),
                $checkboxWrapper = $this.closest('.checkbox-wrapper'),
                $message;
            if (isValid) {
                $checkboxWrapper
                    .removeClass('error')
                    .find('label.error')
                    .removeClass('error')
                    .end()
                    .find('span.error')
                    .remove();
            } else {
                if (message) {
                    if (!$checkboxWrapper.hasClass('error')) {
                        $message = $('<span class="error" />').text(message);
                        $message.appendTo($checkboxWrapper);
                    } else {
                        $checkboxWrapper.find('.error').show();
                    }
                }
                $checkboxWrapper.addClass('error');
            }
        },
        termsCheckboxValid: function termsCheckboxValid() {
            var $terms = $('.ir-login #register-terms');
            // if the error message is for the terms checkbox, update the error element
            // to change the message position
            if ($terms.prop('checked')) {
                $terms.closest('.checkbox-wrapper').removeClass('error');
            } else {
                $terms.closest('.checkbox-wrapper').addClass('error');
            }
        },

        resetForm: function resetForm($form) {
            if ($form.length > 0) {
                $form.validate().resetForm();
                $form.find('input.error, div.error').removeClass('error');
            }
        },

        invalidHandlerAfterSubmit: function invalidHandlerAfterSubmit() {
            var oValidator = arguments,
                iNumberOfErrors = 0,
                fieldWrapperOffset = 0,
                $closetFieldWrapper;

            oValidator = oValidator[1];
            iNumberOfErrors = oValidator.numberOfInvalids();

            if (iNumberOfErrors > 0) {
                $closetFieldWrapper = $(oValidator.errorList[0].element).closest('.field-wrapper');
                fieldWrapperOffset = $closetFieldWrapper.length > 0 ? $closetFieldWrapper.offset().top : 0;
                fieldWrapperOffset = fieldWrapperOffset > 0 ? fieldWrapperOffset - 7 : 0;
                common.scrollToOffset(fieldWrapperOffset);
            }
        }

    };

    /*
     * Login [existing customer] section
     */
    integratedRegistration.existingCustomerSection = {

        instantiated: false,
        sDOMSELECTORS: {
            signInButton: '#signin-button'
        },
        init: function init() {

            oDomElements.$signInForm.validate({
                onkeyup: function (formElement) {
                    if (this.check(formElement)) {
                        $(formElement).addClass('valid');
                    } else {
                        $(formElement).removeClass('valid');
                    }
                },
                focusInvalid: false,
                onfocusout: function (formElement) {
                    this.element(formElement);
                },
                invalidHandler: function (event, validator) {
                    var args = [event, validator];
                    oIr.validation.invalidHandlerAfterSubmit.apply(this, args);
                },
                errorElement: 'span',
                messages: {
                    'signin-email': {
                        required: validationExtras.msg.email.required,
                        email: validationExtras.msg.email.inValid
                    },
                    'signin-password': {
                        required: validationExtras.msg.password.required
                    }
                },
                errorPlacement: function (error, element) {
                    error.insertBefore(validationExtras.errorPlacementElement(element));
                }
            });

            validationExtras.focusoutFix(oDomElements.$signInForm);
            validationExtras.limitCharacters(oDomElements.$signInForm.find('[name=signin-password]'), 15);

            if (common.isPage(common.constants.PAGE_SPC)) {
                oIrExisting.initAjaxFramework();
                oIrExisting.bindSignInButton();
            }

            oIrExisting.instantiated = true;
        },

        initAjaxFramework: function initAjaxFramework() {
            var myInlineRequests = [],
                myRequests = {
                    'irSignIn': ['irSignInForm']
                },
                myModules = {
                    'irSignInForm': [
                        oIrExisting.sDOMSELECTORS.signInForm, 'Checking your login details', null,
                        function () {
                            if (common.isPage(common.constants.PAGE_SPC)) {
                                loader(oDomElements.$body, 'Retrieving your account details', false, {
                                    messages: [
                                        'Searching for the best delivery option',
                                        'Retrieving your delivery details',
                                        'Calculating your total order amount'
                                    ],
                                    timeout: 2000
                                });
                            } else {
                                loader($(oIrExisting.sDOMSELECTORS.signInButton, oDomElements.$container), '', true);
                            }
                        },
                        false
                    ]
                },
                // This will be produced/generated from the server side. If this object does not exist, it will default to myDefaultActions
                myActions = {
                    'irSignIn_integrated': ['/stubs/select-addToBasket.php']
                },
                myDefaultActions = {
                    'irSignIn': ['/stubs/irSPCSignIn.php']
                };

            tescoData.Global.init({
                'inlineRequests': myInlineRequests,
                'requests': myRequests,
                'modules': myModules,
                'actions': myActions,
                'defaultActions': myDefaultActions
            });
        },

        bindSignInButton: function bindSignInButton() {
            oDomElements.$signInForm.on('click', oIrExisting.sDOMSELECTORS.signInButton, function (e) {
                e.preventDefault();

                $('#payment-submit-error').hide();

                if (oDomElements.$signInForm.valid()) {
                    if ($('.personal-gift-message-wrapper').length) {
                        $('.uiGiftMessage').find('.personalGiftMessage').each(function () {
                            var textBoxId = $(this);
                            $(".loginHolder").children("input[id$=" + textBoxId.attr('id').split('-')[1] + "]").val($(this).val());
                            if (textBoxId.val() !== "") {
                                textboxSessionStorage.save();
                            }
                        });
                    }
                    oIr.hidePageError();
                    oIrExisting.submitSignInViaAjax(e);
                }
                return false;
            });
        },

        submitSignInViaAjax: function submitSignInViaAjax(e, receivedData) {
            var $form = utils.getFormByElement(e.target),
                sRequest = 'irSignIn',
                sUrl = tescoData.Utils.getAction(sRequest, $form),
                $elem = $form,
                DL = new tescoData.DataLayer(),
                myData = $form.serialize();

            if (receivedData === 'login_success') {
                $form = null;
                sUrl = '/direct/blocks/login/integratedRegistration/ir-login-success.jsp';
                myData = null;

                $(window).off('message', oIr.receiveMessageFromOneAccount);
            }

            DL.get(sUrl, myData, $elem, oIrExisting.dataHandler, sRequest, null, null, function (xhr) {
                var jResult = $.parseJSON(xhr.responseText);

                oDomElements.$loader = $('.loader');
                if (jResult.loginSuccessful) {
                    $(oDomElements.$container).remove();
                    oDomElements.$checkout.append(jResult.loginSuccessful);
                } else {
                    if (jResult['dg-ir-page-error']) {
                        oIr.displayInlineAjaxErrors(jResult['dg-ir-page-error']);
                    }
                    utils.scrollToElem(oDomElements.$container);
                    oDomElements.$loader.remove();
                }
            });
        },

        dataHandler: {
            handler: function (oJSON) {
                // Based on JSON response, we need to look up each element in object, relate it to the module and then lookup the module for the DOM element
                $.each(oJSON, function (k, v) {
                    switch (k) {
                    case 'redirection':
                        window.location.href = v;
                        break;
                    case 'analytics':
                        var oWebAnalytics = new analytics.WebMetrics();
                        oWebAnalytics.submit(v);
                        break;
                    case 'loginSuccessful':
                        require(['modules/checkout/common'], function (checkout) {
                            checkout.init(true);
                        });
                        break;
                    case 'defaultValues':
                        break;
                    }
                });
            }
        }
    };

    /*
     * Reg [new customer] section
     */
    integratedRegistration.newCustomerSection = {

        sDOMSELECTORS: {
            registerButton: '#register-button',
            registerTerms: '#register-terms'
        },
        oDomElements: {
            $registerButton: null,
            $registerTerms: null
        },

        init: function init() {
            var oValidateOptions;

            oIrNew.sDOMSELECTORS.registerButton = $(oIrNew.sDOMSELECTORS.registerButton);
            oIrNew.oDomElements.$registerTerms = $(oIrNew.sDOMSELECTORS.registerTerms, oDomElements.$newCustomerForm);

            oIrNew.initFramework();
            oIrNew.createCustomDropdown();
            oIr.validation.setupCheckbox(oDomElements.$newCustomerForm);

            $("#reg-title", oDomElements.$newCustomerForm).on("change keyup", function () {
                oDomElements.$newCustomerForm.validate().element(this);
            });

            // Remove all password hint-messaging HTML classes on #integrated-registration container element
            // jQuery validate doesn't trigger custom methods when there isn't a value present within the field.
            $('[name="register-password"]', oDomElements.$newCustomerForm).on('keyup', function () {
                if ($(this).val().length === 0) {
                    oDomElements.$container.removeClass();
                }
            });

            if ((oIrNew.oDomElements.$registerTerms).prop('checked')) {
                oIrNew.oDomElements.$registerTerms.addClass("valid");
            }

            oIrNew.oDomElements.$registerTerms.change(function () {
                $(this).toggleClass("valid", this.checked).valid();
                if ($(this).prop('checked')) {
                    $(this).closest('.checkbox-wrapper').removeClass('error');
                } else {
                    $(this).closest('.checkbox-wrapper').addClass('error');
                }
            });

            oValidateOptions = {
                ignore: "",
                onkeyup: function onkeyup(formElement) {
                    var $formElement = $(formElement);
                    if ($formElement.prop('name') === oPCA_FIELDS.pca) {
                        if ($formElement.val() !== '') {
                            $formElement.addClass('valid');
                        }
                    } else {
                        if (this.check(formElement)) {
                            $formElement.addClass('valid');
                        } else {
                            $formElement.removeClass('valid');
                        }
                    }
                },
                focusInvalid: false,
                onfocusout: function onfocusout(formElement) {
                    var $formElement = $(formElement);
                    if ($formElement.prop('name') === oPCA_FIELDS.pca) {
                        if ($formElement.val() === '') {
                            this.element(formElement);
                        } else {
                            $formElement.removeClass('error');
                            if (!$('.pcaAutoCompleteSmall').find('.item').length) {
                                this.element(formElement);
                            }
                        }
                    } else {
                        this.element(formElement);
                    }
                },
                onclick: function onclick(formElement) {
                    var $formElement = $(formElement);
                    if ($formElement.hasClass('required')) {
                        integratedRegistration.validation.termsCheckboxValid();
                    }
                    if ($formElement.is('#register-no-clubcard')) {
                        $('#register-clubcard').val('').removeClass('invalid');
                    }

                },
                invalidHandler: function invalidHandler(event, validator) {
                    var args = [event, validator];
                    oIr.validation.invalidHandlerAfterSubmit.apply(this, args);
                },
                errorElement: 'span',
                showErrors: function showErrors() {
                    var errorList = arguments,
                        $checkbox = $('#register-terms'),
                        i,
                        errorListLength = errorList.length;

                    for (i = 0; i < errorListLength; i++) {
                        // check if the terms checkbox has an error
                        if (errorList[i].element === $checkbox[0]) {
                            $checkbox.parent().addClass('error');
                            integratedRegistration.validation.termsCheckboxValid();
                        }
                    }
                    this.defaultShowErrors();
                },
                submitHandler: function submitHandler() {
                    oIrNew.handleRegisterSubmit();
                },
                groups: {
                    editableAddressesError: oPCA_FIELDS.companyname + ' ' + oPCA_FIELDS.flatnumber + ' ' + oPCA_FIELDS.buildingname
                },
                rules: {
                    'reg-title': {
                        required: true
                    },
                    'register-firstname': {
                        required: true,
                        nameCheck: {
                            isLastname: false
                        }
                    },
                    "register-lastname": {
                        required: true,
                        nameCheck: {
                            isLastname: true
                        }
                    },
                    'register-clubcard': {
                        required: {
                            depends: function depends() {
                                return oIrNew.clubcardCheck();
                            }
                        },
                        clubcardLength: {
                            depends: function depends() {
                                return oIrNew.clubcardCheck();
                            }
                        }
                    },
                    'register-phone': {
                        required: true,
                        phone: {
                            depends: function depends() {
                                var val = $(this).val();
                                /*jslint regexp: true*/
                                $(this).val($.trim(val.replace(/[^0-9]/g, '')));
                                /*jslint regexp: false*/
                                return true;
                            }
                        }
                    },
                    'register-password': {
                        enhancedPassword: true
                    },
                    'register-password-confirm': {
                        equalTo: '#register-password'
                    },
                    'register-terms': {
                        required: true
                    }
                },
                messages: {
                    'reg-title': {
                        required: validationExtras.msg.title.required
                    },
                    'register-firstname': {
                        required: validationExtras.msg.firstname.required,
                        nameCheck: validationExtras.msg.firstname.inValid
                    },
                    'register-lastname': {
                        required: validationExtras.msg.lastname.required,
                        nameCheck: validationExtras.msg.lastname.inValid
                    },
                    'register-email': {
                        required: validationExtras.msg.email.required,
                        email: validationExtras.msg.email.inValid
                    },
                    'register-clubcard': {
                        required: validationExtras.msg.clubcard.required,
                        digits: validationExtras.msg.clubcard.inValid,
                        clubcardLength: validationExtras.msg.clubcard.inValid
                    },
                    'register-phone': {
                        required: validationExtras.msg.phone.required,
                        phone: validationExtras.msg.phone.inValid
                    },
                    'register-password': {
                        required: validationExtras.msg.password.required,
                        rangelength: validationExtras.msg.password.rangelength,
                        enhancedPassword: validationExtras.msg.password.enhancedPassword
                    },
                    'register-password-confirm': {
                        required: validationExtras.msg.password.confirm,
                        equalTo: validationExtras.msg.password.equalTo,
                        enhancedPassword: validationExtras.msg.password.enhancedPassword
                    },
                    'register-terms': {
                        required: validationExtras.msg.terms.required
                    }
                },

                errorPlacement: function errorPlacement(error, element) {
                    var $parentForm = element.parents('form');
                    switch (element.attr("name")) {
                    case oPCA_FIELDS.pca:
                        error.insertBefore($parentForm.find(".pcaCapturePlusTable"));
                        break;
                    case oPCA_FIELDS.buildingname:
                        error.insertBefore($parentForm.find(oPCA_FIELDSELECTORS.companyname));
                        break;
                    default:
                        error.insertBefore(validationExtras.errorPlacementElement(element));
                    }
                }

            };
            // Add the following dynamic keys to the jQuery validate options object...
            oValidateOptions.rules[oPCA_FIELDS.pca] = {
                required: true,
                validPCAAddress: {
                    depends: function () {
                        return true;
                    }
                }
            };
            oValidateOptions.rules[oPCA_FIELDS.companyname] = {
                checkEditableAddresses: true
            };
            oValidateOptions.rules[oPCA_FIELDS.flatnumber] = {
                checkEditableAddresses: true
            };
            oValidateOptions.rules[oPCA_FIELDS.buildingname] = {
                checkEditableAddresses: true
            };
            oValidateOptions.messages[oPCA_FIELDS.pca] = {
                required: validationExtras.msg.postcode.required,
                validPCAAddress: validationExtras.msg.postcode.inValid
            };

            oDomElements.$newCustomerForm.validate(oValidateOptions);

            validationExtras.focusoutFix(oDomElements.$newCustomerForm);
            oIrNew.addCustomMethodsToValidationObject();
            oIrNew.setFieldCharacterLimits();
            oIrNew.checkClubcardIsValid();

            bfpo.bindToggle(oDomElements.$newCustomerForm);
        },

        validateEmail: function validateEmail(e) {
            var $validateEmailMsg = $('#validate-email-msg'),
                $registerEmail = $('#register-email'),
                sRequest = 'integratedRegValidateEmail',
                sUrl = $(e.target).data('url'),
                DL = new tescoData.DataLayer({
                    singleton: true
                }),
                myData = {
                    emailId: $registerEmail.val()
                };

            $validateEmailMsg.hide();
            if ($(e.target).valid()) {
                $validateEmailMsg.html('');
                DL.get(sUrl, myData, null, null, sRequest, null, null, function () {
                    var validateEmailMsg = $.trim($validateEmailMsg.text());
                    if (validateEmailMsg !== "") {
                        $validateEmailMsg.show();
                        $registerEmail.addClass('error').removeClass('valid');
                    } else {
                        $validateEmailMsg.hide();
                        $registerEmail.addClass('valid').removeClass('error');
                    }
                });
            }
        },

        initFramework: function initFramework() {
            var myInlineRequests = [],
                myRequests = {
                    'integratedRegLogin': [],
                    'integratedRegStep2': ['step2Container'],
                    'integratedRegValidateEmail': ['integratedRegValidateEmail'],
                    'irSPCRegistrationStep2': ['irSPCstep2Container']
                },
                myActions = {
                    'integratedRegValidateEmail-nonbk': ['/' + utils.getSiteContext() + '/blocks/catalog/productlisting/infiniteBrowse.jsp'],
                    'integratedRegLogin-nonbk': ['/' + utils.getSiteContext() + '/blocks/catalog/productlisting/infiniteBrowse.jsp'],
                    'integratedRegStep1-nonbk': ['/' + utils.getSiteContext() + '/blocks/catalog/productlisting/infiniteBrowse.jsp'],
                    'integratedRegStep2-nonbk': ['/' + utils.getSiteContext() + '/blocks/catalog/productlisting/infiniteBrowse.jsp'],
                    'integratedRegStep2Back-nonbk': ['/' + utils.getSiteContext() + '/blocks/catalog/productlisting/infiniteBrowse.jsp']
                },
                myModules = {
                    'irSPCstep2Container': [
                        sDOMSELECTORS.newCustomer, 'Please wait', null,
                        function () {
                            if (common.isPage(common.constants.PAGE_SPC)) {
                                loader(sDOMSELECTORS.body, 'Creating your account', false, {
                                    messages: [
                                        'Searching for the best delivery option',
                                        'Retrieving your delivery details',
                                        'Calculating your total order amount'
                                    ],
                                    timeout: 2000
                                });
                            } else {
                                loader(oIrNew.oDomElements.$registerButton, '', true);
                            }
                        },
                        true
                    ],
                    'step2Container': [
                        sDOMSELECTORS.newCustomer, 'Please wait', true, false, true
                    ],
                    'integratedRegValidateEmail': [
                        '#validate-email-msg', 'Please wait', false, false, false
                    ]
                },
                myDefaultActions = {
                    'integratedRegLogin': ['/stubs/integratedRegStep2.php'],
                    'integratedRegValidateEmail': ['/stubs/validateEmail.php'],
                    'integratedRegStep2': ['/stubs/integratedRegStep2Success.php']
                };
            tescoData.Global.init({
                'inlineRequests': myInlineRequests,
                'requests': myRequests,
                'modules': myModules,
                'actions': myActions,
                'defaultActions': myDefaultActions
            });
        },

        handleRegisterSubmit: function handleRegisterSubmit(receivedData) {
            var sRequest = 'integratedRegStep2',
                registrationHandler = null,
                $formButton = oDomElements.$newCustomerForm.find('input[type="submit"]'),
                $form = utils.getFormByElement(oDomElements.$newCustomerForm),
                sUrl = $form.attr('action'),
                DL = new tescoData.DataLayer({
                    singleton: true
                }),
                myData;


            if (common.isPage(common.constants.PAGE_SPC)) {
                sRequest = 'irSPCRegistrationStep2';
                registrationHandler = oIrExisting.dataHandler;
            }

            // WHEN user has no clubcard
            // THEN empty #clubcad-number
            if ($('input[name="register-no-clubcard"][value="true"]').is(':checked')) {
                $('#register-clubcard').val('');
            }

            myData = $form.serialize();

            if (receivedData === 'register_success') {
                sUrl = '/direct/blocks/login/integratedRegistration/ir-login-success.jsp';
                myData = null;
                $form = null;
                $formButton = null;

                $(window).off('message', oIr.receiveMessageFromOneAccount);
            }

            DL.get(sUrl, myData, $formButton, registrationHandler, sRequest, null, null, function (data) {
                oDomElements.$loader = $('.loader');
                var jResult = $.parseJSON(data.responseText);
                if (jResult.loginSuccessful) {
                    oDomElements.$container.remove();
                    oDomElements.$body.addClass('registered');
                    oDomElements.$checkout.append(jResult.loginSuccessful);
                } else {
                    if (jResult['dg-ir-page-error']) {
                        oIr.displayInlineAjaxErrors(jResult['dg-ir-page-error']);
                    }
                    oDomElements.$loader.remove();
                    utils.scrollToElem(oDomElements.$container);
                }
            });
        },

        setFieldCharacterLimits: function setFieldCharacterLimits() {
            validationExtras.limitCharacters(oDomElements.$newCustomerForm.find('[name=register-firstname]'), 20);
            validationExtras.limitCharacters(oDomElements.$newCustomerForm.find('[name=register-lastname]'), 25);
            validationExtras.limitCharactersNumber(oDomElements.$newCustomerForm.find('[name=register-clubcard]'), 18);
        },

        addCustomMethodsToValidationObject: function addCustomMethodsToValidationObject() {
            validationExtras.customMethods.nameCheck();
            validationExtras.customMethods.clubcardLength();
            validationExtras.customMethods.checkEditableAddresses();
            validationExtras.customMethods.validPCAAddress();
            validationExtras.customMethods.phone();
            validationExtras.customMethods.enhancedPassword(EnhancedPassword);
        },

        createCustomDropdown: function createCustomDropdown() {
            require(['modules/custom-dropdown/common'], function (customDropdown) {
                var $selects = oDomElements.$newCustomerForm.find('select');
                customDropdown.init($selects);
            });
        },

        checkClubcardIsValid: function checkClubcardIsValid() {
            $('#register-no-clubcard').on('change', function () {
                $('#clubcard-number input[name=register-clubcard]').valid();
            });
        },

        /*********************
        Revisit
        // clear the custom error after the checkbox and return the checked state of the i dont have a clubcard checkbox
        // the custom error is inserted as part of the validate showErrors() - is manually added so needs to be manually removed
        **********************/
        clubcardCheck: function clubcardCheck() {
            $('#clubcard-number, .no-clubcard').removeClass('error');
            $('.no-clubcard span.error').remove();
            $('.no-clubcard label.error').removeClass('error');
            return !$('#register-no-clubcard').is(':checked');
        }
    };

    /*
     * PCA
     */
    integratedRegistration.postCodeAnywhereSetup = {
        instantiated: false,

        sDOMSELECTORS: {
            manuallyAddAddress: '.manually-add-address'
        },
        oDomElements: {
            $manuallyAddAddress: null
        },

        init: function init(oDefaultValues) {
            oIrPCA.initialisePCAField(oDomElements.$newCustomerForm, oDefaultValues);
            PCA_EditableAddress.call(this, integratedRegistration, oDomElements.$newCustomer, false);
            oIrNew.init();
            oIrPCA.instantiated = true;
        },

        initialisePCAField: function initialisePCAField($container) {
            window.loadCapturePlus();
            oIrPCA.oDomElements.$manuallyAddAddress = $(oIrPCA.sDOMSELECTORS.manuallyAddAddress, $container);
            $('.edit-address-button', $container).insertAfter($('.pcaCapturePlusTable', $container).first());
            $(sDOMSELECTORS.pcaInputField, $container).on('focus', oIrPCA.clearPCAField);
        },

        clearPCAField: function clearPCAField() {
            oIr.editButtonClicked = false;
            oIrPCA.manualAddressSignUpSlideUp();
        },

        manualAddressSignUpSlideUp: function manualAddressSignUpSlideUp() {
            if (oIr.enableBfpo) {
                bfpo.close(oDomElements.$newCustomer);
            }

            if (!oIrPCA.oDomElements.$manuallyAddAddress.is(':visible')) {
                return;
            }

            oDomElements.$newCustomerForm.find(oIr.groupFields).removeClass('valid').val('');
            oDomElements.$newCustomerForm.validate().resetForm();

            oIrPCA.oDomElements.$manuallyAddAddress.slideUp('fast', function () {
                oIr.editButtonClicked = false;
                oIr.pcaAddressSelected = false;
            });
        },

        manualAddressSignUpSlideDown: function manualAddressSignUpSlideDown() {
            var $form = oIrPCA.oDomElements.$manuallyAddAddress.closest('form');

            oIrPCA.oDomElements.$manuallyAddAddress.slideDown('fast', function () {
                if ($form.data('isBfpoAddress')) {
                    bfpo.open($form);
                }
            });
            $('span[for="postal-code-pca"]', oDomElements.$container).hide();
        }
    };

    common.init.push(function () {
        if ($(sDOMSELECTORS.container).length > 0) {
            integratedRegistration.init();
        }
        if (!$('.irSPC').length) {
            integratedRegistration.aboutYouComplete();
        }

    });

    return integratedRegistration;

});
