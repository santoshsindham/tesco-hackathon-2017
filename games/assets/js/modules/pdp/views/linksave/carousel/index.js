define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');
  var BaseView = require('modules/pdp/views/BaseView');
  var CarouselItemsView = require('modules/pdp/views/CarouselItemsView');
  var template = require('text!templates/views/linksave/carousel/index.html');

  /**
   *
   * @constructor
   * @param {config} config
   * @return {void}
   */
  var LinksaveCarouselView = function LinksaveCarouselView(config) {
    this.sViewName = 'LinksaveCarouselView';
    this.sNamespace = 'promotions';
    this.sTag = 'linksave';
    this.sViewClass = 'linksave-carousel';
    this.sTemplate = template;

    this.views = { classes: {
      CarouselItemsView: CarouselItemsView
    } };

    this.parent.constructor.call(this, config);
  };

  fn.inherit(LinksaveCarouselView, BaseView);
  LinksaveCarouselView._name = 'LinksaveCarouselView';
  LinksaveCarouselView.sNamespace = 'promotions';
  LinksaveCarouselView.sTag = 'linksave';

  LinksaveCarouselView.prototype._setData = function () {
    this.oData.mvc.info = {
      rootViewId: this.sViewId
    };
  };
  /**
   *
   * @param {Object} data
   * @return {Object}
   */
  LinksaveCarouselView.prototype._setProps = function (data) {
    return {
      bucketLink: data.promotion.publicLink + '?bucketId=' + data.bucketGroup.id,
      title: data.promotion.displayName,
      customNavigationClass: data.viewModel.length > 3 ? 'narrowerNavigationButtons' : '',
      bucketSkuCount: data.viewModel.length
    };
  };

  /**
   *
   * @param {Object} data
   * @return {Object}
   */
  LinksaveCarouselView.prototype._setStates = function (data) {
    return {
      displayBucketLink: data.viewModel.length < 4
    };
  };

  /**
   *
   * @return {void}
   */
  LinksaveCarouselView.prototype._addSubViews = function () {
    var namespace = 'sku';

    this.oData.views.carouselItems = this._compileSubView({
      _class: this.views.classes.CarouselItemsView,
      namespace: namespace
    });
  };

  module.exports = LinksaveCarouselView;
});
