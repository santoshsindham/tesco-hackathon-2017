define('modules/pdp/views/BuyboxView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/PrimarySellerView',
  'modules/pdp/views/SellerSummariesView',
  'modules/pdp/views/WishlistsView'
], function (
  $,
  fn,
  BaseView,
  PrimarySellerView,
  SellerSummariesView,
  WishlistsView
) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function BuyboxView(config) {
    this.sNamespace = 'sku';
    this.sTag = 'buybox';
    this.sViewName = 'BuyboxView';
    this.sViewClass = 'buybox-view';
    this.sTemplate = $('#buybox-view-template')[0].innerHTML;
    this.views = {
      classes: {
        PrimarySellerView: PrimarySellerView,
        SellerSummariesView: SellerSummariesView
      }
    };
    this.parent.constructor.call(this, config);
  }

  fn.inherit(BuyboxView, BaseView);
  BuyboxView._name = 'BuyboxView';
  BuyboxView.sNamespace = 'sku';
  BuyboxView.sTag = 'buybox';

  BuyboxView.prototype._setData = function (params) {
    this.parent._setData.call(this, params);
    this._setRefreshPoint();
  };

  BuyboxView.prototype._addSubViews = function () {
    this.oData.aSubViews.push(
      this._compileSubView({
        _class: PrimarySellerView,
        data: this.oModel.getPrimarySeller(this.oData.mvc.sku.id),
        force: true
      })
    );

    this.oData.aSubViews.push(
      this._compileSubView({
        _class: SellerSummariesView,
        data: this.oModel.getSecondarySellers(this.oData.mvc.sku.id),
        ctlr: true
      })
    );

    if (!this.oData.mvc.flags.isKiosk) {
      this.oData.aWishlistsView = this.oData.aWishlistsView === undefined
          ? [] : this.oData.aWishlistsView;
      this.oData.aWishlistsView.push(
        this._compileSubView({
          _class: WishlistsView,
          ctlr: true
        })
      );
    }
  };

  BuyboxView.prototype._cacheDomElms = function () {
    var $Selector = $(this.sSelector),
      $WhyPartnersLink = $Selector.find('.why-sellers-wrapper > a');

    this.parent._cacheDomElms.call(this);
    this.oElms.elBuyboxWrapper = $Selector.closest('.buybox-wrapper')[0];
    this.oElms.elWhyPartnersLink = $WhyPartnersLink.length > 0
        ? $WhyPartnersLink[0]
        : null;
  };

  BuyboxView.prototype._bindEvents = function () {
    var _oData = { sTag: 'buybox', parentClose: true },
      MASKS = '.buybox-mask-media-player, .buybox-mask-buybox-content';

    this.bindEvent({
      name: 'showBuyboxMask',
      target: window,
      method: this._showMask
    });

    this.bindEvent({
      name: 'hideBuyboxMask',
      target: window,
      method: this._hideMask
    });

    $(MASKS).on('click', function closeBuyBoxPanel() {
      fn.createEvent({
        name: 'closeOpenPanels',
        propName: 'oData',
        data: _oData
      }).fire();
    });

    $(this.oElms.elWhyPartnersLink).on(
      'click',
      this._onWhyPartnersLinkClick.bind(this)
    );
  };

  BuyboxView.prototype._showMask = function (oEvent) {
    var WITH_LOADER = 'with-bkg-loader',
      IS_ACTIVE = 'is-active',
      MEDIA_PLAYER_MASK = '.buybox-mask-media-player',
      BUYBOX_PLAYER_MASK = '.buybox-mask-buybox-content',
      maskOptions = oEvent.oData.options,
      maskSelectors = '';

    if (maskOptions.mask === 'mediaPlayer') {
      maskSelectors = MEDIA_PLAYER_MASK;
    } else if (maskOptions.mask === 'buybox') {
      maskSelectors = BUYBOX_PLAYER_MASK;
    } else {
      maskSelectors = MEDIA_PLAYER_MASK + ', ' + BUYBOX_PLAYER_MASK;
    }

    $(maskSelectors).addClass(IS_ACTIVE);

    if (maskOptions.loader) {
      $(maskSelectors).addClass(WITH_LOADER);
    }
  };

  BuyboxView.prototype._hideMask = function (oEvent) {
    var WITH_LOADER = 'with-bkg-loader',
      IS_ACTIVE = 'is-active',
      MEDIA_PLAYER_MASK = '.buybox-mask-media-player',
      BUYBOX_PLAYER_MASK = '.buybox-mask-buybox-content',
      maskOptions = oEvent.oData.options,
      maskSelectors = '';

    if (maskOptions.unmask === 'mediaPlayer') {
      maskSelectors = MEDIA_PLAYER_MASK;
    } else if (maskOptions.unmask === 'buybox') {
      maskSelectors = BUYBOX_PLAYER_MASK;
    } else {
      maskSelectors = MEDIA_PLAYER_MASK + ', ' + BUYBOX_PLAYER_MASK;
    }

    if (maskOptions.loader) {
      $(maskSelectors).removeClass(WITH_LOADER);
    }

    $(maskSelectors).removeClass(IS_ACTIVE);
  };

  /**
   * Click event handler for the WhyPartners link, which creates/opens an overlay.
   * @param {Object} oEvent The jquery event object.
   * @return {void}
   */
  BuyboxView.prototype._onWhyPartnersLinkClick = function (oEvent) {
    this.compileAndRenderOverlay({
      sTag: 'whyPartners',
      sClassNames: 'why-partners-overlay small-lightbox',
      elTrigger: oEvent.currentTarget,
      sProp: 'text'
    }, oEvent);
  };

  return BuyboxView;
});
