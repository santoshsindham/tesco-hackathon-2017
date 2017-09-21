define('modules/pdp/models/InventoryStoreModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/InventoryStore',
  'modules/pdp/models/BaseModel'
], function (fn, InventoryStore, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function InventoryStoreModel(config) {
    this.DataStoreClass = InventoryStore;
    this.sNamespace = 'inventoryStore';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(InventoryStoreModel, BaseModel);

  InventoryStoreModel.prototype.createEndpoint = function (args) {
    var values = args.values,
      endpoints = [],
      endpoint = null,
      url = '',
      storeIds = '',
      listingId = '';

    endpoint = this.oDataEndpointMap.getEndpoint(this.sNamespace);

    if (endpoint && args.values.length) {
      url = endpoint.action.fetch.href;
      storeIds = values[0];
      listingId = values[1];
      url = url.replace(/({STOREIDS})/, storeIds).replace(/({LISTINGID})/, listingId);
      endpoints.push(url);
    }

    return endpoints;
  };

  InventoryStoreModel.prototype.dataHandler = function (data) {
    var oData = data,
      i = 0,
      aAvailabilities = [],
      sStockStatus = '';

    if (oData.availabilities.length > 0) {
      for (i; i < oData.availabilities.length; i += 1) {
        if (!oData.availabilities[i].error) {
          sStockStatus = oData.availabilities[i].stock_status;
          oData.availabilities[i].id = oData.availabilities[i].location.id;
          oData.availabilities[i].stockStatusMessage = sStockStatus.substring(0, 1) + sStockStatus.substring(1).toLowerCase().replace(/_/gi, ' ');
          aAvailabilities.push(oData.availabilities[i]);
        }
      }
      this.add(aAvailabilities);
    }
  };

  return InventoryStoreModel;
});
