/*jslint plusplus: true */
/*globals define,require,$ */
define(["modules/breakpoint", "modules/common", "modules/textbox-session-storage/common"], function (breakpoint, common, textboxSessionStorage) {
    "use strict";
    var start = function () {
            var selector = ".personalGiftMessage";
            $(selector).count({
                selector: ".count",
                warningClass: "warn",
                limitLines: 7,
                limitLineSelector: '.lineCount'
            });
        },
        registerButtonEvents = function () {
            $(".uiGiftMessage .button").one("click", function (e) {
                var ele = $(e.target);
                if (ele.hasClass("cancel")) {
                    $("#virtual-page .uiGiftMessage textarea").addClass("no-save");
                } else {
                    $("#virtual-page .uiGiftMessage textarea").removeClass("no-save");
                }
                common.virtualPage.close();
            });
        },
        mobileUse = function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var deliveryGroup = $(e.target).closest(".product-block"),
                messageTextBox = deliveryGroup.find(".uiGiftMessage").clone(),
                messageBeforeDetach = messageTextBox.find("textarea").val(),
                swapMessages = function (firstBox, secondBox) {
                    firstBox.find("textarea").val(secondBox.find("textarea").val());
                };
            common.virtualPage.show({
                content: messageTextBox,
                title: $(".label", messageTextBox).text(),
                callbackReady: function () {
                    swapMessages(messageTextBox, deliveryGroup);
                    messageTextBox.find("textarea.personalGiftMessage").count({
                        selector: ".count",
                        warningClass: "warn",
                        limitLines: 7,
                        limitLineSelector: '.lineCount'
                    });
                    registerButtonEvents();
                },
                callbackOut: function () {
                    var textBox = messageTextBox.find("textarea.personalGiftMessage");
                    if (textBox.hasClass("no-save")) {
                        textBox.val(messageBeforeDetach);
                    } else {
                        swapMessages(deliveryGroup, messageTextBox);
                    }
                    deliveryGroup.find(".uiGiftMessage textarea").data("count").update();
                    textboxSessionStorage.save();
                }
            });
        };

    return {
        init: function () {
            start();
            if (breakpoint.mobile) {
                $(".personal-gift-message-wrapper").click(mobileUse);
            }
        }
    };
});