define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    ProductTileView = require('modules/pdp/views/ProductTileView'),
    template = require('text!templates/views/carouselItemView.html');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function CarouselItemView(config) {
    this.sViewName = 'CarouselItemView';
    this.sNamespace = 'inherit';
    this.sTag = 'recommender';
    this.sViewClass = 'carousel-item';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(CarouselItemView, BaseView);
  CarouselItemView._name = CarouselItemView;
  CarouselItemView.sNamespace = 'inherit';
  CarouselItemView.sTag = 'recommender';

  CarouselItemView.prototype._setData = function () {
    var viewModel = this.oData.mvc[this.sNamespace];

    delete this.oData.mvc.viewModel;

    fn.loopObject.call(this, viewModel, function loopViewModel(prop) {
      this.oData.mvc[prop] = viewModel[prop];
    });
  };

  CarouselItemView.prototype._addSubViews = function () {
    this.oData.views.ProductTileView = this._compileSubView({
      _class: ProductTileView
    });
  };

  module.exports = CarouselItemView;
});
