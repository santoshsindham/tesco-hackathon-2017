define('modules/pdp/models/SkuModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/Sku',
  'modules/pdp/models/BaseModel'
], function (fn, Sku, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function SkuModel(config) {
    this.DataStoreClass = Sku;
    this.sNamespace = 'sku';
    this.sParentNamespace = 'products';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(SkuModel, BaseModel);

  SkuModel.prototype.sellerInformationCallback = function (oParams) {
    var target = '';

    this.update({
      sSearchKey: 'id',
      mSearchValue: oParams.skuID,
      sUpdateKey: 'sellers',
      mUpdateValue: oParams.sellers
    });

    this.setEvent({
      sName: 'dataFetched',
      mfetchedData: {
        sellers: oParams.sellers
      }
    }, false, true);

    if (oParams.targetSelector !== undefined) {
      target = oParams.targetSelector;
    } else if ($('.buybox-view').length) {
      target = '.buybox-view';
    } else {
      target = '.buybox-wrapper';
    }

    this.setEvent({
      sName: 'render',
      sKeyId: oParams.skuID,
      sNamespace: 'sku',
      sTag: 'buybox',
      sViewName: 'BuyboxView',
      elTarget: target,
      /**
       * View data needs to be passed as value of 'products' property in order for the View
       * to use its namespace to pick up the right data being passed into it. The data is
       * prefixed in the mvc property to allow backwards compatibility with the legacy way
       * of passing data between views.
       */
      mParamData: {
        mvc: {
          sku: this.get({
            sSearchKey: 'id',
            mSearchValue: oParams.skuID
          })
        }
      }
    }, false, true);
  };


  SkuModel.prototype.createEndpoint = function (args) {
    var values = args.values,
      aEndpoints = [],
      oEndpoint = null,
      sProductID = null,
      sSKUID = null,
      sURL = '',
      i = 0,
      sSchoolId = '',
      sSchoolName = '',
      sLogoRef = '';

    oEndpoint = this.oDataEndpointMap.getEndpoint(this.sNamespace);

    if (oEndpoint) {
      sURL = oEndpoint.action.fetch.href;

      if (args.modelMethod) {
        sURL = oEndpoint.action[args.modelMethod].href;

        if (args.modelMethod === 'buybox') {
          sProductID = values[0];
          sSKUID = values[1];

          if (window.oAppController.oPageController.ues.schoolId !== '') {
            sSchoolId = '&schoolId=' + window.oAppController.oPageController.ues.schoolId;
          }

          if (window.oAppController.oPageController.ues.schoolName !== '') {
            sSchoolName = '&schoolName=' + window.oAppController.oPageController.ues.schoolName;
          }

          if (window.oAppController.oPageController.ues.slogoRef !== '') {
            sLogoRef = '&slogoRef=' + window.oAppController.oPageController.ues.slogoRef;
          }

          sURL = sURL.replace(/(%SKUID%)/, sSKUID)
            .replace(/(%PRODUCTID%)/, sProductID)
            .replace(/(%SCHOOLID%)/, sSchoolId)
            .replace(/(%SCHOOLNAME%)/, sSchoolName)
            .replace(/(%SLOGOREF%)/, sLogoRef);
          aEndpoints.push(sURL);
        } else if (args.modelMethod === 'ndo' || args.modelMethod === 'price'
            || args.modelMethod === 'competitors') {
          sURL += values[0];

          if (typeof args.createEndpointCallback === 'function') {
            sURL = args.createEndpointCallback(sURL);
          }

          aEndpoints.push(sURL);
        }
      } else {
        for (i = 0; i < values.length; i += 1) {
          aEndpoints.push(sURL + values[i]);
        }
      }
    }

    return aEndpoints;
  };

  SkuModel.prototype.dataHandler = function (oResponse, oParams) {
    if (oParams.sModelMethod === 'buybox') {
      if (oResponse.length > 0) {
        this.update({
          sSearchKey: 'id',
          mSearchValue: oParams.mSearchValue[1],
          sUpdateKey: 'sellers',
          mUpdateValue: oResponse
        });
      }
      this.triggerDataFetched(oResponse);
    } else {
      this.parent.dataHandler.apply(this, arguments);
    }
  };


  /**
   * NOTE: Legacy method to be deprecated in favour of getPrimaryListing.
   *
   * @param {Object|String} data
   * @return {String}
   */
  SkuModel.prototype.getPrimarySeller = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData, { notEmpty: true })
        || !fn.isArray(skuData.sellers, { notEmpty: true })) {
      return null;
    }

    return skuData.sellers[0];
  };


  /**
   * NOTE: Legacy method to be deprecated in favour of getSecondaryListings.
   *
   * @param {Object|String} data
   * @return {Array<Object>}
   */
  SkuModel.prototype.getSecondarySellers = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData, { notEmpty: true })
        || !fn.isArray(skuData.sellers, { notEmpty: true })) {
      return [];
    }

    return skuData.sellers.slice(1);
  };


  /**
   *
   * @param {Object|String} data
   * @return {Object}
   */
  SkuModel.prototype.getBookDetails = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData, { notEmpty: true })
        || !fn.isObject(skuData.bookDetails, { notEmpty: true })) {
      return {};
    }

    return skuData.bookDetails;
  };


  /**
   *
   * @param {Object|String} data
   * @return {Object}
   */
  SkuModel.prototype.getMediaAssets = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData, { notEmpty: true })
        || !fn.isObject(skuData.mediaAssets, { notEmpty: true })) {
      return {};
    }

    return skuData.mediaAssets;
  };


  /**
   *
   * @param {Object|String} data
   * @return {Object}
   */
  SkuModel.prototype.getDefaultImage = function (data) {
    var mediaAssets = this.getMediaAssets(data);

    if (!fn.isObject(mediaAssets, { notEmpty: true })
        || !fn.isObject(mediaAssets.defaultImage, { notEmpty: true })) {
      return {};
    }

    return mediaAssets.defaultImage;
  };


  /**
   *
   * @param {Object|String} data
   * @param {String} key optional
   * @param {String} value optional
   * @return {Array<Object>}
   */
  SkuModel.prototype.getSkuMedia = function (data, key, value) {
    var mediaAssets = this.getMediaAssets(data),
      skuMedia = [],
      skuMediaAssets = [];

    if (!fn.isObject(mediaAssets, { notEmpty: true })) {
      return [];
    }

    if (!fn.isArray(mediaAssets.skuMedia)) {
      mediaAssets.skuMedia = [];
      return mediaAssets.skuMedia;
    }

    skuMedia = mediaAssets.skuMedia;

    if (typeof key !== 'string' || typeof value !== 'string') {
      return skuMedia;
    }

    fn.loopArray(skuMedia, function loopSkuMedia(i) {
      if (fn.isObject(skuMedia[i]) && skuMedia[i][key] === value) {
        skuMediaAssets.push(skuMedia[i]);
      }
    });

    return skuMediaAssets;
  };


  /**
   *
   * @param {Object|String} data
   * @param {Object} mediaAsset
   * @return {void}
   */
  SkuModel.prototype.setSkuMedia = function (data, mediaAsset) {
    var skuData = this.resolveDataArg(data),
      skuMedia = [];

    if (!fn.isObject(skuData, { notEmpty: true }) || !fn.isObject(mediaAsset, { notEmpty: true })) {
      return;
    }

    skuMedia = this.getSkuMedia(skuData);

    skuMedia.push(mediaAsset);
    this.setDataStores(skuData);
  };


  /**
   *
   * @param {Object|String} data
   * @param {String} key optional
   * @param {String} value optional
   * @return {Array<Object>}
   */
  SkuModel.prototype.unsetSkuMedia = function (data, key, value) {
    var skuData = this.resolveDataArg(data),
      skuMedia = this.getSkuMedia(skuData);

    if (!fn.isArray(skuMedia, { notEmpty: true })) {
      return;
    }

    if (!key && !value) {
      skuMedia.splice(0, skuMedia.length);
    } else {
      fn.loopArray(skuMedia, function loopSkuMedia(i) {
        if (skuMedia[i][key] === value) {
          skuMedia.splice(i, 1);
        }
      }, { backward: true });
    }

    this.setDataStores(skuData);
  };


  /**
   *
   * @param {Object|String} data
   * @param {String} key optional
   * @param {String} value optional
   * @return {Array<Object>}
   */
  SkuModel.prototype.getPings = function (data, key, value) {
    var mediaAssets = this.getMediaAssets(data),
      pings = [],
      pingAssets = [];

    if (!fn.isObject(mediaAssets, { notEmpty: true })) {
      return [];
    }

    if (!fn.isArray(mediaAssets.pings)) {
      mediaAssets.pings = [];
      return mediaAssets.pings;
    }

    pings = mediaAssets.pings;

    if (typeof key !== 'string' || typeof value !== 'string') {
      return pings;
    }

    fn.loopArray(pings, function loopSkuMedia(i) {
      if (fn.isObject(pings[i]) && pings[i][key] === value) {
        pingAssets.push(pings[i]);
      }
    });

    return pingAssets;
  };


  /**
   *
   * @param {Object|String} data
   * @param {Object} pingAsset
   * @return {void}
   */
  SkuModel.prototype.setPing = function (data, pingAsset) {
    var skuData = this.resolveDataArg(data),
      pings = [];

    if (!fn.isObject(skuData, { notEmpty: true }) || !fn.isObject(pingAsset, { notEmpty: true })) {
      return;
    }

    pings = this.getPings(skuData);

    pings.push(pingAsset);
    this.setDataStores(skuData);
  };


  /**
   *
   * @param {Object|String} data
   * @param {String} key optional
   * @param {String} value optional
   * @return {Array<Object>}
   */
  SkuModel.prototype.unsetPings = function (data, key, value) {
    var skuData = this.resolveDataArg(data),
      pings = this.getPings(skuData);

    if (!fn.isArray(pings, { notEmpty: true })) {
      return;
    }

    if (!key && !value) {
      pings.splice(0, pings.length);
    } else {
      fn.loopArray(pings, function loopSkuMedia(i) {
        if (pings[i][key] === value) {
          pings.splice(i, 1);
        }
      }, { backward: true });
    }

    this.setDataStores(skuData);
  };


  /**
   * @param {Object|String} data
   * @return {Array<Object>}
   */
  SkuModel.prototype.getAttributes = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData, { notEmpty: true })) {
      return {};
    }

    return skuData.attributes || {};
  };


  /**
   * @param {Object|String} data
   * @return {Array<Object>}
   */
  SkuModel.prototype.getColour = function (data) {
    var skuAttributes = this.getAttributes(data);

    if (!this.isObject(skuAttributes, true) || typeof skuAttributes.colour !== 'string') {
      return '';
    }

    return skuAttributes.colour || '';
  };


  /**
   *
   * @param {Object|String} data
   * @return {Object}
   */
  SkuModel.prototype.getPrices = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData, { notEmpty: true })
        || !fn.isObject(skuData.prices, { notEmpty: true })) {
      return {};
    }

    return skuData.prices;
  };


  /**
   *
   * @param {Object|String} data
   * @return {String}
   */
  SkuModel.prototype.getPrice = function (data) {
    var prices = this.getPrices(data);

    if (!fn.isObject(prices, { notEmpty: true })) {
      return '';
    }

    return prices.fromPrice || prices.price || '';
  };


  /**
   *
   * @param {Object|String} data
   * @return {String}
   */
  SkuModel.prototype.getPublicLink = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!this.isObject(skuData, true) || typeof skuData.publicLink !== 'string') {
      return '';
    }

    return skuData.publicLink || '';
  };


  /**
   *
   * @param {Object|String} data
   * @return {Object}
   */
  SkuModel.prototype.getParentProduct = function (data) {
    var links = this.getLinks({ value: 'parent', data: data });

    if (!fn.isArray(links, { notEmpty: true }) || !fn.isObject(links[0], { notEmpty: true })) {
      return {};
    }

    return links[0];
  };


  /**
   *
   * @param {Object|String} data
   * @return {String}
   */
  SkuModel.prototype.getParentProductId = function (data) {
    var parent = this.getParentProduct(data);

    return typeof parent.id === 'string' ? parent.id : '';
  };


  /**
   *
   * @param {Object|String} data
   * @return {Array<Object>}
   */
  SkuModel.prototype.getListings = function (data) {
    var links = this.getLinks({ value: 'listed', data: data });

    if (!fn.isArray(links, { notEmpty: true })) return [];
    return links;
  };


  /**
   *
   * @param {Object|String} data
   * @return {Object}
   */
  SkuModel.prototype.getPrimaryListing = function (data) {
    var listingLinks = this.getListings(data);

    if (!listingLinks.length) return {};
    return listingLinks[0] || {};
  };


  /**
   *
   * @param {Object|String} data
   * @return {Array<Object>}
   */
  SkuModel.prototype.getSecondaryListings = function (data) {
    var listingLinks = this.getListings(data);

    if (!listingLinks.length) return [];
    return listingLinks.slice(1);
  };


  /**
   *
   * @param {Object|String} data
   * @return {Array<Object>}
   */
  SkuModel.prototype.getCompetitors = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData) || !fn.isArray(skuData.competitors)) {
      return [];
    }

    return skuData.competitors;
  };


  /**
   *
   * @param {Object|string} data
   * @return {Array<Object>}
   */
  SkuModel.prototype.getCategories = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData) || !fn.isArray(skuData.ancestorCategories)) {
      return [];
    }

    return skuData.ancestorCategories;
  };


  /**
   *
   * @param {Object|string} data
   * @return {Object}
   */
  SkuModel.prototype.getParentCategory = function (data) {
    var categories = this.getCategories(data);

    if (!categories.length) {
      return {};
    }

    return categories[0];
  };


  /**
   *
   * @param {Object} data
   * @return {?boolean}
   */
  SkuModel.prototype.getRangedInStore = function (data) {
    var skuData = this.resolveDataArg(data);

    if (!fn.isObject(skuData) || typeof skuData.rangedInStore !== 'boolean') {
      return null;
    }

    return skuData.rangedInStore;
  };


  return SkuModel;
});
