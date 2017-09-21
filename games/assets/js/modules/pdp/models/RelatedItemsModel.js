define('modules/pdp/models/RelatedItemsModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/RelatedItem',
  'modules/pdp/models/BaseModel'
], function (fn, RelatedItem, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function RelatedItemsModel(config) {
    this.DataStoreClass = RelatedItem;
    this.sNamespace = 'links';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(RelatedItemsModel, BaseModel);
  return RelatedItemsModel;
});
