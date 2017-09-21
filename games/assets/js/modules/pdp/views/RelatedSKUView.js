define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    CarouselItemsView = require('modules/pdp/views/CarouselItemsView'),
    BundleView = require('modules/pdp/views/BundleView'),
    OutfitItemsView = require('modules/pdp/views/OutfitItemsView'),
    template = require('text!templates/views/relatedItemsCarouselView.html');

  /**
   * The view class that renders the related products.
   * @param {oConfig} config The configuration for the view.
   * @return {void}
   */
  function RelatedSKUView(config) {
    this.sViewName = 'RelatedSKUView';
    this.sNamespace = 'sku';
    this.sTag = 'links';
    this.sViewClass = config.sViewClass || 'related-sku-view';
    this.sTemplate = config.sTemplate || template;
    this.parent.constructor.call(this, config);

    this.views = {
      classes: {
        BundleView: BundleView,
        CarouselItemsView: CarouselItemsView,
        OutfitItemsView: OutfitItemsView
      }
    };
  }

  fn.inherit(RelatedSKUView, BaseView);
  RelatedSKUView._name = 'RelatedSKUView';
  RelatedSKUView.sNamespace = 'sku';
  RelatedSKUView.sTag = 'links';

  RelatedSKUView.prototype._setData = function (params) {
    var _this = this;

    this.parent._setData.call(this, params);
    this.flags.isCarousel = !!fn.getValue(this.mParamData, 'carousel', 'show');
    this.flags.hasSubView = !!this.isObject(this.mParamData.subView, true);
    this.oData.mvc = {};
    this.oData.mvc.products = this.mParamData.products;
    this.oData.mvc.sku = this.mParamData.id;
    this.oData.mvc.items = this.mParamData.items;
    this.oData.mvc.flags = this.mParamData.flags || {};
    this.oData.mvc.info = { rootViewId: this.sViewId };

    this.oData.mvc.destroyRootView = function () {
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
    };
  };

  RelatedSKUView.prototype._addSubViews = function () {
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

  module.exports = RelatedSKUView;
});
