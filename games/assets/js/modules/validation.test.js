/*globals define, window, describe, it, expect*/
/*jslint plusplus:true*/
define('modules/validation.test', ['modules/validation'], function (validationExtras) {
    'use strict';

    var oValidation = {
            'unitTests': [{
                'describe': 'WHEN I enter an invalid entry in the "title" field',
                'it': 'THEN I should be presented with the error message - "Select title"',
                'tests': [{
                    'expect': validationExtras.msg.title.required,
                    'toBe': 'Select title'
                }]
            }, {
                'describe': 'WHEN I enter an invalid entry in the "first name" field',
                'it': 'THEN I should be presented with the error message - "Enter a first name" AND the in valid message to be "Enter a valid first name"',
                'tests': [{
                    'expect': validationExtras.msg.firstname.required,
                    'toBe': 'Enter a first name'
                }, {
                    'expect': validationExtras.msg.firstname.inValid,
                    'toBe': 'Enter a valid first name'
                }]
            }, {
                'describe': 'WHEN I enter an invalid entry in the "last name" field',
                'it': 'THEN I should be presented with the error message - "Enter a last name" AND the in valid message to be "Enter a valid last name"',
                'tests': [{
                    'expect': validationExtras.msg.lastname.required,
                    'toBe': 'Enter a last name'
                }, {
                    'expect': validationExtras.msg.lastname.inValid,
                    'toBe': 'Enter a valid last name'
                }]
            }, {
                'describe': 'WHEN I enter an invalid entry in the "phone number" field',
                'it': 'THEN I should be presented with the error message - "Enter a contact phone number" AND the in valid message to be "Enter a valid contact phone number"',
                'tests': [{
                    'expect': validationExtras.msg.phone.required,
                    'toBe': 'Enter a contact phone number'
                }, {
                    'expect': validationExtras.msg.phone.inValid,
                    'toBe': 'Enter a valid contact phone number'
                }]
            }, {
                'describe': 'WHEN I enter an invalid entry in the "email" field',
                'it': 'THEN I should be presented with the error message - "Enter an email address" AND the in valid message to be "Enter a valid email address"',
                'tests': [{
                    'expect': validationExtras.msg.email.required,
                    'toBe': 'Enter an email address'
                }, {
                    'expect': validationExtras.msg.email.confirm,
                    'toBe': 'Confirm your email address'
                }, {
                    'expect': validationExtras.msg.email.inValid,
                    'toBe': 'Enter a valid email address'
                }, {
                    'expect': validationExtras.msg.email.equalTo,
                    'toBe': 'Your email addresses don\'t match'
                }]
            }, {
                'describe': 'WHEN I enter an invalid entry in the "postcode" field',
                'it': 'THEN I should be presented with the error message - "Enter a postcode" AND the in valid message to be "Enter a valid postcode"',
                'tests': [{
                    'expect': validationExtras.msg.postcode.required,
                    'toBe': 'Enter a postcode'
                }, {
                    'expect': validationExtras.msg.postcode.inValid,
                    'toBe': 'Enter a valid postcode'
                }]
            }, {
                'describe': 'WHEN I enter an invalid entry in the "password" field',
                'it': 'THEN I should be presented with the error message - "Enter a password" AND the in valid message to be "Enter a valid password"',
                'tests': [{
                    'expect': validationExtras.msg.password.required,
                    'toBe': 'Enter a password'
                }, {
                    'expect': validationExtras.msg.password.confirm,
                    'toBe': 'Confirm password'
                }, {
                    'expect': validationExtras.msg.password.rangelength,
                    'toBe': 'Invalid password'
                }, {
                    'expect': validationExtras.msg.password.equalTo,
                    'toBe': 'Your passwords don\'t match'
                }, {
                    'expect': validationExtras.msg.password.enhancedPassword,
                    'toBe': 'Invalid password'
                }]
            }, {
                'describe': 'WHEN I enter an invalid entry in the "terms and conditions" field',
                'it': 'THEN I should be presented with the error message - "Please tick this box to agree to Tesco Terms and Conditions"',
                'tests': [{
                    'expect': validationExtras.msg.terms.required,
                    'toBe': 'Please tick this box to agree to Tesco <a href="/direct/help/terms-conditions.page" target="_blank">Terms and Conditions</a>'
                }]
            }, {
                'describe': 'WHEN I enter an invalid entry in the "clubcard" field',
                'it': 'THEN I should be presented with the error message - "Enter a clubcard number"',
                'tests': [{
                    'expect': validationExtras.msg.clubcard.required,
                    'toBe': 'Enter a clubcard number'
                }, {
                    'expect': validationExtras.msg.clubcard.inValid,
                    'toBe': 'Enter a valid clubcard number'
                }]
            }]
        },

        fnDescribe;

    describe('[GFO-84] - More prominent error messaging on input fields', function () {

        describe('GIVEN that I am on the checkout page AND I am in any viewport...', function () {

            fnDescribe = function fnDescribe(i) {
                return function () {
                    it(oValidation.unitTests[i].it, function () {
                        var j;
                        for (j in oValidation.unitTests[i].tests) {
                            if (oValidation.unitTests[i].tests.hasOwnProperty(j)) {
                                expect(oValidation.unitTests[i].tests[j].expect).toBe(oValidation.unitTests[i].tests[j].toBe);
                            }
                        }
                    });
                };
            };

            (function fnInitTests() {
                var i;
                for (i in oValidation.unitTests) {
                    if (oValidation.unitTests.hasOwnProperty(i)) {
                        describe(oValidation.unitTests[i].describe, fnDescribe(i));
                    }
                }
            }());

        });

    });

});