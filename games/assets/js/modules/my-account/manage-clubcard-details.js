/*jslint plusplus: true */
/*globals window,document,console,define,require */
define([
    'domlib',
    'modules/validation'
], function ($, validationExtras) {
    'use strict';

    var $manageClubcardForm,
        clubcardValidation;

    clubcardValidation = function clubcardValidation() {

        validationExtras.customMethods.clubcardFormat();
        validationExtras.customMethods.postcodeUK();

        $manageClubcardForm.validate({
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
                'clubcard-no': {
                    required: true,
                    clubcardFormat: true
                },
                'clubcard-postcode': {
                    required: true,
                    postcodeUK: true
                }
            },
            messages: {
                'clubcard-no': {
                    required: validationExtras.msg.clubcard.requiredMyAccount,
                    clubcardFormat: validationExtras.msg.clubcard.inValid
                },
                'clubcard-postcode': {
                    required: validationExtras.msg.postcode.required,
                    postcodeUK: validationExtras.msg.postcode.inValid
                }
            }
        });

        validationExtras.limitCharactersNumber($manageClubcardForm.find('[name=clubcard-no]'), 18);
        validationExtras.limitCharacters($manageClubcardForm.find('[name=clubcard-postcode]'), 8);
    };

    $(document).ready(function () {
        $manageClubcardForm = $('#manageClubcardForm');

        if ($manageClubcardForm.length > 0) {
            clubcardValidation();
        }
    });
});