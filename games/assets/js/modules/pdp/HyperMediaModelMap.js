define('modules/pdp/HyperMediaModelMap', [], function () {
  'use strict';

  var HyperMediaModelMap = function HyperMediaModelMap() {
    this.oHyperMediaModelMap = [
      {
        type: 'sku',
        model: 'sku'
      }, {
        type: 'product',
        model: 'products'
      },
      {
        type: 'booksSku',
        model: 'sku'
      },
      {
        type: 'directSku',
        model: 'sku'
      }, {
        type: 'booksSku',
        model: 'sku'
      }
    ];
  };

  HyperMediaModelMap.prototype.getModelFromHyperMediaType = function (sType) {
    var i = 0;

    for (i = 0; i < this.oHyperMediaModelMap.length; i += 1) {
      if (this.oHyperMediaModelMap[i].type === sType) {
        return this.oHyperMediaModelMap[i].model;
      }
    }
    return null;
  };

  return HyperMediaModelMap;
});
