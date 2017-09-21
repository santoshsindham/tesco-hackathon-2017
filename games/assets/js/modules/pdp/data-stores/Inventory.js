define('modules/pdp/data-stores/Inventory', [], function () {
  'use strict';

  var Inventory = function (data) {
    this.id = data.id || null;
    this.availability = data.availability || null;
    this.available = data.available || false;
    this.subscribable = data.subscribable || false;
    this.skus = data.skus || null;
    this.listings = data.listings || null;
  };

  return Inventory;
});
