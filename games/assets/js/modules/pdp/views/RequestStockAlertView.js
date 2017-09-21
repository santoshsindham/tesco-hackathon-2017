define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    template = require('text!templates/views/requestStockAlertView.html');

  /**
   * Request stock alert view constructor sets view's core data and calls parent constructor.
   * @param {Object} oConfig The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function RequestStockAlertView(oConfig) {
    this.sViewName = 'RequestStockAlertView';
    this.sNamespace = 'formHandler';
    this.sTag = 'requestStockAlert';
    this.sViewClass = 'request-stock-alert-view';
    this.sTemplate = template;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(RequestStockAlertView, BaseView);
  RequestStockAlertView._name = 'RequestStockAlertView';
  RequestStockAlertView.sNamespace = 'formHandler';
  RequestStockAlertView.sTag = 'requestStockAlert';

  RequestStockAlertView.prototype._setData = function (params) {
    var STOCK_ALERT_SET = 'stock-alert-set ';

    this.parent._setData.call(this, params);

    if (!this.oData.mvc.sellers.formHandler) {
      this.oData.sClassNames += STOCK_ALERT_SET;
    }

    if (this.oData.mvc.flags.disabled) {
      this.oData.mvc.custom.disabled = 'disabled';
    }
  };

  RequestStockAlertView.prototype.enable = function () {
    this.oData.mvc.flags.disabled = false;
    this.oElms.elSubmitBtn.disabled = false;
  };

  RequestStockAlertView.prototype.disable = function () {
    this.oData.mvc.flags.disabled = true;
    this.oElms.elSubmitBtn.disabled = true;
  };

  RequestStockAlertView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.elSubmitBtn = $wrapper.find('button')[0];
  };

  module.exports = RequestStockAlertView;
});
