define('modules/pdp/models/ProductModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/Product',
  'modules/pdp/models/BaseModel'
], function (fn, Product, BaseModel) {
  'use strict';


  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ProductModel(config) {
    this.DataStoreClass = Product;
    this.sNamespace = 'products';
    this.parent.constructor.call(this, config);
  }


  fn.inherit(ProductModel, BaseModel);


  ProductModel.prototype.getMediaAssets = function (data) {
    var productData = this.resolveDataArg(data);

    if (!fn.isObject(productData, { notEmpty: true })
        || !fn.isObject(productData.mediaAssets, { notEmpty: true })) {
      return {};
    }

    return productData.mediaAssets;
  };


  ProductModel.prototype.getDefaultImage = function (data) {
    var mediaAssets = this.getMediaAssets(data);

    if (!fn.isObject(mediaAssets, { notEmpty: true })
        || !fn.isObject(mediaAssets.defaultSku, { notEmpty: true })
        || !fn.isObject(mediaAssets.defaultSku.defaultImage, { notEmpty: true })) {
      return {};
    }

    return mediaAssets.defaultSku.defaultImage;
  };


  ProductModel.prototype.getPrices = function (data) {
    var productData = this.resolveDataArg(data);

    if (!this.isObject(productData, true) || !this.isObject(productData.prices, true)) {
      return {};
    }

    return productData.prices;
  };


  ProductModel.prototype.getPrice = function (data) {
    var prices = this.getPrices(data);

    if (!this.isObject(prices, true)) {
      return '';
    }

    return prices.fromPrice || prices.price || '';
  };


  ProductModel.prototype.getPublicLink = function (data) {
    var productData = this.resolveDataArg(data);

    if (!this.isObject(productData, true) || typeof productData.publicLink !== 'string') {
      return '';
    }

    return productData.publicLink || '';
  };


  ProductModel.prototype.getBrand = function (data) {
    var productData = this.resolveDataArg(data);

    if (!this.isObject(productData, true) || typeof productData.brand !== 'string') {
      return '';
    }

    return productData.brand || '';
  };


  ProductModel.prototype.getGender = function (data) {
    var productData = this.resolveDataArg(data);

    if (!this.isObject(productData, true) || !this.isObject(productData.dynamicAttributes, true)) {
      return '';
    }

    return productData.dynamicAttributes.gender || '';
  };


  ProductModel.prototype.isFF = function (data) {
    var productData = this.resolveDataArg(data);

    if (!this.isObject(productData, true) || !this.isObject(productData.dynamicAttributes, true)
        || productData.dynamicAttributes.supplier !== 'FF') {
      return false;
    }

    return true;
  };


  ProductModel.prototype.isFFBranded = function (data) {
    return this.getBrand(data).startsWith('F&F') || false;
  };


  /**
   *
   * @param {Object|String} data
   * @return {Object}
   */
  ProductModel.prototype.getDefaultSku = function (data) {
    var links = this.getLinks({ value: 'defaultSku', data: data });

    if (!fn.isArray(links, { notEmpty: true })) {
      return {};
    }

    return links[0];
  };


  /**
   *
   * @param {Object|string} data
   * @return {Array<Object>}
   */
  ProductModel.prototype.getCategories = function (data) {
    var productData = this.resolveDataArg(data);

    if (!fn.isObject(productData) || !fn.isArray(productData.ancestorCategories)) {
      return [];
    }

    return productData.ancestorCategories;
  };


  /**
   *
   * @param {Object|string} data
   * @return {Object}
   */
  ProductModel.prototype.getParentCategory = function (data) {
    var categories = this.getCategories(data);

    if (!categories.length) {
      return {};
    }

    return categories[0];
  };


  /**
   *
   * @param {Object|string} data
   * @return {Object}
   */
  ProductModel.prototype.isProductVariant = function (data) {
    var selfLink = this.getSelfLink(data);

    return fn.isObject(selfLink, { notEmpty: true }) && selfLink.hasOwnProperty('options');
  };


  /**
   *
   * @param {Object|string} data
   * @param {string} type
   * @return {Object}
   */
  ProductModel.prototype.getOptionsInfo = function (data, type) {
    var optionInfo = {},
      optionsInfo = [],
      productData = this.resolveDataArg(data);

    if (!fn.isObject(productData, { notEmpty: true })
        || !fn.isArray(productData.optionsInfo, { notEmpty: true })) {
      return !type ? [] : {};
    }

    optionsInfo = productData.optionsInfo;

    if (!type) {
      return optionsInfo;
    }

    fn.loopArray(optionsInfo, function loopOptionsInfo(i) {
      if (optionsInfo[i].type === type) {
        optionInfo = optionsInfo[i];
      }
    });

    return optionInfo;
  };


  /**
   *
   * @param {Array<Object>|Object} data
   * @return {Array<Object>}
   */
  ProductModel.prototype._checkDataStores = function (data) {
    var _data = undefined,
      missingData = [];

    if (!data) {
      return [];
    }

    _data = fn.isArray(data) ? data : [data];

    fn.loopArray(_data, function loopDataStores(i) {
      if (!fn.checkData(_data[i], 'links')) {
        if (fn.isObject(_data[i]) && typeof _data[i].id === 'string') {
          missingData.push(_data[i].id);
        }
      }
    });

    return missingData;
  };


  return ProductModel;
});
