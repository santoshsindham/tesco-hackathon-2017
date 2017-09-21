define('modules/pdp/views/AddRemoveServiceView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  /**
   * Service add/remove view constructor sets view's core data and calls parent constructor.
   * @param {Object} oConfig The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function AddRemoveServiceView(oConfig) {
    this.sViewName = 'AddRemoveServiceView';
    this.sNamespace = 'formHandler';
    this.sTag = 'services';
    this.sViewClass = 'check-box-wrapper';
    this.sTemplate = $('#service-check-box-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(AddRemoveServiceView, BaseView);

  AddRemoveServiceView._name = 'AddRemoveServiceView';
  AddRemoveServiceView.sNamespace = 'formHandler';
  AddRemoveServiceView.sTag = 'services';

  AddRemoveServiceView.prototype._cacheDomElms = function () {
    var $selector = $(this.sSelector);

    this.parent._cacheDomElms.call(this);
    this.oElms.elCheckbox = $selector.find('input[type="checkbox"]')[0];
    this.oElms.elFakeCheckbox = $selector.find('.check-box')[0];
  };

  return AddRemoveServiceView;
});
