define('modules/pdp/controllers/RelatedSKUController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/RelatedItemsController',
  'modules/pdp/views/RelatedSKUView'
], function (fn, RelatedItemsController, RelatedSKUView) {
  'use strict';

  /**
   * Controller for managing all interaction between the sku model and related sku-level views.
   * @param {Object} oModel The sku model.
   * @param {Object} oView A view object.
   * @return {void}
   */
  function RelatedSKUController(oModel, oView) {
    this.sNamespace = 'sku';
    this.sTag = 'links';
    this.views = {
      classes: {
        RelatedSKUView: RelatedSKUView
      }
    };
    this.parent.constructor.call(this, oModel, oView);
  }

  fn.inherit(RelatedSKUController, RelatedItemsController);

  return RelatedSKUController;
});
