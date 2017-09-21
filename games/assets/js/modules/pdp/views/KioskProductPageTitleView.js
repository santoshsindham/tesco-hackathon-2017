define('modules/pdp/views/KioskProductPageTitleView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  var KioskProductPageTitleView = function (oConfig) {
    this.sViewName = 'KioskProductPageTitleView';
    this.sNamespace = 'products';
    this.sViewClass = 'product-page-title';
    this.sTemplate = $('#kiosk-product-page-title-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(KioskProductPageTitleView, BaseView);

  KioskProductPageTitleView._name = 'KioskProductPageTitleView';
  KioskProductPageTitleView.sNamespace = 'products';

  KioskProductPageTitleView.prototype._setData = function (mViewData) {
    this.parent._setData.call(this, mViewData);

    this.oData.mvc.vm.sFFlogoClass = this.oModel.isFFBranded(mViewData.id)
        ? 'icon-FFlogo' : '';
    this.oData.mvc.vm.bOnlineExclusive = mViewData.dynamicAttributes
        && mViewData.dynamicAttributes.online_exclusive === 'Y';
    this.oData.mvc.vm.sGlobalStaticAssetsPath = window.globalStaticAssetsPath;

    this.oData.mvc.vm.title = this.oModel.isFF(mViewData.id)
        ? this.oData.mvc.products.displayName : this.oData.mvc.sku.displayName;
  };

  KioskProductPageTitleView.prototype._cacheDomElms = function () {
    this.parent._cacheDomElms.call(this);
    this.oElms.elRatingMask = $('.' + this.sViewClass + ' .rating-mask') || null;
  };

  KioskProductPageTitleView.prototype._bindEvents = function () {
    if (this.oElms.elRatingMask) {
      $(this.oElms.elRatingMask).on(
        'click',
        this._onRatingMaskClick.bind(this)
      );
    }
  };

  KioskProductPageTitleView.prototype._onRatingMaskClick = function () {
    var eTriggerKioskTab = $.Event('triggerKioskTab', { sViewName: 'KioskProductReviewsView' });

    $(window).trigger(eTriggerKioskTab);
  };

  return KioskProductPageTitleView;
});
