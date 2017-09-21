define('modules/pdp/controllers/PriceCheckController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/PriceCheckView',
  'modules/tesco.analytics'
], function (fn, BaseController, PriceCheckView, analytics) {
  'use strict';

  /**
   *
   * @param {Array<Objects>} models
   * @return {void}
   */
  function PriceCheckController(models) {
    this.sNamespace = 'sku';
    this.sTag = 'competitors';
    this.views = {
      classes: {
        PriceCheckView: PriceCheckView
      }
    };
    this.flags = { viewRendered: false };
    this.parent.constructor.call(this, models);
  }


  fn.inherit(PriceCheckController, BaseController);
  PriceCheckController.modelNames = ['inventorySKU', 'sellers', 'sku'];


  PriceCheckController.prototype._collateDataDependancies = function (args) {
    var _this = this,
      _args = args,
      sellerModel = this.models.sellers,
      skuModel = this.models.sku,
      mvcData = args.mParamData.mvc,
      skuData = mvcData.sku,
      masterDeferred = args.deferred,
      mvcPage = fn.getValue(window.oAppController, 'oPageController');

    if (!mvcPage || !mvcPage.getSelectedSku().id) {
      this.rejectAndDestroy(masterDeferred);
      return;
    }

    if (sellerModel.getName(skuModel.getPrimaryListing(skuData).id) !== 'Tesco') {
      this.rejectAndDestroy(masterDeferred);
      return;
    }

    if (skuModel.getCompetitors(skuData).length > 0) {
      _this.flags.viewRendered = true;
      masterDeferred.resolve(_args);
      return;
    }

    skuModel.fetch({
      mSearchValue: skuData.id,
      sModelMethod: 'competitors',
      doneCallback: function (respData) {
        if (!fn.isObject(respData) || !fn.isArray(respData.skus, { notEmpty: true })) {
          _this.rejectAndDestroy(masterDeferred);
          return;
        }

        if (!fn.isObject(respData.skus[0])
            || !fn.isArray(respData.skus[0].competitors, { notEmpty: true })) {
          _this.rejectAndDestroy(masterDeferred);
          return;
        }

        skuData = skuModel.update({
          mSearchValue: skuData.id,
          sUpdateKey: 'competitors',
          mUpdateValue: respData.skus[0].competitors
        });

        if (!fn.isObject(skuData, { notEmpty: true })) {
          _this.rejectAndDestroy(masterDeferred);
          return;
        }

        _this.flags.viewRendered = true;
        _args.mParamData.mvc.sku = skuData;
        masterDeferred.resolve(_args);

        _this._analyticsTracking(respData.skus[0].competitors);
      }
    });
  };

  PriceCheckController.prototype._analyticsTracking = function (analyticsResponse) {
    var oWebAnalytics = null,
      v = [],
      competitorName = [],
      competitorPrice = [],
      competitorInfo = '',
      finalCompetitorList = [],
      competitorDetails = '';

    if (this.isArray(analyticsResponse, true)) {
      this.forLoop(analyticsResponse, function (i) {
        if (this.isObject(analyticsResponse[i], true)) {
          competitorName[i] = analyticsResponse[i].competitorName;
          competitorPrice[i] = analyticsResponse[i].competitorPrice;
          competitorInfo = competitorName[i] + '-' + competitorPrice[i];
          finalCompetitorList.push(competitorInfo);
        }
      });
      competitorDetails = finalCompetitorList.toString();
    }

    v = [{
      prop51: competitorDetails,
      contextData: {
        content_module_impression: 1,
        content_module_name: 'Price Checker'
      }
    }];

    oWebAnalytics = new analytics.WebMetrics();
    if (!window.pageLoadAnalyticsSuccess) {
      $(window).one('pageLoadAnalyticsSuccess',
      function priceCheckControllerAsyncAnalytics() {
        oWebAnalytics.submit(v);
      });
    } else {
      oWebAnalytics.submit(v);
    }
  };

  PriceCheckController.prototype.rejectAndDestroy = function (deferred) {
    var renderedView = {};

    if (this.flags.viewRendered) {
      renderedView = this._getStoredView('PriceCheckView', function (view) {
        if (view.sTag === 'competitors') {
          return true;
        }
        return false;
      });

      if (fn.isObject(renderedView, { notEmpty: true })) {
        renderedView.destroy();
      }

      this.flags.viewRendered = false;
    }
    deferred.reject();
  };

  return PriceCheckController;
});
