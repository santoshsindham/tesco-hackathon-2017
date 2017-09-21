define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    template = require('text!templates/views/productRatingsView.html');

  /**
   * The view class that renders the outfit item view.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function ProductTileRatingsView(oConfig) {
    this.sViewName = 'ProductTileRatingsView';
    this.sNamespace = 'inherit';
    this.sTag = 'ratings';
    this.sViewClass = 'product-ratings';
    this.sTemplate = template;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(ProductTileRatingsView, BaseView);
  ProductTileRatingsView._name = 'ProductTileRatingsView';
  ProductTileRatingsView.sNamespace = 'inherit';
  ProductTileRatingsView.sTag = 'ratings';

  ProductTileRatingsView.prototype._setData = function (params) {
    this.parent._setData.call(this, params);
    this.oData.mvc.inherit.custom = this._sanitiseDataForView(this.oData.mvc.inherit.avgRating);
  };

  ProductTileRatingsView.prototype._sanitiseDataForView = function (avgRating) {
    var output = {},
      calculateNumOfStars = null,
      calculateNumOfPoints = null;

    calculateNumOfStars = function (rating) {
      if ((rating >= 4.875) && (rating <= 5)) {
        return 5;
      }
      if ((rating >= 3.875) && (rating < 4.875)) {
        return 4;
      }
      if ((rating >= 2.875) && (rating < 3.875)) {
        return 3;
      }
      if ((rating >= 1.875) && (rating < 2.875)) {
        return 2;
      }
      if ((rating > 0) && (rating < 1.875)) {
        return 1;
      }
      return 0;
    };

    calculateNumOfPoints = function (rating) {
      var points = 0,
        decimalPart = 0;

      if (rating) {
        if ((rating > 0) && (rating < 1.125)) {
          return 0;
        }
        decimalPart = rating % 1;

        if (decimalPart >= 0.125 && decimalPart < 0.375) {
          points = 25;
        }
        if (decimalPart >= 0.375 && decimalPart < 0.625) {
          points = 5;
        }
        if (decimalPart >= 0.625 && decimalPart < 0.875) {
          points = 75;
        }
        if (decimalPart >= 0.875 || decimalPart < 0.125) {
          points = 0;
        }
      }
      return points;
    };

    output.numOfPoints = calculateNumOfPoints(avgRating);
    output.numOfStars = calculateNumOfStars(avgRating);

    return output;
  };

  ProductTileRatingsView.prototype.refresh = function (params) {
    this.sNamespace = params.sNamespace;

    this.render({
      newEvent: true,
      sourceOutput: 'inner',
      sOutput: 'inner',
      elTarget: 'self',
      mParamData: params.mParamData
    });
  };

  module.exports = ProductTileRatingsView;
});
