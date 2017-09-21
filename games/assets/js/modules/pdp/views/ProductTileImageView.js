define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    recommenders = require('modules/recommenders/common'),
    template = require('text!templates/views/productTileImageView.html');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ProductTileImageView(config) {
    this.sViewName = 'ProductTileImageView';
    this.sNamespace = 'inherit';
    this.sTag = 'productImage';
    this.sViewClass = 'product-tile-image';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ProductTileImageView, BaseView);
  ProductTileImageView._name = 'ProductTileImageView';
  ProductTileImageView.sNamespace = 'inherit';
  ProductTileImageView.sTag = 'productImage';

  ProductTileImageView.prototype._setProps = function (data) {
    var flags = data.flags,
      itemData = data.inherit;

    return {
      displayName: itemData.displayName,
      id: itemData.id,
      imageSrcDetail: this._populateImageTemplate(flags, itemData, 'detail'),
      imageSrcLarge: this._populateImageTemplate(flags, itemData, 'large'),
      link: flags.richRelevance && itemData.rrLink ? itemData.rrLink : itemData.publicLink
    };
  };

  ProductTileImageView.prototype._populateImageTemplate = function (flags, itemData, type) {
    var _this = this,
      PLACEHOLDER = '[preset]',
      CAROUSEL_PRESET = 'Carousel-306',
      DETAIL_PRESET = 'Detail',
      PORTRAIT_PRESET = 'Portrait-S',
      defaultImage = {},
      detailPreset = flags.isFF ? PORTRAIT_PRESET : DETAIL_PRESET,
      isFF = false,
      largePreset = '',
      preset = '',
      productData = this.oData.mvc.products;

    defaultImage = (function () {
      var mediaAssets = itemData.mediaAssets || {};

      if (_this.sNamespace === 'sku') return mediaAssets.defaultImage;
      return fn.getValue(mediaAssets.defaultSku, 'defaultImage');
    }());

    if (flags.hasOwnProperty('isFF')) {
      isFF = flags.isFF;
    } else if (this.sNamespace === 'products') {
      isFF = this.oModel.isFF(itemData);
    } else if (fn.isObject(productData)) {
      isFF = fn.getValue(productData, 'dynamicAttributes', 'supplier') === 'FF';
    }

    if (isFF) {
      largePreset = PORTRAIT_PRESET;
    } else if (defaultImage.renderSource === 'Scene 7') {
      largePreset = CAROUSEL_PRESET;
    } else {
      largePreset = DETAIL_PRESET;
    }

    if (type === 'detail') {
      preset = detailPreset;
    } else if (type === 'large') {
      preset = largePreset;
    }

    return defaultImage.src.replace(PLACEHOLDER, preset);
  };

  ProductTileImageView.prototype._initDependancies = function () {
    window.picturefill();
  };

  ProductTileImageView.prototype.refresh = function (params) {
    this.sNamespace = params.sNamespace;

    this.render({
      newEvent: true,
      sourceOutput: 'inner',
      sOutput: 'inner',
      elTarget: 'self',
      mParamData: params.mParamData
    });
  };

  ProductTileImageView.prototype._bindEvents = function () {
    $(this.oElms.elWrapper).on(
      'click', 'a',
      this._analyticsTracking.bind(this)
    );
  };

  ProductTileImageView.prototype._analyticsTracking = function () {
    var mvcData = this.oData.mvc,
      flags = mvcData.flags,
      info = mvcData.info,
      relationship = '',
      _s = fn.copyObject(window.s),
      placementData = {},
      formattedItemsArray = [],
      productPosition = null;

    relationship = flags.completeTheLook ? 'Complete the Look' : relationship;
    relationship = flags.outfitBuilder ? 'Outfit Block' : relationship;
    relationship = flags.shopTheRange ? 'Shop The Range' : relationship;
    relationship = flags.bundle ? 'Frequently Bought Together' : relationship;

    if (info.rrPlacement !== undefined) {
      formattedItemsArray = info.rrPlacement.formattedItemsArray;
      fn.loopArray(formattedItemsArray, function loopRRProductIDs(i) {
        if (formattedItemsArray[i].id.indexOf(mvcData.inherit.id) > -1) {
          productPosition = (i + 1);
        }
      });
      placementData.productPosition = productPosition;
      placementData.placement = info.rrPlacement;
      placementData.productId = mvcData.inherit.id;
      recommenders.triggerRichRelevanceClickEventAnalytics(null, placementData);
    }

    if (relationship) {
      _s.linkTrackEvents = 'event32,event45';
      _s.linkTrackVars = 'prop19,eVar45,prop42,eVar59,events,products';
      _s.products = ';' + mvcData.inherit.id + ';;';
      _s.prop19 = 'product click';
      _s.eVar45 = _s.prop19;
      _s.prop42 = 'pdp - ' + relationship + ' - product click';
      _s.eVar59 = _s.prop42;
      _s.events = 'event32,event45';
      _s.tl(true, 'o', relationship + ' - product click');
    }
  };

  module.exports = ProductTileImageView;
});
