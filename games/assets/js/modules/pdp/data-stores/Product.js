define('modules/pdp/data-stores/Product', [], function () {
  'use strict';

  /**
   *
   * @param {Object} data
   * @return {void}
   */
  function Product(data) {
    this.avgRating = data.avgRating || null;
    this.brand = data.brand || null;
    this.ancestorCategories = data.ancestorCategories || null;
    this.classifactionLabelingPackaging = data.classifactionLabelingPackaging || null;
    this.displayName = data.displayName || null;
    this.dynamicAttributes = data.dynamicAttributes || {};
    this.giftMessagingEnabled = data.giftMessagingEnabled || false;
    this.id = data.id || null;
    this.links = data.links || null;
    this.longDescription = data.longDescription || null;
    this.mediaAssets = data.mediaAssets || null;
    this.minimumAgeRequired = data.minimumAgeRequired || null;
    this.noofRatingsProduced = data.noofRatingsProduced || null;
    this.optionsInfo = data.optionsInfo || null;
    this.prices = data.prices || {};
    this.publicLink = data.publicLink || null;
    this.rrLink = data.rrLink || null;
    this.ues = data.ues || null;
    this.userActionable = data.userActionable || false;
  }

  return Product;
});
