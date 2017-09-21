/*jslint plusplus: true */
/*globals window,document,console,define,require */
define([
    'domlib',
    'modules/validation'
], function ($, validationExtras) {
    'use strict';

    var $changeEmailAddressForm,
        changeEmailAddressValidation;

    changeEmailAddressValidation = function changeEmailAddressValidation() {

        $changeEmailAddressForm.validate({
            ignore: "",
            onkeyup: function (e) {
                if (this.check(e)) {
                    $(e).addClass('valid');
                } else {
                    $(e).removeClass('valid');
                }
            },
            focusInvalid: true,
            onfocusout: function (e) {
                this.element(e);
            },
            errorElement: 'span',
            showErrors: function () {
                this.defaultShowErrors();
            },
            errorPlacement: function (error, element) {
                error.insertBefore(validationExtras.errorPlacementElement(element));
            },
            rules : {
                'old-email-address': {
                    required: true
                },
                'current-password': {
                    required: true
                },
                'new-email-address': {
                    required: true
                },
                'confirm-new-email-address': {
                    required: true,
                    equalTo: '#new-email-address'
                }
            },
            messages: {
                'old-email-address': {
                    required: validationExtras.msg.email.required,
                    email: validationExtras.msg.email.inValid
                },
                'current-password': {
                    required: validationExtras.msg.password.required
                },
                'new-email-address': {
                    required: validationExtras.msg.email.required,
                    email: validationExtras.msg.email.inValid
                },
                'confirm-new-email-address': {
                    required: validationExtras.msg.email.confirm,
                    email: validationExtras.msg.email.inValid,
                    equalTo: validationExtras.msg.email.equalTo
                }
            }
        });

        validationExtras.limitCharacters($changeEmailAddressForm.find('[name=password]'), 15);

        $('input#old-email-address').trigger('blur');
    };

    $(document).ready(function () {
        $changeEmailAddressForm = $('#changeEmailAddressForm');

        if ($changeEmailAddressForm.length > 0) {
            changeEmailAddressValidation();
        }
    });
});