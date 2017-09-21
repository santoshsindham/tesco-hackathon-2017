define('modules/pdp/data-stores/Warranty', [], function () {
  'use strict';

  /**
   * The data object for a warranty.
   * @param {Object} oData The data to be added to the warranty data object.
   * @return {void}
   */
  function Warranty(oData) {
    this.productID = oData.productID;
    this.minItemPrice = oData.minItemPrice;
    this.maxItemPrice = oData.maxItemPrice;
    this.condition = oData.condition;
    this.category = oData.category;
    this.resaleProductID = oData.resaleProductID;
    this.deductible = oData.deductible;
    this.servicePlanType = oData.servicePlanType;
    this.term = oData.term;
    this.price = oData.price;
    this.moreInfoID = oData.moreInfoID;
    this.descriptionID = oData.descriptionID;
    this.catalogRefId = oData.catalogRefId;
    this.description = oData.description;
    this.displayPrice = oData.displayPrice;
  }

  return Warranty;
});
