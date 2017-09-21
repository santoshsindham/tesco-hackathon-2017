define('modules/pdp/models/InventorySKUModel', [
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
  function InventorySKUModel(config) {
    this.DataStoreClass = InventoryDS;
    this.sNamespace = 'inventorySKU';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(InventorySKUModel, BaseModel);

  InventorySKUModel.prototype.createEndpoint = function (args) {
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

  InventorySKUModel.prototype.dataHandler = function (oResponse) {
    if (oResponse.skus.length > 0) {
      this.add(oResponse.skus);
    }
  };

  return InventorySKUModel;
});
