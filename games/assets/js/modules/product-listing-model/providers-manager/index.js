define(function (require, exports, module) {
  'use strict';

  var Attraqt = require('./providers/attraqt/index');
  var SlickStitch = require('./providers/slick-stitch/index');

  /**
   *
   * @type {Object}
   */
  var _providers = {
    Attraqt: Attraqt,
    SlickStitch: SlickStitch
  };

  /**
   *
   * @constructor
   * @param {Object} opts
   * @return {void}
   */
  var Manager = function ProvidersManager(opts) {
    this._provider = this._getProvider(opts);
  };

  /**
   *
   * @private
   * @param {Object} opts
   * @return {Object}
   */
  Manager.prototype._getProvider = function (opts) {
    var Provider = _providers[opts.name];
    return new Provider(opts);
  };

  /**
   *
   * @param {number} page
   * @param {boolean} sortFilter
   * @return {Promise}
   */
  Manager.prototype.getDataset = function (page, sortFilter) {
    return this._provider.getDataset(page, sortFilter);
  };

  /**
   *
   * @return {boolean}
   */
  Manager.prototype.sortFilterEnabled = function () {
    return this._provider.sortFilterEnabled();
  };

  /**
   *
   * @param {Array<string>} dataset
   * @return {void}
   */
  Manager.prototype.updateDataset = function (dataset) {
    this._provider.updateDataset(dataset);
  };

  module.exports = Manager;
});
