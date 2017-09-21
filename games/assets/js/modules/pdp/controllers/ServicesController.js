define('modules/pdp/controllers/ServicesController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/ServicesFormView',
  'modules/pdp/views/ServicesBannerGroupView',
  'modules/pdp/views/ServicesBannerView'
], function (fn, BaseController, ServicesFormView, ServicesBannerGroupView, ServicesBannerView) {
  'use strict';

  /**
   *
   * @param {Array<Objects>} models
   * @return {void}
   */
  function ServicesController(models) {
    this.sNamespace = 'services';
    this.sTag = '_default';
    this.views = {
      classes: {
        ServicesFormView: ServicesFormView,
        ServicesBannerGroupView: ServicesBannerGroupView,
        ServicesBannerView: ServicesBannerView
      }
    };
    this.parent.constructor.call(this, models);
  }


  fn.inherit(ServicesController, BaseController);
  ServicesController.modelNames = ['sku', 'sellers', 'services'];


  ServicesController.prototype._bindViewEvents = function (args) {
    var view = args.oView,
      states = view.oData.state;

    if (states.hasTooltip) {
      $(view.oElms.elWrapper).on(
        'click', { view: view },
        this._onBannerClick.bind(this)
      );
    }
  };


  ServicesController.prototype._onBannerClick = function (event) {
    var view = event.data.view,
      serviceData = view.oData.mvc.services;

    this.compileAndRenderOverlay({
      sTag: 'servicesBanner',
      sClassNames: 'services-banner-overlay small-lightbox with-header',
      sContentClasses: 'text text-block',
      elTrigger: event.currentTarget,
      sTitle: serviceData.name + ' - &pound;' + serviceData.price,
      oStyles: {
        allDesktops: ['lightbox', 'fullScreen'],
        htablet: ['lightbox', 'fullScreen'],
        vtablet: ['lightbox', 'fullScreen'],
        mobile: ['slideIn-left', 'fullScreen'],
        kiosk: ['lightbox', 'fullScreen']
      },
      sProp: 'tooltipMessage'
    }, event);
  };


  ServicesController.prototype._collateDataConditional = function (params) {
    if (params.sViewName === 'ServicesFormView' || params.sViewName === 'ServicesBannerGroupView') {
      return true;
    }
    return false;
  };


  ServicesController.prototype._collateDataDependancies = function (params) {
    if (params.sViewName === 'ServicesFormView') {
      this._collateFormDependancies(params, params.deferred);
    } else if (params.sViewName === 'ServicesBannerGroupView') {
      this._collateBannerDependancies(params, params.deferred);
    }
  };


  ServicesController.prototype._collateFormDependancies = function (params, deferred) {
    var _params = params,
      mvcData = _params.mParamData.mvc;

    mvcData.sellers = this.models.sellers.get({ mSearchValue: mvcData.sellers });

    if (this.sanityCheckData(mvcData.sellers).objects) {
      mvcData.services = mvcData.sellers.services;
      _params.mParamData.mvc = mvcData;
      deferred.resolve(_params);
    } else {
      deferred.reject();
    }
  };


  ServicesController.prototype._collateBannerDependancies = function (params, deferred) {
    var mvcData = params.mParamData.mvc;

    if (!this.sanityCheckData(mvcData.sku.sellers).ids) {
      this._querySkuModel(params, deferred);
      return;
    }

    if (!this.sanityCheckData(mvcData.sellers).objects) {
      this._querySellerModel(params, deferred);
      return;
    }

    if (!this.sanityCheckData(mvcData.services).objects) {
      this._queryServicesModel(params, deferred);
      return;
    }

    deferred.resolve(params);
  };


  ServicesController.prototype._querySkuModel = function (params, deferred) {
    var _this = this,
      _params = params,
      checkAndAdd = null,
      observeAndNotify = null,
      mvcData = _params.mParamData.mvc,
      skuModel = this.models.sku;

    checkAndAdd = function checkAddSellerData(data) {
      if (!_this.sanityCheckData(data).ids) {
        observeAndNotify();
      } else {
        mvcData.sku.sellers = data;
        mvcData.sellers = skuModel.getPrimarySeller(mvcData.sku.id);
        _params.mParamData.mvc = mvcData;
        _this._querySellerModel(_params, deferred);
      }
    };

    observeAndNotify = function observeNotifySkuListings() {
      skuModel.observe({
        callback: function observeAndNotifyCallback(resp) {
          checkAndAdd(resp.data.observe.sellers);
        },
        once: true,
        propKey: 'sellers',
        searchValue: mvcData.sku.id
      });
    };

    checkAndAdd(skuModel.get({ mSearchValue: mvcData.sku.id, sPropKey: 'sellers', noFetch: true }));
  };


  ServicesController.prototype._querySellerModel = function (params, deferred) {
    var _this = this,
      _params = params,
      checkAndAdd = null,
      observeAndNotify = null,
      mvcData = _params.mParamData.mvc,
      sellerModel = this.models.sellers;

    checkAndAdd = function checkAddSellerData(data) {
      if (!_this.sanityCheckData(data).objects) {
        observeAndNotify();
      } else {
        _params.mParamData.mvc.sellers = data;
        _this._queryServicesModel(_params, deferred);
      }
    };

    observeAndNotify = function observeNotifySellerData() {
      sellerModel.observe({
        action: 'add',
        callback: function observeAndNotifyCallback(resp) {
          checkAndAdd(resp.data.observe);
        },
        once: true,
        searchValue: mvcData.sellers
      });
    };

    checkAndAdd(sellerModel.get({ mSearchValue: mvcData.sellers, noFetch: true }));
  };


  ServicesController.prototype._queryServicesModel = function (params, deferred) {
    var _this = this,
      _params = params,
      checkAndAdd = null,
      observeAndNotify = null,
      mvcData = _params.mParamData.mvc,
      serviceModel = this.models.services;

    checkAndAdd = function checkAddServiceData(data) {
      if (!_this.sanityCheckData(data).objects) {
        observeAndNotify();
      } else {
        _params.mParamData.mvc.services = data;
        deferred.resolve(_params);
      }
    };

    observeAndNotify = function observeNotifySellerData() {
      serviceModel.observe({
        action: 'add',
        callback: function observeAndNotifyCallback(resp) {
          checkAndAdd(resp.data.observe);
        },
        once: true,
        searchValue: mvcData.sellers.services
      });
    };

    checkAndAdd(serviceModel.get({ mSearchValue: mvcData.sellers.services, noFetch: true }));
  };


  return ServicesController;
});
