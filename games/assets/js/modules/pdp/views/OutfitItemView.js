define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    ProductTileView = require('modules/pdp/views/ProductTileView'),
    template = require('text!templates/views/outfitItemView.html');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function OutfitItemView(config) {
    this.sViewName = 'OutfitItemView';
    this.sNamespace = 'inherit';
    this.sTag = 'recommender';
    this.sViewClass = 'outfit-item';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(OutfitItemView, BaseView);
  OutfitItemView._name = 'OutfitItemView';
  OutfitItemView.sNamespace = 'inherit';
  OutfitItemView.sTag = 'recommender';

  OutfitItemView.prototype._setData = function () {
    var viewModel = this.oData.mvc[this.sNamespace];

    delete this.oData.mvc.viewModel;

    fn.loopObject.call(this, viewModel, function loopViewModel(prop) {
      this.oData.mvc[prop] = viewModel[prop];
    });
  };

  OutfitItemView.prototype._addSubViews = function () {
    this.oData.views.ProductTileView = this._compileSubView({
      _class: ProductTileView
    });
  };

  module.exports = OutfitItemView;
});
