define('modules/pdp/views/PromotionsView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/PromotionsOfferView',
  'modules/toggle-expand-collapse/common'
], function ($, fn, BaseView, PromotionsOfferView, ToggleExpandCollapse) {
  'use strict';

  /**
   * The view class that renders the promotions.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function PromotionsView(oConfig) {
    this.sViewName = 'PromotionsView';
    this.sNamespace = 'promotions';
    this.sTag = oConfig.sTag || '_default';
    this.sViewClass = oConfig.sViewClass || 'buybox-promotions-wrapper';
    this.sTemplate = oConfig.sTemplate
        ? $(oConfig.sTemplate)[0].innerHTML
        : $('#promotions-view-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  }


  fn.inherit(PromotionsView, BaseView);
  PromotionsView._name = 'PromotionsView';
  PromotionsView.sNamespace = 'promotions';


  PromotionsView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);

    this.oElms.title = $wrapper.find('.block-title') || null;
    this.oElms.containerTop = $wrapper.find('.special-offer-container-top');
    this.oElms.elPromoLink = $wrapper.find('.offer-cta a')[0];
  };


  PromotionsView.prototype._setData = function (args) {
    var counter = 1;

    this.parent._setData.call(this, args);

    this.oData.fnOddEvenClass = function () {
      var oddEvenClass = counter % 2 === 0 ? 'even' : 'odd';

      counter += 1;
      return oddEvenClass;
    };

    if (!fn.isArray(this.oData.mvc.promotions)) {
      this.oData.mvc.promotions = [];
    }

    this.oData.promoCount = this.oData.mvc.promotions.length;
    this.oData.title = this.oData.promoCount === 1
        ? this.oData.promoCount + ' Special offer'
        : this.oData.promoCount + ' Special offers';
  };


  PromotionsView.prototype._addSubViews = function () {
    this.forLoop(this.oData.mvc.promotions, function (i) {
      this.oData.aSubViews.push(
        this._compileSubView({ _class: PromotionsOfferView, range: i })
      );
    });
  };


  PromotionsView.prototype._initDependancies = function () {
    if (this.iSubViewCount > 1) {
      if (this.oData.mvc.flags.toEqualiseHeights) {
        $(this.oElms.containerTop)
          .removeAttr('style')
          .equaliseHeights();
      }

      this.oToggleExpandCollapse = new ToggleExpandCollapse({
        sToggleContainer: this.oElms.elWrapper,
        sToggleElementParent: '.fnToggleDescription',
        sToggleTriggerElement: '.special-offer-container-top',
        bAccordionEnabled: true
      });
      this.oToggleExpandCollapse.init();
    }
  };


  PromotionsView.prototype.refresh = function (params) {
    var _params = params;

    this.oData.aSubViews = [];

    if (this.oData.mvc.flags.toEqualiseHeights) {
      _params.mParamData.mvc.flags = { toEqualiseHeights: true };
    }

    this.render({
      sourceOutput: 'inner',
      sOutput: 'inner',
      elTarget: 'self',
      mParamData: _params.mParamData
    });

    this._cacheDomElms();

    if (this.oData.mvc.flags.toEqualiseHeights) {
      $(this.oElms.containerTop)
        .removeAttr('style')
        .equaliseHeights();
    }
  };

  return PromotionsView;
});
