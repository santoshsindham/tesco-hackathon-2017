define('modules/pdp/data-stores/Service', [], function () {
  'use strict';

  /**
   * The data object for a service.
   * @param {Object} oData The data to be added to the service data object.
   * @return {void}
   */
  function Service(oData) {
    this.id = oData.id || null;
    this.longDesc = oData.longDesc || null;
    this.name = oData.name || null;
    this.price = oData.price || null;
    this.skuId = oData.skuId || null;
    this.tooltipMessage = oData.tooltipMessage || null;
    this.formHandler = oData.formHandler || null;
  }

  return Service;
});
