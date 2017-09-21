define('modules/pdp/views/ProductCLPView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function (
  $,
  fn,
  BaseView
) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ProductCLPView(config) {
    this.sViewName = 'ProductCLPView';
    this.sNamespace = 'products';
    this.sTag = 'productCLP';
    this.sViewClass = 'product-clp-view';
    this.sTemplate = $('#product-clp-view-template')[0].innerHTML;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ProductCLPView, BaseView);
  ProductCLPView._name = 'ProductCLPView';
  ProductCLPView.sNamespace = 'products';
  ProductCLPView.sTag = 'productCLP';

  ProductCLPView.prototype._setProps = function (mvcData) {
    var productData = mvcData.products;

    if (!this.isObject(productData, true)) {
      return null;
    }

    return {
      pictographs: this.isArray(productData.classifactionLabelingPackaging, true)
          ? productData.classifactionLabelingPackaging : [],
      statement: this.isObject(productData.dynamicAttributes, true)
          ? productData.dynamicAttributes.clpStatement : null,
      classes: !this.oData.mvc.flags.isKiosk ? 'block-wrapper with-indents' : ''
    };
  };

  ProductCLPView.prototype._setStates = function (mvcData) {
    var productData = mvcData.products;

    if (!this.isObject(productData, true)) {
      return null;
    }

    return {
      hasProductWarnings: (this.isArray(productData.classifactionLabelingPackaging, true))
          || (this.isObject(productData.dynamicAttributes, true)
          && !!productData.dynamicAttributes.clpStatement)
    };
  };

  return ProductCLPView;
});
