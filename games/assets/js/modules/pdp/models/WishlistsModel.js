define('modules/pdp/models/WishlistsModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/Wishlists',
  'modules/pdp/models/BaseModel'
], function (fn, Wishlists, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function WishlistsModel(config) {
    this.DataStoreClass = Wishlists;
    this.sNamespace = 'wishlists';
    this.sProductPlaceholderText = '%PRODUCTPLACEHOLDER%';
    this.sSkuPlaceholderText = '%SKUPLACEHOLDER%';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(WishlistsModel, BaseModel);

  WishlistsModel.prototype._populateData = function (oResp) {
    if (oResp !== undefined) {
      this.add(oResp);
    }
  };

  WishlistsModel.prototype._updateHrefString = function (sDirtyString) {
    var sCleanString = '',
      _sDirtyString = '',
      aURLSplitParams = [],
      aURLIndividualParams = [],
      aUpdatedURLParams = [],
      i = 0,
      sProductIdString = 'productId=',
      sProductIdPlaceholder = sProductIdString + this.sProductPlaceholderText,
      sSkuIdString = 'skuId=',
      sSkuIdPlaceholder = sSkuIdString + this.sSkuPlaceholderText;

    _sDirtyString = sDirtyString;
    aURLSplitParams = _sDirtyString.split('?');
    aURLIndividualParams = aURLSplitParams[1].split(/[&;]/g);

    for (i = 0; i < aURLIndividualParams.length; i += 1) {
      if (aURLIndividualParams[i].indexOf(sSkuIdString) >= 0) {
        aURLIndividualParams[i] = sSkuIdPlaceholder;
      }

      if (aURLIndividualParams[i].indexOf(sProductIdString) >= 0) {
        aURLIndividualParams[i] = sProductIdPlaceholder;
      }
    }
    aUpdatedURLParams = aURLIndividualParams.join('&');
    aURLSplitParams[1] = aUpdatedURLParams;
    _sDirtyString = aURLSplitParams[0] + '?' + aURLSplitParams[1];
    sCleanString = _sDirtyString.replace(/<a href=|"|>|<\/a>/gi, '');

    return sCleanString;
  };

  WishlistsModel.prototype._sanitiseData = function (oResp) {
    var _this = this,
      oDirtyData = oResp,
      oCleanData = {},
      sCleanHref = '',
      i = 0;

    if (oResp === undefined) {
      return null;
    }
    for (i = 0; i < oDirtyData.length; i += 1) {
      if (oDirtyData[i].href !== undefined) {
        if (oDirtyData[i].href.length > 0) {
          sCleanHref = _this._updateHrefString(oDirtyData[i].href);
          oDirtyData[i].href = sCleanHref;
        }
      }
    }
    oCleanData = oDirtyData;
    return oCleanData;
  };

  WishlistsModel.prototype._dataHandler = function (sResp) {
    var _this = this,
      oResp = null;

    if (sResp !== undefined) {
      if (sResp.length > 0) {
        oResp = $.parseJSON(sResp);
        _this._populateData(_this._sanitiseData(oResp.WishlistV2.wishlists));
      }
    }
  };

  WishlistsModel.prototype._getWishlists = function (sProductId, sSkuId) {
    var aStoredWishlistsData = this._aDataStores,
      aWishlistsData = [];

    if (!aStoredWishlistsData || sSkuId === undefined || sProductId === undefined) {
      return null;
    }
    aWishlistsData = this._setProductIdAndSkuId(aStoredWishlistsData, sProductId, sSkuId);
    this._updatePlaceholderText(sProductId, sSkuId);

    return aWishlistsData;
  };

  WishlistsModel.prototype._setProductIdAndSkuId = function (
    aStoredWishlistsData, sProductId, sSkuId
  ) {
    var aWishlistsData = [],
      sTmpWishlist = '',
      sTmpHref = '',
      i = 0;

    for (i = 0; i < aStoredWishlistsData.length; i += 1) {
      sTmpWishlist = aStoredWishlistsData[i];
      sTmpHref = sTmpWishlist.href
        .replace(this.sProductPlaceholderText, sProductId)
        .replace(this.sSkuPlaceholderText, sSkuId);
      sTmpWishlist.href = sTmpHref;
      aWishlistsData.push(sTmpWishlist);
    }

    return aWishlistsData;
  };

  WishlistsModel.prototype._updatePlaceholderText = function (sProductId, sSkuId) {
    if (sProductId !== undefined && sSkuId !== undefined) {
      this.sProductPlaceholderText = sProductId;
      this.sSkuPlaceholderText = sSkuId;
    }
  };

  WishlistsModel.prototype._setMultipleWishlists = function () {
    var bMultipleWishlists = false,
      aWishlistsData = this._aDataStores;

    if (!aWishlistsData) {
      return null;
    }

    if (aWishlistsData.length > 1) {
      bMultipleWishlists = true;
    }
    return bMultipleWishlists;
  };

  WishlistsModel.prototype._getDefaultHref = function () {
    var sDefaultHref = null,
      iDefaultData = 0,
      aWishlistsData = this._aDataStores;

    if (!aWishlistsData) {
      return null;
    }
    iDefaultData = aWishlistsData.length - 1;
    sDefaultHref = aWishlistsData[iDefaultData].href.replace('action=new', 'action=choose');
    return sDefaultHref;
  };

  WishlistsModel.prototype._getDefaultName = function () {
    var sDefaultName = null,
      iDefaultData = 0,
      aWishlistsData = this._aDataStores;

    if (!aWishlistsData) {
      return null;
    }
    iDefaultData = aWishlistsData.length - 1;
    sDefaultName = aWishlistsData[iDefaultData].defaultName;
    return sDefaultName;
  };

  return WishlistsModel;
});
