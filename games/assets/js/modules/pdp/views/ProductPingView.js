define('modules/pdp/views/ProductPingView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ProductPingView(config) {
    this.sViewName = 'ProductPingView';
    this.sNamespace = 'sku';
    this.sTag = 'ping';
    this.sViewClass = 'product-ping';
    this.sTemplate = $('#product-ping-template')[0].innerHTML;
    this.parent.constructor.call(this, config);
  }


  fn.inherit(ProductPingView, BaseView);
  ProductPingView._name = 'ProductPingView';
  ProductPingView.sNamespace = 'sku';
  ProductPingView.sTag = 'ping';


  ProductPingView.prototype._setProps = function (data) {
    var skuData = data.sku,
      ping = fn.getValue(skuData, 'mediaAssets', 'pings', 0);

    if (!fn.isObject(ping, { notEmpty: true })) {
      return {};
    }

    return {
      mediaType: ping.mediaType,
      srcSmall: this._populateImageTemplate(ping.src, 'small'),
      srcLarge: this._populateImageTemplate(ping.src, 'large')
    };
  };


  ProductPingView.prototype._populateImageTemplate = function (src, type) {
    var PLACEHOLDER = '$[preset]$',
      PRESET_LARGE = 'lg',
      PRESET_SMALL = 'sm',
      preset = '',
      _src = src || '';

    if (type === 'large') {
      preset = PRESET_LARGE;
    } else if (type === 'small') {
      preset = PRESET_SMALL;
    }

    return _src.replace(PLACEHOLDER, preset);
  };


  ProductPingView.prototype._initDependancies = function () {
    window.picturefill();
  };


  return ProductPingView;
});
