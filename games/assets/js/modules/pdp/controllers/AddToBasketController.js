define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    FormHandlerController = require('modules/pdp/controllers/FormHandlerController'),
    AddToBasketView = require('modules/pdp/views/AddToBasketView'),
    analytics = require('modules/tesco.analytics'),
    kmfIO = require('modules/chip-and-pin/kmf-io'),
    googleEC = require('modules/google-analytics/pdpTracking'),
    recommenders = require('modules/recommenders/common');

  /**
   *
   * @param {Array<Object>} models
   * @param {Object} options
   * @return {void}
   */
  function AddToBasketController(models, options) {
    this.sTag = 'addToBasket';
    this.oTooltipStyles = {
      kiosk: ['tooltip-left'],
      allDesktops: ['tooltip-left'],
      allDevices: ['tooltip-bottom']
    };
    this.views = { classes: { AddToBasketView: AddToBasketView } };
    this.parent.constructor.call(this, models, options);
  }

  fn.inherit(AddToBasketController, FormHandlerController);
  AddToBasketController.modelNames = ['formHandler'];

  /**
   *
   * @param {Object} res
   * @return {void}
   */
  AddToBasketController.prototype._analyticsTracking = function (res) {
    var baseValue = '',
      customerOriginRRData = recommenders.richRelevanceOriginAnalyticsHandler(),
      flags = fn.getValue(this._activeView, 'oData', 'mvc', 'flags'),
      isPDP = this.pageGroup === 'productDetails',
      isPLP = this.pageGroup === 'listings',
      message = '',
      variantOne = '',
      variantTwo = '',
      v = [],
      webAnalytics = null;

    if (isPDP && !flags.inBasketOverlay) baseValue = 'pdp';
    if (isPDP && flags.inBasketOverlay) baseValue = 'basket overlay';
    if (isPLP && !flags.inBasketOverlay) baseValue = 'plp';
    if (isPLP && flags.inBasketOverlay) baseValue = 'basket overlay';

    if (isPDP && (flags.bundle)) variantOne = 'bundle';
    if (isPDP && flags.carousel) variantOne = 'carousel';
    if (isPDP && flags.grid) variantOne = 'grid';

    if (isPLP && this.pageType === 'Category') variantOne = 'catalogue';
    if (isPLP && this.pageType === 'Search') variantOne = 'search';

    if (isPDP && flags.outfitBuilder) variantTwo = 'outfit builder';
    if (isPDP && flags.shopTheRange) variantTwo = 'shop the range';
    if (isPDP && flags.fbt) variantTwo = 'fbt';
    if (isPDP && flags.linksave) variantTwo = 'linksave';
    if (isPDP && flags.accessories) variantTwo = 'accessories';
    if (isPDP && flags.completeTheLook) variantTwo = 'complete the look';

    message = baseValue;
    if (variantOne) message += ':' + variantOne;
    if (variantTwo) message += ':' + variantTwo;

    v = [{
      eVar45: 'add to basket',
      eVar59: message,
      eVar61: message,
      events: res[0].events + ',event32,event45',
      products: res[0].products && isPDP ? res[0].products + '|eVar61=' + message : res[0].products,
      prop19: 'add to basket',
      prop42: message
    }];

    if (customerOriginRRData !== null) {
      v[0].linkTrackVars = 'prop39,eVar49,eVar61';
      v[0].list3 = customerOriginRRData;
      v[0].prop39 = 'rich releance ' + baseValue + ' clickthrough';
      v[0].eVar49 = 'prop39';
      v[0].eVar61 = baseValue + ' - rich relevance';
    }

    webAnalytics = new analytics.WebMetrics();
    webAnalytics.submit($.extend(true, [{}], res, v));
  };

  /**
   *
   * @return {void}
   */
  AddToBasketController.prototype._bindLegacyAddToBasket = function () {
    var _this = this;

    $(this.pageEventDelegator).on('click', 'input[type=submit].add-to-basket', function (e) {
      e.preventDefault();
      _this._onLegacyAddToBasket(e);
    });
  };

  /**
   *
   * @param {Object} args
   * @return {void}
   */
  AddToBasketController.prototype._bindViewEvents = function (args) {
    var view = args.oView,
      elms = view.oElms;

    $(elms.elWrapper).on('click', 'button', { view: view }, this._onAddToBasket.bind(this));

    if (!elms.elQtyInput) {
      return;
    }

    $(elms.elWrapper)
      .on('change', 'input.product-quantity', { view: view }, this._onQuantityChange.bind(this))
      .on('keyup', 'input.product-quantity', { view: view }, this._onQuantityKeyup.bind(this))
      .on('keypress', 'input.product-quantity', { view: view }, this._handleQuantityKeypress.bind(this));
  };

  /**
   *
   * @return {JQueryObject}
   */
  AddToBasketController.prototype._getLegacyFormSelector = function () {
    var selector = '';

    switch (this.pageGroup) {
      case 'listings':
        selector = '[id^=addToBasket_PLP_]';
        break;
      case 'productDetails':
        selector = '#addBundleTobasket';
        break;
      // no default
    }

    return selector;
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  AddToBasketController.prototype._handleQuantityKeypress = function (e) {
    if (e.which === 13) {
      e.preventDefault();
      this._onQuantityChange(e);
      this._onAddToBasket(e);
      $(e.currentTarget).blur();
    }
  };

  /**
   *
   * @return {void}
   */
  AddToBasketController.prototype._initDependancies = function () {
    this._bindLegacyAddToBasket();
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  AddToBasketController.prototype._onAddToBasket = function (e) {
    var formHdlrModel = this.models.formHandler,
      view = e.data.view;

    $(view.oElms.elSubmitBtn).addClass('submitting');
    this._activeView = view;

    formHdlrModel.send({
      oPromise: {
        sSearchKey: $(view.oElms.elSubmitBtn).data('mvc-key'),
        mSearchValue: $(view.oElms.elSubmitBtn).data('mvc-value')
      },
      fnDoneCallback: this._onAddToBasketSuccess.bind(this),
      fnFailCallback: this._onAddToBasketFailure.bind(this)
    });
  };

  /**
   *
   * @param {string} err
   * @param {Object} jqXHR
   * @return {void}
   */
  AddToBasketController.prototype._onAddToBasketFailure = function (err, jqXHR) {
    var elms = this._activeView.oElms;

    fn.createEvent({
      name: 'addToBasketFailure',
      propName: 'oData',
      data: jqXHR
    }).fire();

    this.createTooltip({
      sTooltopMessage: err,
      elTrigger: elms.elQtyInput || elms.elSubmitBtn,
      sType: 'error'
    });

    $(elms.elSubmitBtn).removeClass('submitting');
  };

  /**
   *
   * @param {Object} res
   * @return {void}
   */
  AddToBasketController.prototype._onAddToBasketSuccess = function (res) {
    var mvcData = this._activeView.oData.mvc,
      elms = this._activeView.oElms,
      quanityAdded = 0,
      basketQuantity = 0;

    if (res.hasOwnProperty('success')) {
      fn.createEvent({
        name: 'addToBasketSuccess',
        namespace: this._activeView.id,
        propName: 'oData',
        data: res
      }).fire();

      quanityAdded = res.success.data.itemsAdded.quantity;
      basketQuantity = res.success.data.basket.total;
      kmfIO.enableBasketButton(basketQuantity);

      if (res.success.data) {
        fn.createEvent({
          name: 'dataFetched',
          propName: 'oData',
          data: { mfetchedData: res.success.data }
        }).fire();
      }

      googleEC.setAnalytics(res.success.data.itemsAdded.items, 'addToBasket');
      this._analyticsTracking(res.success.analytics);

      this.renderOverlay({
        sTag: 'basketOverlay',
        sClassNames: 'basket-overlay with-header',
        oStyles: {
          allDesktops: ['lightbox', 'fullScreen'],
          allDevices: ['slideIn-left', 'fullScreen']
        },
        sTitle: quanityAdded > 1
            ? '<strong>' + quanityAdded + ' items</strong> added to basket'
            : '<strong>' + quanityAdded + ' item</strong> added to basket',
        sOverlayContent: res.success.html,
        toDestroyOnClose: true,
        forceUpdateActive: true,
        callback: function overlayRenderedCallback() {
          var skuData = mvcData.sku,
            e = null;

          if (fn.getValue(skuData, 'personalisation', 'isPersonalised')) {
            e = $.Event('resetPersonalisation');
            e.oData = { skuId: skuData.id };
            $(window).trigger(e);
          }
        }
      });
    } else {
      fn.createEvent({
        name: 'addToBasketFailure',
        propName: 'oData',
        data: res
      }).fire();

      this.createTooltip({
        sTooltopMessage: res.failure.message,
        elTrigger: elms.elQtyInput || elms.elSubmitBtn,
        sType: 'error'
      });
    }

    $(elms.elSubmitBtn).removeClass('submitting');
  };

  /**
   *
   * @private
   * @param {JQueryEvent} e
   * @return {void}
   */
  AddToBasketController.prototype._onLegacyAddToBasket = function (e) {
    var $submit = $(e.currentTarget);
    var selector = this._getLegacyFormSelector();
    var $form = $submit.closest(selector);
    if (!$form.length) return;
    var formHdlrModel = this.models.formHandler;
    var data = formHdlrModel.serialize($form[0]);
    formHdlrModel.add(data);

    var view = {
      id: fn.createId(),
      oData: { mvc: { flags: {} } },
      oElms: { elSubmitBtn: $submit[0] }
    };

    if (selector === '#addBundleTobasket') {
      view.oData.mvc.flags.linksave = true;
      view.oData.mvc.flags.bundle = true;
    } else {
      view.oData.mvc.flags.listingTile = true;
    }

    $submit
      .data('mvc-key', 'id')
      .data('mvc-value', data.name);

    e.data = { view: view };
    this._onAddToBasket(e);
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  AddToBasketController.prototype._onQuantityChange = function (e) {
    var formHdlrModel = this.models.formHandler,
      view = e.data.view,
      elms = view.oElms;

    formHdlrModel.update({
      sSearchKey: $(elms.elSubmitBtn).data('mvc-key'),
      mSearchValue: $(elms.elSubmitBtn).data('mvc-value'),
      sUpdateKey: 'oData',
      mUpdateValue: null,
      sUpdatePropKey: $(elms.elQtyInput).data('mvc-key'),
      mUpdatePropValue: elms.elQtyInput.value
    });
  };

  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  AddToBasketController.prototype._onQuantityKeyup = function (e) {
    var MESSAGE = 'Please enter a valid number.',
      view = e.data.view,
      regex = /^([0-9]+)$|^$/,
      value = view.oElms.elQtyInput.value;

    if (!value.match(regex)) {
      this.createTooltip({
        sTooltopMessage: MESSAGE,
        elTrigger: view.oElms.elQtyInput,
        sType: 'error'
      });
    } else if (this._activePanel.tooltip) {
      this._activePanel.tooltip.close();
    }
  };

  module.exports = AddToBasketController;
});
