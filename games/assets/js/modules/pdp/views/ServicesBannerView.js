define('modules/pdp/views/ServicesBannerView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  /**
   * Services banner view constructor sets view's core data and calls parent constructor.
   * @param {Object} config The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function ServicesBannerView(config) {
    var template = config.sTemplate || '#services-banner-template',
      $templateScript = $(template);

    this.sViewName = 'ServicesBannerView';
    this.sTag = 'banner';
    this.sNamespace = 'services';
    this.sViewClass = 'services-banner-view';
    this.sTemplate = $templateScript.length > 0 ? $templateScript[0].innerHTML : '';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ServicesBannerView, BaseView);

  ServicesBannerView._name = 'ServicesBannerView';
  ServicesBannerView.sNamespace = 'services';
  ServicesBannerView.sTag = 'banner';

  ServicesBannerView.prototype._setProps = function (data) {
    var servicesData = data.services;

    return {
      name: servicesData.name,
      price: servicesData.price
    };
  };

  ServicesBannerView.prototype._setStates = function (data) {
    return {
      hasTooltip: !!data.services.tooltipMessage
    };
  };

  return ServicesBannerView;
});
