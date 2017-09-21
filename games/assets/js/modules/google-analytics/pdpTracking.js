define(function (require, exports, module) {
  'use strict';

  var breakPoint = require('modules/breakpoint'),
    fn = require('modules/mvc/fn'),
    common = require('modules/common'),
    pdpTracking = {},
    pageController = {},
    skuModel = {},
    productModel = {},
    oOmnitureData = {},
    sAction = '';


  /**
   * Starts the PDP analytics tracking for the add to basket action or page load
   * @param {Object} itemData either the Sku in scope or the basket response
   * @param {String|Object} action to carry out addToBasket|pageLoad
   * @return {void}
   */
  pdpTracking.setAnalytics = function (itemData, action) {
    pageController = fn.getValue(window, 'oAppController', 'oPageController');

    if (!pageController && !fn.isObject(itemData)) {
      return null;
    }
    if (fn.isObject(action)) {
      sAction = action.isVariantChange ? 'variantChange' : 'pageLoad';
    } else {
      sAction = action;
    }

    skuModel = pageController.getModule('model', 'sku');
    productModel = pageController.getModule('model', 'products');

    if (sAction === 'addToBasket') {
      pdpTracking.setAddToBasketAnalytics(itemData);
    } else {
      pdpTracking.setPageLoadAnalytics(itemData);
    }
    return itemData;
  };


  /**
   * Tracking for page load gathering productid and skuid for collateProductData
   * @param {Object} skuData PDP primary product skuData from page load or variant change
   * @return {void}
   */
  pdpTracking.setPageLoadAnalytics = function (skuData) {
    var pageLoadDimensions = {},
      productTrackingData = {},
      productData = {};

    if (productModel === undefined) {
      return false;
    }

    productData = productModel.getDataStores({ value: skuModel.getParentProductId(skuData) });

    if (window.s) {
      oOmnitureData = window.s;
      pageLoadDimensions = {
        dimension1: fn.getValue(oOmnitureData, 'eVar24'),
        dimension2: oOmnitureData.prop7 === String(!(oOmnitureData.prop7 === 'repeat customer')),
        dimension3: this.getViewport(),
        dimension4: 'GMO'
      };
    }
    productTrackingData = this.collateProductData(skuData, productData);
    this.submitAnalytics(productTrackingData, pageLoadDimensions);

    return { skuData: skuData, productData: productData, pageLoadDimensions: pageLoadDimensions };
  };


  /**
   * Tracking for page load gathering productid and skuid for collateProductData
   * @param {Object} items basket add response array of items
   * @return {void}
   */
  pdpTracking.setAddToBasketAnalytics = function (items) {
    var productTrackingData = {},
      skuData = {},
      productData = {},
      aTrackingData = [];

    fn.loopArray.call(this, items, function loopItemData(i) {
      skuData = skuModel.getDataStores({ value: items[i].skuId });
      productData = productModel.getDataStores({ value: items[i].productId });
      productTrackingData = this.collateProductData(skuData, productData, items[i]);
      this.submitAnalytics(productTrackingData);
      aTrackingData.push({ skuData: skuData, productData: productData, basketData: items[i] });
    });

    return aTrackingData;
  };


  /**
   * @return {string} BIGWEB|MWEB
   */
  pdpTracking.getViewport = function () {
    return (breakPoint.mobile || breakPoint.vTablet || breakPoint.hTablet) ? 'MWEB' : 'BIGWEB';
  };


  /**
   * collates the data from the sku and product models in a format for GA enhanced product data
   * @param {Object} skuData
   * @param {Object} productData
   * @param {Object} basketResponse {Optional}
   * @return {object} Tracking data collated for GA product
   */
  pdpTracking.collateProductData = function (skuData, productData, basketResponse) {
    var collateTrackingData = {},
      $breadcrumb = $('#breadcrumbCategoryOnly'),
      breadcrumbCategoryOnly = $breadcrumb.length ? $breadcrumb.val().replace(/\s*>\s*/g, '/') : null;

    if (fn.getValue(pageController, 'ues', 'schoolId')) {
      breadcrumbCategoryOnly = 'Embroidered Uniforms/' + breadcrumbCategoryOnly;
    }

    collateTrackingData = {
      id: skuData.id,
      name: skuData.displayName,
      price: skuModel.getPrice(skuData),
      brand: productModel.getBrand(productData),
      dimension9: productModel.getGender(productData),
      dimension24: String(productModel.isFF(productData)),
      variant: skuModel.getColour(skuData),
      category: breadcrumbCategoryOnly
    };

    if (basketResponse) {
      collateTrackingData.quantity = basketResponse.quantity;
      collateTrackingData.dimension17 = basketResponse.listingId;
    }

    return collateTrackingData;
  };

  /**
   * collates the data from the sku and product models in a format for GA
   * @param {Object} productTrackingData the collated data from the sku and product models
   * @param {Object} pageLoadDimensions {Optional} dimensions that are only used for page views
   * @return {void}
   */
  pdpTracking.submitAnalytics = function (productTrackingData, pageLoadDimensions) {
    if (window.ga) {
      window.ga('require', 'ec');
      window.ga('ec:addProduct', productTrackingData);
      if (sAction === 'addToBasket') {
        window.ga('ec:setAction', 'add');
        window.ga('send', 'event', 'basket action', 'add', productTrackingData.id);
      } else if (sAction === 'pageLoad' || sAction === 'variantChange') {
        window.ga('ec:setAction', 'detail');
        window.ga('send', 'pageview', pageLoadDimensions);
      } else if (sAction === 'matchingItemsLoad') {
        window.ga('ec:setAction', 'detail');
        window.ga('send', 'event', 'PDP', 'matching item clicks', productTrackingData.id);
      }
    } else {
      common.init.push(function () {
        pdpTracking.submitAnalytics(productTrackingData, pageLoadDimensions);
      });
    }
  };

  module.exports = pdpTracking;
});
