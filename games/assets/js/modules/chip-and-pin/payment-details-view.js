/* jslint plusplus: true, nomen: true, regexp: true, indent: 4 */
/* globals window,document,console,define,require,jQuery,$ */
define('modules/chip-and-pin/payment-details-view', ['modules/mvapi/common', 'modules/settings/common', 'modules/common', 'modules/chip-and-pin/user-session', 'modules/chip-and-pin/atg-data'], function (mvApi, SETTINGS, common, userSession, atgData) {
  'use strict';

  var init,
    bindEventListeners,
    update,
    voucherButtonLabel,
    eCouponButtonLabel,
    giftCardButtonLabel,
    discountQuantityLabel = '#discountCount',
    discountTotalValue = '#discountTotalValue',
    viewDiscountButton = '.paymentSummary .discountsTotal',
    itemizedDiscounts = '.paymentSummary .discounts',
    renderVoucherButton,
    renderPaymentSummary,
    updatePaymentSummaryDiscountButtons,
    updatePaymentSummaryDiscountOverlayButton,
    prepareDiscountData,
    formatNumbers;

  prepareDiscountData = function prepareDiscountData() {
    var iExchangedVouchersTotal = 0,
      iVouchersTotal = 0,
      oLocalData = null,
      iPromotionTotal,
      iStaffDiscountTotal = 0,
      iEcouponsAppliedCount = 0,
      iGiftCardsUsedCount = 0,
      sEmptyDiscountsMessage,
      iSubTotal = 0,
      i = 0,
      userType = userSession.getUserType(),
      discountTotal = 0;

    oLocalData = common.getLocalCheckoutData();

    if (oLocalData.paymentDetails.promotion !== undefined && oLocalData.paymentDetails.promotion !== null) {
      iPromotionTotal = formatNumbers(oLocalData.paymentDetails.promotion);
      if (iPromotionTotal > 0) {
        discountTotal += parseFloat(iPromotionTotal);
      }
    }
    if (oLocalData.tenderDetails.eCoupons !== undefined && oLocalData.tenderDetails.eCoupons !== null) {
      iEcouponsAppliedCount = formatNumbers(oLocalData.tenderDetails.eCoupons.eCouponsApplied);
      if (iEcouponsAppliedCount > 0) {
        discountTotal += parseFloat(oLocalData.tenderDetails.eCoupons.eCouponsTotal);
      }
    }
    if (userType !== SETTINGS.CONSTANTS.LOGIN.LOGIN_ANONYMOUS) {
      if (oLocalData.paymentDetails.staffDiscountAmount !== undefined && oLocalData.paymentDetails.staffDiscountAmount !== null) {
        iStaffDiscountTotal = formatNumbers(oLocalData.paymentDetails.staffDiscountAmount);
        if (iStaffDiscountTotal > 0) {
          discountTotal += parseFloat(iStaffDiscountTotal);
        }
      }
      if (oLocalData.tenderDetails.vouchers !== undefined && oLocalData.tenderDetails.vouchers !== null) {
        iVouchersTotal = formatNumbers(oLocalData.tenderDetails.vouchers.selectedVouchersTotal);
        if (iVouchersTotal > 0) {
          discountTotal += parseFloat(iVouchersTotal);
        }
      }
      if (oLocalData.tenderDetails.vouchers !== undefined && oLocalData.tenderDetails.vouchers !== null) {
        iExchangedVouchersTotal = formatNumbers(oLocalData.tenderDetails.vouchers.selectedExchangedVouchersTotal);
        if (iExchangedVouchersTotal > 0) {
          discountTotal += parseFloat(iExchangedVouchersTotal);
        }
      }
    }
    if (oLocalData.tenderDetails.giftCards !== undefined && oLocalData.tenderDetails.giftCards !== null) {
      iGiftCardsUsedCount = parseFloat(oLocalData.tenderDetails.giftCards.giftCardsUsedCount);
      if (iGiftCardsUsedCount > 0) {
        for (i = 0; i < iGiftCardsUsedCount; i++) {
          discountTotal += parseFloat(oLocalData.tenderDetails.giftCards.giftCardDetails[i].giftCardAmount);
        }
      }
    }

    return formatNumbers(discountTotal);
  };

  updatePaymentSummaryDiscountOverlayButton = function updatePaymentSummaryDiscountOverlayButton() {
    var oPsModel = mvApi.getModel('paymentSummary'),
      oLocalData = window.TescoData.ChipAndPin.tenderDetails,
      iGiftCardCount = oLocalData.giftCards.giftCardsUsedCount && oLocalData.giftCards.giftCardsUsedCount !== 0 && oLocalData.giftCards.giftCardsUsedCount !== '0' ? parseFloat(oLocalData.giftCards.giftCardsUsedCount) : 0;

    if (oPsModel.defaults.numberOfTypesOfDiscountApplied > 1) {
      $(discountQuantityLabel).html('(' + oPsModel.defaults.numberOfDiscountsApplied + ')');
      $(discountTotalValue).html(prepareDiscountData());
      $(itemizedDiscounts).hide();
      $(viewDiscountButton).show();
    }
  };

  updatePaymentSummaryDiscountButtons = function updatePaymentSummaryDiscountButtons() {
    var eCouponsApplied,
      giftCardsUsedCount,
      localData = common.getLocalCheckoutData();

    if (localData !== null) {
      eCouponsApplied = localData.tenderDetails.eCoupons.eCouponsApplied > 0 ? localData.tenderDetails.eCoupons.eCouponsApplied + ' applied' : '';
      giftCardsUsedCount = localData.tenderDetails.giftCards.giftCardsUsedCount > 0 ? localData.tenderDetails.giftCards.giftCardsUsedCount + ' applied' : '';
      if (localData.tenderDetails.vouchers.vouchersTotal)
        voucherButtonLabel.html('&pound;' + parseFloat(localData.tenderDetails.vouchers.vouchersTotal).toFixed(2));
      else
                voucherButtonLabel.html('&pound;' + '0.00');
      eCouponButtonLabel.html(eCouponsApplied);
      giftCardButtonLabel.html(giftCardsUsedCount);
    }
  };

  renderPaymentSummary = function renderPaymentSummary() {
    mvApi.render('paymentSummary', function () {
      $('.content').trigger('paymentSummaryReady');
    });
  };

  renderVoucherButton = function renderVoucherButton() {
    var vc = $('.vouchersContainer'),
      userType = userSession.getUserType();

    if (vc.length) {
      vc.html('');
    }
    mvApi.render('voucherButton', function () {
      voucherButtonLabel = $('.vouchersContainer .addVouchers .voucherBtnTotal');
      eCouponButtonLabel = $('.vouchersContainer .addECoupons .voucherBtnTotal');
      giftCardButtonLabel = $('.vouchersContainer .addGiftCards .voucherBtnTotal');
      updatePaymentSummaryDiscountButtons();
      renderPaymentSummary();

      $('.content').on('paymentSummaryReady', function () {
        updatePaymentSummaryDiscountOverlayButton();
      });

      if (userType === SETTINGS.CONSTANTS.LOGIN.LOGIN_ANONYMOUS) {
        $('.vouchersContainer .addVouchers').css('display', 'none');
      }
    });
  };

  formatNumbers = function formatNumbers(iNumber) {
    var iResult, iConvertToNumber;
    if (iNumber !== undefined && iNumber !== null && iNumber !== '' && iNumber !== 0) {
      if (isNaN(iNumber))
        iNumber = iNumber.replace(/[^0-9.]/g, '');

      iConvertToNumber = parseFloat(iNumber).toFixed(2);
      iResult = iConvertToNumber;
    } else {
      iResult = '0';
    }
    return iResult;
  };

  update = function update(data) {
    if (data === undefined) {
      data = window.TescoData.ChipAndPin;
    } else {
      window.TescoData.ChipAndPin.paymentDetails = data.paymentDetails;
      window.TescoData.ChipAndPin.tenderDetails = data.tenderDetails;
    }

    var pd = data.paymentDetails,
      td = data.tenderDetails,
      psModel = mvApi.getModel('paymentSummary'),
      numDiscountsApplied = (td.giftCards.giftCardsUsedCount ? parseFloat(td.giftCards.giftCardsUsedCount) : 0) + ((td.vouchers.selectedVouchersCount && td.vouchers.selectedVouchersTotal && td.vouchers.selectedVouchersTotal > 0) ? parseFloat(td.vouchers.selectedVouchersCount) : 0) + (td.vouchers.selectedExchangedVouchersCount ? parseFloat(td.vouchers.selectedExchangedVouchersCount) : 0) + ((td.eCoupons.eCouponsApplied && td.eCoupons.eCouponsTotal && td.eCoupons.eCouponsTotal > 0) ? parseFloat(td.eCoupons.eCouponsApplied) : 0) + (formatNumbers(pd.staffDiscountAmount) > 0 ? 1 : 0) + (formatNumbers(pd.promotion) > 0 ? 1 : 0),
      totalClubCardPoints = (pd.clubCardPoints || 0) + (pd.extraClubcardPoints || 0) + (pd.refundedClubcardPoints || 0),
      paymentSummaryDefaults,
      numTypesDiscountApplied = (formatNumbers(pd.staffDiscountAmount) > 0 ? 1 : 0) + (formatNumbers(pd.promotion) > 0 ? 1 : 0) + (parseFloat(td.giftCards.giftCardsUsedCount) > 0 ? 1 : 0) + ((td.eCoupons.eCouponsApplied && parseFloat(td.eCoupons.eCouponsApplied) > 0 && td.eCoupons.eCouponsTotal && td.eCoupons.eCouponsTotal > 0) ? 1 : 0) + (parseFloat(td.vouchers.selectedVouchersTotal) > 0 ? 1 : 0) + (parseFloat(td.vouchers.selectedExchangedVouchersTotal) > 0 ? 1 : 0),
      orderId = pd.orderId ? pd.orderId : '';

    if (pd.excahngedVouchers) {
      var finalExcahngedVouchers = pd.excahngedVouchers;
    } else {
      var finalExcahngedVouchers = '';
    }
    if (pd.vouchers) {
      var finalVouchers = pd.vouchers;
    } else {
      var finalVouchers = '';
    }

    paymentSummaryDefaults = {
      discountTotal: formatNumbers(pd.discountTotal),
      subtotal: formatNumbers(pd.subTotal),
      orderId: orderId,
      exchangedVouchers: (td.vouchers.selectedExchangedVouchersCount ? parseFloat(td.vouchers.selectedExchangedVouchersCount) : 0),
      vouchers: (td.vouchers.selectedVouchersCount ? parseFloat(td.vouchers.selectedVouchersCount) : 0),
      totalCost: formatNumbers(pd.totalToPay),
      clubcardPoints: totalClubCardPoints !== 0 && totalClubCardPoints !== null ? totalClubCardPoints : 0,
      fuelSaveAmount: formatNumbers(pd.clubCardFuelSavings),
      staffDiscountAmount: formatNumbers(pd.staffDiscountAmount),
      promotionAmount: formatNumbers(pd.promotion),
      giftCardAmount: formatNumbers(td.giftCards.giftCardsTotalAmount),
      voucherAmount: formatNumbers(td.vouchers.selectedVouchersTotal),
      exchangedVouchersAmount: formatNumbers(td.vouchers.selectedExchangedVouchersTotal),
      ecouponAmount: formatNumbers(td.eCoupons.eCouponsTotal),
      numberOfDiscountsApplied: numDiscountsApplied,
      numberOfTypesOfDiscountApplied: numTypesDiscountApplied
    };
    psModel.atgData = pd.atgData;
    mvApi.updateModel('paymentSummary', {
      defaults: paymentSummaryDefaults
    });
    renderVoucherButton();
  };

  bindEventListeners = function bindEventListeners() {
    $('.content').off('paymentSummaryReady').on('paymentSummaryReady', function () {
      updatePaymentSummaryDiscountOverlayButton();
    });
  };

  init = function init(data) {
    $('.content').on('reviewLayoutReady', function () {
      update(data);
    });
  };

  return {
    init: init,
    update: update
  };
});
