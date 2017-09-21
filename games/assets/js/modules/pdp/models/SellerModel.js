define('modules/pdp/models/SellerModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/Seller',
  'modules/pdp/models/BaseModel'
], function (fn, Seller, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function SellerModel(config) {
    this.DataStoreClass = Seller;
    this.sNamespace = 'sellers';
    this.sParentNamespace = 'products';
    this.parent.constructor.call(this, config);
  }


  fn.inherit(SellerModel, BaseModel);


  /**
   * Gets the primary delivery option for a seller.
   * @param {String} sId The id of a seller.
   * @return {String} The id of the primary delivery option.
   */
  SellerModel.prototype.getPrimaryDeliveryOption = function (sId) {
    return this.forLoop(this._aDataStores, function (i) {
      if (this._aDataStores[i].id === sId) {
        if (this.isArray(this._aDataStores[i].deliveryOptions, true)) {
          return this._aDataStores[i].deliveryOptions[0];
        }
      }

      return undefined;
    });
  };


  /**
   * Gets whether there is a seller that is a tesco partner.
   * @param {String|Array} mId The id(s) of a seller.
   * @return {Boolean} true/false
   */
  SellerModel.prototype.isSellerPartner = function (mId) {
    return this.forLoop(this._aDataStores, function (i) {
      var isSellerPartner = undefined;

      if (this.isArray(mId, true)) {
        isSellerPartner = this.forLoop(mId, function (j) {
          if (this._aDataStores[i].id === mId[j]) {
            if (this._aDataStores[i].name !== 'Tesco') {
              return true;
            }
          }

          return undefined;
        });
      } else if (this._aDataStores[i].id === mId) {
        if (this._aDataStores[i].name !== 'Tesco') {
          isSellerPartner = true;
        }
      }

      return isSellerPartner;
    }) || false;
  };


  /**
   *
   * @param {Object} data
   * @return {string}
   */
  SellerModel.prototype.getName = function (data) {
    var sellerData = this.resolveDataArg(data);

    if (!fn.isObject(sellerData, { notEmpty: true })) return '';
    return sellerData.name || '';
  };


  SellerModel.prototype.getPrices = function (data) {
    var sellerData = this.resolveDataArg(data);

    if (!this.isObject(sellerData, true) || !this.isObject(sellerData.prices, true)) {
      return {};
    }

    return sellerData.prices;
  };


  SellerModel.prototype.getPrice = function (data) {
    var prices = this.getPrices(data);

    if (!this.isObject(prices, true)) {
      return '';
    }

    return prices.price || '';
  };


  /**
   *
   * @param {Object|string} data
   * @return {Array<string>}
   */
  SellerModel.prototype.getPromotions = function (data) {
    var sellerData = this.resolveDataArg(data);

    if (!fn.isObject(sellerData, { notEmpty: true }) || !fn.isArray(sellerData.promotions)) {
      return [];
    }

    return sellerData.promotions;
  };


  return SellerModel;
});
