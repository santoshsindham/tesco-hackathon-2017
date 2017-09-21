define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    template = require('text!templates/views/productPriceView.html');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ProductPriceView(config) {
    this.sNamespace = 'inherit';
    this.sTag = 'prices';
    this.sViewName = 'ProductPriceView';
    this.sViewClass = 'product-price-view';
    this.sTemplate = template;
    this.views = { classes: {} };
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ProductPriceView, BaseView);
  ProductPriceView._name = 'ProductPriceView';
  ProductPriceView.sNamespace = 'inherit';
  ProductPriceView.sTag = 'prices';

  ProductPriceView.prototype._compileData = function () {
    if (this.sNamespace !== 'sellers') {
      this.oData.mvc.inherit.prices = this.oModel.getPrices(this.oData.mvc.inherit.id);
    }

    this.parent._compileData.call(this, this.oData.mvc);
  };

  ProductPriceView.prototype._setProps = function (data) {
    return {
      fromPrice: data.inherit.prices.fromPrice,
      toPrice: data.inherit.prices.toPrice,
      price: data.inherit.prices.price,
      rrpPrice: data.inherit.prices.rrp,
      wasPrice: data.inherit.prices.was,
      wasWasPrice: data.inherit.prices.wasWas,
      savings: data.inherit.prices.savings,
      clubcardPoints: data.inherit.prices.clubcardPoints
    };
  };

  ProductPriceView.prototype._setStates = function (data) {
    var hasSeller = this.isObject(data.sellers, true);

    return {
      hasFromPrice: !!data.inherit.prices.fromPrice,
      hasToPrice: !!data.inherit.prices.toPrice,
      hasPrice: !!data.inherit.prices.price,
      hasRrpPrice: !!data.inherit.prices.rrp,
      hasWasPrice: !!data.inherit.prices.was,
      hasWasWasPrice: !!data.inherit.prices.wasWas,
      hasSavings: !!data.inherit.prices.savings,
      hasClubcardPoints: !!data.inherit.prices.clubcardPoints,
      isBoost: hasSeller && !!data.sellers.isBCVE,
      showSavings: undefined,
      showPoints: undefined
    };
  };

  ProductPriceView.prototype.refresh = function (args) {
    this.sNamespace = args.sNamespace;

    this.render({
      sourceOutput: 'inner',
      sOutput: 'inner',
      elTarget: 'self',
      mParamData: args.mParamData
    });
  };

  module.exports = ProductPriceView;
});
