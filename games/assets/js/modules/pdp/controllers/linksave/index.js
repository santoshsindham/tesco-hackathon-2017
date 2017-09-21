define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');
  var BaseController = require('modules/pdp/controllers/BaseController');
  var tileData = require('modules/pdp/controllers/utils/tile-data/index');
  var filtering = require('modules/pdp/controllers/utils/filtering/index');
  var LinksaveCarouselView = require('modules/pdp/views/linksave/carousel/index');

  /**
   *
   * @constructor
   * @param {Array<Object>} models
   * @return {void}
   */
  var LinksaveController = function LinksaveController(models) {
    this.sNamespace = 'promotions';
    this.sTag = 'linksave';
    this._cache = {};

    this.views = { classes: {
      LinksaveCarouselView: LinksaveCarouselView
    } };

    this.parent.constructor.call(this, models);
  };

  fn.inherit(LinksaveController, BaseController);

  LinksaveController.modelNames = [
    'bucketGroup',
    'formHandler',
    'inventoryProduct',
    'inventorySKU',
    'marketingSku',
    'products',
    'promotions',
    'sku',
    'categories'
  ];

  /**
   *
   * @private
   * @param {Object} args
   * @return {void}
   */
  LinksaveController.prototype._collateDataDependancies = function (args) {
    var deferred = args.deferred;
    var cacheEntry = this._getCacheEntry(args);

    if (cacheEntry) {
      if (cacheEntry.resolve) deferred.resolve(cacheEntry.data);
      if (cacheEntry.reject) deferred.reject();
      return;
    }

    var mvcData = args.mParamData.mvc;
    var info = mvcData.info;
    var promotion = info.promotion;
    var namespace = 'sku';
    var _this = this;

    this._getPromotion(promotion.id, info.sku.id)
      .done(function (promoData, bucketType) {
        promotion.bucketType = promotion.bucketType || bucketType;

        if (_this._isLastBucket(promotion.bucketType, promoData.bucketCount)) {
          _this._cacheAndReject(args, deferred);
          return;
        }

        var nextBucketType = _this._getNextBucketType(promotion.bucketType);
        var promoModel = _this.models.promotions;
        var bucketLink = promoModel.getLinks({ value: nextBucketType, data: promoData });

        if (!fn.getValue(bucketLink[0], 'id')) {
          _this._cacheAndReject(args, deferred);
          return;
        }

        var bucketGroupModel = _this.models.bucketGroup;

        bucketGroupModel.getDataStores({ value: bucketLink[0].id, fetch: true })
          .done(function (bucketData) {
            var dataLinks = bucketGroupModel.getLinks({ value: 'contains', data: bucketData });
            bucketData.isLastBucket = _this._isLastBucket(nextBucketType);

            _this._getSkuLinks(dataLinks)
              .done(function (skuLinks) {
                if (!skuLinks.length) {
                  _this._cacheAndReject(args, deferred);
                  return;
                }

                var skuIDs = skuLinks.map(function (obj) {
                  return obj.id;
                });

                var skuModel = _this.models.sku;

                skuModel.getDataStores({ value: skuIDs, fetch: true })
                .done(function (skuData) {
                  if (!fn.isArray(skuData, { notEmpty: true })) {
                    _this._cacheAndReject(args, deferred);
                    return;
                  }

                  _this._filterItems(skuData, namespace, mvcData.filters)
                    .done(function (filteredData) {
                      if (!fn.isArray(filteredData, { notEmpty: true })) {
                        _this._cacheAndReject(args, deferred);
                        return;
                      }

                      var viewData = _this._collateViewData(
                        promoData, bucketData, filteredData, namespace,
                        mvcData.flags
                      );

                      _this._cacheAndResolve(args, viewData, deferred);
                    })
                    .fail(function () {
                      _this._cacheAndReject(args, deferred);
                    });
                })
                .fail(function () {
                  _this._cacheAndReject(args, deferred);
                });
              })
              .fail(function () {
                deferred.reject();
              });
          })
          .fail(function () {
            _this._cacheAndReject(args, deferred);
          });
      })
      .fail(function () {
        _this._cacheAndReject(args, deferred);
      });
  };

  /**
   *
   * @private
   * @param {Object} args
   * @param {JQueryDeferred} deferred
   * @return {void}
   */
  LinksaveController.prototype._cacheAndReject = function (args, deferred) {
    this._setCacheEntry(args, { reject: true });
    deferred.reject();
  };

  /**
   *
   * @private
   * @param {Object} args
   * @param {Object} data
   * @param {JQueryDeferred} deferred
   * @return {void}
   */
  LinksaveController.prototype._cacheAndResolve = function (args, data, deferred) {
    fn.mergeObjects(args.mParamData.mvc, data, { extend: true });
    this._setCacheEntry(args, { resolve: true });
    deferred.resolve(args);
  };

  /**
   *
   * @private
   * @param {Object} promoData
   * @param {Object} bucketData
   * @param {Array<Object>} filteredData
   * @param {string} namespace
   * @param {Object} flags
   * @param {string} nextBucketType
   * @return {Promise}
   */
  LinksaveController.prototype._collateViewData = function (
    promoData, bucketData, filteredData, namespace, flags) {
    var filteredViewData = filteredData;

    // condition added to display only 12 items on the carousel
    if (filteredData.length > 12) {
      filteredViewData = filteredData.slice(0, 12);
    }

    var collatedData = tileData.collateData(filteredViewData, namespace, 'linksave', flags, this.models);

    return {
      bucketGroup: bucketData,
      products: {},
      promotion: promoData,
      sku: {},
      viewModel: collatedData
    };
  };

  /**
   *
   * @private
   * @param {any} data
   * @param {string} namespace
   * @param {Object} filters
   * @return {Promise}
   */
  LinksaveController.prototype._filterItems = function (data, namespace, filters) {
    return filtering.filterItems(data, namespace, filters, this.models);
  };

  /**
   *
   * @private
   * @param {Object} args
   * @return {Object}
   */
  LinksaveController.prototype._getCacheEntry = function (args) {
    return this._cache[fn.hashValue(args)] || null;
  };

  /**
 *
 * @private
 * @param {string} categoryIDs
 * @param {string} skuLinks
 * @return {JQueryPromise}
 */
  LinksaveController.prototype._getCategorySkuLinks = function (categoryIDs) {
    var deferred = $.Deferred();
    var _this = this;
    var categoryModel = this.models.categories;

    categoryModel.getDataStores({ value: categoryIDs, fetch: true })
      .done(function (categoryData) {
        if (!fn.isArray(categoryData, { notEmpty: true })) {
          deferred.reject();
          return;
        }

        var productLinks = categoryModel.getLinks({ value: 'contains', data: categoryData });

        var productIDs = productLinks.map(function (obj) {
          return obj.id;
        });

        _this._getProductSkuLinks(productIDs)
          .done(function (productData) {
            if (!fn.isArray(productData, { notEmpty: true })) {
              deferred.reject();
              return;
            }

            deferred.resolve(productData);
          })
          .fail(function () {
            deferred.reject();
          });
      })
      .fail(function () {
        deferred.reject();
      });

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {string} promoID
   * @param {string} skuID
   * @return {JQueryPromise}
   */
  LinksaveController.prototype._getMarketing = function (promoID, skuID) {
    var deferred = $.Deferred();

    if (promoID) {
      deferred.resolve(promoID);
      return deferred.promise();
    }

    var model = this.models.marketingSku;

    model.getDataStores({ value: skuID, fetch: true })
      .done(function (data) {
        if (!fn.isObject(data, { notEmpty: true })) {
          deferred.reject();
          return;
        }

        var promoItems = fn.getValue(data, '_links', 'promotions', 'items');

        if (!promoItems || !promoItems.length) {
          deferred.reject();
          return;
        }

        var linkSaveItems = promoItems.filter(function (obj) {
          return obj.kind === 'linkSave';
        });

        if (!linkSaveItems.length) {
          deferred.reject();
          return;
        }

        var _promoID = fn.getURLQueryString('promoid');

        var linkSaveItem = null;

        if (_promoID) {
          fn.loopArray(linkSaveItems, function loopItems(i) {
            if (fn.isObject(linkSaveItems[i], { notEmpty: true })) {
              if (_promoID === linkSaveItems[i].id) {
                linkSaveItem = linkSaveItems[i];
              }
            }
          });

          if (linkSaveItem) {
            deferred.resolve(linkSaveItem.id, linkSaveItem.bucketType);
            return;
          }
        }

        if (!fn.getValue(linkSaveItems[0], 'id')) {
          deferred.reject();
          return;
        }

        deferred.resolve(linkSaveItems[0].id, linkSaveItems[0].bucketType);
      })
      .fail(function () {
        deferred.reject();
      });

    return deferred.promise();
  };

  /**
 *
 * @private
 * @param {string} currentBucketType
 * @return {string}
 */
  LinksaveController.prototype._getNextBucketType = function (currentBucketType) {
    if (currentBucketType === 'bucketX') return 'bucketY';
    return 'bucketZ';
  };

  /**
   *
   * @private
   * @param {string} productIDs
   * @param {string} skuLinks
   * @return {JQueryPromise}
   */
  LinksaveController.prototype._getProductSkuLinks = function (productIDs) {
    var deferred = $.Deferred();
    var productModel = this.models.products;

    productModel.getDataStores({ value: productIDs, fetch: true })
      .done(function (data) {
        if (!fn.isArray(data, { notEmpty: true })) {
          deferred.reject();
          return;
        }

        var skuLinks = productModel.getLinks({ value: 'childSku', data: data });
        deferred.resolve(skuLinks);
      })
      .fail(function () {
        deferred.reject();
      });

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {string} promoID
   * @param {string} skuID
   * @return {JQueryPromise}
   */
  LinksaveController.prototype._getPromotion = function (promoID, skuID) {
    var deferred = $.Deferred();
    var _this = this;

    this._getMarketing(promoID, skuID)
      .done(function (_promoID, bucketType) {
        var model = _this.models.promotions;

        model.getDataStores({ value: _promoID, forceFetch: true })
          .done(function (data) {
            if (!fn.isObject(data, { notEmpty: true })) {
              deferred.reject();
              return;
            }

            deferred.resolve(data, bucketType);
          })
          .fail(function () {
            deferred.reject();
          });
      })
      .fail(function () {
        deferred.reject();
      });

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {string} dataLinks
   * @param {string} skuID
   * @return {JQueryPromise}
   */
  LinksaveController.prototype._getSkuLinks = function (dataLinks) {
    /* This method is currently based on the assumption that bucket contains either sku,product
     or category ,need to refractor this method if bucket contains a combination  sku,product
     and category in future */
    var deferred = $.Deferred();

    if (fn.isArray(dataLinks, { notEmpty: true })) {
      var dataLinkType = fn.getValue(dataLinks[0], 'type');

      if (dataLinkType === 'sku') {
        deferred.resolve(dataLinks);
        return deferred.promise();
      }

      var dataLinkIDs = dataLinks.map(function (obj) {
        return obj.id;
      });

      var skuLinkPromise = dataLinkType === 'product' ? this._getProductSkuLinks(dataLinkIDs)
       : this._getCategorySkuLinks(dataLinkIDs);

      skuLinkPromise
        .done(function (data) {
          deferred.resolve(data);
        })
        .fail(function () {
          deferred.reject();
        });
    } else {
      deferred.reject();
    }

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {string} bucketName
   * @param {string} count
   * @return {boolean}
   */
  LinksaveController.prototype._isLastBucket = function (bucketName, count) {
    return (count === 2 && bucketName === 'bucketY') || (count === 3 && bucketName === 'bucketZ');
  };

  /**
   *
   * @private
   * @param {Object} args
   * @param {Object} data
   * @return {void}
   */
  LinksaveController.prototype._setCacheEntry = function (args, data) {
    this._cache[fn.hashValue(args)] = data;
  };

  module.exports = LinksaveController;
});
