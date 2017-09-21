define('modules/pdp/data-stores/InventoryStore', [], function () {
  'use strict';

  /**
   * The data object for the inventory store / stock availability.
   * @param {Object} data The properties to map into the inventory store data object.
   * @return {void}
   */
  function InventoryStore(data) {
    this.available = data.available;
    this.id = data.id || null;
    this.location = data.location || null;
    this.productReference = data.productReference || null;
    this.stock_status = data.stock_status || null;
    this.stockStatusMessage = data.stockStatusMessage || null;
  }

  return InventoryStore;
});
