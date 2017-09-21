define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    sizeGuide = require('modules/size-guide/sizeGuide'),
    template = require('text!templates/views/sizeGuideView.html');

  /**
   * The view class that renders the size guide link and triggers the display.
   * @param {Object} config The configuration for the view.
   * @return {void}
   */
  function SizeGuideView(config) {
    this.sViewName = 'SizeGuideView';
    this.sNamespace = 'products';
    this.sTag = 'sizeGuide';
    this.sViewClass = 'size-guide';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(SizeGuideView, BaseView);
  SizeGuideView._name = 'SizeGuideView';
  SizeGuideView.sNamespace = 'products';
  SizeGuideView.sTag = 'sizeGuide';

  SizeGuideView.prototype._setData = function (params) {
    this.parent._setData.call(this, params);

    if (!this.oData.mvc.products.custom) {
      this.oData.mvc.products.custom = {};
    }

    this.oData.mvc.products.custom.sizeGuideLookupName = this._getLookupName();
  };

  SizeGuideView.prototype._getLookupName = function () {
    var GENDER_MAP = {
        Mens: 'sizeguideblockmen',
        Womens: 'sizeguideblockwomen',
        Adults: 'sizeguideblockadults',
        Boys: 'sizeguideblockboys',
        Girls: 'sizeguideblockgirls',
        Kids: 'sizeguideblockkids'
      },
      ageSuitability = null,
      key = null;

    key = fn.getValue(this.oData, 'mvc', 'products', 'dynamicAttributes', 'gender');
    if (!key) {
      return '';
    }
    if (key.indexOf('Unisex') >= 0) {
      ageSuitability = fn.getValue(this.oData, 'mvc', 'products', 'dynamicAttributes', 'ageSuitability');
      if (!ageSuitability) {
        return '';
      }
      key = ageSuitability === 'Adult' ? 'Adults' : 'Kids';
    }

    return GENDER_MAP[key] || '';
  };

  SizeGuideView.prototype._cacheDomElms = function () {
    var SIZE_GUIDE = '.size-guide-link';

    this.parent._cacheDomElms.call(this);
    this.oElms.link = $(this.oElms.elWrapper).find(SIZE_GUIDE);
  };

  SizeGuideView.prototype._bindEvents = function () {
    $(this.oElms.link).on(
      'click',
      this._onLinkClick.bind(this)
    );
  };

  SizeGuideView.prototype._onLinkClick = function (eventData) {
    this.compileAndRenderOverlay({
      sTag: 'sizeGuide',
      sClassNames: 'size-guide-overlay',
      elTrigger: eventData.currentTarget,
      sProp: 'text',
      callback: function (selector) {
        sizeGuide.init({ selector: selector });
      }
    }, eventData);
  };

  module.exports = SizeGuideView;
});
