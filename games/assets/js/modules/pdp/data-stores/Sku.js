define('modules/pdp/data-stores/Sku', [], function () {
  'use strict';

  /**
   *
   * @param {Object} data
   * @return {void}
   */
  function Sku(data) {
    this.id = data.id || null;
    this.commercialReleaseDateFormatted = data.commercialReleaseDateFormatted || null;
    this.authors = data.authors || null;
    this.mediaAssets = data.mediaAssets || null;
    this.skuSynopsis = data.skuSynopsis || null;
    this.publicLink = data.publicLink || null;
    this.longDescription = data.longDescription || null;
    this.specification = data.specification || null;
    this.prices = data.prices || null;
    this.links = data.links || null;
    this.attributes = data.attributes || {};
    this.displayName = data.displayName || null;
    this.bookDetails = data.bookDetails || null;
    this.miniDescription = data.miniDescription || null;
    this.noofRatingsProduced = data.noofRatingsProduced || null;
    this.avgRating = data.avgRating || null;
    this.sellers = data.sellers || null;
    this.personalisation = data.personalisation || null;
    this.ancestorCategories = data.ancestorCategories || null;
    this.competitors = data.competitors || null;
    this.rangedInStore = data.rangedInStore || false;
    this.isDigitalSku = data.isDigitalSku || false;
  }

  return Sku;
});
