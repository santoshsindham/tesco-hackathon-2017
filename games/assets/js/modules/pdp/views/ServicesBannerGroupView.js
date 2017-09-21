define('modules/pdp/views/ServicesBannerGroupView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/ServicesBannerView'
], function ($, fn, BaseView, ServicesBannerView) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ServicesBannerGroupView(config) {
    var template = config.sTemplate || '#services-banner-group-template',
      $templateScript = $(template);

    this.sViewName = 'ServicesBannerGroupView';
    this.sTag = 'banner';
    this.sNamespace = 'services';
    this.sViewClass = 'services-banner-group';
    this.sTemplate = $templateScript.length > 0 ? $templateScript[0].innerHTML : '';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ServicesBannerGroupView, BaseView);

  ServicesBannerGroupView._name = 'ServicesBannerGroupView';
  ServicesBannerGroupView.sNamespace = 'services';
  ServicesBannerGroupView.sTag = 'banner';

  ServicesBannerGroupView.prototype._setData = function () {
    var servicesData = this.oData.mvc.services;

    this.oData.mvc.flags.multipleServices = fn.isArray(servicesData) && servicesData.length > 1;
  };

  ServicesBannerGroupView.prototype._setProps = function (data) {
    var DOUBLE_CLASSES = 'functional-banner-double center-children-vertically',
      SINGLE_CLASSES = 'functional-banner-single';

    return {
      classNames: fn.isArray(data.services) && data.services.length > 1
          ? DOUBLE_CLASSES : SINGLE_CLASSES
    };
  };

  ServicesBannerGroupView.prototype._setStates = function (data) {
    return {
      multipleServices: fn.isArray(data.services) && data.services.length > 1
    };
  };

  ServicesBannerGroupView.prototype._addSubViews = function () {
    var servicesData = this.oData.mvc.services,
      servicesBannerViews = [];

    fn.loopArray.call(this, servicesData, function loopServicesData(i) {
      servicesBannerViews.push(this._compileSubView({
        _class: ServicesBannerView,
        data: servicesData[i]
      }));

      if (i === 1) {
        return false;
      }
      return undefined;
    }, { check: true });

    this.oData.views.ServicesBannerView = servicesBannerViews;
  };

  ServicesBannerGroupView.prototype._initDependancies = function () {
    if (this.oData.mvc.flags.isKiosk) {
      this._updateMediaViewerContainer();
    }
  };

  ServicesBannerGroupView.prototype._updateMediaViewerContainer = function () {
    var MAIN_CONTENT = '.main-content-wrapper',
      SERVICES_CLASS = 'services-available',
      $mainContent = $(MAIN_CONTENT);

    if ($mainContent.length > 0 && this.oData.mvc.services.length > 0) {
      $mainContent.addClass(SERVICES_CLASS);
    }
  };

  return ServicesBannerGroupView;
});
