define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    CarouselItemsView = require('modules/pdp/views/CarouselItemsView'),
    OutfitItemsView = require('modules/pdp/views/OutfitItemsView'),
    BundleView = require('modules/pdp/views/BundleView'),
    template = require('text!templates/views/relatedItemsCarouselView.html');

  /**
   * The view class that renders the related products.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function RelatedProductView(oConfig) {
    this.sViewName = 'RelatedProductView';
    this.sNamespace = 'products';
    this.sTag = 'links';
    this.sViewClass = oConfig.sViewClass || 'related-product-view';
    this.sTemplate = oConfig.sTemplate || template;
    this.parent.constructor.call(this, oConfig);

    this.views = {
      classes: {
        BundleView: BundleView,
        CarouselItemsView: CarouselItemsView,
        OutfitItemsView: OutfitItemsView
      }
    };
  }

  fn.inherit(RelatedProductView, BaseView);
  RelatedProductView._name = 'RelatedProductView';
  RelatedProductView.sNamespace = 'products';
  RelatedProductView.sTag = 'links';

  RelatedProductView.prototype._setData = function (params) {
    var _this = this;

    this.parent._setData.call(this, params);

    this.oData.mvc = {
      products: this.mParamData.id,
      sku: this.mParamData.sku,
      items: this.mParamData.items,
      flags: this.mParamData.flags || {},
      info: { rootViewId: this.sViewId },
      destroyRootView: function () {
        _this.setEvent({
          sName: 'destroyView',
          sNamespace: _this.sNamespace,
          sTag: _this.sTag,
          sViewName: _this.sViewName,
          getView: function getView(view) {
            if (view.sViewId === _this.sViewId) {
              return true;
            }
            return false;
          }
        }, false, true);
      }
    };

    if (this.mParamData.info && this.mParamData.info.rrPlacement) {
      this.oData.mvc.info = this.oData.mvc.info || {};
      this.oData.mvc.info.rrPlacement = this.mParamData.info.rrPlacement;
    }

    this.flags.isCarousel = !!fn.getValue(this.mParamData, 'carousel', 'show');
    this.flags.hasSubView = !!this.isObject(this.mParamData.subView, true);
    this.oData.mvc.info.relationship = this.mParamData.relationshipType;

    if (this.oData.mvc.info.relationship === 'completeTheLook') {
      this.oData.mvc.flags.showProductRatings = false;
    }
  };

  RelatedProductView.prototype._addSubViews = function () {
    var subviewData = this.mParamData.subView;

    if (this.flags.hasSubView) {
      this.oData.aSubViews.push(
        this._compileSubView({
          _class: this.views.classes[subviewData.name],
          ctlr: subviewData.ctlr,
          filterOptions: subviewData.filterOptions
        })
      );
    } else if (this.flags.isCarousel) {
      this.oData.aSubViews.push(
        this._compileSubView({
          _class: CarouselItemsView,
          data: this.oData.mvc.items
        })
      );
    }
  };

  module.exports = RelatedProductView;
});
