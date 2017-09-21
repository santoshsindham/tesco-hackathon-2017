define(function (require, exports, module) {
  'use strict';

  var _super = require('../index');
  var breadcrumbCache = require('../../../../breadcrumb-cache/common');
  var fn = require('../../../../mvc/fn');

  /**
   *
   * @constructor
   * @param {Object} opts
   * @param {string} opts.sessionID
   * @param {string} opts.siteID
   * @param {string} opts.userID
   * @return {void}
   */
  var Attraqt = function Attraqt(opts) {
    _super.call(this, opts);
    var metadata = this._getCategoryMetadata();
    this._categoryID = metadata.categoryID;
    this._categoryTree = metadata.categoryTree;
    this._datasetKey = 'attraqtDataset::' + this._categoryID;
    this._dataset = this._getCachedDataset() || {};
    this._sessionID = opts.sessionID;
    this._siteID = opts.siteID;
    this._userID = opts.userID;
  };

  fn.inherit(Attraqt, _super);

  /**
   *
   * @private
   * @param {string} page
   * @return {string}
   */
  Attraqt.prototype._buildURL = function (page) {
    var url = this._endpoint + '?zone0=category&currency=GBP';
    if (this._siteID) url += '&siteId=' + this._siteID;
    if (this._userID) url += '&UID=' + this._userID;
    if (this._sessionID) url += '&sid=' + this._sessionID;
    if (this._categoryTree) url += '&config_categorytree=' + this._categoryTree;
    if (this._categoryID) url += '&config_category=' + this._categoryID;
    if (page) url += '&category_page=' + page;
    return url;
  };

  /**
   *
   * @private
   * @return {Object}
   */
  Attraqt.prototype._getCategoryMetadata = function () {
    return {
      categoryID: breadcrumbCache.getCurrentCategoryID(location.href),
      categoryTree: breadcrumbCache.getHierarchyIDs(location.href).join('/')
    };
  };

  /**
   *
   * @private
   * @param {number} page
   * @return {Promise}
   */
  Attraqt.prototype._getDataset = function (page) {
    var deferred = $.Deferred();
    var dataset = this._dataset[page];

    if (dataset && dataset.length) {
      deferred.resolve(dataset);
      return deferred.promise();
    }

    var _this = this;

    this._fetchDataset(page)
      .done(function (res) {
        dataset = _this._parseResponse(res);
        _this._dataset[page] = dataset;
        _this._setCachedDataset();

        if (dataset.length) {
          deferred.resolve(dataset);
        } else {
          deferred.reject();
        }
      })
      .fail(function () {
        _this._dataset[page] = dataset;
        _this._setCachedDataset();
        deferred.reject();
      });

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {Object} res
   * @return {any}
   */
  Attraqt.prototype._parseResponse = function (res) {
    var skus = fn.getValue(res, 'zones', 0, 'data', 'results');
    if (!fn.isArray(skus, { notEmpty: true })) return [];

    return skus.map(function (obj) {
      return fn.getValue(obj, 'fields', 'product_id', 'value', 0);
    })
      .filter(function (value) {
        return !!value;
      });
  };

  /**
   *
   * @param {number} page
   * @return {Promise}
   */
  Attraqt.prototype.getDataset = function (page) {
    var deferred = $.Deferred();

    this._getDataset(page)
      .done(function (dataset) {
        deferred.resolve(dataset, 'skuList');
      })
      .fail(function () {
        var message = 'ProductListing::ProvidersManager::Attraqt::No dataset available';
        console.info(message);
        deferred.reject(message);
      });

    return deferred.promise();
  };

  module.exports = Attraqt;
});
