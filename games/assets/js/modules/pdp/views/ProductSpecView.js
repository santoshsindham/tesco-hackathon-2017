define('modules/pdp/views/ProductSpecView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/jargon-buster/common',
  'modules/show-more/ShowMore'
], function ($, fn, BaseView, jargonBuster, ShowMore) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @param {String} config.sTemplate
   * @return {void}
   */
  function ProductSpecView(config) {
    this.sViewName = 'ProductSpecView';
    this.sNamespace = 'sku';
    this.sViewClass = 'product-spec-block';
    this.sTemplate = config.sTemplate
        ? $(config.sTemplate)[0].innerHTML
        : $('#product-spec-template')[0].innerHTML;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ProductSpecView, BaseView);

  ProductSpecView._name = 'ProductSpecView';
  ProductSpecView.sNamespace = 'sku';

  ProductSpecView.prototype._initDependancies = function () {
    var oShowMore = null,
      _this = this;

    if (this.oData.mvc.custom !== undefined) {
      if (this.oData.mvc.flags.inPanel) {
        return;
      }
    }

    jargonBuster.init();

    if (this.oData.mvc.products.dynamicAttributes.supplier !== 'FF') {
      setTimeout(function () {
        oShowMore = new ShowMore({
          selector: _this.oElms.elTarget,
          height: 600,
          label: 'specs'
        });
        oShowMore.fnInit();
      }, 100);
    }
  };

  return ProductSpecView;
});
