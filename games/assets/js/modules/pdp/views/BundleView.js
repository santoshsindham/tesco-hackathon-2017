define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    ProductTileView = require('modules/pdp/views/ProductTileView'),
    ProductPriceView = require('modules/pdp/views/ProductPriceView'),
    AddToBasketView = require('modules/pdp/views/AddToBasketView'),
    template = require('text!templates/views/bundleView.html');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function BundleView(config) {
    this.sViewName = 'BundleView';
    this.sNamespace = 'inherit';
    this.sTag = 'bundle';
    this.sViewClass = 'bundle-view';
    this.sTemplate = template;

    this.views = {
      classes: {
        ProductTileView: ProductTileView,
        ProductPriceView: ProductPriceView,
        AddToBasketView: AddToBasketView
      }
    };
    this.parent.constructor.call(this, config);
  }

  fn.inherit(BundleView, BaseView);
  BundleView._name = 'BundleView';
  BundleView.sNamespace = 'inherit';
  BundleView.sTag = 'bundle';

  BundleView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.$labels = $wrapper.find('div.bundle-secondary label');
    this.oElms.$price = $wrapper.find('div.bundle-price span.product-price');
  };

  BundleView.prototype._setProps = function (data) {
    var primary = {},
      recommendations = {},
      type = '',
      viewModel = data.viewModel;

    if (!this.isObject(viewModel, true)) {
      return {};
    }

    type = viewModel.type;

    primary = data.viewModel.primary;
    primary.view = this._compileSubView({
      _class: this.views.classes.ProductTileView,
      mvcData: fn.mergeObjects(data, primary),
      namespace: type
    });

    recommendations = data.viewModel.recommendations;
    this.forLoop(recommendations, function loopSecondarySkus(i) {
      recommendations[i].view = this._compileSubView({
        _class: this.views.classes.ProductTileView,
        mvcData: fn.mergeObjects(data, recommendations[i]),
        namespace: type
      });
    });

    return {
      primary: primary,
      recommendations: recommendations,
      price: viewModel.price
    };
  };

  BundleView.prototype._addSubViews = function () {
    var addToBasket = this.oData.views.addToBasket,
      data = this.oData.mvc;

    if (this.isObject(addToBasket, true)) {
      return;
    }

    addToBasket = this._compileSubView({
      _class: this.views.classes.AddToBasketView,
      flags: { disabled: data.flags.disableAddToBasket }
    });

    this.oData.views.addToBasket = addToBasket;
  };

  BundleView.prototype.refresh = function (args) {
    var $node = $(this.parseHtml(
        { html: this.render({ mParamData: { mvc: args.data } }), trim: true }
      )),
      $labels = $node.find('div.bundle-secondary label'),
      addToBasket = this.oData.views.addToBasket;

    if (typeof args.activeID === 'string') {
      this.oElms.$labels.filter(
        'label[for="' + args.activeID + '"]'
      )[0].innerHTML = $labels.filter('label[for="' + args.activeID + '"]')[0].innerHTML;
    } else {
      this.forLoop(this.oElms.$labels, function loopCachedLabels(i) {
        this.forLoop($labels, function loopNewLabels(j) {
          if (this.oElms.$labels[i].getAttribute('for') === $labels[j].getAttribute('for')) {
            fn.refreshElement(this.oElms.$labels[i], $labels[j]);
          }
        });
      });
    }

    fn.refreshElement(
      this.oElms.$price[0],
      $node.find('div.bundle-price span.product-price')[0]
    );
    addToBasket.refresh({ data: args.data });
  };

  module.exports = BundleView;
});
