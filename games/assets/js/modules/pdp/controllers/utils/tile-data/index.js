define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');

  /**
   *
   * @private
   * @type {Object}
   */
  var _models;

  /**
   *
   * @param {Object} skuData
   * @param {string} name
   * @return {Object}
   */
  var cloneFormhandler = function cloneFormhandler(skuData, name) {
    var productID = _models.sku.getParentProduct(skuData).id;

    // TODO: Need to add promoID if it is passed in

    return _models.formHandler.clone({
      component: name,
      config: [{
        key: 'catalogRefIds',
        value: _models.sku.getPrimaryListing(skuData).id
      }, {
        key: 'productId',
        value: productID
      }, {
        key: 'skuId',
        value: skuData.id
      }],
      name: 'addToBasket',
      publicLink: _models.products.getPublicLink(productID)
    }, { add: true });
  };

  /**
   *
   * @param {Object} data
   * @param {string} namespace
   * @param {string} tag
   * @return {Object}
   */
  var collateWithAddToBasket = function collateWithItemActions(data, namespace, tag) {
    var obj = {};
    obj[namespace] = data;
    obj.formHandler = cloneFormhandler(data, tag);
    obj.sellers = { buyBoxMessage: 'buy', buyButtonLabel: 'Add to basket' };
    return obj;
  };

  /**
   *
   * @param {Object} data
   * @param {string} namespace
   * @return {Object}
   */
  var collateDefault = function collateDefault(data, namespace) {
    var obj = {};
    obj[namespace] = data;
    return obj;
  };

  /**
   *
   * @param {Array<Object>} data
   * @param {string} namespace
   * @param {string} tag
   * @param {Object} flags
   * @param {Object} models
   * @return {Array<Object>}
   */
  var collateData = function collateData(data, namespace, tag, flags, models) {
    _models = models;
    var collate;
    var collated = [];

    if (namespace === 'sku' && flags.showItemActions) {
      collate = collateWithAddToBasket;
    } else {
      collate = collateDefault;
    }

    fn.loopArray(data, function loopItems(i) {
      collated.push(collate(data[i], namespace, tag));
    });

    return collated;
  };

  module.exports = {
    collateData: collateData
  };
});
