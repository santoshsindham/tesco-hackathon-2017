/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery,_ */
define('modules/chip-and-pin/giftCards', ['domlib', 'modules/mvapi/common', 'modules/chip-and-pin/giftCards-models', 'modules/overlay/common', 'modules/inline-scrollbar/common', 'modules/validation', 'modules/chip-and-pin/bundles', 'modules/common', 'modules/chip-and-pin/user-session', 'modules/chip-and-pin/kmf-io'], function ($, mvApi, mvModels, overlay, inlineScrollbar, validationExtras, bundles, common, userSession, kmfIO) {
    "use strict";

    var self,
        init,
        update,
        show,
        resetBackEndMessageBox,
        bindGiftCardEntryEvents,
        setupGiftCardsEntryValidation,
        bindGiftCardListingEvents,
        overlayParams,
        injectGiftCardEntryModalContent,
        injectGiftCardWalletModalContent,
        onGiftCardSubmissionResult,
        onGiftCardDeletionResult,
        onAddGiftCardClick,
        onDeleteGiftCardClick,
        updateOverlayHeading,
        isVisible = false,
        MODE = {
            LISTING: "listing",
            ADDITEM: "addItem"
        },
        currentMode = MODE.ADDITEM,
        busy = false;

    onGiftCardSubmissionResult = function onGiftCardSubmissionResult(data) {
        var messageData;

        if (data.tenderDetails.giftCards.giftCardErrormessage) {
            messageData = {
                'section': 'kiosk',
                'templateId': 'giftCardsEntryModalContent',
                'placeholderClass': 'dialog-content',
                'defaults': {
                    'statusMessageClass': 'error',
                    'statusMessageText': data.tenderDetails.giftCards.giftCardErrormessage || "Unknown Error"
                }
            };

            mvApi.render('giftCardsEntryForm', messageData, bindGiftCardEntryEvents);
            mvApi.publish("/chip-and-pin/display", 'giftCardEntry');
        } else {
            mvApi.getModel('giftCardsListItems').collection.items = data.tenderDetails.giftCards.giftCardDetails;
            isVisible = false;
            overlay.hide();
        }
    };

    onGiftCardDeletionResult = function onGiftCardDeletionResult() {
        injectGiftCardWalletModalContent();
    };

    onAddGiftCardClick = function onAddGiftCardClick() {
        var giftCardCode = $('#txt-giftCardCode').val(),
            giftCardPin = $('#txt-giftCardPin').val();

        if (giftCardCode !== "" && giftCardPin !== "") {
            $(this).trigger({
                type: "addItem",
                discountType: "giftCards",
                code: giftCardCode,
                pin: giftCardPin
            });
        }
    };

    onDeleteGiftCardClick = function onDeleteGiftCardClick(e) {
        if (!busy) {
            busy = true;
            e.stopImmediatePropagation();
            var giftCardCode = this.value;
            $(this).trigger({
                type: "removeItem",
                discountType: "giftCards",
                code: giftCardCode
            });
            currentMode = MODE.LISTING;
        }
    };

    overlayParams = {
        content: '<div class="kiosk-lightbox"></div>',
        additionalCloseButtonClassNames: 'kiosk-lightbox-close-btn',
        hideOnOverlayClick: true
    };

    bindGiftCardEntryEvents = function bindGiftCardEntryEvents() {
        setupGiftCardsEntryValidation();
        $('.chip-and-pin-debug-bar').attr('data-section', 'giftCardsEntry');
        $('#btn-add-giftCards').off().on('click', onAddGiftCardClick);
        $('#btn-show-giftCards').click(function () {
            injectGiftCardWalletModalContent();
        });
    };

    bindGiftCardListingEvents = function bindGiftCardListingEvents() {
        $('.giftCardsList').on('click tap', 'button[type=button], input[type=button]', onDeleteGiftCardClick);
        $('#btnHaveGiftCard').on('click tap', function () {
            resetBackEndMessageBox();
            $('.dialog-content').html('');
            injectGiftCardEntryModalContent();
        });
    };

    setupGiftCardsEntryValidation = function setupGiftCardsEntryValidation() {
        var inputForm = $('#frmGiftCardsEntry');
        inputForm.validate({
            debug: true,
            ignore: "",
            onkeyup: function (e) {
                if (this.check(e)) {
                    $(e).addClass('valid');
                } else {
                    $(e).removeClass('valid');
                }
            },
            focusInvalid: false,
            errorElement: 'span',
            showErrors: function () {
                this.defaultShowErrors();
            },
            errorPlacement: function (error, element) {
                error.insertAfter(validationExtras.errorPlacementElement(element));
            },
            rules: {
                'txt-giftCardCode': {
                    required: true
                },
                'txt-giftCardPin': {
                    required: true
                }
            },
            messages: {
                'txt-giftCardCode': {
                    required: validationExtras.msg.giftCardNumber.required
                },

                'txt-giftCardPin': {
                    required: validationExtras.msg.giftCardPin.required
                }
            }
        });

        inputForm.find("input").focus(function () {
            inputForm.parent().find("span.error").hide();
        });
    };

    injectGiftCardEntryModalContent = function injectGiftCardEntryModalContent() {
        currentMode = MODE.ADDITEM;
        $('#lightbox').removeClass('no-keyboard');
        $('.dialog-content').html('');
        userSession.canScanGiftcard = true;
                            
        mvApi.render('giftCardsModalHeader', {
            defaults: {
                heading: bundles['spc.chipAndPin.giftCards.addGiftCardsHeading']
            }
        }, function () {
            mvApi.render('giftCardsEntryForm', function () {
                mvApi.render('giftCardsModalFooter', function () {
                    bindGiftCardEntryEvents();
                    mvApi.publish("/chip-and-pin/display", 'giftCardEntry');
                });
            });
        });
    };

    updateOverlayHeading = function updateOverlayHeading() {
        var heading = $(".kiosk-lightbox .dialog-header h2");
        heading.html(bundles['spc.chipAndPin.giftCards.giftCardsListHeading']);
    };

    injectGiftCardWalletModalContent = function injectGiftCardWalletModalContent() {

        var inlineScrollBarInstance,
            customItems,
            data = common.getLocalCheckoutData();

        mvApi.getModel('giftCardsListItems').collection.items = data.tenderDetails.giftCards.giftCardDetails;
        currentMode = MODE.ADDITEM;

        $('#lightbox').addClass('no-keyboard');
        $('.dialog-content').html('');

        mvApi.render('giftCardsModalHeader', {
            defaults: {
                heading: bundles['spc.chipAndPin.giftCards.giftCardsListHeading']
            }
        }, function () {
            updateOverlayHeading(data.tenderDetails.giftCards.giftCardDetails);
            mvApi.render('giftCardsWalletModalContent', function () {
                mvApi.render('giftCardsListItems', function () {

                    inlineScrollBarInstance = $('#giftCardWalletScrollBar');
                    if (!inlineScrollBarInstance.length) {
                        customItems = [];
                        $('.giftCardsList > li').each(function () {
                            customItems.push($(this).outerHeight());
                        });

                        inlineScrollbar.init($('.giftCardsWallet'), {
                            containerId: 'giftCardWalletScrollBar',
                            customItems: customItems,
                            forceEnable: false
                        });
                    }

                    mvApi.render('giftCardsWalletModalFooter', function () {
                        bindGiftCardListingEvents();
                    });
                });
            });
        });
    };

    show = function show(mode) {
        var lbox = $('.kiosk-lightbox'),
            callback;

        if (lbox.length) {
            lbox.remove();
        }

        currentMode = mode === undefined ? currentMode : mode;

        if (currentMode === MODE.ADDITEM) {
            callback = injectGiftCardEntryModalContent;
        } else {
            callback = injectGiftCardWalletModalContent;
        }

        overlayParams.callback = function () {
            mvApi.render('overlayLayout', callback);
        };

        resetBackEndMessageBox();
        overlay.show(overlayParams);
        isVisible = true;
    };

    resetBackEndMessageBox = function resetBackEndMessageBox() {
        mvApi.updateModel('giftCardsEntryForm', {
            defaults: {
                statusMessageClass: '',
                statusMessageText: ''
            }
        });
    };

    update = function update(resp) {
		var data;
        if (resp)
        	data = JSON.parse(resp);
		else
			data = common.getLocalCheckoutData();

        busy = false;
        resetBackEndMessageBox();
        mvApi.getModel('giftCardsListItems').collection.items = data.tenderDetails.giftCards.giftCardDetails;
        if (isVisible) {
            if (currentMode === MODE.ADDITEM) {
                onGiftCardSubmissionResult(data);
            } else {
                onGiftCardDeletionResult();
            }
        }
    };

    init = function init() {
        mvApi.cacheInitialModels(mvModels);
        userSession.canScanGiftcard = true;
        kmfIO.registerCallback('canScanGiftcard', function (number) {
			if($('#txt-giftCardCode').length)
				$('#txt-giftCardCode').val(number);
        });
    };

    self = {
        init: init,
        update: update,
        show: show,
        MODE: MODE
    };

    return self;
});