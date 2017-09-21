define('modules/pdp/controllers/RequestStockAlertController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/controllers/FormHandlerController',
  'modules/pdp/views/RequestStockAlertView'
], function ($, fn, FormHandlerController, RequestStockAlertView) {
  'use strict';

  var RequestStockAlertController = function (oModel) {
    this.sTag = 'requestStockAlert';
    this.oTooltipStyles = {
      kiosk: ['tooltip-left'],
      allDesktops: ['tooltip-left'],
      allDevices: ['tooltip-bottom']
    };
    this.views = {
      classes: {
        RequestStockAlertView: RequestStockAlertView
      }
    };
    this.parent.constructor.call(this, oModel);
  };

  fn.inherit(RequestStockAlertController, FormHandlerController);

  RequestStockAlertController.prototype._bindViewEvents = function (oData) {
    $(oData.oView.oElms.elSubmitBtn).on(
      'click',
      { oView: oData.oView },
      this._onRequestAlert.bind(this)
    );
  };

  RequestStockAlertController.prototype._onRequestAlert = function (oEvent) {
    var oView = oEvent.data.oView;

    $(oView.oElms.elSubmitBtn).addClass('submitting');

    this._activeView = oView;
    this.oModel.send({
      oPromise: {
        sSearchKey: $(oView.oElms.elSubmitBtn).data('mvc-key'),
        mSearchValue: $(oView.oElms.elSubmitBtn).data('mvc-value')
      },
      fnDoneCallback: this._onRequestAlertSuccess.bind(this),
      fnFailCallback: this._onRequestAlertFailure.bind(this)
    });
  };

  RequestStockAlertController.prototype._onRequestAlertSuccess = function (mRespData) {
    if (mRespData.hasOwnProperty('success')) {
      this.setEvent({
        sName: 'requestStockAlertSuccess',
        oRespData: mRespData
      }, false, true);

      this._showAlertSuccessBox();
    } else {
      this.setEvent({
        sName: 'requestStockAlertFailure',
        oRespData: mRespData
      }, false, true);

      if (mRespData.failure.redirectUrl) {
        window.location.href = mRespData.failure.redirectUrl;
      } else {
        this.createTooltip({
          sTooltopMessage: mRespData.failure.message,
          elTrigger: this._activeView.oElms.elSubmitBtn,
          sType: 'error'
        });
      }
    }

    $(this._activeView.oElms.elSubmitBtn).removeClass('submitting');
  };

  RequestStockAlertController.prototype._onRequestAlertFailure = function (sErrorMsg, oJqXHR) {
    this.setEvent({
      sName: 'requestStockAlertFailure',
      oRespData: oJqXHR
    }, false, true);

    this.createTooltip({
      sTooltopMessage: sErrorMsg,
      elTrigger: this._activeView.oElms.elSubmitBtn,
      sType: 'error'
    });

    $(this._activeView.oElms.elSubmitBtn).removeClass('submitting');
  };

  RequestStockAlertController.prototype._showAlertSuccessBox = function () {
    var STOCK_ALERT_SET = 'stock-alert-set';

    $(this._activeView.oElms.elWrapper).addClass(STOCK_ALERT_SET);
  };

  return RequestStockAlertController;
});
