define('modules/pdp/views/ProductPageTabView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/ProductPageTabPanelGroupView',
  'modules/pdp/views/ProductPageTabPanelView',
  'modules/pdp/views/KioskProductDetailsView',
  'modules/pdp/views/KioskProductSpecView',
  'modules/pdp/views/KioskProductReviewsView',
  'modules/pdp/views/PromotionsView',
  'modules/pdp/views/ProductSynopsisView',
  'modules/pdp/views/AuthorBiographyView',
  'modules/pdp/views/ProductCLPView'
], function (
  $,
  fn,
  BaseView,
  ProductPageTabPanelGroupView,
  ProductPageTabPanelView,
  KioskProductDetailsView,
  KioskProductSpecView,
  KioskProductReviewsView,
  PromotionsView,
  ProductSynopsisView,
  AuthorBiographyView
) {
  var ProductPageTabView = function (oConfig) {
    this.sViewName = 'ProductPageTabView';
    this.sNamespace = 'sku';
    this.sTag = 'tabs';
    this.sViewClass = 'kiosk-pdp-tabs';
    this.sTemplate = $('#product-page-tab-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(ProductPageTabView, BaseView);

  ProductPageTabView._name = 'ProductPageTabView';
  ProductPageTabView.sNamespace = 'sku';

  ProductPageTabView.prototype._cacheDomElms = function () {
    this.parent._cacheDomElms.call(this);
    this.oElms.elTabOverview = $('#tab-overview');
  };

  ProductPageTabView.prototype._setData = function (args) {
    var mvcData = this.oData.mvc,
      sellerData = mvcData.sellers,
      skuData = mvcData.sku;

    this.parent._setData.call(this, args);
    mvcData.flags.inPanel = true;

    skuData = mvcData.sku;

    if (fn.isArray(sellerData, { notEmpty: true })) {
      this.oData.hasPromos = this.isArray(sellerData[0].promotions, true);
    }

    if (this.oData.hasPromos) {
      this.oData.promoLabel = this._createPromoTabText(sellerData[0].promotions);
    }

    this.oData.hasDetails = this._hasDetails();

    this.oData.bHasAuthorBiography = !!skuData.bookDetails && !!skuData.bookDetails.authorBiography;
    this.oData.bHasSynopsis = !!skuData.skuSynopsis;
    this.oData.bHasReviews = !!skuData.noofRatingsProduced;
    this.oData.bHasSpecification = this._checkSpecifications(skuData);
  };

  ProductPageTabView.prototype._createPromoTabText = function (promos) {
    var l = promos.length,
      output = '';

    if (l === 1) {
      output = l + ' Special offer';
    } else {
      output = l + ' Special offers';
    }

    return output;
  };

  ProductPageTabView.prototype._hasDetails = function () {
    var output = false;

    if (this.oData.mvc.sku.longDescription || this.oData.mvc.sku.bookDetails) {
      output = true;
    }

    if (this.isObject(this.oData.mvc.products.dynamicAttributes, true)
        && this.oData.mvc.products.dynamicAttributes.supplier === 'FF') {
      if (this.isObject(this.oData.mvc.vm, true) && this.isObject(this.oData.mvc.vm.sku, true)) {
        if (this.oData.mvc.vm.sku.miniDescription || this.oData.mvc.vm.sku.specification) {
          output = true;
        }
      }
    }

    return output;
  };

  ProductPageTabView.prototype._checkSpecifications = function (oData) {
    var bSpecification = false;

    if (oData.specification !== undefined && oData.specification !== null) {
      bSpecification = true;

      if (this.oData.mvc.products.dynamicAttributes) {
        if (this.oData.mvc.products.dynamicAttributes.supplier === 'FF') {
          bSpecification = false;
        }
      }
    }

    return bSpecification;
  };

  ProductPageTabView.prototype._initDependancies = function () {
    this._createTabPanelGroup();
  };

  ProductPageTabView.prototype._createTabPanelGroup = function () {
    var oPanelGroup = {},
      aTabViews = [];

    if (this.oData.hasPromos) {
      aTabViews.push(this._compileSubView({
        _class: PromotionsView,
        data: this.oData.mvc.sellers[0].promotions,
        template: '#promotions-view-with-title-template'
      }));
    }

    if (this.oData.hasDetails) {
      aTabViews.push(this._compileSubView({
        _class: KioskProductDetailsView
      }));
    }

    if (this.oData.bHasReviews) {
      aTabViews.push(this._compileSubView({
        _class: KioskProductReviewsView
      }));
    }

    if (this.oData.bHasSpecification) {
      aTabViews.push(this._compileSubView({
        _class: KioskProductSpecView
      }));
    }

    if (this.oData.bHasSynopsis) {
      aTabViews.push(this._compileSubView({
        _class: ProductSynopsisView
      }));
    }

    if (this.oData.bHasAuthorBiography) {
      aTabViews.push(this._compileSubView({
        _class: AuthorBiographyView
      }));
    }

    oPanelGroup = new ProductPageTabPanelGroupView({
      sTag: 'tabs',
      elTarget: $('body')[0]
    });

    this.forLoop(aTabViews, function (i) {
      oPanelGroup.createSubView({
        ViewClass: ProductPageTabPanelView,
        mParamData: {
          elTrigger: '#tab-' + aTabViews[i].sViewName,
          oData: {
            sClassName: 'info-panel-tabs',
            aSubViews: [
              aTabViews[i]
            ]
          },
          iSubViewCount: aTabViews.length
        }
      });
    });

    oPanelGroup.render();
  };

  ProductPageTabView.prototype._bindEvents = function () {
    $(this.oElms.elTabOverview).on(
      'click',
      this._onOverviewTabClick.bind(this)
    );

    $(window)
      .on('panelGroupOpen', this._setOverlayActiveState.bind(this))
      .on('panelGroupClosed', this._unsetOverlayActiveState.bind(this))
      .on('triggerKioskTab', this._triggerKioskTab.bind(this));
  };

  ProductPageTabView.prototype._onOverviewTabClick = function (oEvent) {
    this.setEvent({
      sName: 'closeOpenPanels',
      sTag: this.sTag,
      oView: this,
      oClickEvent: oEvent
    }, false, true);
  };

  ProductPageTabView.prototype._setOverlayActiveState = function (oEvent) {
    var IS_ACTIVE = 'is-active';

    if (oEvent.oData.sTag === this.sTag) {
      $(this.oElms.elTabOverview).removeClass(IS_ACTIVE);
    }
  };

  ProductPageTabView.prototype._unsetOverlayActiveState = function (oEvent) {
    var IS_ACTIVE = 'is-active';

    if (oEvent.oData.sTag === this.sTag) {
      $(this.oElms.elTabOverview).addClass(IS_ACTIVE);
    }
  };

  ProductPageTabView.prototype._triggerKioskTab = function (oEvent) {
    if (oEvent !== undefined) {
      if (oEvent.sViewName !== undefined) {
        $('#tab-' + oEvent.sViewName).trigger('click');
      }
    }
  };

  return ProductPageTabView;
});
