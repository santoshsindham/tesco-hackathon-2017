define(function (require, exports, module) {
  'use strict';

  var fn = require('../../../mvc/fn');

  /**
   *
   * @constructor
   * @param {Object} opts
   * @param {string} opts.endpoint
   * @param {string} opts.orgID
   * @param {boolean} opts.sortFilterEnabled
   * @param {number} opts.ttl
   * @return {void}
   */
  var Provider = function Provider(opts) {
    this._endpoint = opts.endpoint || null;
    this._sortFilterEnabled = opts.sortFilterEnabled || false;
    this._ttl = opts.ttl || 300000;
  };

  /**
   *
   * @private
   * @param {Object} dataset
   * @return {Array<string>}
   */
  Provider.prototype._depaginate = function (dataset) {
    var ids = [];

    Object.keys(dataset).forEach(function (key) {
      if (!fn.isArray(dataset[key])) return;
      ids = ids.concat(dataset[key]);
    });

    return ids;
  };

  /**
   *
   * @private
   * @param {number} page
   * @return {Promise}
   */
  Provider.prototype._fetchDataset = function (page) {
    var deferred = $.Deferred();
    var url = this._buildURL(page);

    var options = {
      beforeSend: function (xhr, settings) {
        var _settings = settings;
        _settings.url = url;
      },
      method: 'GET',
      url: url
    };

    $.ajax(options)
      .done(function (res) {
        deferred.resolve(res);
      })
      .fail(function () {
        deferred.reject();
      });

    return deferred.promise();
  };

  /**
   *
   * @private
   * @return {Object}
   */
  Provider.prototype._getCachedDataset = function () {
    var obj = fn.getSessionData(this._datasetKey) || {};
    if (!this._isCacheValid(obj.ttl)) return null;
    fn.clearSessionData(this._datasetKey);
    var dataset = obj[fn.hashValue(location.href)];
    return !dataset || fn.isObject(dataset, { empty: true }) ? null : dataset;
  };

  /**
   *
   * @private
   * @param {number} ttl
   * @return {boolean}
   */
  Provider.prototype._isCacheValid = function (ttl) {
    return ttl > Date.now();
  };

  /**
   *
   * @private
   * @param {Array<string>} ids
   * @return {Object}
   */
  Provider.prototype._paginate = function (ids) {
    var pages = {};

    ids.forEach(function (value, index) {
      var page = Math.floor((index + 20) / 20);
      if (!pages[page]) pages[page] = [];
      pages[page].push(value);
    });

    return pages;
  };

  /**
   *
   * @private
   * @return {void}
   */
  Provider.prototype._setCachedDataset = function () {
    var obj = { ttl: this._setTTL() };
    obj[fn.hashValue(location.href)] = this._dataset;
    fn.setSessionData(this._datasetKey, obj);
  };

  /**
   *
   * @private
   * @return {void}
   */
  Provider.prototype._setTTL = function () {
    return Date.now() + this._ttl;
  };

  /**
   *
   * @return {boolean}
   */
  Provider.prototype.sortFilterEnabled = function () {
    return this._sortFilterEnabled;
  };

  /**
   *
   * @param {Array<string>} dataset
   * @return {void}
   */
  Provider.prototype.updateDataset = function (dataset) {
    this._dataset.paginated = this._paginate(dataset.split(','));
    this._setCachedDataset();
  };

  module.exports = Provider;
});
