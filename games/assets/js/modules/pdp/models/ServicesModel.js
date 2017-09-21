define('modules/pdp/models/ServicesModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/Service',
  'modules/pdp/models/BaseModel'
], function (fn, Service, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ServicesModel(config) {
    this.DataStoreClass = Service;
    this.sNamespace = 'services';
    this.sParentNamespace = 'sellers';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ServicesModel, BaseModel);

  return ServicesModel;
});
