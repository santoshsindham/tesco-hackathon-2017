define('modules/pdp/views/KioskProductDetailsView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/ProductSpecView',
  'modules/tesco.utils',
  'modules/pdp/views/ProductCLPView'
], function ($, fn, BaseView, ProductSpecView, tescoUtils, ProductCLPView) {
  'use strict';

  var KioskProductDetailsView = function (oConfig) {
    this.sViewName = 'ProductDetailsView';
    this.sNamespace = 'products';
    this.sTag = '_default';
    this.sViewClass = 'product-details';
    this.sTemplate = $('#kiosk-product-details-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(KioskProductDetailsView, BaseView);

  KioskProductDetailsView._name = 'ProductDetailsView';
  KioskProductDetailsView.sNamespace = 'products';

  KioskProductDetailsView.prototype._setData = function (args) {
    this.parent._setData.call(this, args);
    this.oData.mvc.vm.bFFBrandProduct = this.oModel.isFFBranded(this.oData.mvc.products.id);

    if (this.oData.mvc.products.dynamicAttributes
        && this.oData.mvc.products.dynamicAttributes.onlineExclusive === 'Y') {
      this.oData.mvc.vm.bOnlineExclusive = true;
    }
  };

  KioskProductDetailsView.prototype._addSubViews = function () {
    var productDetails = [];

    if (this.oModel.isFF(this.oData.mvc.products.id)) {
      productDetails.push(this._compileSubView({
        _class: ProductSpecView,
        template: '#product-spec-enclosed-template',
        ctlr: true
      }));
      productDetails.push(this._compileSubView({ _class: ProductCLPView, ctlr: true }));
      this.oData.views.productDetails = productDetails;
    }
  };

  KioskProductDetailsView.prototype._setStates = function (data) {
    var skuData = data.sku,
      productData = data.products,
      personalisable = false;

    if (this.isObject(skuData, true)
        && this.isObject(skuData.attributes, true)
        && skuData.attributes.personalisable === 'Y') {
      personalisable = true;
    }

    return {
      alreadyInBasket: personalisable && !!tescoUtils.getQueryStringParam('alreadyInBasket'),
      hasUES: this.isObject(productData.ues, true)
    };
  };

  return KioskProductDetailsView;
});
