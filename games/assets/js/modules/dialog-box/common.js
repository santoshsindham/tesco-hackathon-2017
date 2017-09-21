/*jslint plusplus: true */
/*globals define */
define('modules/dialog-box/common', ['domlib', 'modules/overlay/common', 'modules/common'], function ($, overlay, common) {
    'use strict';

    var dialogBox,
        dialogRenderer;

    dialogRenderer = {
        renderHeader: function renderHeader(dialogClassName) {
            if (!dialogClassName) {
                return '';
            }

            return $('<div />').addClass(dialogClassName);
        },

        renderContent: function renderContent(dialogContent) {
            if (!dialogContent) {
                return '';
            }

            return $('<p />').html(dialogContent);
        },

        attachButtonHandlers: function attachButtonHandlers(renderedButton, buttonConfig) {
            renderedButton.on('click', function () {
                overlay.hide();
                $(window).unbind('resize.dialogBox breakpointChange.dialogBox');
            });

            if (buttonConfig.callback !== undefined) {
                renderedButton.on('click', buttonConfig.callback);
            }
        },

        renderButton: function renderButton(buttonConfig) {
            var renderedButton = $('<a />').text(buttonConfig.title).addClass(buttonConfig.className);

            if (buttonConfig.location !== undefined) {
                renderedButton = renderedButton.attr('href', buttonConfig.location);
            }

            this.attachButtonHandlers(renderedButton, buttonConfig);
            return $('<li />').append(renderedButton);
        },

        appendButtons: function appendButtons(renderedButtonContainer) {
            var buttonsConfig = this.dialogOptions.buttons,
                i = buttonsConfig.length;

            while (i--) {
                renderedButtonContainer.append(this.renderButton(buttonsConfig[i]));
            }

            if (buttonsConfig.length > 1) {
                renderedButtonContainer.addClass('multipleButtons');
            }
        },

        renderDialogBody: function renderDialogBody() {
            var renderedDialog = $('<div id="dialogBox" class="lightbox" />')
                .append(this.renderHeader(this.dialogOptions.className))
                .append(this.renderContent(this.dialogOptions.content));

            this.appendButtons($('<ul />').appendTo(renderedDialog));

            return renderedDialog;
        },

        renderDialog: function renderDialog(dialogOptions) {
            var overlayOptions;
            this.dialogOptions = dialogOptions;

            overlayOptions = {
                content: this.renderDialogBody(),
                customClass: this.dialogOptions.customClass || 'dialogBox',
                hideOnOverlayClick: false,
                showCloseButton: false,
                lightboxPosition: this.dialogOptions.lightboxPosition || 'verticallyCentre'
            };
            overlay.show(overlayOptions);
            dialogRenderer.ieOpacityFix();
        },

        ieOpacityFix: function ieOpacityFix() {
            if (common.isModern() === false) {
                $('#overlay').addClass('dark');
            }
        }
    };

    dialogBox = {
        showDialog: function showDialog(dialogOptions) {
            dialogRenderer.renderDialog(dialogOptions);
        }
    };

    return dialogBox;
});