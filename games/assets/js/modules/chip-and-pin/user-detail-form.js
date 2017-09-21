/*jslint plusplus: true, nomen: true, regexp: true, indent: 4 */
/*globals window,document,console,define,require */
define('modules/chip-and-pin/user-detail-form', ['domlib', 'modules/settings/common', 'modules/mvapi/common', 'modules/chip-and-pin/user-detail-form-models', 'modules/custom-dropdown/common', 'modules/ajax/common', 'modules/validation', 'modules/chip-and-pin/atg-data', 'modules/chip-and-pin/user-session'], function ($, SETTINGS, mvApi, formModels, dropdown, ajax, validationExtras, atg, userSession) {
    'use strict';
    var self, init, displayDeliverySection, initCustomDropdown, renderUserDetailsForm, formRenderedCallback, renderOverlayLayout, updateDomReferences, bindClicks, extendWithAtgData,
        $continueButton, setupFormValidation, $form, iPeakAgeRestriction,
        form = '#customerDetailsForm',
        atgParserCallback = function atgParserCallback(id, sourceObject) {
            var params = {
                id: id,
                sourceObject: sourceObject,
                actions: {
                    updateModel: mvApi.updateModel
                }
            };
            ajax.handleAtg(params);
        };

    setupFormValidation = function setupFormValidation() {
        $form = $(form);
        iPeakAgeRestriction = $('#wrapper.spi').data('age-restriction');
        validationExtras.customMethods.nameCheck();
        validationExtras.customMethods.phone();
        validationExtras.customMethods.ageRestrictionCheck();

        var first = ["register-date-full"];
        $form.validate({
            ignore: "",
            onkeyup: function (e) {


                var element = $(e),
                    id = element.attr("id"),
                    that = this,

                    check = function (element) {
                        //element.toggleClass('error', !that.check(element));

                        if (first.indexOf(element.attr('id')) >= 0) {
                            that.element(element);
                        }

                    };

                if (this.check(e)) {
                    $(e).addClass('valid');
                } else {
                    $(e).removeClass('valid');
                }




                if (first.indexOf(id) === -1) {
                    first.push(id);
                }

                if (id === 'register-date-day') {
                    check($('#register-date-month'));
                    check($('#register-date-year'));
                    check($('#register-date-full'));
                    if (element.val().length === 2) {
                        $('#register-date-month').focus();
                    }
                }

                if (id === 'register-date-month') {
                    check($('#register-date-day'));
                    check($('#register-date-year'));
                    check($('#register-date-full'));
                    if (element.val().length === 2) {
                        $('#register-date-year').focus();
                    }
                }
                if (id === 'register-date-year') {
                    check($('#register-date-month'));
                    check($('#register-date-day'));
                    check($('#register-date-full'));
                }

            },
            focusInvalid: true,
            onfocusout: function (e) {
                this.element(e);
                var element = $(e),
                    id = element.attr("id");

                if ((id === 'register-date-day' || id === 'register-date-month') && element.val().length === 1) {
                    element.val('0' + element.val());
                }
            },
            errorElement: 'span',
            showErrors: function () {
                this.defaultShowErrors();
            },
            errorPlacement: function (error, element) {
                var id = element.attr("id");

                if (id === "register-date-day" || id === "register-date-month") {
                    element = $("#register-date-year");
                }

                if (id === "register-date-full") {
                    $("#lightbox .message").html(error);
                } else {
                    error.insertAfter(validationExtras.errorPlacementElement(element));
                }
            },
            rules : {
                'reg-title': 'required',
                'register-firstname': {
                    required: true,
                    nameCheck: {
                        isLastname: false
                    }
                },
                'register-lastname': {
                    required: true,
                    nameCheck: {
                        isLastname: true
                    }
                },
                'register-phone': {
                    required: true,
                    phone: {
                        depends: function () {
                            var val = $(this).val();
                            $(this).val($.trim(val.replace(/[^0-9]/g, '')));
                            return true;
                        }
                    }
                },
                'register-date-day': {
                    dateDayCheck: 'day',
                    ageRestrictionDayCheck: iPeakAgeRestriction
                },
                'register-date-month': {
                    dateMonthCheck: 'month',
                    ageRestrictionMonthCheck: iPeakAgeRestriction
                },
                'register-date-year': {
                    dateYearCheck: 'year',
                    ageRestrictionYearCheck: iPeakAgeRestriction
                },
                'register-date-full': {
                    ageRestrictionYearCheck: iPeakAgeRestriction
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
                'register-phone': {
                    required: validationExtras.msg.phone.required,
                    phone: validationExtras.msg.phone.inValid
                },
                'register-date-day': {
                    dateDayCheck: validationExtras.msg.date.dateDayCheck,
                    ageRestrictionDayCheck: " "
                },
                'register-date-month': {
                    dateMonthCheck: validationExtras.msg.date.dateMonthCheck,
                    ageRestrictionMonthCheck: " "
                },
                'register-date-year': {
                    dateYearCheck: validationExtras.msg.date.dateYearCheck,
                    ageRestrictionYearCheck: " "
                },
                'register-date-full': {
                	ageRestrictionYearCheck: $('#wrapper.spi').length > 0 ? "You must be over the age of " + iPeakAgeRestriction + " to purchase some of the items in your basket" : "You must be over the age of 18 to purchase some of the items in your basket"
                }
            }
        });

        validationExtras.limitCharactersPhone($form.find('.fnContactNumber'), 11);
        validationExtras.limitCharacters($form.find('.fnFirstName'), 20);
        validationExtras.limitCharacters($form.find('.fnLastName'), 25);

    };

    displayDeliverySection = function displayDeliverySection() {
        mvApi.navigateTo('deliveryDataWarning', false, true);
        mvApi.navigateTo('delivery', true);
    };

    extendWithAtgData = function extendWithAtgData(id, data) {
        var model = mvApi.getModel(id);
        if (model && data) {
            $.extend(data, model.atgData);
        }
        return data;
    };

    bindClicks = function bindClicks() {
        var modelChange, userData, requestData;

        $continueButton.off().on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if ($(form).valid()) {
              $continueButton.attr('disabled', true);
            userData = {
                'id': 'ir-register1',
                'reg-title': $('#userTitle .innerText').text() || ''
            };

            requestData = extendWithAtgData('user_details_form', userData);

            if (!userSession.isRegisteredUser()) {
                $.extend(requestData, {
                    'register-firstname': $('.fnFirstName').val() || '',
                    'register-lastname': $('.fnLastName').val() || '',
                    'register-email': $('.fnEmail').val() || '',
                    'register-phone': $('.fnContactNumber').val() || ''
                });
            }

            if (userSession.isAgeRestricted()) {
                $.extend(requestData, {
                    'register-date-day': $('#register-date-day').val() || '',
                    'register-date-month': $('#register-date-month').val() || '',
                    'register-date-year': $('#register-date-year').val() || ''
                });
            }

                ajax.post({
                    'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
                    'data': requestData || {},
                    'callbacks': {
                        'success': function (data) {
                            atg.handleForms(data, atgParserCallback);
                            data = JSON.parse(data);
                            if (data.header.success === true) {
                                if (userSession.isRegisteredUser()) {
                                    userSession.setUserType(SETTINGS.CONSTANTS.LOGIN.LOGIN_REGISTERED);
                                }
                                require(['modules/chip-and-pin/delivery-group'], function (deliveryGroup) {
                                    deliveryGroup.populateDeliveryGroupInformation(data.deliveryGroups);
                                });
                                displayDeliverySection();
                                mvApi.updateModel('user_details_form', {
                                    'request': {
                                        'callbacks': {
                                            'success': null
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });

    };

    updateDomReferences = function updateDomReferences() {
        $continueButton = $('#continueButton');
    };

    initCustomDropdown = function initCustomDropdown($dropdown) {
        var value = $dropdown.data('value'),
            $options = $('option', $dropdown);

        $options.each(function () {
            $(this).removeAttr('selected');
            if ($(this).val() === value) {
                $(this).attr('selected', 'selected');
            }
        });

        dropdown.init($dropdown);

    };

    formRenderedCallback = function () {
        updateDomReferences();
        initCustomDropdown($('#reg-title'));
        bindClicks();
        setupFormValidation();
        mvApi.publish("/chip-and-pin/display", 'loginUserDetails');
    };

    renderUserDetailsForm = function renderUserDetailsForm() {
        mvApi.render('user_details_form', formRenderedCallback);
    };

    renderOverlayLayout = function renderOverlayLayout() {
        mvApi.render('overlayLayout', renderUserDetailsForm);
    };


    init = function init() {
        renderOverlayLayout();
    };

    mvApi.cacheInitialModels(formModels);

    self = {
        init: init,
        initCustomDropdown: initCustomDropdown,
        updateDomReferences: updateDomReferences,
        setupFormValidation: setupFormValidation,
        pageModel: formModels.pageModel
    };
    return self;
});