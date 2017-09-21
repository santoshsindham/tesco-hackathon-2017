define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    SizeGuideView = require('modules/pdp/views/SizeGuideView'),
    AddToBasketView = require('modules/pdp/views/AddToBasketView'),
    PersonaliseView = require('modules/pdp/views/PersonaliseView'),
    RequestStockAlertView = require('modules/pdp/views/RequestStockAlertView'),
    template = require('text!templates/views/itemActionsView.html');

  /**
   * The view class that renders an item's actions such as add to basket button.
   * @param {Object} config The configuration for the view.
   * @return {void}
   */
  function ItemActionsView(config) {
    this.sViewName = 'ItemActionsView';
    this.sNamespace = 'inherit';
    this.sTag = 'itemActions';
    this.sViewClass = 'item-actions-view';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);

    this._conditionalEventData = {
      isBound: false,
      sellerId: ''
    };
  }

  fn.inherit(ItemActionsView, BaseView);
  ItemActionsView._name = 'ItemActionsView';
  ItemActionsView.sNamespace = 'inherit';
  ItemActionsView.sTag = 'itemActions';

  ItemActionsView.prototype._setData = function (params) {
    this.parent._setData.call(this, params);
    this._setRefreshPoint();
  };

  ItemActionsView.prototype._addSubViews = function () {
    var hasSkuData = this.sanityCheckData(this.oData.mvc.sku).objects,
      skuData = hasSkuData && this.oData.mvc.sku,
      personalisable = this.isObject(skuData.attributes, true)
          && skuData.attributes.personalisable === 'Y',
      hasPersonalisationData = this.isObject(skuData.personalisation, true),
      isPersonalised = hasPersonalisationData && skuData.personalisation.isPersonalised;

    if (this._toRenderSizeGuide()) {
      this.oData.aSubViews.push(
        this._compileSubView({ _class: SizeGuideView })
      );
    }

    if (this.oData.mvc.inherit.buyBoxMessage) {
      if (this.oData.mvc.inherit.buyBoxMessage === 'emwbis') {
        if (!this.oData.mvc.flags.isKiosk) {
          this.oData.aSubViews.push(
            this._compileSubView({ _class: RequestStockAlertView })
          );
        }
      } else if (this.oData.mvc.inherit.buyBoxMessage !== 'none') {
        if (!personalisable || (personalisable && hasPersonalisationData && isPersonalised)) {
          this.oData.aSubViews.push(
            this._compileSubView({ _class: AddToBasketView })
          );
        }

        if (personalisable && hasPersonalisationData) {
          this.oData.aSubViews.push(
            this._compileSubView({ _class: PersonaliseView })
          );
        }
      }
    } else {
      this.oData.mvc.flags.disabled = true;
      this.oData.mvc.sellers = {
        buyBoxMessage: 'buy',
        buyButtonLabel: 'Add to basket'
      };

      this.oData.aSubViews.push(
        this._compileSubView({
          _class: AddToBasketView, flags: { required: { data: false } }
        })
      );
    }
  };

  ItemActionsView.prototype._toRenderSizeGuide = function () {
    if (this.isObject(this.oData.mvc.products, true)) {
      if (this.isObject(this.oData.mvc.products.dynamicAttributes, true)
          && this.oData.mvc.products.dynamicAttributes.supplier === 'FF'
          && this.oData.mvc.products.dynamicAttributes.gender) {
        if (this.oData.mvc.products.dynamicAttributes.gender !== 'Unisex') {
          return true;
        }

        if (this.oData.mvc.products.dynamicAttributes.ageSuitability) {
          return true;
        }
      }
    }

    return false;
  };

  ItemActionsView.prototype.refresh = function (params) {
    this.sNamespace = params.sNamespace;
    this.oData.aSubViews = [];

    this.mergeObjects(this.oData.mvc, params.mParamData.mvc, { extend: true });

    this.render({
      sourceOutput: 'inner',
      sOutput: 'inner',
      elTarget: 'self'
    });
  };

  module.exports = ItemActionsView;
});
