define('modules/pdp/views/KioskProductPageView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/KioskProductPageTitleView',
  'modules/pdp/views/KioskProductDetailsView',
  'modules/pdp/views/ProductMediaViewerView',
  'modules/pdp/media-viewer/common',
  'modules/pdp/views/BuyboxView',
  'modules/pdp/views/ServicesBannerGroupView',
  'modules/pdp/views/kiosk-tabs/index'
], function (
  $,
  fn,
  BaseView,
  KioskProductPageTitleView,
  KioskProductDetailsView,
  ProductMediaViewerView,
  mediaViewer,
  BuyboxView,
  ServicesBannerGroupView,
  KioskTabs
) {
  'use strict';

  var KioskProductPageView = function (oConfig) {
    this.sViewName = 'KioskProductPageView';
    this.sNamespace = 'sku';
    this.sTag = 'kioskPage';
    this.sViewClass = 'content-container';
    this.sTemplate = $('#kiosk-product-page-template')[0].innerHTML;
    this.sMainContentWrapperSelector = '.main-content-wrapper';
    this.sStaticWrapperSelector = '.static-product-image';
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(KioskProductPageView, BaseView);
  KioskProductPageView._name = 'KioskProductPageView';
  KioskProductPageView.sNamespace = 'sku';

  KioskProductPageView.prototype._setData = function () {
    if (this.oData.mvc.custom === undefined) {
      this.oData.mvc.custom = {};
    }

    this.oData.mvc.flags.isKiosk = window.isKiosk();

    this._setPreloadedElements();

    this.oData.oProductPageTitleView = this._compileSubView({
      _class: KioskProductPageTitleView
    });

    this.oData.oProductDetailsView = this._compileSubView({
      _class: KioskProductDetailsView
    });

    this.oData.oProductMediaViewerView = this._compileSubView({
      _class: ProductMediaViewerView
    });

    this.oData.oBuyboxView = this._compileSubView({
      _class: BuyboxView,
      ctlr: true
    });

    this.oData.oServicesBannerGroupView = this._compileSubView({
      _class: ServicesBannerGroupView,
      ctlr: true
    });

    this.oData.oKioskTabs = this._compileSubView({
      _class: KioskTabs,
      ctlr: true
    });
  };

  KioskProductPageView.prototype._initDependancies = function () {
    var _this = this,
      eScene7 = new $.Event('scene7.init');

    eScene7.oData = this.oData.mvc.sku;
    this._setMediaViewerOrientation();

    $(window).trigger(eScene7);

    if (this.oData.mvc.sku.noofRatingsProduced === null) {
      $(window).on('bazaarVoiceLoaded', function () {
        _this._disableBazaarVoiceReviews();
      });
    }
  };

  KioskProductPageView.prototype._disableBazaarVoiceReviews = function () {
    $('#BVRRSummaryContainer, #BVRRSummaryContainer a.bv-rating-stars-container')
      .unbind('click')
      .on('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      });
  };

  KioskProductPageView.prototype._setMediaViewerOrientation = function () {
    if ($(this.sMainContentWrapperSelector).length) {
      $(this.sMainContentWrapperSelector).addClass(
        'media-viewer--' + this.oData.mvc.custom.mediaViewer.sOrientation
      );
    }
  };

  KioskProductPageView.prototype._getPreloadedMediaViewerOrientation = function () {
    var sOrientation = 'landscape'; // default to landscape media orientation

    if ($(this.sMainContentWrapperSelector).length) {
      sOrientation = $(this.sMainContentWrapperSelector).hasClass('media-viewer--portrait')
        ? 'portrait'
        : 'landscape';
    }
    this.oData.mvc.custom.mediaViewer = {};
    this.oData.mvc.custom.mediaViewer.sOrientation = sOrientation;
  };

  KioskProductPageView.prototype._getPreloadedMediaViewerType = function () {
    var sScene7Enabled = null;

    sScene7Enabled = $(this.sStaticWrapperSelector).hasClass('scene7-enabled')
      ? 'scene7-enabled'
      : '';
    this.oData.mvc.custom.mediaViewer.sScene7Enabled = sScene7Enabled;
  };

  KioskProductPageView.prototype._setPreloadedElements = function () {
    this._getPreloadedMediaViewerOrientation();
    this._getPreloadedMediaViewerType();
  };

  return KioskProductPageView;
});
