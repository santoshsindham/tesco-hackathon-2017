/*jslint plusplus: true, nomen: true, regexp: true, indent: 4 */
/*globals window,document,console,define,require,jQuery,$ */
define('modules/chip-and-pin/voucher', ['modules/mvapi/common', 'modules/common', 'modules/chip-and-pin/voucher-models', 'modules/settings/common', 'modules/overlay/common', 'modules/ajax/common', 'modules/chip-and-pin/messages', 'modules/chip-and-pin/kmf-io', 'modules/inline-scrollbar/common', 'modules/validation', 'modules/chip-and-pin/user-session', 'modules/chip-and-pin/bundles', 'modules/chip-and-pin/atg-data'], function (mvApi, common, mvModels, SETTINGS, overlay, ajax, messages, kmfIO, inlineScrollbar, validationExtras, userSession, bundles, atgData) {

    var self,
        init,
        update,
        show,
        localData = null,
        processUserBasedOnLogin,
        bindEvents,
        bindVoucherEntryOverlayEvents,
        referenceDomElements,
        hideOverlay,
        setVoucherTotal,
        setVoucherSelectedTotal,
        showVouchersOverlay,
        renderCustomCheckboxes,
        renderAddClubcardVouchersComplete,
        renderInlineScrollbar,
        populateTotalVouchers,
        getVoucherSelectedTotal,
        updateRunningTotal,
        getVoucherTotal,
        enableCancelButton,
        disableCancelButton,
        enableAddButton,
        disableAddButton,
        enableIHaveAnotherVoucherBtn,
        disableIHaveAnotherVoucherBtn,
        controlButtons,
        cancelVoucherItemsDialog,
        unsetAllItemsAndCloseDialog,
        controlOverlayHide,
        createOverlayOver,
        createCloseButtonOver,
        overlayCoverAndButtonCoverHide,
        renderVoucherCodeOverlayLayout,
        addVoucherCodeRequest,
        parseAndRenderResponse,
        sendRequest,
        setupAddVoucherValidation,
        addVoucherItems,
        voucherStatusHandler,
        hideOverlayCallback,
        renderMessages,
        $body,
        $moduleSelector,
        $dialogHeading,
        $selectedTotal,
        $cancelVoucherButton,
        $addVoucherButton,
        vouchersTotal = 0,
        voucherSelectedTotal = 0,
        aDynamicText = [],
        scrollbarTop = 0,
        MODE = {
            LISTING: "listing",
            ADDITEM: "addItem"
        },
        currentMode = MODE.LISTING,
        overlayParams = {
            content: '<div class="kiosk-lightbox clubcardVoucherLightbox"></div>',
            additionalCloseButtonClassNames: 'kiosk-lightbox-close-btn',
            onHideCallback: hideOverlayCallback,
            hideOnOverlayClick: true
        },
        parseVoucherData,
        cancelVoucherItems,
        dialogResult,
        userHasVouchersAvailable,
        checkVoucherArraysEqual,
        aAddedVoucherItems = [],
        aRunningVoucherItems = [];

    checkVoucherArraysEqual = function checkVoucherArraysEqual(a, b) {
        var i;
        if (a === b) {
            return true;
        }
        if (a === null || b === null) {
            return false;
        }
        if (a.length !== b.length) {
            return false;
        }
        for (i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    };

    addVoucherCodeRequest = function addVoucherCodeRequest() {
        var $txtVoucherCode = $('.kiosk-lightbox .enterVoucherCode #txtVoucherCode'),
            data,
            oLocalData = common.getLocalCheckoutData(),
            voucherCodeModelData = atgData.parse(oLocalData.tenderDetails.vouchers.atgData_addVoucherToEwallet);

        data = {
            'id': 'addNewVoucher'
        };

        $.extend(data, voucherCodeModelData.atgData);

        data.voucherCode = $txtVoucherCode.val() || '';

        sendRequest(data, function (response) {
            response = (typeof response === 'string') ? JSON.parse(response) : response;
            if (response && response.header && response.header.success === true && response.tenderDetails) {
                parseVoucherData(response.tenderDetails.vouchers);
                parseAndRenderResponse();
            } else if (response !== null && response !== undefined && response.tenderDetails !== undefined && response.tenderDetails.vouchers.voucherErrorMessage && response.tenderDetails.vouchers.voucherErrorMessage !== undefined) {
                messages.show(response.tenderDetails.vouchers.voucherErrorMessage, 'error', 'dialog-content .message');
            }
        });
    };

    referenceDomElements = function referenceDomElements() {
        $body = $('body');
        $moduleSelector = $('#lightbox');
        $dialogHeading = $('.dialog-header h2', $moduleSelector);
        $selectedTotal = $('.selectedTotal', $moduleSelector);
        $cancelVoucherButton = $('.cancelVoucher', $moduleSelector);
        $addVoucherButton = $('.addVoucher', $moduleSelector);
    };

    bindEvents = function bindEvents(callback) {
        $moduleSelector.off('change').one('change', 'input[type="checkbox"]', function () {
            var top = 0,
                totalHeight = parseInt($('#lightbox .overlay-wrapper').css('top'), 10),
                $self = $(this),
                voucherID = $self.data('voucherid'),
                modelData = {},
                modelData1 = {},
                voucherData,
                oLocalData = common.getLocalCheckoutData();

            $('ul.voucherItems').find('li').each(function () {
                totalHeight += $(this).outerHeight();
                top++;
                if (totalHeight > 0) {
                    scrollbarTop = top - 1;
                    return false;
                }
            });

            voucherData = atgData.parse(oLocalData.tenderDetails.vouchers.atgData);

            modelData = {
                'id': 'getVoucherItems'
            };

            $.extend(modelData, voucherData.atgData);
            modelData1.isSelected = $self.is(':checked');

            if (common.isBuildKit()) {
                if (!modelData1.isSelected) {
                    voucherID = '';
                }
            }
            modelData1.voucherID = voucherID;
            $.extend(modelData, modelData1);

            sendRequest(modelData, function (modelDataReturn) {
                var i,
                    oVoucherScrollerData;
                if (modelDataReturn.length) {
                    if (typeof modelDataReturn === 'string') {
                        modelDataReturn = JSON.parse(modelDataReturn);
                    }
                    if (modelDataReturn.tenderDetails) {
                        parseVoucherData(modelDataReturn.tenderDetails.vouchers);
                        parseAndRenderResponse();
                    }

                    aRunningVoucherItems = [];
                    oVoucherScrollerData = modelDataReturn.tenderDetails.vouchers.voucherScroller;
                    for (i = 0; i < oVoucherScrollerData.length; i++) {
                        if (oVoucherScrollerData[i].voucherSelected && oVoucherScrollerData[i].voucherSelected === true) {
                            aRunningVoucherItems.push(parseInt(oVoucherScrollerData[i].voucherID, 10));
                        }
                    }

                    if (callback) {
                        callback();
                    }

                }
            });

            overlayCoverAndButtonCoverHide();
        });

        $cancelVoucherButton.off('click').on('click', function () {
            cancelVoucherItemsDialog();
        });

        $addVoucherButton.off('click').on('click', function () {
            addVoucherItems();
        });

        $body.off('click', '#btnEnterCode').on('click', '#btnEnterCode', function () {
            mvApi.navigateTo('review&enterVoucherCode', true);
        });
    };

    sendRequest = function sendRequest(data, callback) {
        ajax.post({
            'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            'data': data || {},
            'callbacks': {
                'success': callback || null
            }
        });
    };

    addVoucherItems = function addVoucherItems() {
        var oLocalData = common.getLocalCheckoutData(),
            data = atgData.parse(oLocalData.tenderDetails.vouchers.atgData_addVoucherToOrder),
            oUpdateEvent;
        data.atgData.id = 'getVoucherItems';
        sendRequest(data.atgData, function (oReturnedData) {
            if (oReturnedData) {
                var oVoucherScroller,
                    i;

                if (typeof oReturnedData === 'string') {
                    oReturnedData = JSON.parse(oReturnedData);
                }
                parseVoucherData(oReturnedData.tenderDetails.vouchers);
                hideOverlay();
                oUpdateEvent = new $.Event('updatePaymentSummary');
                oUpdateEvent.checkoutData = oReturnedData;
                $('body').trigger(oUpdateEvent);

                oVoucherScroller = oReturnedData.tenderDetails.vouchers.voucherScroller;
                aAddedVoucherItems = [];
                for (i = 0; i < oVoucherScroller.length; i++) {
                    if (oVoucherScroller[i].voucherSelected && oVoucherScroller[i].voucherSelected === true) {
                        aAddedVoucherItems.push(parseInt(oVoucherScroller[i].voucherID, 10));
                    }
                }
            }
        });
    };

    cancelVoucherItems = function cancelVoucherItems() {
        var oLocalData = common.getLocalCheckoutData(),
            data = atgData.parse(oLocalData.tenderDetails.vouchers.atgData_cancelEWalletChanges),
            oUpdateEvent;
        sendRequest(data.atgData, function (oReturnedData) {
            if (oReturnedData) {
                if (typeof oReturnedData === 'string') {
                    oReturnedData = JSON.parse(oReturnedData);
                }
                parseVoucherData(oReturnedData.tenderDetails.vouchers);
                hideOverlay();
                oUpdateEvent = new $.Event('updatePaymentSummary');
                oUpdateEvent.checkoutData = oReturnedData;
                $('body').trigger(oUpdateEvent);
            }
        });
    };

    bindVoucherEntryOverlayEvents = function bindVoucherEntryOverlayEvents() {
        $('body').off('click').on('click', '#btn-show-vouchers', function () {
            if (userHasVouchersAvailable()) {
                showVouchersOverlay();
            } else {
                hideOverlay();
            }
        });

        $('#lightbox').on('click', '.close', function () {
            $("body").trigger("vouchersOverlayClose");
        });
    };

    renderVoucherCodeOverlayLayout = function renderVoucherCodeOverlayLayout() {
        var $lightbox = $('.kiosk-lightbox'),
            modelChange = {
                request: {
                    data: {}
                }
            };

        if ($lightbox.length === 2) {
            console.warn('2 lightboxes exist - THIS IS SOMETHING WHICH NEEDS TO BE SORTED');
            $lightbox.first().remove();
        }

        kmfIO.showKeyboard();

        //THIS VOUCHER% FORM DATA IS IN THE JSON NOW

        function extendWithAtgData(id, data) {
            var model = mvApi.getModel(id);
            if (model && data) {
                $.extend(data, model.atgData);
            }
            return data;
        }

        modelChange.request.data = extendWithAtgData('voucherCodeOverlayLayout', modelChange.request.data);
        mvApi.render('voucherCodeOverlayLayout', function () {
            setupAddVoucherValidation();
            renderMessages();
            mvApi.render('voucherEntryFooter', bindVoucherEntryOverlayEvents);
        });
    };

    renderMessages = function renderMessages() {
        if (aDynamicText.screenOneStatusMessage !== undefined) {
            $('.addClubcardVoucher .intro-message p').text(aDynamicText.screenOneStatusMessage);
        }
        if (aDynamicText.screenTwoStatusMessage !== undefined) {
            $('.enterVoucherCode .intro-message p').text(aDynamicText.screenTwoStatusMessage);
        }
    };

    parseAndRenderResponse = function parseAndRenderResponse() {
        localData = common.getLocalCheckoutData();
        if (localData !== null && localData !== undefined) {
            if (localData.tenderDetails !== undefined && localData.tenderDetails.vouchers !== undefined) {
                if (userHasVouchersAvailable()) {
                    setVoucherTotal(parseFloat(localData.tenderDetails.vouchers.vouchersTotal).toFixed(2));
                    setVoucherSelectedTotal(localData.tenderDetails.vouchers.selectedVouchersTotal);
                    aDynamicText.screenOneStatusMessage = localData.tenderDetails.vouchers.screenOneStatusMessage;
                    aDynamicText.screenTwoStatusMessage = localData.tenderDetails.vouchers.screenTwoStatusMessage;

                    if (currentMode === MODE.LISTING) {
                        mvApi.render('voucherOverlayLayout', function () {
                            mvApi.render('voucherItem', function () {
                                mvApi.render('voucherFooter', function () {
                                    renderAddClubcardVouchersComplete(localData.tenderDetails.vouchers.voucherAddedToOrder);
                                    renderMessages();
                                });
                            });
                            setTimeout(function () {
                                kmfIO.hideKeyboard();
                            }, 100);
                        });
                    }
                }
            }
        } else {
            messages.show('Unexpected error: voucher.js', 'error', 'dialog-content .message');
        }
    };

    populateTotalVouchers = function populateTotalVouchers() {
        var voucherTotal = getVoucherTotal(),
            headingContent,
            newHeading,
            headingEnd = bundles['spc.chipAndPin.vouchers.AddClubcardVouchersTitleEnd'] || 'available';

        headingContent = bundles['spc.chipAndPin.vouchers.AddClubcardVouchersTitleBeggining'] || 'Add Clubcard Vouchers';
        newHeading = headingContent + ' - &pound;' + voucherTotal + ' ' + headingEnd;
        $dialogHeading.html(newHeading);
    };

    unsetAllItemsAndCloseDialog = function unsetAllItemsAndCloseDialog() {
        cancelVoucherItems();
        voucherSelectedTotal = 0;
    };

    dialogResult = function dialogResult() {
        var sButton = Array.prototype.slice.call(arguments, 1);
        sButton = sButton.toString();
        if (sButton === 'YES') {
            unsetAllItemsAndCloseDialog();
        }
    };

    cancelVoucherItemsDialog = function cancelVoucherItemsDialog() {
        var confirmDialog,
            message = bundles['spc.chipAndPin.vouchers.kmfIOselectedVouchers'];

        if (!checkVoucherArraysEqual(aAddedVoucherItems, aRunningVoucherItems)) {
            if (!kmfIO.checkKMFExists()) {
                confirmDialog = window.confirm(message);
                if (confirmDialog) {
                    unsetAllItemsAndCloseDialog();
                }
            } else {
                kmfIO.showDialog('cancelVoucherItems', bundles['spc.chipAndPin.vouchers.kmfIOselectedVouchersTitle'], message, 'YES', 'NO', dialogResult);
            }
        } else {
            unsetAllItemsAndCloseDialog();
        }
    };

    setVoucherTotal = function setVoucherTotal(vt) {
        if (vt === undefined) {
            return;
        }
        vouchersTotal = vt;
    };

    getVoucherTotal = function getVoucherTotal() {
        return vouchersTotal;
    };

    setVoucherSelectedTotal = function setVoucherSelectedTotal(vst) {
        if (vst === undefined) {
            return;
        }
        voucherSelectedTotal = parseFloat(vst);
    };

    getVoucherSelectedTotal = function getVoucherSelectedTotal() {
        return voucherSelectedTotal;
    };

    createOverlayOver = function createOverlayOver() {
        var $overlayOver = $('#overlay-over');
        if (!$overlayOver.length) {
            $('#overlay').before('<div id="overlay-over" class="voucher-modal-overlay-over"></div>');
        } else {
            $overlayOver.show();
        }
    };

    createCloseButtonOver = function createCloseButtonOver() {
        var $buttonOver = $('#button-over');
        if (!$buttonOver.length) {
            $('#lightbox a.close').before('<a id="button-over" class="voucher-modal-button-over"></a>');
        } else {
            $buttonOver.show();
        }
    };

    overlayCoverAndButtonCoverHide = function overlayCoverAndButtonCoverHide(bRemoveOverlay) {
        $('#button-over, #overlay-over').hide();
        // This is called from ./common.js to get around the issues with the overlay and back button.
        // If it looks wrong it's because it is VERY wrong!!
        if (bRemoveOverlay && $('#lightbox').length) {
            $('#overlay, #lightbox').remove();
        }
    };

    controlOverlayHide = function controlOverlayHide() {
        if (!checkVoucherArraysEqual(aAddedVoucherItems, aRunningVoucherItems)) {
            createOverlayOver();
            createCloseButtonOver();
            $('#overlay-over, #button-over').off().on('click', function (e) {
                if (e.currentTarget.id === 'overlay-over') {
                    return false;
                }
                if (e.currentTarget.id === 'button-over') {
                    cancelVoucherItemsDialog();
                    return false;
                }
            });
        } else {
            overlayCoverAndButtonCoverHide();
        }
    };

    controlButtons = function controlButtons(voucherAddedToOrder) {
        if (voucherAddedToOrder !== undefined && voucherAddedToOrder === "false") {
            enableCancelButton();
            enableAddButton();
            disableIHaveAnotherVoucherBtn();
        } else {
            disableCancelButton();
            disableAddButton();
            enableIHaveAnotherVoucherBtn();
        }
    };


    enableAddButton = function enableAddButton() {
        $addVoucherButton.removeClass('disabled').attr('disabled', false);
    };

    disableAddButton = function disableAddButton() {
        $addVoucherButton.addClass('disabled').attr('disabled', true);
    };

    enableCancelButton = function enableCancelButton() {
        $cancelVoucherButton.removeClass('disabled').attr('disabled', false);
    };

    disableCancelButton = function disableCancelButton() {
        $cancelVoucherButton.addClass('disabled').attr('disabled', true);
    };

    enableIHaveAnotherVoucherBtn = function enableIHaveAnotherVoucherBtn() {
        $('#btnEnterCode').removeAttr('disabled').removeClass('disabled');
    };

    disableIHaveAnotherVoucherBtn = function disableIHaveAnotherVoucherBtn() {
        $('#btnEnterCode').attr('disabled', 'disabled').addClass('disabled');
    };

    updateRunningTotal = function updateRunningTotal() {
        var runningTotal = getVoucherSelectedTotal();
        voucherSelectedTotal = runningTotal;
        $selectedTotal.text(runningTotal.toFixed(2));
    };

    renderInlineScrollbar = function renderInlineScrollbar() {
        var customItems = [];
        
        if(isVoucherOverlay && $('.clubcardVouchersContainer .voucherItems').find('.selectLabelContainer.selected').length){		
    		var $selectLabelContainer = $('.clubcardVouchersContainer .voucherItems').find('.selectLabelContainer'),
				$firstSelected = $('.clubcardVouchersContainer .voucherItems').find('.selectLabelContainer.selected')[0],
				$firstSelectedIndex = $.inArray($firstSelected, $selectLabelContainer);

			scrollbarTop = $firstSelectedIndex - 2;
    	}
    	isVoucherOverlay = false;

        $('.voucherItems > li').each(function () {
            customItems.push($(this).outerHeight());
        });

        inlineScrollbar.init($('.clubcardVouchersContainer'), {
            containerId: 'clubcardVouchersScrollBar',
            customItems: customItems,
            autoScrollTo: scrollbarTop,
            autoScrollOnce: true,
            forceEnable: false
        });
    };

    renderCustomCheckboxes = function renderCustomCheckboxes(callback) {
        common.customCheckBox.init($('.voucherItems'));
        if (callback) {
            callback();
        }
    };

    showVouchersOverlay = function showVouchersOverlay() {
        scrollbarTop = 0;
        isVoucherOverlay = true;
        overlayParams.callback = parseAndRenderResponse;
        overlay.show(overlayParams);
        mvApi.publish("/chip-and-pin/display", 'deliveryVouchers');
    };

    show = function show(mode) {
        var lbox = $('.kiosk-lightbox');

        if (lbox.length) {
            lbox.remove();
        }
        if (mode !== currentMode) {
            currentMode = mode;
        }
        processUserBasedOnLogin();
    };

    hideOverlayCallback = function hideOverlayCallback() {
        mvApi.navigateTo('review', true, false);
        overlayCoverAndButtonCoverHide();
        kmfIO.hideKeyboard();
        setTimeout(function () {
            kmfIO.hideKeyboard();
        }, 500);
    };

    hideOverlay = function hideOverlay() {
        $('#lightbox a.close').trigger('click');
        overlayCoverAndButtonCoverHide();

    };

    voucherStatusHandler = function voucherStatusHandler() {
        var $voucherUnavailable = $('.voucherInfoContainer.voucherUnavailable', $moduleSelector);
        $voucherUnavailable.parent().find('[type="checkbox"]').attr('disabled', true);
        $voucherUnavailable.parent().find('.selectLabelContainer .checkbox').off();
    };

    renderAddClubcardVouchersComplete = function renderAddClubcardVouchersComplete(voucherAddedToOrder) {
        referenceDomElements();
        renderCustomCheckboxes(voucherStatusHandler);
        renderInlineScrollbar();
        populateTotalVouchers();
        updateRunningTotal();
        bindEvents(controlOverlayHide);
        controlButtons(voucherAddedToOrder);
    };

    processUserBasedOnLogin = function processUserBasedOnLogin() {
        switch (userSession.getUserType()) {
        case SETTINGS.CONSTANTS.LOGIN.LOGIN_REGISTERED:
            showVouchersOverlay();
            break;
        case SETTINGS.CONSTANTS.LOGIN.LOGIN_HALF:
            if (userHasVouchersAvailable()) {
                showVouchersOverlay();
            }
            break;
        default:
            break;
        }
    };

    setupAddVoucherValidation = function setupAddVoucherValidation() {
        var formRules = {},
            formMessages = {},
            voucherCode = $('body').find('.kiosk-lightbox .fnvoucherCode').attr('name');

        formRules[voucherCode] = {
            required: true
        };

        formMessages[voucherCode] = {
            required: validationExtras.msg.voucherCode.required
        };

        $('body').find('.enterVoucherCode form').validate({
            onkeyup: function (e) {
                if (this.check(e)) {
                    $(e).addClass('valid');
                } else {
                    $(e).removeClass('valid');
                }
            },
            focusInvalid: true,
            errorElement: 'span',
            showErrors: function () {
                this.defaultShowErrors();
                messages.remove();
                kmfIO.showKeyboard();
                $('#txtVoucherCode').trigger('focus');
            },
            errorPlacement: function (error, element) {
                error.insertAfter(validationExtras.errorPlacementElement(element));
            },
            submitHandler: function () {
                addVoucherCodeRequest();
            },
            rules: formRules,
            messages: formMessages
        });

        kmfIO.showKeyboard();
        $('#txtVoucherCode').trigger('focus').trigger('click');
    };

    update = function update(data) {
        //localData = data;
        data = common.getLocalCheckoutData();
        mvApi.getModel('voucherItem').collection.items = data.tenderDetails.vouchers.voucherScroller;
    };

    parseVoucherData = function parseVoucherData(oVoucherData) {
        mvApi.cacheInitialModels(mvModels);
        var oLocalData;
        if (typeof oVoucherData === 'string') {
            oVoucherData = JSON.parse(oVoucherData);
        }
        if (oVoucherData) {
            // Hold the information in the global Chip & PIN var
            if (window.TescoData.ChipAndPin.tenderDetails === undefined) {
                window.TescoData.ChipAndPin.tenderDetails = {};
            }
            if (window.TescoData.ChipAndPin.tenderDetails.vouchers === undefined) {
                window.TescoData.ChipAndPin.tenderDetails.vouchers = {};
            }
            window.TescoData.ChipAndPin.tenderDetails.vouchers = oVoucherData;
            oLocalData = common.getLocalCheckoutData();
            mvApi.getModel('voucherItem').collection.items = oLocalData.tenderDetails.vouchers.voucherScroller;
        }
    };

    userHasVouchersAvailable = function userHasVouchersAvailable() {
        var oLocalData = common.getLocalCheckoutData();
        if (oLocalData.tenderDetails.vouchers.voucherScroller !== undefined) {
            if (oLocalData.tenderDetails.vouchers.voucherScroller.length > 0) {
                return true;
            }
        } else {
            return false;
        }
    };

    init = function init() {
        mvApi.cacheInitialModels(mvModels);
    };

    self = {
        init: init,
        update: update,
        show: show,
        MODE: MODE,
        overlayCoverAndButtonCoverHide: overlayCoverAndButtonCoverHide,
        renderVoucherCodeOverlayLayout: renderVoucherCodeOverlayLayout,
        parseVoucherData: parseVoucherData,
        parseAndRenderResponse: parseAndRenderResponse
    };

    return self;
});