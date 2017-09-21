define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');
  var Bucket = require('modules/pdp/data-stores/bucket-group/index');
  var BaseModel = require('modules/pdp/models/BaseModel');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  var BucketGroupModel = function BucketGroupModel(config) {
    this.DataStoreClass = Bucket;
    this.sNamespace = 'bucketGroup';
    this.parent.constructor.call(this, config);
  };

  fn.inherit(BucketGroupModel, BaseModel);

  BucketGroupModel.prototype.dataHandler = function (res) {
    if (!fn.isArray(res, { notEmpty: true }) && !fn.isObject(res, { notEmpty: true })) return;
    this.add(res);
  };

  module.exports = BucketGroupModel;
});
