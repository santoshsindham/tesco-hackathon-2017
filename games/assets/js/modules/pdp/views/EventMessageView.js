define('modules/pdp/views/EventMessageView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/product-description/eventMessagingCountDown'
], function ($, fn, BaseView, eventMessagingCountDown) {
  'use strict';

  /**
   * Event messaging view constructor sets view's core data and calls parent constructor.
   * @param {Object} oConfig The configuration to populate the view's dynamic properties.
   * @return {void}
   */
  function EventMessageView(oConfig) {
    this.sViewName = 'EventMessageView';
    this.sNamespace = 'sellers';
    this.sTag = 'events';
    this.sViewClass = 'event-message-wrapper';
    this.sTemplate = $('#buybox-template-event-messaging')[0].innerHTML;
    this.parent.constructor.call(this, oConfig);
    this.initEventMessageManager(this.oData.mvc);
  }

  fn.inherit(EventMessageView, BaseView);

  EventMessageView._name = 'EventMessageView';
  EventMessageView.sNamespace = 'sellers';
  EventMessageView.sTag = 'events';

  EventMessageView.prototype.initEventMessageManager = function (data) {
    var hasCountdown = false;

    if (!this.isObject(data.sellers, true)) {
      return;
    }

    hasCountdown = this.isObject(data.sellers.countdown, true);

    this.eventMessageManager = new eventMessagingCountDown.EventMessagingManager({
      sellerID: data.sellers.sellerId,
      listingId: data.sellers.id,
      events: data.sellers.events || [],
      initCountdown: false,
      countdown: {
        startTime: hasCountdown && data.sellers.countdown.startTime,
        endTime: hasCountdown && data.sellers.countdown.endTime,
        currentTime: window.currentTimeAsync,
        message: hasCountdown && data.sellers.countdown.message
      }
    });
  };

  EventMessageView.prototype._cacheDomElms = function () {
    var EVENT_MESSAGE_CLASS = '.event-message';

    this.parent._cacheDomElms.call(this);
    this.oElms.elMessage = $(this.oElms.elWrapper).find(EVENT_MESSAGE_CLASS);
  };

  EventMessageView.prototype._initDependancies = function () {
    if (this.eventMessageManager) {
      this.eventMessageManager.show(this.oElms.elMessage);
    }
  };

  return EventMessageView;
});
