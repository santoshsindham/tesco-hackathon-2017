define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseController = require('modules/pdp/controllers/BaseController'),
    KioskTabsView = require('modules/pdp/views/kiosk-tabs/index');

  /**
   *
   * @param {Array<Objects>} models
   * @return {void}
   */
  function KioskTabsController(models) {
    this.sNamespace = 'links';
    this.sTag = 'tabs';
    this.views = { classes: { KioskTabsView: KioskTabsView } };
    this.parent.constructor.call(this, models);
  }

  fn.inherit(KioskTabsController, BaseController);
  KioskTabsController.modelNames = ['inventorySKU', 'links', 'products', 'sellers', 'sku'];

  /**
   *
   * @param {Object} args
   * @param {JQueryDeferred} args.deferred
   * @param {Object} args.mParamData
   * @param {Object} args.mParamData.mvc
   * @return {void}
   */
  KioskTabsController.prototype._collateDataDependancies = function (args) {
    var deferred = args.deferred,
      mvcData = args.mParamData.mvc,
      flags = mvcData.flags || {},
      productData = mvcData.products,
      productModel = this.models.products,
      promises = [],
      skuData = mvcData.sku,
      skuModel = this.models.sku;

    flags.isFF = typeof flags.isFF === 'boolean' ? flags.isFF : productModel.isFF(productData);
    flags.inPanel = true;

    flags.tabs = {
      hasAccessories: false,
      hasBiography: !!skuModel.getBookDetails(skuData).authorBiography,
      hasBundle: false,
      hasCompleteTheLook: !!productModel.getLinks(
        { value: 'completeTheLook', data: productData }
      ).length,
      hasDetails: !!skuData.longDescription || !!skuData.bookDetails || (flags.isFF
        && (!!skuData.miniDescription || !!skuData.specification)),
      hasOutfitBuilder: !!productModel.getLinks({ value: 'outFit', data: productData }).length,
      hasReviews: !!skuData.noofRatingsProduced,
      hasShopTheRange: false,
      hasSpecs: !!skuData.specification && !flags.isFF,
      hasSynopsis: !!skuData.skuSynopsis
    };

    promises = promises.concat(this._hasRecommenders(mvcData));
    promises.push(this._hasPromos(mvcData));

    $.when
      .apply($, promises)
      .done(function () {
        deferred.resolve(args);
      });
  };

  /**
   *
   * @param {Object} mvcData
   * @return {Array<JQueryPromise>}
   */
  KioskTabsController.prototype._hasRecommenders = function (mvcData) {
    var _this = this,
      relationships = ['accessories', 'range'],
      promises = [];

    relationships.forEach(function loopRelationships(rel) {
      promises.push(_this._hasRecommender(rel, mvcData));
    });

    return promises;
  };

  /**
   *
   * @param {string} rel
   * @param {Object} mvcData
   * @return {JQueryPromise}
   */
  KioskTabsController.prototype._hasRecommender = function (rel, mvcData) {
    var deferred = $.Deferred(),
      flags = mvcData.flags.tabs,
      relatedModel = this.models.links,
      skuData = mvcData.sku,
      invSkuModel = this.models.inventorySKU;

    relatedModel.fetch({
      mSearchValue: skuData.id,
      sModelMethod: 'relationships',
      hrefData: { relationship: rel },
      doneCallback: function (data) {
        if (!data.links.length) {
          deferred.resolve();
          return;
        }

        invSkuModel.getDataStores({
          fetch: true,
          value: data.links.map(function (link) {
            return link.id;
          })
        })
          .done(function (inv) {
            var avail = inv.filter(function (value) {
              return !!value.available;
            });

            if (avail.length) {
              if (rel === 'accessories') {
                flags.hasAccessories = true;
                flags.hasBundle = true;
              } else if (rel === 'range') {
                flags.hasShopTheRange = true;
              }
            }

            deferred.resolve();
          });
      }
    });

    return deferred.promise();
  };

  /**
   *
   * @param {Object} mvcData
   * @return {JQueryPromise}
   */
  KioskTabsController.prototype._hasPromos = function (mvcData) {
    var check = null,
      deferred = $.Deferred(),
      flags = mvcData.flags.tabs,
      listingID = '',
      observe = null,
      sellerModel = this.models.sellers,
      skuModel = this.models.sku;

    listingID = skuModel.getPrimaryListing(mvcData.sku).id;

    check = function checkSellerData(data) {
      if (!fn.checkData(data, ['id', 'name'])) {
        observe();
      } else {
        mvcData.sellers = data;
        flags.hasPromos = fn.isArray(data.promotions, { notEmpty: true });
        deferred.resolve();
      }
    };

    observe = function observeSellerData() {
      sellerModel.observe({
        action: 'add',
        callback: function observeCallback(resp) {
          check(resp.data.observe);
        },
        once: true,
        searchValue: listingID
      });
    };

    check(sellerModel.getDataStores({ value: listingID, noFetch: true }));
    return deferred.promise();
  };

  module.exports = KioskTabsController;
});
