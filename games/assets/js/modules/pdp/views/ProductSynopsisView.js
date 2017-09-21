define('modules/pdp/views/ProductSynopsisView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  var ProductSynopsisView = function (oConfig) {
    this.sViewName = 'ProductSynopsisView';
    this.sNamespace = 'sku';
    this.sTag = '_default';
    this.sViewClass = 'product-synopsis';
    this.sTemplate = $('#product-synopsis-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(ProductSynopsisView, BaseView);

  ProductSynopsisView._name = 'ProductSynopsisView';
  ProductSynopsisView.sNamespace = 'sku';

  ProductSynopsisView.prototype._setData = function (mViewData) {
    this.parent._setData.call(this, mViewData);
  };

  return ProductSynopsisView;
});
