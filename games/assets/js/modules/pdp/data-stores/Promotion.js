define(function (require, exports, module) {
  'use strict';

  /**
   *
   * @param {Object} data
   * @return {void}
   */
  module.exports = function Promotion(data) {
    this.publicLink = data.publicLink || null;
    this.bucketCount = data.bucketCount || null;
    this.customerInstruction = data.customerInstruction || null;
    this.description = data.description || null;
    this.displayName = data.displayName || null;
    this.id = data.id || null;
    this.linkSaveURL = data.linkSaveURL || null;
    this.links = data.links;
    this.promoTermsCond = data.promoTermsCond || null;
    this.type = data.type || null;
    this.voucherCode = data.voucherCode || null;
  };
});
