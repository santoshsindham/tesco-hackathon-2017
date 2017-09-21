define(['domlib', 'modules/order-amendments/constants', 'modules/order-amendments/store-change', 'modules/common'], function ($, constants, storeChange, common) {
    "use strict";

    var confirmBtn,
        desktopMessage = "You have unsaved changes. To save them, please stay on the page and select 'Confirm changes'.",
        mobileMessage = "Your changes have not been saved. To save them, please come back to this page, make the required updates, and then select the 'Confirm changes' button",
        confirmBeforeClose = function (e) {
            e = e || window.event;
            if (confirmBtn.length > 0 && !confirmBtn.hasClass('disabled')) {
                if (common.isIOS()) {
                    alert(mobileMessage);
                } else {
                    //e.returnValue = desktopMessage;
                	return desktopMessage;
                }
            }
        };

    return {
        init: function (isItSimpleOrderAmmends) {
            confirmBtn = $("#confirm-changes");
            $('body').on(constants.EVENTS.ORDER_DETAILS_AMENDED, '.amendSection', storeChange.common.enableUnsavedChangesConfirmation);
            if (isItSimpleOrderAmmends) {
                if (common.isIOS()) {
                    window.addEventListener('pagehide', confirmBeforeClose);
                } else {
                    window.onbeforeunload = confirmBeforeClose;
                }
            }
        },
        confirmBeforeClose: confirmBeforeClose
    };
});