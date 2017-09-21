define('modules/pdp/views/ProductPageTitleView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ProductPageTitleView(config) {
    this.sViewName = 'ProductPageTitleView';
    this.sNamespace = 'products';
    this.sViewClass = 'product-title-wrapper';
    this.sTemplate = $('#product-page-title-template')[0].innerHTML;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ProductPageTitleView, BaseView);

  ProductPageTitleView._name = 'ProductPageTitleView';
  ProductPageTitleView.sNamespace = 'products';

  ProductPageTitleView.prototype._setData = function (mViewData) {
    this.parent._setData.call(this, mViewData);

    this.oData.mvc.vm.sFFlogoClass = this.oModel.isFFBranded(mViewData.id)
        ? 'icon-FFlogo' : '';

    this.oData.mvc.vm.bOnlineExclusive = mViewData.dynamicAttributes
        && mViewData.dynamicAttributes.online_exclusive === 'Y';

    this.oData.mvc.vm.sGlobalStaticAssetsPath = window.globalStaticAssetsPath;

    this.oData.mvc.vm.title = mViewData.dynamicAttributes.supplier === 'FF'
        ? this.oData.mvc.products.displayName : this.oData.mvc.sku.displayName;
  };

  return ProductPageTitleView;
});
