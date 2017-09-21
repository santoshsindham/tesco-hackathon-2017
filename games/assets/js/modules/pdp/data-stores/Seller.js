define('modules/pdp/data-stores/Seller', [], function () {
  'use strict';

  /**
   * The data object for the seller, including all the properties a seller has.
   * @param {Object} data The properties to map into the seller data object.
   * @return {void}
   */
  function Seller(data) {
    this.buyBoxMessage = data.buyBoxMessage || null;
    this.buyBoxState = data.buyBoxState || null;
    this.buyButtonLabel = data.buyButtonLabel || null;
    this.maxQuantity = data.maxQuantity || null;
    this.formHandler = data.formHandler || null;
    this.isBCVE = data.isBCVE || null;
    this.id = data.id || null;
    this.name = data.name || null;
    this.prices = data.prices || null;
    this.services = data.services || null;
    this.promotions = data.promotions || null;
    this.deliveryOptions = data.deliveryOptions || null;
    this.events = data.events || null;
    this.countdown = data.countdown || null;
    this.sellerId = data.sellerId || null;
    this.showBuyBox = data.showBuyBox || null;
    this.staticImagePath = data.staticImagePath || null;
    this.stockMessaging = data.stockMessaging || null;
    this.enableStockServiceCallPdpV2 = data.enableStockServiceCallPdpV2 || null;
    this.partnerUrl = data.partnerUrl || null;
    this.addOnMessage = data.addOnMessage || null;
  }

  return Seller;
});
