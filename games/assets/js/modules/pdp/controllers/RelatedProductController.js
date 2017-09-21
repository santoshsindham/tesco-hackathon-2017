define('modules/pdp/controllers/RelatedProductController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/RelatedItemsController',
  'modules/pdp/views/RelatedProductView'
], function (fn, RelatedItemsController, RelatedProductView) {
  'use strict';

  /**
   * Controller for managing all interaction between the product model and related
   * product-level views.
   * @param {Object} oModel The product model.
   * @param {Object} oView A view object.
   * @return {void}
   */
  function RelatedProductController(oModel, oView) {
    this.sNamespace = 'products';
    this.sTag = 'links';
    this.views = {
      classes: {
        RelatedProductView: RelatedProductView
      }
    };
    this.parent.constructor.call(this, oModel, oView);
  }

  fn.inherit(RelatedProductController, RelatedItemsController);

  return RelatedProductController;
});
