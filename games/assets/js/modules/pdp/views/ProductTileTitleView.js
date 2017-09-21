define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    recommenders = require('modules/recommenders/common'),
    template = require('text!templates/views/productTileTitleView.html');

  /**
   * The view class that renders the tile title.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function ProductTileTitleView(oConfig) {
    this.sViewName = 'ProductTileTitleView';
    this.sNamespace = 'inherit';
    this.sTag = 'title';
    this.sViewClass = 'product-tile-title';
    this.sTemplate = template;
    this.parent.constructor.call(this, oConfig);
  }


  fn.inherit(ProductTileTitleView, BaseView);
  ProductTileTitleView._name = 'ProductTileTitleView';
  ProductTileTitleView.sNamespace = 'inherit';
  ProductTileTitleView.sTag = 'title';


  ProductTileTitleView.prototype._setProps = function (data) {
    var flags = data.flags,
      itemData = data.inherit;

    return {
      displayName: itemData.displayName,
      id: itemData.id,
      link: flags.richRelevance && itemData.rrLink ? itemData.rrLink : itemData.publicLink
    };
  };


  ProductTileTitleView.prototype._cacheDomElms = function () {
    this.parent._cacheDomElms.call(this);
    this.oElms.elTitle = $(this.oElms.elWrapper).find('h3');
  };


  ProductTileTitleView.prototype._bindEvents = function () {
    $(window).off('breakpointChange.ProductTileTitleView')
    .on('breakpointChange.ProductTileTitleView',
      this._initDotDotDot.bind(this)
    );

    $(this.oElms.elTitle).on(
      'click',
      this._analyticsTracking.bind(this)
    );
  };


  ProductTileTitleView.prototype._initDependancies = function () {
    this._initDotDotDot();
  };


  ProductTileTitleView.prototype._initDotDotDot = function () {
    var _this = this;

    setTimeout(function () {
      $(_this.oElms.elTitle).dotdotdot({ height: 48 });
    }, 10);
  };


  ProductTileTitleView.prototype.refresh = function (params) {
    this.sNamespace = params.sNamespace;

    this.render({
      newEvent: true,
      sourceOutput: 'inner',
      sOutput: 'inner',
      elTarget: 'self',
      mParamData: params.mParamData
    });
  };


  ProductTileTitleView.prototype._analyticsTracking = function () {
    var mvcData = this.oData.mvc,
      flags = mvcData.flags,
      info = mvcData.info,
      relationship = '',
      _s = fn.copyObject(window.s),
      placementData = {},
      formattedItemsArray = [],
      productPosition = null;

    relationship = flags.completeTheLook ? 'Complete the Look' : relationship;
    relationship = flags.outfitBuilder ? 'Outfit Block' : relationship;
    relationship = flags.shopTheRange ? 'Shop The Range' : relationship;
    relationship = flags.bundle ? 'Frequently Bought Together' : relationship;

    if (info.rrPlacement !== undefined) {
      formattedItemsArray = info.rrPlacement.formattedItemsArray;
      fn.loopArray(formattedItemsArray, function loopRRProductIDs(i) {
        if (formattedItemsArray[i].id.indexOf(mvcData.inherit.id) > -1) {
          productPosition = (i + 1);
        }
      });
      placementData.productPosition = productPosition;
      placementData.placement = info.rrPlacement;
      placementData.productId = mvcData.inherit.id;
      recommenders.triggerRichRelevanceClickEventAnalytics(null, placementData);
    }

    if (relationship) {
      _s.linkTrackEvents = 'event32,event45';
      _s.linkTrackVars = 'prop19,eVar45,prop42,eVar59,events,products';
      _s.products = ';' + mvcData.inherit.id + ';;';
      _s.prop19 = 'product click';
      _s.eVar45 = _s.prop19;
      _s.prop42 = 'pdp - ' + relationship + ' - product click';
      _s.eVar59 = _s.prop42;
      _s.events = 'event32,event45';
      _s.tl(true, 'o', relationship + ' - product click');
    }
  };

  module.exports = ProductTileTitleView;
});
