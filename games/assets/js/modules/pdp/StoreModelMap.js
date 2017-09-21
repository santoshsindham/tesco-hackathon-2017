define('modules/pdp/StoreModelMap', [], function () {
  'use strict';

  /**
   * Map used in base model to look up namespaced data models.
   * @return {void}
   */
  function StoreModelMap() {
    this.aMap = [
      'products',
      'sku',
      'sellers',
      'promotions',
      'deliveryOptions',
      'services',
      'formHandler',
      'storeStockCheck',
      'stores'
    ];
  }

  StoreModelMap.prototype.isStoreMapped = function (sProp) {
    var i = 0,
      iCount = this.aMap.length;

    for (; i < iCount; i += 1) {
      if (this.aMap[i] === sProp) {
        return true;
      }
    }

    return false;
  };

  return StoreModelMap;
});
