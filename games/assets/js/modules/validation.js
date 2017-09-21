/*globals define, window*/
/*jslint plusplus:true, regexp: true*/
define([
    'domlib',
    'modules/breakpoint',
    'modules/common',
    'modules/custom-dropdown/common',
    'modules/tesco.utils',
    'modules/chip-and-pin/bundles'
], function (
    $,
    breakpoint,
    common,
    customDropdown,
    utils,
    bundles
) {
    'use strict';
    var validationExtras = {
        msg: {
            signinpass: {
                required: "Please enter your email address.",
                signinpassword: "Password must contain a upper case, number and a special character"
            },
            email: {
                required: "Enter an email address",
                confirm: "Confirm your email address",
                inValid: "Enter a valid email address",
                equalTo: "Your email addresses don't match"
            },
            postcode: {
                required: bundles["spc.chipAndPin.login.validation.enterAPostCode"] || 'Enter a postcode',
                inValid: "Enter a valid postcode"
            },
            postcodeUK: {
                inValid: "Please check the postcode you've entered is correct."
            },
            clubcard: {
                required: "Enter a clubcard number",
                requiredKiosk: bundles['spc.chipAndPin.login.validation.required'] || 'Please enter a number.',
                requiredMyAccount: "Please enter a Clubcard number.",
                chooseOne: "Enter a clubcard number",
                inValidKiosk: bundles['spc.chipAndPin.login.validation.inValid'] || 'Please enter a number.',
                inValid: 'Enter a valid clubcard number'
            },
            title: {
                required: "Select title"
            },
            firstname: {
                required: "Enter a first name",
                inValid: "Enter a valid first name"
            },
            lastname: {
                required: "Enter a last name",
                inValid: "Enter a valid last name"
            },
            date: {
                dateDayCheck: "Enter your date of birth",
                dateMonthCheck: "Enter your date of birth",
                dateYearCheck: "Enter your date of birth",
                ageRestrictionYearCheck: $('#wrapper.spi').length > 0 ? "You must be over the age of " + $('#wrapper.spi').data().ageRestriction : "You must be over the age of 18"
            },
            screenname: {
                minlength: "Please choose a screen name that is at least six characters. This will be displayed if you write a product review."
            },
            address: {
                required: "You need to select your main address."
            },
            addressNickname: {
                required: "Enter a nickname for this address."
            },
            companyname: {
                inValid: "Sorry, we do not accept sets of single or double quote marks",
                inValidLastChar: "Sorry, we do not accept * as the last character",
                inValidSingleQuotes: "Sorry, we don't accept a pair of single quote marks",
                required: "Enter a company name"
            },
            editableAddress: {
                required: "Complete one of the following three fields",
                inValid: "Sorry, we only accept the following special characters –().&\',/"
            },
            newAddressNickname: {
                required: "Enter a nickname",
                inValid: "Please do not enter special characters {}<>[]"
            },
            propertyType: {
                required: "Please enter a property type"
            },
            daytimeTelephone: {
                required: "Please enter a daytime phone number.",
                inValid: "Your daytime phone number must begin with a 0 and contain 10 or 11 digits including the dialling code."
            },
            eveningTelephone: {
                required: "Please enter an evening phone number.",
                inValid: "Your evening phone number must begin with a 0 and contain 10 or 11 digits including the dialling code."
            },
            alternateTelephone: {
                required: "Enter your alternate phone number",
                inValid: "Enter a valid contact phone number."
            },
            mobile: {
                required: "Enter your mobile phone number",
                inValid: "Invalid mobile phone number"
            },
            phone: {
                required: "Enter a contact phone number",
                inValid: "Enter a valid contact phone number"
            },
            password: {
                required: "Enter a password",
                confirm: "Confirm password",
                rangelength: "Invalid password",
                equalTo: "Your passwords don't match",
                enhancedPassword: "Invalid password"
            },
            terms: {
                required: 'Please tick this box to agree to Tesco <a href="/direct/help/terms-conditions.page" target="_blank">Terms and Conditions</a>'
            },
            eGamingTerms: {
            	required: 'Please tick this box to agree that once you start downloading your digital content you will lose the right to cancel your order within 14 days.',
            	checked: 'I agree that once I start downloading my digital content I will lose the right to cancel my order within 14 days.'
            },
            nameOnCard: {
                required: "Enter the name on your card"
            },
            cardNumber: {
                required: "Enter a card number"
            },
            securityCode: {
                required: "Enter a code",
                number: "Invalid code",
                minLength: "Invalid code",
                maxLength: "Invalid code"
            },
            expiryDate: {
                required: "Select an expiry date"
            },
            billingAddress: {
                required: "Please select a billing address"
            },
            giftCard: {
                required: "Enter your Gift card code and PIN"
            },
            giftCardNumber: {
                required: "Enter a valid gift card code"
            },
            giftCardPin: {
                required: "Enter a valid gift card PIN"
            },
            couponCode: {
                required: "Enter a valid code"
            },
            voucherCode: {
                required: "Enter a valid code"
            },
            isUnique: {
                inValid: "You are already using this nickname"
            },
            ageverification: {
                dobRequired: "Please enter your date of birth",
                inValid: function () {
                    return "You must be over the age of " + $('#min-age').val();
                }
            },
            postcodeTownCombo: {
                inValid: "Enter a valid town or postcode"
            },
            flatnumber: {
                required: "Enter a flat / unit number"
            }
        },

        customMethods: {
        	 //function which check for special charcters in the nick name field and address line One field
            validateSpecialInvalidCharacters: function(){
             $.validator.addMethod('validateSpecialInvalidCharacters', function (value, element, params) {
                  var regexp,
                      isValid;
                  regexp = /[{}\[\]<>]/;
                  isValid = regexp.test(value);
                  
                  return !isValid;
                  
       	   
              }, validationExtras.msg.newAddressNickname.inValid);
            },
            // valid company name with everything except ,'"
            companyNameCheck: function () {
                $.validator.addMethod('companyNameCheck', function (value, element, params) {
                    var regexp,
                        isValid;
                    regexp = /^[^,"]*$/;
                    isValid = regexp.test(value);
                    return isValid;
                }, validationExtras.msg.companyname.inValid);
            },
            // valid company name with everything except ,'"
            companyNameLastCharacterCheck: function () {
                $.validator.addMethod('companyNameLastCharacterCheck', function (value, element, params) {
                    if (value.slice(-1) === '*') {
                        return false;
                    }
                    return true;

                }, validationExtras.msg.companyname.inValidLastChar);
            },
            // Currently not begin used...
            companyNameSingleQuotes: function () {
                $.validator.addMethod('companyNameSingleQuotes', function (value, element, params) {
                    if ((value.split("'").length - 1) > 1) {
                        return false;
                    }
                    return true;

                }, validationExtras.msg.companyname.inValidSingleQuotes);
            },
            // valid names with letters and hyphen only.
            nameCheck: function () {
                $.validator.addMethod('nameCheck', function (value, element, params) {
                    var isLastname = params.isLastname,
                        regexp,
                        isValid;
                    regexp = (isLastname) ? (/^[A-Za-z\s-']+([A-Za-z\s-']+)*$/) : (/^[A-Za-z\s-]+(-[A-Za-z\s-]+)*$/);

                    isValid = regexp.test(value);
                    return isValid;
                }, validationExtras.msg.firstname.inValid);
            },
            //validate
            ageRestrictionCheck: function () {

                var validate_month = function () {
                    var v_month = $('#register-date-month').val(),
                        month = parseInt(v_month, 10);

                    return /^[0-9]{1,2}$/.test(v_month) && month <= 12;
                },
                    validate_day = function () {
                        var v_day = $('#register-date-day').val(),
                            v_month = $('#register-date-month').val(),
                            v_year = $('#register-date-year').val(),
                            day = parseInt(v_day, 10),
                            month = parseInt(v_month, 10),
                            year = parseInt(v_year, 10),

                            currDate = new Date(),
                            d = new Date(year, month - 1, day),
                            isValid = isNaN(d) || !validate_month() || (!isNaN(d) && ((d.getMonth() + 1) === month && d.getDate() === day) && validate_month());

                        return /^[0-9]{1,2}$/.test(v_day) && day <= 31 && isValid;
                    },

                    validate_year = function () {
                        var v_year = $('#register-date-year').val(),
                            year = parseInt(v_year, 10);

                        return /^[0-9]{4}$/.test(v_year) && year >= 1900;
                    },

                    validate_all = function (value, element, params) {
                        var v_day = $('#register-date-day').val(),
                            v_month = $('#register-date-month').val(),
                            v_year = $('#register-date-year').val(),
                            day = parseInt(v_day, 10),
                            month = parseInt(v_month, 10),
                            year = parseInt(v_year, 10),
                            birthday = new Date(year, month - 1, day),
                            currDate = new Date(),
                            millisPerYear = 1000 * 60 * 60 * 24 * 365.25,
                            age = ((currDate.getTime()) - birthday.getTime()) / millisPerYear;

                        return (!validate_day() || !validate_month() || !validate_year()) || age >= params;
                    };

                $.validator.addMethod('dateDayCheck', validate_day, '');
                $.validator.addMethod('dateMonthCheck', validate_month, '');
                $.validator.addMethod('dateYearCheck', validate_year, '');

                $.validator.addMethod('ageRestrictionDayCheck', validate_all, '');
                $.validator.addMethod('ageRestrictionMonthCheck', validate_all, '');
                $.validator.addMethod('ageRestrictionYearCheck', validate_all, '');
            },
            // valid telephone number which begins with 0 and contain 11 digits.
            telephone: function () {
                $.validator.addMethod('telephone', function (value, element, params) {
                	var regexp = /^0\d{9,10}$/;
                	return common.verifyTelephone(regexp, value);
                }, validationExtras.msg.daytimeTelephone.inValid);
            },

            // valid telephone number which begins with 0 and contain 11 digits.
            eveningTelephone: function () {
                $.validator.addMethod('eveningTelephone', function (value, element, params) {
                	var regexp = /^0\d{9,10}$/;
                	return common.verifyTelephone(regexp, value);
                }, validationExtras.msg.eveningTelephone.inValid);
            },
            signinpassword: function () {
                $.validator.addMethod("signinpassword", function (value) {
                    return /^[A-Za-z0-9\d=!\-@._*]*$/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
                }, validationExtras.msg.signinpass.signinpassord);
            },

            // valid mobile number which begin with 07 and contain 11 digits.
            mobile: function () {
                $.validator.addMethod('mobile', function (value, element, params) {
                    if (value === '') {
                        return true;
                    }
                    var regexp = /^07\d{9}$/,
                        isValid = regexp.test(value.replace(/\s/g, ''));
                    return isValid;
                }, validationExtras.msg.mobile.inValid);
            },

            // valid telephone number which begins with 0 and contain 11 digits.
            phone: function () {
                $.validator.addMethod('phone', function (value, element, params) {
                    var regexp = /^(07[\d]{9}|01[\d]{8,9}|02[\d]{8,9})$/;
                    return common.verifyTelephone(regexp, value);
                }, validationExtras.msg.phone.inValid);
            },

            postcodeTownCombo: function () {
                $.validator.addMethod('postcodeTownCombo', function (value, element) {
                    return this.optional(element) || /^[a-zA-Z0-9\s]+$/i.test(value);
                }, validationExtras.msg.postcodeTownCombo.inValid);
            },

            // check form field checking for editable addresses (used in checkout and account section)
            checkEditableAddresses: function () {
                $.validator.addMethod('checkEditableAddresses', function (value, element, params) {
                    var bResult = false,
                        self = this;
                    $.each(this.groups, function (key, value) {
                        var $elem = $(self.currentForm).find('input[name="' + key + '"]');
                        if ($elem.val() !== '') {
                            bResult = true;
                            return;
                        }
                    });

                    if (bResult) {
                        $.each(this.groups, function (key, value) {
                            var $elem = $(self.currentForm).find('input[name="' + key + '"]');
                            $elem.removeClass('error required').addClass('valid');
                        });
                        return true;

                    } else {
                        $.each(this.groups, function (key, value) {
                            var $elem = $(self.currentForm).find('input[name="' + key + '"]');
                            if ($elem.val() === '') {
                                $elem.removeClass('valid').addClass('required error');
                            }
                        });
                        return false;
                    }
                }, validationExtras.msg.editableAddress.required);
            },

            checkEditableAddressesInvalidCharacters: function () {
                $.validator.addMethod('checkEditableAddressesInvalidCharacters', function (value, element, params) {

                    var self = this,
                        regex = /^[\/,\w\d\s–().&\''/-]+$/, // Allowed chars
                        $elem = $(element);


                    $elem.removeClass('failedInvalidChars');
                    if (value !== '') {
                        if (!value.match(regex)) {
                            $elem.addClass('failedInvalidChars');
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }

                }, validationExtras.msg.editableAddress.inValid);

            },
            // UK clubcard number length
            postcodeUK: function () {
                $.validator.addMethod('postcodeUK', function (value, element) {
                    var regexp = /^[a-zA-Z].*$/,
                        check = utils.checkPostCodeIsValid(value);
                    if (check) {
                        check = regexp.test(value);
                    }
                    return check;
                }, validationExtras.msg.postcodeUK.inValid);
            },

            // check clubcard number length
            clubcardLength: function () {
                $.validator.addMethod('clubcardLength', function (value, element) {
                    return $.inArray($.trim(value).length, [16, 18]) !== -1;
                }, validationExtras.msg.clubcard.inValid);
            },

            // check clubcard number length
            clubcardFormat: function () {
                $.validator.addMethod('clubcardFormat', function (value, element) {
                    return /^63400(\d{11}|\d{13})$/.test($.trim(value));
                }, validationExtras.msg.clubcard.inValid);

            },

            // check that the entered value does not match an existing one
            isUnique: function () {
                $.validator.addMethod('isUnique', function (value, element, params) {
                    var isValid = true,
                        options,
                        i,
                        len;
                    if (value !== '' && params.fieldToCompare[0]) {
                        if (params.fieldToCompare[0].tagName.toLowerCase() === 'select') {
                            options = params.fieldToCompare.find('option');
                            for (i = 0, len = options.length; i < len; i++) {
                                if ($.trim(options[i].text.toLowerCase()) === $.trim(value.toLowerCase())) {
                                    isValid = false;
                                    break;
                                }
                            }
                        } else if (params.fieldToCompare[0].tagName.toLowerCase() === 'input') {
                            if ($.trim(params.fieldToCompare[0].value.toLowerCase()) === $.trim(value.toLowerCase())) {
                                isValid = false;
                            }
                        } else {
                            isValid = params.fieldToCompare[0].value === value;
                        }
                    }

                    return isValid;
                }, validationExtras.msg.isUnique.inValid);
            },

            // check that the entered value does not match an existing one
            isUniqueFromString: function () {
                $.validator.addMethod('isUniqueFromString', function (value, element, params) {

                    var isValid = true,
                        nicknames = params.fieldToCompare,
                        i;

                    if (typeof (nicknames) === undefined) {
                        return;
                    }

                    nicknames = nicknames.split(',');
                    for (i = 0; i < nicknames.length; i++) {
                        if (nicknames[i].toLowerCase() === value.toLowerCase()) {
                            isValid = false;
                            break;
                        }
                    }

                    return isValid;

                }, validationExtras.msg.isUnique.inValid);
            },

            // check ageverification
            ageverification: function () {
                var min_age;
                $.validator.addMethod('ageverification', function (value, element) {
                    var day = parseInt($('#spc-age-confirmation-module-dd').val(), 10),
                        month = parseInt($('#spc-age-confirmation-module-mm').val(), 10),
                        year = parseInt($('#spc-age-confirmation-module-yyyy').val(), 10),
                        birthday = new Date(year, month - 1, day),
                        currDate = new Date(),
                        millisPerYear = 1000 * 60 * 60 * 24 * 365,
                        age = ((currDate.getTime()) - birthday.getTime()) / millisPerYear;
                    min_age = $('#min-age').val();
                    if (age < min_age) {
                        return false;
                    } else {
                        return true;
                    }
                }, 'You must be over the age of ' + min_age + ' to purchase some items in your basket');
            },

            enhancedPassword: function (EnhancedPassword) {
                $.validator.addMethod('enhancedPassword', function (fieldValue) {
                    var $integratedReg = $('#integrated-registration'),
                        oEnhancedPassword = new EnhancedPassword(fieldValue),
                        iCheckLengthPass = oEnhancedPassword.checkLength(),
                        iCheckNumberPass = oEnhancedPassword.checkNumber(),
                        iCheckLowerCasePass = oEnhancedPassword.checkLowerCase(),
                        iCheckUpperCasePass = oEnhancedPassword.checkUpperCase(),
                        iSpecialCharactersPass = oEnhancedPassword.checkSpecialCharacters();

                    $integratedReg.toggleClass('fnCheckLengthPass', iCheckLengthPass);
                    $integratedReg.toggleClass('fnCheckNumberPass', iCheckNumberPass);
                    $integratedReg.toggleClass('fnCheckLowerCasePass', iCheckLowerCasePass);
                    $integratedReg.toggleClass('fnCheckUpperCasePass', iCheckUpperCasePass);
                    $integratedReg.toggleClass('fnSpecialCharactersPass', iSpecialCharactersPass);

                    if (iCheckLengthPass && iCheckNumberPass && iCheckLowerCasePass && iCheckUpperCasePass && iSpecialCharactersPass) {
                        return true;
                    }
                }, validationExtras.msg.password.enhancedPassword);
            },

            validPCAAddress: function () {
                $.validator.addMethod('validPCAAddress', function (value, element) {
                    if ($('.manually-add-address').is(':visible')) {
                        return true;
                    } else {
                        return false;
                    }
                }, validationExtras.msg.postcode.inValid);
            }
        },

        // update the error placement element - for custom drop downs, the error cannot appear after the select element
        // needs to be after the custom drop down wrapper
        errorPlacementElement: function (element) {
            var innerElement;
            if (element[0].tagName.toLowerCase() === 'select') {
                innerElement = customDropdown.getWrapper(element);
                if (!innerElement.length) {
                    innerElement = element.nextAll('.customDropdown');
                }
            } else {
                innerElement = element;
            }
            return innerElement;
        },

        // nasty fix - may need to look into amending the lib for better fix
        // focus out not begin triggered on old android devices (samsung ace) so force
        // validation of self on blur
        focusoutFix: function ($form) {
            if (common.isAndroid()) {
                $form.find('input[type=text], input[type=email], input[type=password]').blur(function () {
                    $(this).valid();
                });
            }
        },

        selectChangeFix: function ($form, $fields, $save) {
            if (common.isAndroid()) {
                $form.find('select').change(function () {
                    $(this).valid();
                    validationExtras.enableSave($fields, $save);
                });
            }
        },


        scrollToError: function ($elem, speed) {
            var self = utils,
                s = speed || 500;

            if ($elem.length) {
                self.scrollToElem($elem, speed);
            }
        },

        enableSave: function ($fields, $save) {

            var $valid,
                $changeFields;

            $valid = $fields.filter(function () {
                // although a field may have a prefilled value on load, it won't yet have the 'valid' class
                // so call the validate function on the element to set up
                if (!$(this).hasClass('valid')) {
                    if ($(this).validate().check(this)) {
                        $(this).addClass('valid');
                    } else {
                        $(this).removeClass('valid');
                    }
                }
                return $(this).hasClass('valid');
            });

            // check if the selects have the custom 'prefilledValue' set
            // this will get set on form initialisation
            $fields.filter('select').each(function () {
                if (typeof (this.prefilledValue) === undefined) {
                    this.prefilledValue = this.value;
                }
            });

            // collect any form fields who's values differ from their defaults
            $changeFields = $fields.filter(function () {
                var hasChanged = false,
                    tagName = this.tagName.toLowerCase(),
                    timeNow = new Date();
                if (tagName === 'select') {
                    hasChanged = this.value !== this.prefilledValue;
                } else {
                    if (this.type === 'radio' || this.type === 'checkbox') {
                        hasChanged = this.checked !== this.defaultChecked;
                    } else {
                        hasChanged = this.value !== this.defaultValue;
                    }
                }

                return hasChanged;
            });

            // only enable the save button if all the fields are valid and that they have changed
            // from their default values
            if ($fields.length === $valid.length && $changeFields.length !== 0) {
                $save.removeClass('disabled');
            } else {
                $save.addClass('disabled');
            }
        },

        // Suppress non-numeric input (without preventing paste). Prevent more than 11-digit input.
        // MERGE THIS WITH THE OTHER?
        limitCharactersPhone: function ($field, charLimit) {
            $field.on('keydown.limitCharacters', function (e) {
                var field = $(this),
                    codes = [8, 46, 9, 16, 37, 39, 9],
                    arrowKeys,
                    notDeleteOrTabKey,
                    newTrimmedValue;

                if (charLimit === '') {
                    charLimit = 11;
                }

                // Is a number
                if ((e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 95 && e.keyCode < 106) || ($.inArray(e.keyCode, codes) > -1)) {
                    // limitCharacters: function (e, field, charLimit) {
                    arrowKeys = e.keyCode > 36 && e.keyCode < 40;
                    notDeleteOrTabKey = e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode !== 9;

                    if (field.val().length >= charLimit && field[0].selectionStart === field[0].selectionEnd && notDeleteOrTabKey && !arrowKeys) {
                        e.preventDefault();
                        newTrimmedValue = field.val().substring(0, charLimit);

                        field.val(newTrimmedValue);

                        return false;
                    }
                    // }
                } else { // Is not a number
                    e.preventDefault();
                }
            });
        },

        limitCharacters: function ($field, charLimit) {
            $field.each(function () {
                if (this.isLimitCharacters) {
                    return;
                }

                this.isLimitCharacters = true;
                this.charLimit = charLimit;

                $(this).on('keydown.limitCharacters', function (e) {
                    var arrowKeys = e.keyCode > 36 && e.keyCode < 40,
                        notDeleteOrTabKey = e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode !== 9;

                    if (this.value.length >= this.charLimit && this.selectionStart === this.selectionEnd && notDeleteOrTabKey && !arrowKeys) {
                        e.preventDefault();

                        // udpated with trimmed value
                        this.value = this.value.substring(0, this.charLimit);

                        return false;
                    }
                });
            });
        },

        limitCharactersNumber: function ($field, charLimit) {
            $field.each(function () {
                if (this.isLimitCharacters) {
                    return;
                }

                this.isLimitCharacters = true;
                this.charLimit = charLimit;

                $(this).on('keydown.limitCharacters', function (e) {
                    var arrowKeys = e.keyCode > 36 && e.keyCode < 40,
                        notDeleteOrTabKey = e.keyCode !== 8 && e.keyCode !== 46 && e.keyCode !== 9;

                    if (this.value.length >= this.charLimit && notDeleteOrTabKey && !arrowKeys) {
                        e.preventDefault();

                        // udpated with trimmed value
                        this.value = this.value.substring(0, this.charLimit);

                        return false;
                    }
                });
            });
        },

        updatePlaceholders: function (context, forceShow, bottomPx) {
            $('[placeholder]', context).each(function () {
                if (!$(this).parents('.placeholder').length) {
                    $(this).placeholder({
                        inputWrapper: '<div class="placeholder" />',
                        placeholderCSS: {
                            'position': 'absolute',
                            'top': 'auto',
                            'right': 'auto',
                            'bottom': bottomPx || '0',
                            'left': '0'
                        }
                    });
                }
            });
        },

        customGroupValidation: function (element) {
            var bResult = true,
                myCustomGroup = ['companyname', 'flatnumber', 'buildingname'],
                self = this;
            $.each(myCustomGroup, function (ord, key) {
                var $elem = $(self.currentForm).find('input[name="' + key + '"]');
                bResult = $.validator.methods.checkEditableAddressesInvalidCharacters($elem.val(), $elem[0]);
                if (!bResult) {
                    return false;
                }
            });
            return bResult;
        },
        removeCustomGroupErrors: function (myCustomGroup) {
            var self = this;
            $.each(myCustomGroup, function (ord, key) {
                var $elem = $(self.currentForm).find('input[name="' + key + '"]');
                if (breakpoint.mobile) {
                    $elem.prev('.error').remove();
                } else {
                    $elem.closest('.field-wrapper').prev('.error').remove();
                }
            });
        },
        removeCustomGroupFieldErrorClass: function (myCustomGroup, $form) {
            var self = this;
            $.each(myCustomGroup, function (ord, key) {
                var $elem = $form ?
                    $form.find('input[name="' + key + '"]') :
                    $(self.currentForm).find('input[name="' + key + '"]');

                if (!$elem.hasClass('failedInvalidChars')) {
                    $elem.removeClass('error');
                }
            });
        },

        /*
         * checksum calculation for GTIN-8, GTIN-12, GTIN-13, GTIN-14, and SSCC
         * based on http://www.gs1.org/barcodes/support/check_digit_calculator
         */
        checkGTIN: function checkGTIN(gtin) {
            var iLastDigit = 0,
                iCheckSum = 0,
                aGTINchars = [],
                iOddTotal = 0,
                iEvenTotal = 0,
                i = 0;

            if (gtin.length < 8 || gtin.length > 18 || (gtin.length !== 8 && gtin.length !== 12 && gtin.length !== 13 && gtin.length !== 14 && gtin.length !== 18)) {
                return false;
            }

            iLastDigit = Number(gtin.substring(gtin.length - 1));

            if (isNaN(iLastDigit)) {
                return false;
            }

            aGTINchars = gtin.substring(0, gtin.length - 1).split('').reverse();

            for (i = 0; i < aGTINchars.length; i++) {
                if (isNaN(aGTINchars[i])) {
                    return false;
                }
                if (i % 2 === 0) {
                    iOddTotal += Number(aGTINchars[i]) * 3;
                } else {
                    iEvenTotal += Number(aGTINchars[i]);
                }
            }

            iCheckSum = (10 - ((iEvenTotal + iOddTotal) % 10)) % 10;

            return iCheckSum === iLastDigit;
        }

    };
    return validationExtras;
});
