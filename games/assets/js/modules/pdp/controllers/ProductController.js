define('modules/pdp/controllers/ProductController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/VariantsView',
  'modules/pdp/views/RelatedProductView',
  'modules/pdp/views/ProductCLPView'
], function (fn, BaseController, VariantsView, RelatedProductView, ProductCLPView) {
  'use strict';

  /**
   * Controller for managing all interaction between the product model and product-level views.
   * @param {Object} oModel The product model.
   * @param {Object} oView A view object.
   * @return {void}
   */
  function ProductController(oModel, oView) {
    this.sNamespace = 'products';
    this.sTag = '_default';
    this.views = {
      classes: {
        VariantsView: VariantsView,
        RelatedProductView: RelatedProductView,
        ProductCLPView: ProductCLPView
      }
    };
    this.parent.constructor.call(this, oModel, oView);
  }

  fn.inherit(ProductController, BaseController);

  return ProductController;
});
