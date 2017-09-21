define('modules/pdp/data-stores/Store', [], function () {
  'use strict';

  /**
   * The data object for the store, including all the properties a store has.
   * @param {Object} data The properties to map into the store data object.
   * @return {void}
   */
  function Store(data) {
    this.id = data.id || null;
    this.addressOne = data.addressOne || null;
    this.addressTwo = data.addressTwo || null;
    this.country = data.country || null;
    this.county = data.county || null;
    this.facilities = data.facilities || null;
    this.facilitiesTiming = data.facilitiesTiming || null;
    this.friClose = data.friClose || null;
    this.friOpen = data.friOpen || null;
    this.gridReference = data.gridReference || null;
    this.latitude = parseFloat(data.latitude) || null;
    this.longitude = parseFloat(data.longitude) || null;
    this.monClose = data.monClose || null;
    this.monOpen = data.monOpen || null;
    this.postalCode = data.postalCode || null;
    this.satClose = data.satClose || null;
    this.satOpen = data.satOpen || null;
    this.storeId = data.storeId || null;
    this.storeName = data.storeName || null;
    this.storeTimings = data.storeTimings || null;
    this.storeTypes = data.storeTypes || null;
    this.sunClose = data.sunClose || null;
    this.sunOpen = data.sunOpen || null;
    this.telephone = data.telephone || null;
    this.thuClose = data.thuClose || null;
    this.thuOpen = data.thuOpen || null;
    this.townCity = data.townCity || null;
    this.tueClose = data.tueClose || null;
    this.tueOpen = data.tueOpen || null;
    this.wedClose = data.wedClose || null;
    this.wedOpen = data.wedOpen || null;
  }

  return Store;
});
