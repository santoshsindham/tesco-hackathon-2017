/*jslint plusplus: true */
/*globals window,document,console,define,require */
define([
    'domlib',
    'modules/validation',
    'modules/custom-dropdown/common'
], function ($, validationExtras, customDropdown) {
    'use strict';

    var $manageContactForm,
        contactFormValidation;

    contactFormValidation = function contactFormValidation() {

        validationExtras.customMethods.nameCheck();

        $manageContactForm.validate({
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
            rules: {
                'user-title': {
                    required: true
                },
                'firstname': {
                    required: true,
                    nameCheck: {
                        isLastname: false
                    }
                },
                'lastname': {
                    required: true,
                    nameCheck: {
                        isLastname: true
                    }
                }
            },
            messages: {
                'user-title': {
                    required: validationExtras.msg.title.required
                },
                'firstname': {
                    required: validationExtras.msg.firstname.required,
                    nameCheck: validationExtras.msg.firstname.inValid
                },
                'lastname': {
                    required: validationExtras.msg.lastname.required,
                    nameCheck: validationExtras.msg.lastname.inValid
                }
            }
        });

        validationExtras.limitCharactersNumber($manageContactForm.find('[name=firstname]'), 20);
        validationExtras.limitCharacters($manageContactForm.find('[name=lastname]'), 25);

        $('input#firstname, input#lastname').trigger('blur');
    };

    $(document).ready(function () {
        $manageContactForm = $('#manageContactForm');

        if ($manageContactForm.length > 0) {
            customDropdown.init($('select#user-title'));
            contactFormValidation();
        }
    });
});