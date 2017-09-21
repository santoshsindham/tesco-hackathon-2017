define('modules/pdp/data-stores/Asset', [], function () {
  'use strict';

  /**
   * Structured data object for assets, i.e. BCC block content.
   * @param {Object} oData Data to be added into the structured data object.
   * @return {void}
   */
  function Asset(oData) {
    this.id = oData.id || null;
    this.lookupNameDefault = oData.lookupNameDefault || null;
    this.folder = oData.folder || null;
    this.text = oData.text || null;
    this.lookupName = oData.lookupName || null;
    this.type = oData.type || null;
    this.name = oData.name || null;
  }

  return Asset;
});
