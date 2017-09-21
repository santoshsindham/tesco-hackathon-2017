define('modules/pdp/views/DeliverySnippetView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/BuyboxPanelGroupView',
  'modules/pdp/views/BuyboxPanelView',
  'modules/pdp/views/DeliveryDetailsView',
  'text!templates/views/DeliverySnippetView.html'
], function (
  $,
  fn,
  BaseView,
  BuyboxPanelGroupView,
  BuyboxPanelView,
  DeliveryDetailsView,
  template
) {
  'use strict';

  /**
   * The view class that renders the delivery options snippet in the buybox.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function DeliverySnippetView(oConfig) {
    this.sViewName = 'DeliverySnippetView';
    this.sNamespace = 'deliveryOptions';
    this.sTag = 'snippet';
    this.sViewClass = 'delivery-snippet-wrapper';
    this.sTemplate = template;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(DeliverySnippetView, BaseView);

  DeliverySnippetView._name = 'DeliverySnippetView';
  DeliverySnippetView.sNamespace = 'deliveryOptions';
  DeliverySnippetView.sTag = 'snippet';

  DeliverySnippetView.prototype._setData = function (params) {
    var doLength = 0;

    this.parent._setData.call(this, params);

    if (this.isArray(this.oData.mvc.deliveryOptions, true)) {
      doLength = this.oData.mvc.deliveryOptions.length - 1;
      this.oData.mvc.custom.deliveryOptions = { moreOptionsText: '' };

      if (doLength === 1) {
        this.oData.mvc.custom.deliveryOptions.moreOptionsText = doLength + ' more option';
      } else if (doLength > 1) {
        this.oData.mvc.custom.deliveryOptions.moreOptionsText = doLength + ' more options';
      }
    }
  };

  DeliverySnippetView.prototype._bindEventsPreRender = function () {
    this.bindEvent({
      name: 'disableCountdownClock',
      namespace: this.oData.mvc.sellers.id,
      target: window,
      method: this._onDisableCountdownClock
    });

    this.bindEvent({
      name: 'enableCountdownClock',
      namespace: this.oData.mvc.sellers.id,
      target: window,
      method: this._onEnableCountdownClock
    });
  };

  DeliverySnippetView.prototype._cacheDomElms = function () {
    var COUNTDOWN = '.countdown-message',
      COUNTDOWN_TEXT = '.countdown-message-text',
      OPTION_TEXT = '.delivery-options-text';

    this.parent._cacheDomElms.call(this);
    this.oElms.elOptionText = $(this.oElms.elWrapper).find(OPTION_TEXT)[0];
    this.oElms.elCountdown = $(this.oElms.elWrapper).find(COUNTDOWN)[0];
    this.oElms.elCountdownText = $(this.oElms.elWrapper).find(COUNTDOWN_TEXT)[0];
  };

  DeliverySnippetView.prototype._onDisableCountdownClock = function () {
    this._disableCountdownClock();
  };

  DeliverySnippetView.prototype._onEnableCountdownClock = function (event) {
    if (this.oElms.elCountdownText) {
      this._enableCountdownClock({
        element: this.oElms.elCountdownText,
        countdown: event.oData.countdown,
        clock: event.oData.clock
      });
    } else {
      this._pendingCountdownClock = function (element) {
        this._enableCountdownClock({
          element: element,
          countdown: event.oData.countdown,
          clock: event.oData.clock
        });
      };
    }
  };

  DeliverySnippetView.prototype._enableCountdownClock = function (params) {
    var _this = this,
      hasCountdown = false,
      COUNTDOWN_CLASS = 'with-countdown';

    hasCountdown = params.countdown.show({ element: params.element });

    if (hasCountdown) {
      if ($(params.element).find('time').length) {
        params.clock.init({
          element: $(params.element).find('time')[0],
          onEnd: function () {
            _this._disableCountdownClock();
          }
        });
        $(this.oElms.elWrapper).addClass(COUNTDOWN_CLASS);
      }
    }
  };

  DeliverySnippetView.prototype._disableCountdownClock = function () {
    var COUNTDOWN_CLASS = 'with-countdown';

    $(this.oElms.elWrapper).removeClass(COUNTDOWN_CLASS);
  };

  DeliverySnippetView.prototype._initDependancies = function () {
    this._getEligibleCountdown();
    this._getBuyboxPanelGroup();
  };

  DeliverySnippetView.prototype._getEligibleCountdown = function () {
    var _this = this;

    if (this._pendingCountdownClock) {
      this._pendingCountdownClock(this.oElms.elCountdownText);
      this._pendingCountdownClock = null;
    } else {
      this.setEvent({
        sName: 'getEligibleCountdown',
        sNamespace: this.oData.mvc.sellers.id,
        callback: function (options) {
          _this._enableCountdownClock({
            element: _this.oElms.elCountdownText,
            countdown: options.countdown,
            clock: options.clock
          });
        }
      }, true, true);
    }
  };

  DeliverySnippetView.prototype._getBuyboxPanelGroup = function () {
    var _this = this;

    this.setEvent({
      sName: 'getPanelGroup',
      tag: 'buybox',
      callback: function (panelGroup) {
        if (!panelGroup) {
          _this._createBuyboxPanels();
        } else {
          _this._addBuyboxPanel(panelGroup, {
            output: 'prepend',
            target: panelGroup.oElms.elWrapper,
            render: true
          });
        }
      }
    }, false, true);
  };

  DeliverySnippetView.prototype._createBuyboxPanels = function () {
    var panelGroup = new BuyboxPanelGroupView({
      sTag: 'buybox',
      elTarget: '.buybox-wrapper'
    });

    this._addBuyboxPanel(panelGroup);
    panelGroup.render();
  };

  DeliverySnippetView.prototype._addBuyboxPanel = function (panelGroup, options) {
    var _options = options || {},
      panel = {},
      deliveryOptions = fn.getValue(this, 'oData', 'mvc', 'deliveryOptions') || [];

    if (this._isResiliencyDelivery(deliveryOptions)) {
      return;
    }
    panel = panelGroup.createSubView({
      ViewClass: BuyboxPanelView,
      mParamData: {
        sOutput: _options.output,
        elTarget: _options.target,
        elTrigger: this.oElms.elWrapper,
        oData: {
          sClassNames: 'info-panel-delivery-details',
          sTitle: 'Delivery details',
          aSubViews: [this._compileSubView({ _class: DeliveryDetailsView })]
        },
        iSubViewCount: 1
      }
    });

    if (_options.render) {
      panel.render();
    }
  };

  DeliverySnippetView.prototype._isResiliencyDelivery = function (options) {
    return !fn.isArray(options) || !options.length || options[0].isResiliency;
  };

  return DeliverySnippetView;
});
