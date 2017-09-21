define('modules/pdp/data-stores/Wishlists', [], function () {
  'use strict';

  /**
   * Structured data object for Wishlists data
   * @param {Object} oData Data to be added into the structured data object.
   * @return {void}
   */
  function Wishlists(oData) {
    this.id = oData.id || null;
    this.href = oData.href || null;
    this.name = oData.name || null;
    this.defaultHref = oData.defaultHref || null;
    this.defaultName = oData.defaultName || null;
  }

  return Wishlists;
});
