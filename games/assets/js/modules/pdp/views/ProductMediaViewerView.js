define('modules/pdp/views/ProductMediaViewerView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/ProductMediaViewerStaticImageView',
  'modules/pdp/views/ProductPingView'
], function (
  $,
  fn,
  BaseView,
  ProductMediaViewerStaticImageView,
  ProductPingView
) {
  var ProductMediaViewerView = function (oConfig) {
    this.sViewName = 'ProductMediaViewerView';
    this.sNamespace = 'sku';
    this.sTag = '_default';
    this.sViewClass = 'product-media-viewer';
    this.sTemplate = $('#product-media-viewer-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(ProductMediaViewerView, BaseView);

  ProductMediaViewerView.sNamespace = 'sku';

  ProductMediaViewerView.prototype._setData = function (mViewData) {
    this.parent._setData.call(this, mViewData);

    this.oData.oProductMediaViewerStaticImageView = this._compileSubView({
      _class: ProductMediaViewerStaticImageView
    });

    this.oData.oProductPingView = this._compileSubView({
      _class: ProductPingView
    });
  };

  return ProductMediaViewerView;
});
