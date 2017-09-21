define('modules/pdp/views/KioskProductReviewsView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  var KioskProductReviewsView = function (oConfig) {
    this.sViewName = 'KioskProductReviewsView';
    this.sNamespace = 'sku';
    this.sViewClass = 'product-page-reviews';
    this.sTemplate = $('#kiosk-product-page-reviews-template')[0].innerHTML;
    this.sStaleDOMReviewsSelector = '#BVRRContainer';
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(KioskProductReviewsView, BaseView);

  KioskProductReviewsView._name = 'KioskProductReviewsView';
  KioskProductReviewsView.sNamespace = 'sku';

  KioskProductReviewsView.prototype._setData = function () {
    this._removeExistingReviewsDOMHook();
  };

  KioskProductReviewsView.prototype._removeExistingReviewsDOMHook = function () {
    $(this.sStaleDOMReviewsSelector).remove();
  };

  return KioskProductReviewsView;
});
