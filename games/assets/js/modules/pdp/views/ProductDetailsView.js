define('modules/pdp/views/ProductDetailsView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/ProductSpecView',
  'modules/show-more/ShowMore'
], function ($, fn, BaseView, ProductSpecView, ShowMore) {
  'use strict';

  /**
   * Use for displaying product details.
   * @param {Object} oConfig The configuration for the view.
   * @return {void}
   */
  function ProductDetailsView(oConfig) {
    this.sViewName = 'ProductDetailsView';
    this.sNamespace = 'sku';
    this.sTag = '_default';
    this.sViewClass = 'product-description-block';
    this.sTemplate = oConfig.sTemplate
      ? $(oConfig.sTemplate)[0].innerHTML
      : $('#product-details-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(ProductDetailsView, BaseView);

  ProductDetailsView._name = 'ProductDetailsView';
  ProductDetailsView.sNamespace = 'sku';

  ProductDetailsView.prototype._addSubViews = function () {
    if (this.oData.mvc.products.dynamicAttributes.supplier === 'FF') {
      this.oData.aSubViews.push(
        this._compileSubView({
          _class: ProductSpecView,
          template: '#product-spec-enclosed-template',
          ctlr: true
        })
      );
    }
  };

  ProductDetailsView.prototype._initDependancies = function () {
    var _this = this;

    setTimeout(function () {
      var oShowMore = new ShowMore({
        selector: _this.oElms.elTarget,
        height: 400,
        label: 'specs'
      });

      oShowMore.fnInit();
    }, 100);
  };

  return ProductDetailsView;
});
