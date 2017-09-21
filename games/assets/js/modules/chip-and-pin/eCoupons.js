/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery,_ */
define('modules/chip-and-pin/eCoupons', ['domlib', 'modules/mvapi/common', 'modules/chip-and-pin/eCoupon-models', 'modules/overlay/common', 'modules/inline-scrollbar/common', 'modules/validation', 'modules/chip-and-pin/bundles', 'modules/common'], function ($, mvApi, mvModels, overlay, inlineScrollbar, validationExtras, bundles, common) {
    "use strict";

    var self,
        init,
        update,
        show,
        resetBackEndMessageBox,
        bindAddItemModeEvents,
        setupAddItemModeValidation,
        bindListingModeEvents,
        overlayParams,
        injectAddItemModalContent,
        injectListingModalContent,
        onAddItemResult,
        onDeleteItemResult,
        onAddItemClick,
        onDeleteItemClick,
        onCouponTextBoxFocus,
        updateOverlayHeading,
        isVisible = false,
        MODE = {
            LISTING: "listing",
            ADDITEM: "addItem"
        },
        currentMode = MODE.ADDITEM;

    injectListingModalContent = function injectListingModalContent() {
        var inlineScrollBarInstance,
            customItems;

        currentMode = MODE.LISTING;

        $('#lightbox').addClass('no-keyboard');
        $('.dialog-content').html('');
        mvApi.render('eCouponModalHeader', { defaults: { heading: bundles['spc.chipAndPin.eCoupon.eCouponListHeading'] } }, updateOverlayHeading);
        mvApi.render('eCouponWalletModalContent', function () {
            mvApi.render('eCouponListItems', function () {
                inlineScrollBarInstance = $('#eCouponWalletScrollBar');
                if (!inlineScrollBarInstance.length) {
                    customItems = [];
                    $('.eCouponList > li').each(function () {
                        customItems.push($(this).outerHeight());
                    });
                    inlineScrollbar.init($('.eCouponWallet'), { containerId: 'eCouponWalletScrollBar', customItems: customItems, forceEnable: false });
                }
                mvApi.render('eCouponWalletModalFooter', bindListingModeEvents);
            });
        });
    };

    onAddItemResult = function onAddItemResult(data) {
        var messageData;
        resetBackEndMessageBox();
        if (data.tenderDetails.eCoupons.ecouponErrormessage) {
            messageData = {
                'section': 'kiosk',
                'templateId': 'eCouponEntryModalContent',
                'placeholderClass': 'dialog-content',
                'defaults': {
                    'statusMessageClass': 'error',
                    'statusMessageText': data.tenderDetails.eCoupons.ecouponErrormessage || 'Unknown Error'
                }
            };

            mvApi.render('eCouponEntryForm', messageData, bindAddItemModeEvents);
            mvApi.render("/chip-and-pin/display", 'eCouponEntry');
        } else {
            mvApi.getModel('eCouponListItems').collection.items = data.tenderDetails.eCoupons.ecouponScroller;
            injectListingModalContent();
        }
    };

    onDeleteItemResult = function onDeleteItemResult(data) {
        injectListingModalContent(data.tenderDetails.eCoupons.ecouponScroller, data.paymentDetails);
    };

    onAddItemClick = function onAddItemClick() {
        var couponCode = $('#txt-eCoupon').val();
        if (couponCode !== "") {
            $(this).trigger({ type: "addItem", discountType: "eCoupons", code: couponCode });
        }
    };

    onDeleteItemClick = function onDeleteItemClick() {
        $(this).trigger({ type: "removeItem", discountType: "eCoupons", code: this.value });
    };

    overlayParams = {
        content: '<div class="kiosk-lightbox"></div>',
        additionalCloseButtonClassNames: 'kiosk-lightbox-close-btn',
        hideOnOverlayClick: true
    };

    onCouponTextBoxFocus = function onCouponTextBoxFocus() {
        $(this).parent().find('span.error').hide();
        resetBackEndMessageBox();
    };

    bindAddItemModeEvents = function bindAddItemModeEvents() {
        setupAddItemModeValidation();
        $('.chip-and-pin-debug-bar').attr('data-section', 'eCouponEntry');
        $('#btn-add-ecoupon').off().on('click', onAddItemClick);
        $('#btn-show-eCoupons').click(function () {
            injectListingModalContent();
        });
        $('#txt-eCoupon').on('focus', onCouponTextBoxFocus);
    };

    bindListingModeEvents = function bindListingModeEvents() {
        $('.eCouponList').on('click tap', 'button[type=button], input[type=button]', onDeleteItemClick);
        $('#btnCancel').on('click tap', function () { overlay.hide(); });
        $('#btnHaveECoupon').on('click tap', function () {
            $('.dialog-content').html('');
            injectAddItemModalContent();
        });
    };

    setupAddItemModeValidation = function setupAddItemModeValidation() {
        $('#frmECouponEntry').validate({
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
                resetBackEndMessageBox();
                error.insertAfter(validationExtras.errorPlacementElement(element));
            },
            rules: {
                'txt-eCoupon': {
                    required: true
                }
            },
            messages: {
                'txt-eCoupon': {
                    required: validationExtras.msg.couponCode.required
                }
            }
        });
    };

    injectAddItemModalContent = function injectAddItemModalContent() {
        var data = common.getLocalCheckoutData();
        mvApi.getModel('eCouponListItems').collection.items = data.tenderDetails.eCoupons.ecouponScroller;
        currentMode = MODE.ADDITEM;

        $('#lightbox').removeClass('no-keyboard');
        $('.dialog-content').html('');
        mvApi.render('eCouponModalHeader', { defaults: { heading: bundles['spc.chipAndPin.eCoupon.addECouponHeading'] } }, function () {
            mvApi.render('eCouponEntryForm', function () {
                mvApi.render('eCouponModalFooter', function () {
                    bindAddItemModeEvents();
                    mvApi.publish("/chip-and-pin/display", 'eCouponEntry');
                });
            });
        });
    };

    updateOverlayHeading = function updateOverlayHeading() {
        var data = common.getLocalCheckoutData(),
            heading = $(".kiosk-lightbox .dialog-header h2");
        heading.html(bundles['spc.chipAndPin.eCoupon.eCouponListHeading'] + " - <span class='voucherBtnTotal'>" + data.tenderDetails.eCoupons.eCouponsApplied.toString() + " applied</span>");
    };

    resetBackEndMessageBox = function resetBackEndMessageBox() {
        mvApi.updateModel('eCouponEntryForm', {
            defaults: {
                statusMessageClass: '',
                statusMessageText: ''
            }
        });
        $('.fnModal .error').hide();
    };

    init = function init() {
        mvApi.cacheInitialModels(mvModels);
    };

    update = function update(resp) {
        var data;
		if(resp)
			data = JSON.parse(resp);
		else
			data = common.getLocalCheckoutData();

        mvApi.getModel('eCouponListItems').collection.items = data.tenderDetails.eCoupons.ecouponScroller;
        resetBackEndMessageBox();

        if (isVisible) {
            if (currentMode === MODE.ADDITEM) {
                onAddItemResult(data);
            } else if (currentMode === MODE.LISTING) {
                onDeleteItemResult(data);
            }
        }
    };

    show = function show(mode) {
        var lbox = $('.kiosk-lightbox'),
            callback;

        if (lbox.length) {
            lbox.remove();
        }

        currentMode = mode === undefined ? currentMode : mode;

        if (currentMode === MODE.ADDITEM) {
            callback = injectAddItemModalContent;
        } else {
            callback = injectListingModalContent;
        }

        overlayParams.callback = function () {
            mvApi.render('overlayLayout', callback);
        };

        resetBackEndMessageBox();
        overlay.show(overlayParams);
        isVisible = true;
    };

    self = {
        init: init,
        update: update,
        show: show,
        MODE: MODE
    };

    return self;
});