define('modules/pdp/views/BuyboxContentView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/ProductPriceView',
  'modules/pdp/views/VariantsView',
  'modules/pdp/views/ItemActionsView',
  'modules/pdp/views/EventMessageView',
  'modules/pdp/views/DeliverySnippetView',
  'modules/pdp/views/StoreStockCheckView',
  'modules/pdp/views/PromotionsView',
  'modules/pdp/views/GiftMessageView'
], function (
  $,
  fn,
  BaseView,
  ProductPriceView,
  VariantsView,
  ItemActionsView,
  EventMessageView,
  DeliverySnippetView,
  StoreStockCheckView,
  PromotionsView,
  GiftMessageView
) {
  'use strict';

  /**
   *
   * @param {Object} oConfig
   * @return {void}
   */
  function BuyboxContentView(oConfig) {
    this.sNamespace = 'sellers';
    this.sTag = 'buyboxContent';
    this.sViewName = 'BuyboxContentView';
    this.sViewClass = 'buybox-content-view';
    this.sTemplate = $('#buybox-template-buybox-content')[0].innerHTML;
    this.views = {
      classes: {
        ProductPriceView: ProductPriceView,
        VariantsView: VariantsView,
        ItemActionsView: ItemActionsView,
        EventMessageView: EventMessageView,
        DeliverySnippetView: DeliverySnippetView,
        StoreStockCheckView: StoreStockCheckView,
        PromotionsView: PromotionsView,
        GiftMessageView: GiftMessageView
      }
    };
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(BuyboxContentView, BaseView);

  BuyboxContentView._name = 'BuyboxContentView';
  BuyboxContentView.sNamespace = 'sellers';
  BuyboxContentView.sTag = 'buyboxContent';

  BuyboxContentView.prototype._cacheDomElms = function () {
    this.parent._cacheDomElms.call(this);
    this.oElms.partnerInfoIcon = $(this.oElms.elWrapper).find('.partner-info-icon')[0] || null;
    this.oElms.addOnItemIcon = $(this.oElms.elWrapper).find('.add-on-item')[0] || null;
  };

  BuyboxContentView.prototype._bindEvents = function () {
    if (this.oElms.partnerInfoIcon) {
      $(this.oElms.partnerInfoIcon).on(
        'click',
        this._openPartnerInfoTooltip.bind(this)
      );
    }
    if (this.oData.state.hasAddOnItem) {
      $(this.oElms.addOnItemIcon).on(
        'click',
        this._openAddOnItemInfoTooltip.bind(this)
      );
    }
  };

  BuyboxContentView.prototype._setData = function (args) {
    var cacheCow = {};

    this.parent._setData.call(this, args);

    if (this.toRenderProductPrice({ cacheCow: cacheCow })) {
      this.oData.views = {
        ProductPriceView: this._compileSubView({
          _class: this.views.classes.ProductPriceView,
          namespace: cacheCow.hasSellerPrices ? 'sellers' : 'products',
          className: 'with-large-price with-saving-inline',
          state: { showSavings: true, showPoints: true }
        })
      };
    }
  };

  BuyboxContentView.prototype.toRenderProductPrice = function (args) {
    var _args = args,
      hasCacheCow = this.isObject(_args.cacheCow),
      isFF = this.oData.mvc.flags.isFF,
      isSkuSelected = this.oData.mvc.flags.isSkuSelected,
      hasSeller = this.isObject(this.oData.mvc.sellers, true),
      hasSellerPrices = hasSeller && this.isObject(this.oData.mvc.sellers.prices, true),
      hasProduct = this.isObject(this.oData.mvc.products, true),
      hasProductPrices = hasProduct && this.isObject(this.oData.mvc.products.prices, true);

    if ((isSkuSelected || !isFF) && hasSeller && hasSellerPrices) {
      if (hasCacheCow) {
        _args.cacheCow.hasSellerPrices = hasSellerPrices;
      }
      return true;
    }

    if (hasProduct && hasProductPrices) {
      if (hasCacheCow) {
        _args.cacheCow.hasProductPrices = hasProductPrices;
      }
      return true;
    }

    return false;
  };

  BuyboxContentView.prototype._setProps = function (data) {
    var flags = data.flags || {},
      productData = data.products || {},
      sellerData = data.sellers || {},
      skuData = data.sku || {},
      hasPrices = this.isObject(productData, true) && this.isObject(productData.prices, true)
          && !productData.prices.error,
      hasSellerData = this.isObject(data.sellers, true),
      isSkuSelected = flags.isSkuSelected;

    return {
      stockMessageText: hasSellerData && sellerData.stockMessaging.messageText,
      stockSchemaHref: hasSellerData && sellerData.stockMessaging.schemaHref,
      stockMessageClass: hasSellerData && sellerData.stockMessaging.messageClass,
      name: hasSellerData && sellerData.name,
      staticImagePath: hasSellerData && sellerData.staticImagePath,
      clubcardPoints: (!isSkuSelected && hasPrices && productData.prices.clubcardPoints)
          || (hasSellerData && sellerData.prices.clubcardPoints),
      hookLogic: data.hooklogic,
      releaseDate: skuData.commercialReleaseDateFormatted,
      minimumAge: productData.minimumAgeRequired
    };
  };

  BuyboxContentView.prototype._setStates = function (data) {
    var flags = data.flags || {},
      productData = data.products || {},
      sellerData = data.sellers || {},
      skuData = data.sku || {},
      hasPrices = this.isObject(productData, true) && this.isObject(productData.prices, true)
          && !productData.prices.error,
      hasSellerData = this.isObject(data.sellers, true),
      isSkuSelected = flags.isSkuSelected,
      hasClubcardPointsData = (!isSkuSelected && hasPrices && !!productData.prices.clubcardPoints)
          || (hasSellerData && !!sellerData.prices.clubcardPoints);

    return {
      isPartner: hasSellerData && sellerData.name.length > 0 && sellerData.name !== 'Tesco',
      hasFromPrice: !isSkuSelected && hasPrices && !!productData.prices.fromPrice,
      hasSeller: hasSellerData,
      noListings: !hasSellerData && !hasPrices,
      hasStockMessage: hasSellerData && !!sellerData.stockMessaging.messageText,
      hasClubcardPoints: hasClubcardPointsData,
      isBoost: hasSellerData && sellerData.isBCVE && hasClubcardPointsData,
      hasHookLogic: !!data.hooklogic,
      hasReleaseDate: !!skuData.commercialReleaseDateFormatted,
      hasMinimumAge: !!productData.minimumAgeRequired,
      hasAddOnItem: !!sellerData.addOnMessage
    };
  };

  BuyboxContentView.prototype._addSubViews = function () {
    if (this.oData.mvc.flags.isPrimarySeller) {
      this.oData.aSubViews.push(
        this._compileSubView({
          _class: this.views.classes.VariantsView,
          ctlr: true
        })
      );
    }

    this.oData.aSubViews.push(
      this._compileSubView({ _class: this.views.classes.ItemActionsView })
    );

    if (this.oData.mvc.products.giftMessagingEnabled) {
      this.oData.aSubViews.push(
        this._compileSubView({ _class: this.views.classes.GiftMessageView })
      );
    }

    if (this.isObject(this.oData.mvc.sellers, true)) {
      this.oData.aSubViews.push(
        this._compileSubView({ _class: this.views.classes.EventMessageView, ctlr: true })
      );

      this.oData.aSubViews.push(
        this._compileSubView({ _class: this.views.classes.DeliverySnippetView, ctlr: true })
      );

      if (!this.oData.mvc.flags.isKiosk && this.oData.mvc.sellers.enableStockServiceCallPdpV2
        && this.oData.mvc.sku.rangedInStore && this.oData.mvc.flags.isSkuSelected
        && this.oData.mvc.sellers.buyBoxMessage.toLowerCase().indexOf('preorder') === -1) {
        this.oData.aSubViews.push(
          this._compileSubView({ _class: this.views.classes.StoreStockCheckView, ctlr: true })
        );
      }

      if (!this.oData.mvc.flags.isPrimarySeller
          && this.isArray(this.oData.mvc.sellers.promotions, true)) {
        this.oData.aSubViews.push(
          this._compileSubView({ _class: this.views.classes.PromotionsView })
        );
      }
    }
  };

  BuyboxContentView.prototype._openPartnerInfoTooltip = function () {
    var name = this.oData.mvc.sellers.name,
      partnerUrl = this.oData.mvc.sellers.partnerUrl,
      message = 'We\'ve carefully chosen all our Tesco Partners to give you even more '
          + 'choice. Read more about <a href="' + partnerUrl + '">' + name + '</a>.';

    this.createTooltip({
      sTooltopMessage: message,
      elTrigger: this.oElms.partnerInfoIcon
    });
  };

  BuyboxContentView.prototype._openAddOnItemInfoTooltip = function () {
    var addOnItemMsg = this.oData.mvc.sellers.addOnMessage;

    this.createTooltip({
      sTooltopMessage: addOnItemMsg,
      elTrigger: this.oElms.addOnItemIcon
    });
  };

  return BuyboxContentView;
});
