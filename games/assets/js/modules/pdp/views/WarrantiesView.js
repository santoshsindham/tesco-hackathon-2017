define('modules/pdp/views/WarrantiesView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  /**
   * Warranties view constructor sets view's core data and calls parent constructor.
   * @param {Object} oConfig The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function WarrantiesView(oConfig) {
    this.sViewName = 'WarrantiesView';
    this.sNamespace = 'sellers';
    this.sTag = 'warranties';
    this.sViewClass = 'warranties-view';
    this.sTemplate = $('#warranties-view-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(WarrantiesView, BaseView);

  WarrantiesView._name = 'WarrantiesView';
  WarrantiesView.sNamespace = 'sellers';
  WarrantiesView.sTag = 'warranties';

  WarrantiesView.prototype._cacheDomElms = function () {
    var $Selector = $(this.sSelector);

    this.parent._cacheDomElms.call(this);
    this.oElms.elCheckboxInput = $Selector.find('input.warranty-checkbox');
  };

  return WarrantiesView;
});
