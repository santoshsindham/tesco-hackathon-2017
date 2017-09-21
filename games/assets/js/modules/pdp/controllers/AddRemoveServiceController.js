define('modules/pdp/controllers/AddRemoveServiceController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/FormHandlerController',
  'modules/pdp/views/AddRemoveServiceView',
  'modules/tesco.analytics'
], function (fn, FormHandlerController, AddRemoveServiceView, analytics) {
  'use strict';

  /**
   * Add/remove service controller constructor sets controller's core data and calls parent
   * constructor.
   * @param {Object} oModel The services model.
   * @param {Object} oView The services view.
   * @return {void}
   */
  function AddRemoveServiceController(oModel, oView) {
    this.sTag = 'services';
    this.views = {
      classes: {
        AddRemoveServiceView: AddRemoveServiceView
      }
    };
    this.parent.constructor.call(this, oModel, oView);
  }

  fn.inherit(AddRemoveServiceController, FormHandlerController);

  AddRemoveServiceController.prototype._bindViewEvents = function (oData) {
    $(oData.oView.oElms.elCheckbox).on(
      'change',
      { oView: oData.oView },
      this._onToggleService.bind(this)
    );
  };

  AddRemoveServiceController.prototype._onToggleService = function (oEvent) {
    var oView = oEvent.data.oView;

    this._activeView = oView;
    this.oModel.send({
      oPromise: {
        sSearchKey: $(oEvent.currentTarget).data('mvc-key'),
        mSearchValue: $(oEvent.currentTarget).data('mvc-value')
      },
      fnDoneCallback: this._onToggleServiceSuccess.bind(this),
      fnFailCallback: this._onToggleServiceFailure.bind(this)
    });
  };

  AddRemoveServiceController.prototype._onToggleServiceSuccess = function (mRespData, oSendParams) {
    if (mRespData.hasOwnProperty('success')) {
      this.setEvents([
        { oData: { sName: 'toggleServiceSuccess', oRespData: mRespData } },
        { oData: { sName: 'reloadBasketFlyoutBadge', oRespData: mRespData } }
      ], false, true);

      this.oModel.remove({
        sSearchKey: 'id',
        mSearchValue: oSendParams.mSearchValue
      });

      if (mRespData.success.data) {
        this.setEvent({
          sName: 'dataFetched',
          mfetchedData: mRespData.success.data
        }, false, true);
      }

      if (this._activePanel.tooltip) {
        this._activePanel.tooltip.close();
      }

      // Short term code to reload basket summary on add/remove service
      if ($(this._activeView.oElms.elWrapper).closest('.basket-overlay__services').length > 0) {
        this._reloadBasketSummary();
      }
      this._analyticsTracking(mRespData.success.analytics, mRespData.success.data.services);
    } else {
      this.setEvent({
        sName: 'toggleServiceFailure',
        oRespData: mRespData
      }, false, true);

      if ($(this._activeView.oElms.elCheckbox).is(':checked')) {
        $(this._activeView.oElms.elCheckbox).attr('checked', false);
      } else {
        $(this._activeView.oElms.elCheckbox).attr('checked', true);
      }

      this.createTooltip({
        sTooltopMessage: mRespData.failure.message,
        elTrigger: this._activeView.oElms.elFakeCheckbox,
        sType: 'error'
      });
    }
  };

  AddRemoveServiceController.prototype._onToggleServiceFailure = function (sErrorMsg, oJqXHR) {
    this.setEvent({
      sName: 'toggleServiceFailure',
      oRespData: oJqXHR
    }, false, true);

    if ($(this._activeView.oElms.elCheckbox).is(':checked')) {
      $(this._activeView.oElms.elCheckbox).attr('checked', false);
    } else {
      $(this._activeView.oElms.elCheckbox).attr('checked', true);
    }

    this.createTooltip({
      sTooltopMessage: sErrorMsg,
      elTrigger: this._activeView.oElms.elFakeCheckbox,
      sType: 'error'
    });
  };

  AddRemoveServiceController.prototype._reloadBasketSummary = function () {
    $.ajax({
      url: '/direct/blocks/catalog/productdetailv2/basketOverlaySummary.jsp'
    }).done(function (mData) {
      $('.basket-overlay__summary')[0].outerHTML = mData;
    });
  };

  AddRemoveServiceController.prototype._analyticsTracking = function (
    analyticsResponse, mRespDataServices
  ) {
    var _oWebAnalytics = null,
      analyticProps = [],
      extendedVars = null,
      servicePrice = null,
      i = 0,
      isChecked = null,
      message = null,
      events = null,
      scProp = null,
      checkedElement = null,
      serviceSkuId = null,
      sellerId = null,
      serviceSellerId = null,
      analyticEventsProps = [],
      extendedAnalyticsProps = null;

    for (i = 0; i < mRespDataServices.length; i += 1) {
      checkedElement = this._activeView.oElms.elCheckbox.id.split('-')[1];
      if (mRespDataServices[i].id === checkedElement) {
        servicePrice = mRespDataServices[i].price;
        serviceSkuId = mRespDataServices[i].skuId;
        serviceSellerId = mRespDataServices[i].sellerId;
        break;
      }
    }

    isChecked = $(this._activeView.oElms.elCheckbox).is(':checked');
    message = isChecked ? 'add to basket' : 'remove from basket';
    scProp = isChecked ? 'scAdd' : 'scRemove';
    events = isChecked ? ';;;event26=1|event27=' : ';;;event28=1|event29=';
    sellerId = (serviceSellerId === '1000001' || serviceSellerId === undefined) ? '1000001' : serviceSellerId;
    analyticProps = [{
      eVar45: message,
      prop19: message,
      eVar59: 'basket overlay - ' + message,
      prop42: 'basket overlay - ' + message,
      eVar25: sellerId,
      products: ';' + serviceSkuId + events + servicePrice + ';eVar25=' + sellerId
    }];
    if (isChecked) {
      analyticEventsProps = [{
        scAdd: scProp,
        event26: '1',
        event27: servicePrice
      }];
    } else {
      analyticEventsProps = [{
        scRemove: scProp,
        event28: '1',
        event29: servicePrice,
        events: 'scRemove,event28,event29'
      }];
    }

    extendedAnalyticsProps = $.extend(true, [{}], analyticProps, analyticEventsProps);

    _oWebAnalytics = new analytics.WebMetrics();
    extendedVars = $.extend(true, [{}], analyticsResponse, extendedAnalyticsProps);
    _oWebAnalytics.submit(extendedVars);
  };
  return AddRemoveServiceController;
});
