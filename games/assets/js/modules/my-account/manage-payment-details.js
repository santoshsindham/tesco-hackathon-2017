/*jslint plusplus: true */
/*globals window,document,console,define,require */
define([
    'domlib',
    'modules/common',
    'modules/breakpoint',
    'modules/dialog-box/common'
], function ($, common, breakpoint, dialogBox) {
    'use strict';

    var $managePaymentDetailsForm,
        showDialog;

    showDialog = function showDialog(event) {
        event.preventDefault();

        dialogBox.showDialog({
            content: 'Are you sure you want to delete this card?',
            buttons: [{
                className: 'button secondary-button buttonCancel',
                title: 'No'
            }, {
                className: 'button primary-button buttonDefault buttonConfirm',
                title: 'Yes',
                callback: function () {
                    $managePaymentDetailsForm.off('click', 'input.fnDeletePaymentCard');
                    $managePaymentDetailsForm.find('input.fnDeletePaymentCard').trigger('click');
                }
            }],
            lightboxPosition: (breakpoint.mobile && common.isTouch()) ? 'verticallyBottom' : 'verticallyCentre'
        });
    };

    $(document).ready(function () {
        $managePaymentDetailsForm = $('#managePaymentForm');

        if ($managePaymentDetailsForm.length > 0) {
            $managePaymentDetailsForm.on('click', 'input.fnDeletePaymentCard', showDialog);
        }
    });
});
