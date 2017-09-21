define(function (require, exports, module) {
  'use strict';

  var _super = require('../index');
  var fn = require('../../../../mvc/fn');

  /**
   *
   * @constructor
   * @param {Object} opts
   * @param {Array<string>} [opts.dataset]
   * @param {string} opts.orgID
   * @return {void}
   */
  var SlickStitch = function SlickStitch(opts) {
    _super.call(this, opts);
    this._datasetKey = 'slickStitchDataset::' + opts.orgID;
    var dataset = this._getCachedDataset();

    if (!dataset && opts.dataset) {
      dataset = { unmodifed: opts.dataset, paginated: this._paginate(opts.dataset) };
    }

    this._dataset = dataset || {};
    this._orgID = opts.orgID;
  };

  fn.inherit(SlickStitch, _super);

  /**
   *
   * @private
   * @return {string}
   */
  SlickStitch.prototype._buildURL = function () {
    return this._endpoint + '?oid=' + this._orgID;
  };

  /**
   *
   * @private
   * @param {number} page
   * @param {boolean} sortFilter
   * @return {Promise}
   */
  SlickStitch.prototype._getDataset = function (page, sortFilter) {
    var deferred = $.Deferred();
    var dataset = sortFilter ? this._dataset.unmodifed : fn.getValue(this._dataset, 'paginated', String(page));

    if (dataset && dataset.length) {
      deferred.resolve(dataset);
      return deferred.promise();
    }

    var _this = this;

    this._fetchDataset()
      .done(function (res) {
        var ids = _this._parseResponse(res);
        _this._dataset = { paginated: _this._paginate(ids), unmodifed: ids };
        _this._setCachedDataset();
        dataset = _this._dataset.paginated[page];

        if (dataset.length) {
          deferred.resolve(dataset);
        } else {
          deferred.reject();
        }
      })
      .fail(function () {
        _this._dataset = {};
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
  SlickStitch.prototype._parseResponse = function (res) {
    var skus = fn.getValue(res, 'skus');
    if (!fn.isArray(skus, { notEmpty: true })) return [];

    return skus.map(function (obj) {
      return obj.product_sku;
    })
      .filter(function (value) {
        return !!value;
      });
  };

  /**
   *
   * @param {number} page
   * @param {boolean} sortFilter
   * @return {Promise}
   */
  SlickStitch.prototype.getDataset = function (page, sortFilter) {
    var deferred = $.Deferred();

    this._getDataset(page, sortFilter)
      .done(function (dataset) {
        deferred.resolve(dataset, 'schoolskuList');
      })
      .fail(function () {
        var message = 'ProductListing::ProvidersManager::SlickStitch::No dataset available';
        console.info(message);
        deferred.reject(message);
      });

    return deferred.promise();
  };

  module.exports = SlickStitch;
});
