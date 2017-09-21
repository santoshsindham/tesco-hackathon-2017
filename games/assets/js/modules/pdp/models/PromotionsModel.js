define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');
  var Promotion = require('modules/pdp/data-stores/Promotion');
  var BaseModel = require('modules/pdp/models/BaseModel');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  var PromotionsModel = function PromotionsModel(config) {
    this.DataStoreClass = Promotion;
    this.sNamespace = 'promotions';
    this.parent.constructor.call(this, config);
  };

  fn.inherit(PromotionsModel, BaseModel);

  PromotionsModel.prototype.dataHandler = function (res) {
    if (!fn.isArray(res, { notEmpty: true }) && !fn.isObject(res, { notEmpty: true })) return;
    this.add(res);
  };

  module.exports = PromotionsModel;
});
