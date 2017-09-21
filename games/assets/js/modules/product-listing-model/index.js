define(function (require, exports, module) {
  'use strict';

  var ProvidersManager = require('./providers-manager/index');

  /**
   *
   * @private
   * @type {Object}
   */
  var _asyncBrowse = {
    baseURL: '/direct/blocks/productlisting/asyncBrowse.jsp',
    method: 'GET'
  };

  /**
   *
   * @private
   * @type {Object}
   */
  var _infinityBrowse = {
    baseURL: '/direct/blocks/catalog/productlisting/infiniteBrowse.jsp',
    method: 'GET'
  };

  /**
   *
   * @private
   * @type {Object}
   */
  var _endpoints = {
    sortFilter: _asyncBrowse,
    paginate: _infinityBrowse
  };

  /**
   *
   * @constructor
   * @param {Object} [opts]
   * @return {Model}
   */
  var Model = function ProductListingModel(opts) {
    var _opts = opts || {};
    this._activeQueryParams = '';
    if (_opts.provider) this._providersManager = new ProvidersManager(_opts.provider);
  };

  /**
   *
   * @private
   * @param {Object} params
   * @return {string}
   */
  Model.prototype._buildQueryParams = function (params) {
    var queryParams = '';

    Object.keys(params).forEach(function (key, index) {
      var prefix = index === 0 ? '?' : '&';
      queryParams += prefix + key + '=' + params[key];
    });

    return queryParams;
  };

  /**
   *
   * @private
   * @param {string} endpoint
   * @param {Object} queryParams
   * @return {string}
   */
  Model.prototype._buildURL = function (endpoint, queryParams) {
    return endpoint + queryParams;
  };

  /**
   *
   * @private
   * @param {Object} opts
   * @param {Array<string>} [dataset]
   * @param {string} [key]
   * @return {Object}
   */
  Model.prototype._collateRequest = function (opts, dataset, key) {
    var params = this._filterParams(opts.params);
    if (dataset) params[key] = dataset.join(',');
    var queryParams = this._buildQueryParams(params);
    this._setActiveQueryParams(queryParams);
    return { queryParams: queryParams };
  };

  /**
   *
   * @private
   * @param {string} url
   * @param {string} method
   * @return {Promise}
   */
  Model.prototype._fetch = function (url, method) {
    var deferred = $.Deferred();

    var options = {
      beforeSend: function (xhr, settings) {
        var _settings = settings;
        _settings.url = url;
      },
      method: method,
      url: url
    };

    $.ajax(options)
      .done(function (res) {
        if (typeof res !== 'string') {
          deferred.reject();
          return;
        }

        deferred.resolve(JSON.parse(res));
      })
      .fail(function () {
        deferred.reject();
      });

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {Object} params
   * @return {string}
   */
  Model.prototype._filterParams = function (params) {
    var filtered = {};

    Object.keys(params).forEach(function (key) {
      if (!params[key] && typeof params[key] !== 'number') return;
      filtered[key] = params[key];
    });

    return filtered;
  };

  /**
   *
   * @private
   * @param {string} phase
   * @return {string}
   */
  Model.prototype._getEndpoint = function (phase) {
    var key = (phase === 'sort' || phase === 'filter') ? 'sortFilter' : 'paginate';
    return _endpoints[key];
  };

  /**
   *
   * @private
   * @param {Object} opts
   * @param {number} opts.page
   * @param {string} opts.phase
   * @param {boolean} opts.sortFilterApplied
   * @return {Promise}
   */
  Model.prototype._getProviderDataset = function (opts) {
    var deferred = $.Deferred();

    if (!this.hasProvider(opts.sortFilterApplied)) {
      deferred.resolve();
      return deferred.promise();
    }

    this._providersManager.getDataset(opts.page, this._isSortFilter(opts.phase))
      .done(function (dataset, key) {
        deferred.resolve(dataset, key);
      })
      .fail(function () {
        deferred.resolve();
      });

    return deferred.promise();
  };

  /**
   *
   * @private
   * @param {string} phase
   * @return {boolean}
   */
  Model.prototype._isSortFilter = function (phase) {
    return phase === 'sort' || phase === 'filter';
  };

  /**
   *
   * @private
   * @param {string} params
   * @return {void}
   */
  Model.prototype._setActiveQueryParams = function (params) {
    this._activeQueryParams = params;
  };

  /**
   *
   * @param {Object} opts
   * @param {Object} opts.params
   * @param {string} opts.phase
   * @param {boolean} opts.sortFilterApplied
   * @return {Promise}
   */
  Model.prototype.fetchFilters = function (opts) {
    var deferred = $.Deferred();
    var endpoint = this._getEndpoint(opts.phase);

    if (!endpoint) {
      deferred.reject();
      return deferred.promise();
    }

    // TODO: Need to check behaviour when sorting/filtering
    // set of IDs like in case of SlickStich.

    var req = this._collateRequest(opts);
    var url = this._buildURL(endpoint.baseURL, req.queryParams);

    this._fetch(url, endpoint.method)
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
   * @param {Object} opts
   * @param {Object} opts.params
   * @param {string} opts.phase
   * @param {boolean} opts.sortFilterApplied
   * @return {Promise}
   */
  Model.prototype.fetchTiles = function (opts) {
    var deferred = $.Deferred();
    var endpoint = this._getEndpoint(opts.phase);

    if (!endpoint) {
      deferred.reject();
      return deferred.promise();
    }

    var _this = this;

    this._getProviderDataset(opts)
      .done(function (dataset, key) {
        var req = _this._collateRequest(opts, dataset, key);
        var url = _this._buildURL(endpoint.baseURL, req.queryParams);

        _this._fetch(url, endpoint.method)
          .done(function (res) {
            if (res.updatedSkuList && _this.hasProvider(opts.sortFilterApplied)) {
              _this._providersManager.updateDataset(res.updatedSkuList);
            }

            deferred.resolve(res);
          })
          .fail(function () {
            deferred.reject();
          });
      });

    return deferred.promise();
  };

  /**
   *
   * @return {string}
   */
  Model.prototype.getActiveQueryParams = function () {
    return this._activeQueryParams;
  };

  /**
   *
   * @param {boolean} sortFilterApplied
   * @return {boolean}
   */
  Model.prototype.hasProvider = function (sortFilterApplied) {
    if (!sortFilterApplied) return !!this._providersManager;
    return !!this._providersManager && this._providersManager.sortFilterEnabled();
  };

  module.exports = Model;
});
