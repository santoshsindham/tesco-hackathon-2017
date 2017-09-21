/*globals define */
/*jslint regexp: true */
define('modules/enhanced-password/common', ['domlib'], function ($) {
    'use strict';

    var EnhancedPassword = function EnhancedPassword(sValue) {
        if (!sValue) {
            throw new Error('Invalid param in constructor');
        }
        this.sValue = $.trim(sValue);
    };

    EnhancedPassword.prototype.checkLength = function checkLength() {
        var regexp = /(?=^.{8,15}$)/;
        return regexp.test(this.sValue) ? true : false;
    };

    EnhancedPassword.prototype.checkNumber = function checkNumber() {
        var regexp = /(?=.*\d)/;
        return regexp.test(this.sValue) ? true : false;
    };

    EnhancedPassword.prototype.checkLowerCase = function checLowerCase() {
        var regexp = /(?=.*[a-z])/;
        return regexp.test(this.sValue) ? true : false;
    };

    EnhancedPassword.prototype.checkUpperCase = function checkUpperCase() {
        var regexp = /(?=.*[A-Z])/;
        return regexp.test(this.sValue) ? true : false;
    };

    EnhancedPassword.prototype.checkSpecialCharacters = function checkSpecialCharacters() {
        var regexp = /(?=.*[?!#$%&£()*+,\-.\/:;<=>?@\[\]\^_{|}~])/;
        return regexp.test(this.sValue) ? true : false;
    };

    return EnhancedPassword;
});