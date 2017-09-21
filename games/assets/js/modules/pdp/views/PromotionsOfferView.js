define('modules/pdp/views/PromotionsOfferView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  /**
   * The view class that renders the promotions.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function PromotionsOfferView(oConfig) {
    this.sViewName = 'PromotionsOfferView';
    this.sNamespace = 'promotions';
    this.sTag = 'offer';
    this.sViewClass = 'promotions-offer';
    this.sTemplate = $('#promotions-offer-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(PromotionsOfferView, BaseView);

  PromotionsOfferView._name = 'PromotionsOfferView';
  PromotionsOfferView.sNamespace = 'promotions';
  PromotionsOfferView.sTag = 'offer';

  PromotionsOfferView.prototype._setData = function () {
    this.oData.sToggleClass = (this.oData.mvc.promotions.description !== ''
        || this.oData.mvc.promotions.linkSaveURL !== ''
        || this.oData.mvc.promotions.customerInstructions !== '')
            ? 'fnToggleDescription'
            : '';
  };

  PromotionsOfferView.prototype.refresh = function (params) {
    this.render({
      sourceOutput: 'inner',
      sOutput: 'inner',
      elTarget: 'self',
      mParamData: params.mParamData
    });
  };

  return PromotionsOfferView;
});
