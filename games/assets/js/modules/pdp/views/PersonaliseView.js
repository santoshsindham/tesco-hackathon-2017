define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    template = require('text!templates/views/personaliseView.html');

  /**
   * Add to basket view constructor sets view's core data and calls parent constructor.
   * @param {Object} config The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function PersonaliseView(config) {
    this.sViewName = 'PersonaliseView';
    this.sNamespace = 'sku';
    this.sTag = 'personalise';
    this.sViewClass = 'personalise-view';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(PersonaliseView, BaseView);
  PersonaliseView._name = 'PersonaliseView';
  PersonaliseView.sNamespace = 'sku';
  PersonaliseView.sTag = 'personalise';

  PersonaliseView.prototype._setStates = function (data) {
    var hasSkuData = this.sanityCheckData(data.sku).objects;

    return {
      isPersonalised: hasSkuData && data.sku.personalisation.isPersonalised
    };
  };

  PersonaliseView.prototype._cacheDomElms = function () {
    var $wrapper = null,
      $personaliseBtn = null,
      $editLink = null;

    this.parent._cacheDomElms.call(this);

    $wrapper = $(this.oElms.elWrapper);
    $personaliseBtn = $wrapper.find('.personalise-button');
    $editLink = $wrapper.find('.edit-personalise-link');

    if ($personaliseBtn.length > 0) {
      this.oElms.personaliseBtn = $personaliseBtn[0];
    }

    if ($editLink.length > 0) {
      this.oElms.editLink = $editLink[0];
    }
  };

  module.exports = PersonaliseView;
});
