define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');
  var BaseController = require('modules/pdp/controllers/BaseController');
  var PromotionsView = require('modules/pdp/views/PromotionsView');
  var analytics = require('modules/tesco.analytics');

  /**
   *
   * @param {Array<Object>} models
   * @return {void}
   */
  var PromotionsController = function PromotionsController(models) {
    this.sNamespace = 'promotions';
    this.sTag = '_default';

    this.views = { classes: {
      PromotionsView: PromotionsView
    } };

    this.parent.constructor.call(this, models);
  };

  fn.inherit(PromotionsController, BaseController);
  PromotionsController.modelNames = ['promotions', 'sellers', 'sku'];

  /**
   *
   * @private
   * @param {Object} args
   * @param {string} args.sViewName
   * @param {string} args.sTag
   * @return {boolean}
   */
  PromotionsController.prototype._collateDataConditional = function (args) {
    return args.sViewName === 'PromotionsView' && args.sTag === 'productPage';
  };

  /**
   *
   * @private
   * @param {Object} args
   * @return {void}
   */
  PromotionsController.prototype._collateDataDependancies = function (args) {
    this._collateProductPageDependancies(args);
  };

  /**
   *
   * @private
   * @param {Object} args
   * @param {JQueryDeferred} args.deferred
   * @param {Object} args.mParamData
   * @return {void}
   */
  PromotionsController.prototype._collateProductPageDependancies = function (args) {
    var _this = this,
      masterDeferred = args.deferred,
      mvcData = args.mParamData.mvc,
      sellerModel = this.models.sellers;

    this._querySellerModel(args)
      .done(function handleQuerySellerModelSuccess(sellerData) {
        mvcData.sellers = sellerData;

        if (!mvcData.sellers.length || !sellerModel.getPromotions(mvcData.sellers[0]).length) {
          masterDeferred.resolve(args);
        } else {
          _this._queryPromotionsModel(args)
            .done(function handleQueryPromotionsModelSuccess(promoData) {
              mvcData.promotions = promoData;
              masterDeferred.resolve(args);
            });
        }
      });
  };

  /**
   *
   * @private
   * @param {Object} args
   * @param {Object} args.mParamData
   * @return {JQueryPromise}
   */
  PromotionsController.prototype._querySellerModel = function (args) {
    var check = null,
      deferred = $.Deferred(),
      listingIDs = [],
      listingLinks = [],
      mvcData = args.mParamData.mvc,
      observe = null,
      sellerModel = this.models.sellers,
      skuModel = this.models.sku;

    listingLinks = skuModel.getListings(mvcData.sku);

    if (!listingLinks.length) {
      deferred.resolve([]);
    }

    listingIDs = listingLinks.map(function (link) {
      return link.id;
    });

    check = function checkSellerData(data) {
      if (!fn.checkData(data, ['id', 'name'])) {
        observe();
      } else {
        deferred.resolve(data);
      }
    };

    observe = function observeSellerData() {
      sellerModel.observe({
        action: 'add',
        callback: function observeCallback(resp) {
          check(resp.data.observe);
        },
        once: true,
        searchValue: listingIDs
      });
    };

    check(sellerModel.getDataStores({ value: listingIDs, noFetch: true }));

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {Object} args
   * @param {Object} args.mParamData
   * @return {JQueryPromise}
   */
  PromotionsController.prototype._queryPromotionsModel = function (args) {
    var check = null,
      deferred = $.Deferred(),
      mvcData = args.mParamData.mvc,
      observe = null,
      promoIDs = [],
      promotionsModel = this.models.promotions,
      sellerModel = this.models.sellers;

    promoIDs = sellerModel.getPromotions(mvcData.sellers[0]);

    check = function checkPromoData(data) {
      if (!fn.checkData(data, ['id', 'displayName'])) {
        observe();
      } else {
        deferred.resolve(data);
      }
    };

    observe = function observePromoData() {
      promotionsModel.observe({
        action: 'add',
        callback: function observeCallback(resp) {
          check(resp.data.observe);
        },
        once: true,
        searchValue: promoIDs
      });
    };

    check(promotionsModel.getDataStores({ value: promoIDs, noFetch: true }));

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {Object} data
   * @return {void}
   */
  PromotionsController.prototype._bindViewEvents = function (data) {
    $(data.oView.oElms.elPromoLink).on(
      'click',
      { view: data.oView },
      this._analyticsTracking.bind(this)
    );
  };

  /**
   *
   * @private
   * @return {void}
   */
  PromotionsController.prototype._analyticsTracking = function () {
    var webAnalytics = new analytics.WebMetrics(),
      v = [{
        prop19: 'see other products',
        eVar45: 'see other products',
        prop42: 'pdp - special offers - other products',
        eVar59: 'pdp - special offers - other products',
        events: 'event45'
      }];

    webAnalytics.submit(v);
  };

  module.exports = PromotionsController;
});
