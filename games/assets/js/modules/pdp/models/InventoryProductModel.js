define('modules/pdp/models/InventoryProductModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/Inventory',
  'modules/pdp/models/BaseModel'
], function (fn, InventoryDS, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function InventoryProductModel(config) {
    this.DataStoreClass = InventoryDS;
    this.sNamespace = 'inventoryProduct';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(InventoryProductModel, BaseModel);

  InventoryProductModel.prototype.createEndpoint = function (args) {
    var endpoints = [],
      endpoint = null,
      url = '';

    endpoint = this.oDataEndpointMap.getEndpoint(this.sNamespace);

    if (endpoint && args.values.length) {
      url = endpoint.action.fetch.href;
      url += args.values.join(',');
      url += '?format=standard';

      if (typeof args.createEndpointCallback === 'function') {
        url = args.createEndpointCallback(url);
      }

      endpoints.push(url);
    }

    return endpoints;
  };

  InventoryProductModel.prototype.dataHandler = function (oResponse) {
    if (oResponse.products.length > 0) {
      this.add(oResponse.products);
    }
  };

  return InventoryProductModel;
});
