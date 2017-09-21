define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    template = require('text!templates/views/storeStockCheckView.html');


  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function StoreStockCheckView(config) {
    this.sNamespace = 'stores';
    this.sTag = 'storeStockCheck';
    this.sViewName = 'StoreStockCheckView';
    this.sViewClass = 'store-stock-check-view';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }


  fn.inherit(StoreStockCheckView, BaseView);
  StoreStockCheckView._name = 'StoreStockCheckView';
  StoreStockCheckView.sNamespace = 'stores';
  StoreStockCheckView.sTag = 'storeStockCheck';


  StoreStockCheckView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);

    $wrapper = $(this.oElms.elWrapper);

    this.oElms.elForm = $wrapper.find('form.stock-check-form')[0];
    this.oElms.elCheckBtn = $wrapper.find('input.button')[0];
    this.oElms.elPostcodeInput = $wrapper.find('input.postcode')[0];
    this.oElms.elChangeStore = $wrapper.find('a.change-store-link')[0];
    this.oElms.elCurrentLocationLink = $wrapper.find('a.current-location-link')[0];
  };


  StoreStockCheckView.prototype._setProps = function (data) {
    var stores = data.stores,
      hasStores = null,
      hasSessionData = null;

    if (!fn.isObject(stores)) {
      return {};
    }

    hasStores = fn.isObject(stores.nearestStore, { notEmpty: true });
    hasSessionData = fn.isObject(stores.sessionStoreData);

    if (!hasStores && hasSessionData) {
      stores.sessionStoreData.stockStatus = 'Out of stock';
    }

    return {
      nearestStore: hasStores ? stores.nearestStore : stores.sessionStoreData,
      stockStatusClass: hasStores ? stores.nearestStore.stockStatus.toLowerCase().split(' ').join('-') : 'out-of-stock',
      listingID: data.sellers.id
    };
  };


  StoreStockCheckView.prototype._setStates = function (data) {
    var stores = data.stores,
      isInStockOnly = typeof this.oData.state.isInStockOnly === 'boolean'
          ? this.oData.state.isInStockOnly : true,
      isNearestStoreAvailable = fn.isObject(stores)
          && fn.isObject(stores.nearestStore, { notEmpty: true }),
      isSessionStoreAvailable = fn.isObject(stores) && fn.isObject(stores.sessionStoreData);

    return {
      isInStockOnly: isInStockOnly,
      isNearestStoreAvailable: isNearestStoreAvailable,
      isSessionStoreAvailable: isSessionStoreAvailable,
      hasStockStatus: isNearestStoreAvailable || isSessionStoreAvailable,
      isGeolocationAvailable: fn.isGeolocationAvailable() && !data.flags.isKiosk
    };
  };


  StoreStockCheckView.prototype.refresh = function (storesData) {
    var mvcData = this.oData.mvc;

    mvcData.stores = storesData;

    this.render({
      sourceOutput: 'inner',
      sOutput: 'inner',
      elTarget: 'self',
      mParamData: { mvc: mvcData }
    });
  };


  module.exports = StoreStockCheckView;
});
