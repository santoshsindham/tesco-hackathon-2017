/*globals define, window, describe, it, expect, beforeEach, afterEach, spyOn */
/*jslint plusplus:true*/

/// <reference path="common.js">

define('modules/enhanced-password/common.test', ['modules/enhanced-password/common'], function (EnhancedPassword) {
    'use strict';

    describe('[GFO-942] - Registration - password strength enhancement', function () {

        var sInputPassword = 'pa1s$wOrd',
            oExpectedValue;

        afterEach(function () {
            oExpectedValue = null;
        });

        describe('GIVEN I am on the checkout or registration page creating a new account', function () {

            describe('Object constructor', function () {
                it('GIVEN we have NOT provided a valid argument (string) to the constructor', function () {
                    expect(function () {
                        return new EnhancedPassword();
                    }).toThrowError('Invalid param in constructor');
                });
            });

            describe('WHEN I enter a VALID password...', function () {

                var oEnhancedPassword = new EnhancedPassword(sInputPassword);

                it('THEN it MUST contain...a minimum of 8 characters', function () {
                    oExpectedValue = oEnhancedPassword.checkLength();
                    expect(oExpectedValue).toEqual(true);
                });

                it('THEN it MUST contain...a number', function () {
                    oExpectedValue = oEnhancedPassword.checkNumber();
                    expect(oExpectedValue).toEqual(true);
                });

                it('THEN it MUST contain...a lowercase character', function () {
                    oExpectedValue = oEnhancedPassword.checkLowerCase();
                    expect(oExpectedValue).toEqual(true);
                });

                it('THEN it MUST contain...an uppercase character', function () {
                    oExpectedValue = oEnhancedPassword.checkUpperCase();
                    expect(oExpectedValue).toEqual(true);
                });

                it('THEN it MUST contain...a special character (e.g.! ? £ $ #)', function () {
                    oExpectedValue = oEnhancedPassword.checkSpecialCharacters();
                    expect(oExpectedValue).toEqual(true);
                });
            });

            describe('WHEN I enter less than 8 characters as the password...', function () {
                var sIncorrectPassword = 'pass',
                    oEnhancedPassword = new EnhancedPassword(sIncorrectPassword);

                it('THEN I expect the checkLength() method to return as FALSE', function () {
                    oExpectedValue = oEnhancedPassword.checkLength();
                    expect(oExpectedValue).toEqual(false);
                });
            });

            describe('WHEN I do NOT enter any numerical characters as the password...', function () {
                var sIncorrectPassword = 'pa$$',
                    oEnhancedPassword = new EnhancedPassword(sIncorrectPassword);

                it('THEN I expect the checkNumber() method to return as FALSE', function () {
                    oExpectedValue = oEnhancedPassword.checkNumber();
                    expect(oExpectedValue).toEqual(false);
                });
            });

            describe('WHEN I do NOT enter in lowercase characters as the password...', function () {
                var sIncorrectPassword = 'P455W0RD',
                    oEnhancedPassword = new EnhancedPassword(sIncorrectPassword);

                it('THEN I expect the checkLowerCase() method to return as FALSE', function () {
                    oExpectedValue = oEnhancedPassword.checkLowerCase();
                    expect(oExpectedValue).toEqual(false);
                });
            });

            describe('WHEN I do NOT enter in uppercase characters as the password...', function () {
                var sIncorrectPassword = 'p4$$',
                    oEnhancedPassword = new EnhancedPassword(sIncorrectPassword);

                it('THEN I expect the checkUpperCase() method to return as FALSE', function () {
                    oExpectedValue = oEnhancedPassword.checkUpperCase();
                    expect(oExpectedValue).toEqual(false);
                });
            });

            describe('WHEN I do NOT enter in any special characters as the password...', function () {
                var sIncorrectPassword = 'pass',
                    oEnhancedPassword = new EnhancedPassword(sIncorrectPassword);

                it('THEN I expect the checkSpecialCharacters() method to return as FALSE', function () {
                    oExpectedValue = oEnhancedPassword.checkSpecialCharacters();
                    expect(oExpectedValue).toEqual(false);
                });
            });

        });

    });

});