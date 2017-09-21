define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');
  var Category = require('modules/pdp/data-stores/Category');
  var BaseModel = require('modules/pdp/models/BaseModel');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  var CategoryModel = function CategoryModel(config) {
    this.DataStoreClass = Category;
    this.sNamespace = 'categories';
    this.parent.constructor.call(this, config);
  };

  fn.inherit(CategoryModel, BaseModel);

  CategoryModel.prototype.dataHandler = function (res) {
    if (!fn.isArray(res, { notEmpty: true }) && !fn.isObject(res, { notEmpty: true })) return;
    this.add(res);
  };

  module.exports = CategoryModel;
});
