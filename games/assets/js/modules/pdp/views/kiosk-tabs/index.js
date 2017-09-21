define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    ev = require('modules/mvc/ev'),
    BaseView = require('modules/pdp/views/BaseView'),
    ProductPageTabPanelGroupView = require('modules/pdp/views/ProductPageTabPanelGroupView'),
    ProductPageTabPanelView = require('modules/pdp/views/ProductPageTabPanelView'),
    KioskProductDetailsView = require('modules/pdp/views/KioskProductDetailsView'),
    KioskProductSpecView = require('modules/pdp/views/KioskProductSpecView'),
    KioskProductReviewsView = require('modules/pdp/views/KioskProductReviewsView'),
    ProductSynopsisView = require('modules/pdp/views/ProductSynopsisView'),
    AuthorBiographyView = require('modules/pdp/views/AuthorBiographyView'),
    template = require('text!templates/views/kioskTabs.html'),
    relatedItemsViewWithTitleTmpl = require('text!templates/views/relatedItemsViewWithTitle.html');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function KioskTabsView(config) {
    this.sViewName = 'KioskTabsView';
    this.sNamespace = 'links';
    this.sTag = 'tabs';
    this.sViewClass = 'kiosk-tabs';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(KioskTabsView, BaseView);
  KioskTabsView._name = 'KioskTabsView';
  KioskTabsView.sNamespace = 'links';
  KioskTabsView.sTag = 'tabs';

  /**
   *
   * @param {Object} data
   * @return {Object}
   */
  KioskTabsView.prototype._setProps = function (data) {
    var flags = data.flags.tabs,
      sellerData = data.sellers,
      promoLabel = '',
      promosLength = flags.hasPromos ? sellerData.promotions.length : 0,
      tabCount = 0;

    if (promosLength === 1) {
      promoLabel = promosLength + ' Special offer';
    } else if (promosLength > 1) {
      promoLabel = promosLength + ' Special offers';
    }

    Object.keys(flags).forEach(function (key) {
      if (flags[key]) tabCount += 1;
    });

    return {
      promoLabel: promoLabel,
      tabCount: tabCount
    };
  };

  /**
   *
   * @param {Object} data
   * @return {Object}
   */
  KioskTabsView.prototype._setStates = function (data) {
    var flags = data.flags.tabs;

    return {
      hasAccessories: flags.hasAccessories,
      hasBiography: flags.hasBiography,
      hasBundle: flags.hasBundle,
      hasCompleteTheLook: flags.hasCompleteTheLook,
      hasDetails: flags.hasDetails,
      hasOutfitBuilder: flags.hasOutfitBuilder,
      hasPromos: flags.hasPromos,
      hasReviews: flags.hasReviews,
      hasShopTheRange: flags.hasShopTheRange,
      hasSpecs: flags.hasSpecs,
      hasSynopsis: flags.hasSynopsis
    };
  };

  /**
   *
   * @return {void}
   */
  KioskTabsView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.tabOverview = $wrapper.find('.js-tab-overview')[0];
  };

  /**
   *
   * @return {void}
   */
  KioskTabsView.prototype._initDependancies = function () {
    this._createTabsCarousel();
    this._createTabPanelGroup();
  };

  /**
   *
   * @return {void}
   */
  KioskTabsView.prototype._createTabsCarousel = function () {
    var $wrapper = $(this.oElms.elWrapper);

    if (this.oData.props.tabCount > 5) {
      $wrapper.addClass('in-carousel');
    }

    $(this.oElms.elWrapper).carousel({
      itemSelector: '.kiosk-tabs-items > li',
      bHideNextPreviousIfAllItemsVisible: true,
      centraliseThumbnails: { enabled: true }
    });
  };

  /**
   *
   * @return {void}
   */
  KioskTabsView.prototype._createTabPanelGroup = function () {
    var mvcData = this.oData.mvc,
      flags = this.oData.mvc.flags.tabs,
      panelGroup = {},
      tabViews = [];

    if (flags.hasAccessories) {
      tabViews.push(this._renderAccessories(mvcData));
    }

    if (flags.hasBiography) {
      tabViews.push(this._compileSubView({ _class: AuthorBiographyView }));
    }

    if (flags.hasBundle) {
      tabViews.push(this._renderBundle(mvcData));
    }

    if (flags.hasCompleteTheLook) {
      tabViews.push(this._renderCompleteTheLook(mvcData));
    }

    if (flags.hasDetails) {
      tabViews.push(this._compileSubView({ _class: KioskProductDetailsView }));
    }

    if (flags.hasOutfitBuilder) {
      tabViews.push(this._renderOutfitBuilder(mvcData));
    }

    if (flags.hasPromos) {
      tabViews.push(this._renderPromotions(mvcData));
    }

    if (flags.hasReviews) {
      tabViews.push(this._compileSubView({ _class: KioskProductReviewsView }));
    }

    if (flags.hasShopTheRange) {
      tabViews.push(this._renderShopTheRange(mvcData));
    }

    if (flags.hasSpecs) {
      tabViews.push(this._compileSubView({ _class: KioskProductSpecView }));
    }

    if (flags.hasSynopsis) {
      tabViews.push(this._compileSubView({ _class: ProductSynopsisView }));
    }

    panelGroup = new ProductPageTabPanelGroupView({ sTag: 'tabs', elTarget: $('body')[0] });

    fn.loopArray(tabViews, function (i) {
      panelGroup.createSubView({
        ViewClass: ProductPageTabPanelView,
        mParamData: {
          elTrigger: '.js-tab-' + tabViews[i].sViewName,
          oData: {
            sClassName: 'info-panel-tabs',
            aSubViews: [tabViews[i]]
          },
          iSubViewCount: tabViews.length
        }
      });
    });

    panelGroup.render();
  };

  /**
   *
   * @param {Object} mvcData
   * @return {Object}
   */
  KioskTabsView.prototype._renderAccessories = function (mvcData) {
    ev.renderView({
      sNamespace: 'sku',
      sTag: 'links',
      sViewName: 'RelatedSKUView',
      elTarget: '.js-accessories-tab-placeholder',
      sOutput: 'outer',
      mParamData: {
        flags: {
          accessories: true,
          carousel: true,
          inPanel: mvcData.flags.inPanel,
          isFF: mvcData.flags.isFF,
          isKiosk: mvcData.flags.isKiosk,
          showRatings: true
        },
        id: mvcData.sku.id,
        relatedItemHeading: 'Popular accessories',
        relationshipType: 'accessories',
        processHyperMediaType: 'sku',
        processHyperMedia: true,
        subView: { ctlr: true, name: 'CarouselItemsView' }
      }
    }, { timeout: 10 });

    return {
      render: '<div class="js-accessories-tab-placeholder"></div>', sViewName: 'Accessories'
    };
  };

  /**
   *
   * @param {Object} mvcData
   * @return {Object}
   */
  KioskTabsView.prototype._renderBundle = function (mvcData) {
    ev.renderView({
      sNamespace: 'sku',
      sTag: 'links',
      sViewName: 'RelatedSKUView',
      elTarget: '.js-bundle-tab-placeholder',
      sOutput: 'outer',
      sTemplate: relatedItemsViewWithTitleTmpl,
      mParamData: {
        flags: {
          bundle: true,
          inPanel: mvcData.flags.inPanel,
          isFF: mvcData.flags.isFF,
          isKiosk: mvcData.flags.isKiosk
        },
        id: mvcData.sku.id,
        relatedItemHeading: 'Often bought together',
        relationshipType: 'accessories',
        processHyperMediaType: 'sku',
        processHyperMedia: true,
        subView: {
          ctlr: true,
          filterOptions: {
            category: {
              unique: true
            },
            inventory: {
              available: true
            }
          },
          name: 'BundleView'
        }
      }
    }, { timeout: 10 });

    return {
      render: '<div class="js-bundle-tab-placeholder"></div>', sViewName: 'Bundle'
    };
  };

  /**
   *
   * @param {Object} mvcData
   * @return {Object}
   */
  KioskTabsView.prototype._renderCompleteTheLook = function (mvcData) {
    ev.renderView({
      sNamespace: 'products',
      sTag: 'links',
      sViewName: 'RelatedProductView',
      elTarget: '.js-ctl-tab-placeholder',
      sOutput: 'outer',
      mParamData: {
        flags: {
          carousel: true,
          completeTheLook: true,
          inPanel: mvcData.flags.inPanel,
          isFF: mvcData.flags.isFF,
          isKiosk: mvcData.flags.isKiosk
        },
        id: mvcData.products.id,
        relatedItemHeading: 'Complete the look',
        relationshipType: 'completeTheLook',
        processHyperMediaType: 'product',
        relationshipLookup: false,
        subView: { ctlr: true, name: 'CarouselItemsView' }
      }
    }, { timeout: 10 });

    return {
      render: '<div class="js-ctl-tab-placeholder"></div>', sViewName: 'CompleteTheLook'
    };
  };

  /**
   *
   * @param {Object} mvcData
   * @return {Object}
   */
  KioskTabsView.prototype._renderOutfitBuilder = function (mvcData) {
    ev.renderView({
      sNamespace: 'products',
      sTag: 'links',
      sViewName: 'RelatedProductView',
      elTarget: '.js-outfit-tab-placeholder',
      sOutput: 'outer',
      sTemplate: relatedItemsViewWithTitleTmpl,
      mParamData: {
        flags: {
          grid: true,
          hidePrimaryVariant: true,
          inPanel: mvcData.flags.inPanel,
          isFF: mvcData.flags.isFF,
          isKiosk: mvcData.flags.isKiosk,
          outfitBuilder: true,
          showItemActions: true,
          showVariants: true
        },
        id: mvcData.products.id,
        relatedItemHeading: 'Matching items',
        relationshipType: 'outFit',
        processHyperMediaType: 'product',
        relationshipLookup: false,
        subView: { ctlr: true, name: 'OutfitItemsView' }
      }
    }, { timeout: 10 });

    return {
      render: '<div class="js-outfit-tab-placeholder"></div>', sViewName: 'OutfitBuilder'
    };
  };

  /**
   *
   * @param {Object} mvcData
   * @return {Object}
   */
  KioskTabsView.prototype._renderPromotions = function (mvcData) {
    mvcData.flags.toEqualiseHeights = true;

    ev.renderView({
      sNamespace: 'promotions',
      sTag: 'productPage',
      sViewName: 'PromotionsView',
      elTarget: '.js-promo-tab-placeholder',
      sOutput: 'outer',
      sTemplate: '#promotions-view-with-title-template',
      mParamData: { mvc: mvcData }
    }, { timeout: 10 });

    return {
      render: '<div class="js-promo-tab-placeholder"></div>', sViewName: 'PromotionsView'
    };
  };

  /**
   *
   * @param {Object} mvcData
   * @return {Object}
   */
  KioskTabsView.prototype._renderShopTheRange = function (mvcData) {
    ev.renderView({
      elTarget: '.js-range-tab-placeholder',
      mParamData: {
        flags: {
          grid: true,
          inPanel: mvcData.flags.inPanel,
          isFF: mvcData.flags.isFF,
          isKiosk: mvcData.flags.isKiosk,
          shopTheRange: true,
          showItemActions: true,
          showRatings: true
        },
        id: mvcData.sku.id,
        processHyperMedia: true,
        processHyperMediaType: 'sku',
        relatedItemHeading: 'Shop the range',
        relationshipType: 'range',
        subView: {
          ctlr: true,
          filterOptions: { inventory: { available: true } },
          name: 'OutfitItemsView'
        }
      },
      sNamespace: 'sku',
      sOutput: 'outer',
      sTag: 'links',
      sTemplate: relatedItemsViewWithTitleTmpl,
      sViewName: 'RelatedSKUView'
    }, { timeout: 10 });

    return {
      render: '<div class="js-range-tab-placeholder"></div>', sViewName: 'ShopTheRange'
    };
  };

  /**
   *
   * @return {void}
   */
  KioskTabsView.prototype._bindEvents = function () {
    $(this.oElms.tabOverview).on(
      'click',
      this._onOverviewTabClick.bind(this)
    );

    $(window)
      .on('panelGroupOpen', this._setOverlayActiveState.bind(this))
      .on('panelGroupClosed', this._unsetOverlayActiveState.bind(this))
      .on('triggerKioskTab', this._triggerKioskTab.bind(this));
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  KioskTabsView.prototype._onOverviewTabClick = function (e) {
    fn.createEvent({
      name: 'closeOpenPanels',
      propName: 'oData',
      data: { oClickEvent: e, oView: this, sTag: this.sTag }
    }).fire();
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  KioskTabsView.prototype._setOverlayActiveState = function (e) {
    var IS_ACTIVE = 'is-active';

    if (e.oData.sTag === this.sTag) {
      $(this.oElms.tabOverview).removeClass(IS_ACTIVE);
    }
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  KioskTabsView.prototype._unsetOverlayActiveState = function (e) {
    var IS_ACTIVE = 'is-active';

    if (e.oData.sTag === this.sTag) {
      $(this.oElms.tabOverview).addClass(IS_ACTIVE);
    }
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  KioskTabsView.prototype._triggerKioskTab = function (e) {
    if (e.sViewName) {
      $('.js-tab-' + e.sViewName).trigger('click');
    }
  };

  module.exports = KioskTabsView;
});
