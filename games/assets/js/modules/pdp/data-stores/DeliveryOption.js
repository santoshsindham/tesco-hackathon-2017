define('modules/pdp/data-stores/DeliveryOption', [], function () {
  'use strict';

  /**
   *
   * @param {Object} data
   * @return {void}
   */
  function DeliveryOption(data) {
    this.id = data.id || null;
    this.type = data.type || null;
    this.name = data.name || null;
    this.charge = data.charge || null;
    this.leadTime = data.leadTime || null;
    this.message = data.message || null;
    this.chargeableClickAndCollect = data.chargeableClickAndCollect || null;
    this.isScheduled = data.isScheduled || null;
    this.isResiliency = data.isResiliency || false;
  }

  return DeliveryOption;
});
