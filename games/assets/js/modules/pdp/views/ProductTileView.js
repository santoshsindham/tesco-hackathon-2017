define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    ProductTileTitleView = require('modules/pdp/views/ProductTileTitleView'),
    ProductTileImageView = require('modules/pdp/views/ProductTileImageView'),
    ProductPriceView = require('modules/pdp/views/ProductPriceView'),
    VariantsView = require('modules/pdp/views/VariantsView'),
    ItemActionsView = require('modules/pdp/views/ItemActionsView'),
    ProductTileRatingsView = require('modules/pdp/views/ProductTileRatingsView'),
    template = require('text!templates/views/productTileView.html');

  /**
   * The view class that renders the outfit item product tile.
   * @param {Object} config The configuration for the view.
   * @return {void}
   */
  function ProductTileView(config) {
    this.sViewName = 'ProductTileView';
    this.sNamespace = 'inherit';
    this.sTag = 'recommender';
    this.sViewClass = 'outfit-product-tile';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ProductTileView, BaseView);

  ProductTileView._name = 'ProductTileView';
  ProductTileView.sNamespace = 'inherit';
  ProductTileView.sTag = 'recommender';

  ProductTileView.prototype._setData = function (args) {
    this.parent._setData.call(this, args);
    this._setRefreshPoint();
    this.oData.mvc.flags.isRecommenderVariant = true;
  };

  ProductTileView.prototype._setProps = function (data) {
    var flags = data.flags,
      CLASS_NAME = 'outfit-product-tile-range';

    return {
      classNames: flags.shopTheRange ? CLASS_NAME : ''
    };
  };

  ProductTileView.prototype._addSubViews = function () {
    var views = {},
      mvcData = this.oData.mvc,
      flags = mvcData.flags,
      sellerData = mvcData.sellers;

    views.ProductTileImageView = this._compileSubView({ _class: ProductTileImageView });
    views.ProductTileTitleView = this._compileSubView({ _class: ProductTileTitleView });

    views.ProductPriceView = this._compileSubView({
      _class: ProductPriceView,
      namespace: flags.bundle && 'sellers',
      state: { showSavings: flags.showPriceSavings || false, showPoints: false }
    });

    if (flags.showRatings) {
      views.ProductTileRatingsView = this._compileSubView({ _class: ProductTileRatingsView });
    }

    if (flags.showVariants) {
      views.VariantsView = this._compileSubView({ _class: VariantsView, ctlr: true });
    }

    if (flags.showItemActions) {
      views.ItemActionsView = this._compileSubView({
        _class: ItemActionsView,
        namespace: fn.isObject(sellerData, { notEmpty: true }) ? 'sellers' : this.sNamespace
      });
    }

    this.oData.views = views;
  };

  ProductTileView.prototype.refresh = function (params) {
    var views = this.oData.views,
      flags = this.oData.mvc.flags;

    if (this.isObject(params.inherit, true)) {
      this.sNamespace = params.inherit.namespace;
      this.oModel = params.inherit.model;
    }

    this.oData.mvc.inherit = null;
    this.mergeObjects(this.oData.mvc, params.mParamData.mvc, { extend: true });

    views.ProductTileImageView.refresh({
      sNamespace: this.sNamespace,
      mParamData: this._compileSubView({
        _class: ProductTileImageView,
        namespace: this.sNamespace,
        returnData: true
      })
    });

    views.ProductTileTitleView.refresh({
      sNamespace: this.sNamespace,
      mParamData: this._compileSubView({
        _class: ProductTileTitleView,
        namespace: this.sNamespace,
        returnData: true
      })
    });

    views.ProductPriceView.refresh({
      sNamespace: 'sellers',
      mParamData: this._compileSubView({
        _class: ProductPriceView,
        namespace: 'sellers',
        returnData: true
      })
    });

    if (flags.showRatings) {
      views.ProductTileRatingsView.refresh({
        sNamespace: this.sNamespace,
        mParamData: this._compileSubView({
          _class: ProductTileRatingsView,
          namespace: this.sNamespace,
          returnData: true
        })
      });
    }

    if (flags.showItemActions) {
      views.ItemActionsView.refresh({
        sNamespace: 'sellers',
        mParamData: this._compileSubView({
          _class: ItemActionsView,
          namespace: 'sellers',
          returnData: true
        })
      });
    }
  };

  module.exports = ProductTileView;
});
