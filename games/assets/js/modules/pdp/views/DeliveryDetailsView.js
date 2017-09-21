define('modules/pdp/views/DeliveryDetailsView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView'
], function ($, fn, BaseView) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function DeliveryDetailsView(config) {
    this.sViewName = 'DeliveryDetailsView';
    this.sNamespace = 'deliveryOptions';
    this.sTag = 'details';
    this.sViewClass = 'delivery-details-wrapper';
    this.sTemplate = $('#buybox-template-delivery-details')[0].innerHTML;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(DeliveryDetailsView, BaseView);

  DeliveryDetailsView._name = 'DeliveryDetailsView';
  DeliveryDetailsView.sNamespace = 'deliveryOptions';
  DeliveryDetailsView.sTag = 'details';

  DeliveryDetailsView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.deliveryInfoLink = $wrapper.find('.delivery-details-lead-time-advisory a')[0];
    this.oElms.returnsLink = $wrapper.find('.delivery-details-returns-policy a')[0];
  };

  return DeliveryDetailsView;
});
