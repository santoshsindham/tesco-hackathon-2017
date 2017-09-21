define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    OutfitItemView = require('modules/pdp/views/OutfitItemView'),
    ShowMore = require('modules/show-more/ShowMore'),
    template = require('text!templates/views/outfitItemsView.html');

  /**
   * The view class that renders the outfit items view.
   * @param {Object} config The configuration for the view.
   * @return {void}
   */
  function OutfitItemsView(config) {
    this.sViewName = 'OutfitItemsView';
    this.sNamespace = 'inherit';
    this.sTag = 'recommender';
    this.sViewClass = 'outfit-items';
    this.sTemplate = template;
    this.itemCounter = 1;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(OutfitItemsView, BaseView);
  OutfitItemsView._name = 'OutfitItemsView';
  OutfitItemsView.sNamespace = 'inherit';
  OutfitItemsView.sTag = 'recommender';

  OutfitItemsView.prototype._setData = function (args) {
    this.parent._setData.call(this, args);
    delete this.oData.mvc.items;
  };

  OutfitItemsView.prototype._setProps = function () {
    var _this = this;

    return {
      oddEvenClass: function () {
        var oddEvenClass = _this.itemCounter % 2 === 0 ? 'even' : 'odd';

        _this.itemCounter += 1;
        return oddEvenClass;
      }
    };
  };

  OutfitItemsView.prototype._addSubViews = function () {
    var viewModel = this.oData.mvc.viewModel,
      outfitItemView = [];

    this.forLoop(viewModel, function (i) {
      outfitItemView.push(this._compileSubView({ _class: OutfitItemView, data: viewModel[i] }));
    });

    this.oData.views.OutfitItemView = outfitItemView;
  };

  OutfitItemsView.prototype._initDependancies = function () {
    var _this = this,
      flags = this.oData.mvc.flags;

    if (!flags.useShowMore) {
      return;
    }

    setTimeout(function () {
      var showMore = new ShowMore({
        selector: _this.oElms.elWrapper,
        height: 500
      });

      showMore.fnInit();
    }, 100);
  };

  module.exports = OutfitItemsView;
});
