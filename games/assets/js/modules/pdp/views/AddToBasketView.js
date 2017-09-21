define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    template = require('text!templates/views/addToBasketView.html');

  /**
   * Add to basket view constructor sets view's core data and calls parent constructor.
   * @param {Object} oConfig The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function AddToBasketView(oConfig) {
    this.sViewName = 'AddToBasketView';
    this.sNamespace = 'formHandler';
    this.sTag = 'addToBasket';
    this.sViewClass = 'add-to-basket-view';
    this.sTemplate = template;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(AddToBasketView, BaseView);
  AddToBasketView._name = 'AddToBasketView';
  AddToBasketView.sNamespace = 'formHandler';
  AddToBasketView.sTag = 'addToBasket';

  AddToBasketView.prototype._setProps = function (data) {
    var hasSellerData = false,
      hasFormhanlderData = false;

    if (this.isObject(data.sellers, true)) {
      hasSellerData = true;
    }

    if (this.isObject(data.formHandler, true)) {
      hasFormhanlderData = true;
    }


    return {
      state: hasSellerData && (data.sellers.buyBoxMessage || ''),
      maxQuantity: hasSellerData && (data.sellers.maxQuantity || ''),
      formHandlerId: hasFormhanlderData && (data.formHandler.id || ''),
      label: hasSellerData && (data.sellers.buyButtonLabel || '')
    };
  };

  AddToBasketView.prototype._setStates = function (data) {
    var hasFlags = false,
      isDigitalMedia = false;

    if (this.isObject(data.flags, true)) {
      hasFlags = true;
    }

    if (this.isObject(data.sku, true)) {
      if (data.sku.isDigitalSku && data.flags.isKiosk) {
        isDigitalMedia = true;
      }
    }

    return {
      disabled: hasFlags && (!!data.flags.disabled || !!data.flags.disableAddToBasket
        || isDigitalMedia),
      hideQuantity: hasFlags && !!data.flags.hideQuantity
    };
  };

  AddToBasketView.prototype.enable = function () {
    this.oData.mvc.flags.disabled = false;
    this.oElms.elSubmitBtn.disabled = false;
    this.oElms.elQtyInput.disabled = false;
  };

  AddToBasketView.prototype.disable = function () {
    this.oData.mvc.flags.disabled = true;
    this.oElms.elSubmitBtn.disabled = true;
    this.oElms.elQtyInput.disabled = true;
  };

  AddToBasketView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.elSubmitBtn = $wrapper.find('button')[0];

    if (!this.oData.mvc.flags.hideQuantity) {
      this.oElms.elQtyInput = $wrapper.find('input.product-quantity')[0];
    }
  };

  AddToBasketView.prototype.refresh = function (args) {
    var $node = $(this.parseHtml(
        { html: this.render({ mParamData: { mvc: args.data } }), trim: true }
      ));

    fn.refreshElement(this.oElms.elSubmitBtn, $node.find('button')[0]);

    if (this.oElms.elQtyInput) {
      fn.refreshElement(this.oElms.elQtyInput, $node.find('input.product-quantity')[0]);
    }
  };

  module.exports = AddToBasketView;
});
