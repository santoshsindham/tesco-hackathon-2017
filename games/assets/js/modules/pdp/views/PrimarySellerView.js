define('modules/pdp/views/PrimarySellerView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/BuyboxContentView'
], function ($, fn, BaseView, BuyboxContentView) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function PrimarySellerView(config) {
    this.sNamespace = 'sellers';
    this.sTag = 'buybox';
    this.sViewName = 'PrimarySellerView';
    this.sViewClass = 'primary-seller-view';
    this.sTemplate = $('#primary-seller-view-template')[0].innerHTML;
    this.views = {
      classes: {
        BuyboxContentView: BuyboxContentView
      }
    };
    this.parent.constructor.call(this, config);
  }

  fn.inherit(PrimarySellerView, BaseView);
  PrimarySellerView._name = 'PrimarySellerView';
  PrimarySellerView.sNamespace = 'sellers';
  PrimarySellerView.sTag = 'buybox';

  PrimarySellerView.prototype._setData = function (params) {
    this.parent._setData.call(this, params);
    this.oData.mvc.flags.isPrimarySeller = true;
  };

  PrimarySellerView.prototype._addSubViews = function () {
    this.oData.aSubViews.push(
      this._compileSubView({ _class: BuyboxContentView })
    );
  };

  return PrimarySellerView;
});
