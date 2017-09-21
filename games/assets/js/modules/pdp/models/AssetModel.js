define('modules/pdp/models/AssetModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/Asset',
  'modules/pdp/models/BaseModel'
], function (fn, Asset, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function AssetModel(config) {
    this.DataStoreClass = Asset;
    this.sNamespace = 'assets';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(AssetModel, BaseModel);

  return AssetModel;
});
