define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');
  var MarketingSku = require('modules/pdp/data-stores/marketing/sku/index');
  var BaseModel = require('modules/pdp/models/BaseModel');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  var MarketingSkuModel = function MarketingSkuModel(config) {
    this.DataStoreClass = MarketingSku;
    this.sNamespace = 'marketingSku';
    this.parent.constructor.call(this, config);
  };

  fn.inherit(MarketingSkuModel, BaseModel);

  MarketingSkuModel.prototype.dataHandler = function (res) {
    if (!fn.isObject(res, { notEmpty: true })) return;
    this.add(res);
  };

  module.exports = MarketingSkuModel;
});
