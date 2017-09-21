/*globals define, console */
define(['modules/breakpoint', 'modules/common', 'modules/overlay/common'], function (breakpoint, common, overlay) {
    'use strict';

    var self = {}, showVirtualPage, showModalDialog, displayMessage;

    showVirtualPage = function showVirtualPage(params) {
        common.virtualPage.show(params);
    };

    showModalDialog = function showModalDialog(params) {
        overlay.show(params);
    };

    displayMessage = function displayMessage(message) {
        var config = {
            content: message,
            showBack: true,
            customClass: 'custom-class'
        };

        if (breakpoint.mobile) {
            showVirtualPage(config);
        } else {
            showModalDialog(config);
        }
    };

    /* Public methods */
    self.handle = function handle(errorObject) {
        var errorDescription, errorStatus,
            errorMessage = errorObject.message || 'An unknown error occured.';

        if (errorObject.public) {
            displayMessage(errorMessage);
        } else if (errorObject.details) {
            errorDescription = errorObject.details.statusText || 'unknown';
            errorStatus = (errorObject.details.status) ? ' (' + errorObject.details.status + ')' : '';
            console.warn(errorMessage);
            console.info('[AJAX] Error details: ' + errorDescription + errorStatus);
        }

    };

    return self;

});