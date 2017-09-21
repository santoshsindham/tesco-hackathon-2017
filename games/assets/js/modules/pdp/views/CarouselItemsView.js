define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    CarouselItemView = require('modules/pdp/views/CarouselItemView'),
    CarouselController = require('modules/pdp/controllers/CarouselController'),
    template = require('text!templates/views/carouselItemsView.html');

  /**
   *
   * @param {config} config
   * @return {void}
   */
  function CarouselItemsView(config) {
    this.sViewName = 'CarouselItemsView';
    this.sNamespace = 'inherit';
    this.sTag = 'recommender';
    this.sViewClass = 'carousel-items';
    this.sTemplate = template;
    this.itemCounter = 1;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(CarouselItemsView, BaseView);

  CarouselItemsView._name = 'CarouselItemsView';
  CarouselItemsView.sNamespace = 'inherit';
  CarouselItemsView.sTag = 'recommender';

  CarouselItemsView.prototype._setData = function (args) {
    this.parent._setData.call(this, args);
    delete this.oData.mvc.items;
  };

  CarouselItemsView.prototype._addSubViews = function () {
    var viewModel = this.oData.mvc.viewModel,
      carouselItemView = [];

    this.forLoop(viewModel, function (i) {
      carouselItemView.push(this._compileSubView({ _class: CarouselItemView, data: viewModel[i] }));
    });

    this.oData.views.CarouselItemView = carouselItemView;
  };

  CarouselItemsView.prototype._initDependancies = function () {
    var mvcData = this.oData.mvc,
      rootViewSelector = '',
      _this = this;

    if (mvcData.flags.carousel && fn.getValue(mvcData, 'info', 'rootViewId')) {
      rootViewSelector = '#' + mvcData.info.rootViewId;
      setTimeout(function () {
        _this.carousel = new CarouselController($(rootViewSelector));
      }, 10);
    }
  };

  module.exports = CarouselItemsView;
});
