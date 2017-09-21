define('modules/pdp/views/ProductMediaViewerStaticImageView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  var ProductMediaViewerStaticImageView = function (oConfig) {
    this.sViewName = 'ProductMediaViewerStaticImageView';
    this.sNamespace = 'sku';
    this.sTag = '_default';
    this.sViewClass = 'product-media-viewer-static-image';
    this.sTemplate = $('#product-media-viewer-static-image-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(ProductMediaViewerStaticImageView, BaseView);
  ProductMediaViewerStaticImageView._name = 'ProductMediaViewerStaticImageView';
  ProductMediaViewerStaticImageView.sNamespace = 'sku';

  ProductMediaViewerStaticImageView.prototype._setData = function (mViewData) {
    this.parent._setData.call(this, mViewData);
    this.oData.mvc.sku.mediaAssets.defaultImage.src = this._sanitiseDataForView();
  };

  ProductMediaViewerStaticImageView.prototype._sanitiseDataForView = function () {
    var PRESET_PLACEHOLDER = '[preset]',
      sUpdatedPreset = 'Portrait-XL',
      oDefaultImage = this.oData.mvc.sku.mediaAssets.defaultImage;

    if (this.oData.mvc.flags.isKiosk) {
      if (this._checkForMissingImage(oDefaultImage.src) || this.oData.mvc.sku.bookDetails) {
        sUpdatedPreset = 'Detail';
      } else {
        PRESET_PLACEHOLDER = this._setKioskStaticImagePreset(oDefaultImage.src);
        sUpdatedPreset = '';
      }
    }

    return oDefaultImage.src.replace(PRESET_PLACEHOLDER, sUpdatedPreset);
  };

  ProductMediaViewerStaticImageView.prototype._checkForMissingImage = function (sImageURL) {
    return !!sImageURL.match('Default_image_unavailable');
  };

  ProductMediaViewerStaticImageView.prototype._setKioskStaticImagePreset = function (sImageURL) {
    var PRESET_PLACEHOLDER_WITH_UNDERSCORE = '_[preset]',
      PRESET_PLACEHOLDER = '[preset]',
      sStaticImagePreset = 'Detail';

    if (sImageURL.match(PRESET_PLACEHOLDER)) {
      sStaticImagePreset = PRESET_PLACEHOLDER;
    } else
    if (sImageURL.src.match(PRESET_PLACEHOLDER_WITH_UNDERSCORE)) {
      sStaticImagePreset = PRESET_PLACEHOLDER_WITH_UNDERSCORE;
    }

    return sStaticImagePreset;
  };

  return ProductMediaViewerStaticImageView;
});
