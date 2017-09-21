define('modules/pdp/views/ServicesFormView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/AddRemoveServiceView'
], function ($, fn, BaseView, AddRemoveServiceView) {
  'use strict';

  /**
   * Services form view constructor sets view's core data and calls parent constructor.
   * @param {Object} oConfig The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function ServicesFormView(oConfig) {
    this.sViewName = 'ServicesFormView';
    this.sNamespace = 'services';
    this.sTag = 'form';
    this.sViewClass = 'services__form';
    this.sTemplate = $('#services-form-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(ServicesFormView, BaseView);

  ServicesFormView._name = 'ServicesFormView';
  ServicesFormView.sNamespace = 'services';
  ServicesFormView.sTag = 'form';

  ServicesFormView.prototype._setData = function () {
    if (this.isArray(this.oData.mvc.services, true)) {
      this.forLoop(this.oData.mvc.services, function (i) {
        this.oData.mvc.services[i].custom = {
          visibility: !this.oData.mvc.services[i].tooltipMessage
              ? 'visibility: hidden'
              : '',
          checkbox: this._compileSubView({
            _class: AddRemoveServiceView,
            index: this.oData.mvc.services[i]
          })
        };
      });
    }
  };

  ServicesFormView.prototype._cacheDomElms = function () {
    var $selector = $(this.sSelector);

    this.parent._cacheDomElms.call(this);
    this.oElms.$tooltipTrigger = $selector.find('.tooltip-trigger');
  };

  ServicesFormView.prototype._bindEvents = function () {
    $(this.oElms.$tooltipTrigger).on(
      'click',
      this._triggerTooltip.bind(this)
    );
  };

  ServicesFormView.prototype._triggerTooltip = function (oEvent) {
    var serviceObj = this.oModel.get({
      sSearchKey: $(oEvent.currentTarget).data('mvc-key'),
      mSearchValue: $(oEvent.currentTarget).data('mvc-value')
    });

    if (serviceObj.tooltipMessage) {
      this.createTooltip({
        sTooltopMessage: serviceObj.tooltipMessage,
        elTrigger: oEvent.currentTarget
      });
    }
  };

  return ServicesFormView;
});
