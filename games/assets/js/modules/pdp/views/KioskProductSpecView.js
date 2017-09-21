define('modules/pdp/views/KioskProductSpecView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/ProductSpecView',
  'modules/pdp/views/ProductCLPView'
], function (
  $,
  fn,
  BaseView,
  ProductSpecView,
  ProductCLPView
) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function KioskProductSpecView(config) {
    this.sViewName = 'KioskProductSpecView';
    this.sNamespace = 'sku';
    this.sTag = 'kioskProductSpec';
    this.sViewClass = 'kiosk-product-spec-view';
    this.sTemplate = $('#kiosk-product-spec-view-template')[0].innerHTML;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(KioskProductSpecView, BaseView);
  KioskProductSpecView._name = 'KioskProductSpecView';
  KioskProductSpecView.sNamespace = 'sku';
  KioskProductSpecView.sTag = 'kioskProductSpec';

  KioskProductSpecView.prototype._addSubViews = function () {
    var productSpec = [];

    productSpec.push(this._compileSubView({ _class: ProductSpecView, ctlr: true }));
    productSpec.push(this._compileSubView({ _class: ProductCLPView, ctlr: true }));
    this.oData.views.productSpec = productSpec;
  };

  return KioskProductSpecView;
});
