define('modules/pdp/views/GiftMessageView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  /**
   * The view class that renders the gift message.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function GiftMessageView(oConfig) {
    this.sViewName = 'GiftMessageView';
    this.sNamespace = 'products';
    this.sTag = 'giftMessage';
    this.sViewClass = 'gift-message-view';
    this.sTemplate = $('#gift-message-view-template')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(GiftMessageView, BaseView);

  GiftMessageView._name = 'GiftMessageView';
  GiftMessageView.sNamespace = 'product';

  return GiftMessageView;
});
