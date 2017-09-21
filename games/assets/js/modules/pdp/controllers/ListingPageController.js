define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');
  var BasePageController = require('modules/pdp/controllers/BasePageController');
  var loadMore = require('../../load-more/common');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ListingPageController(config) {
    this.parent.constructor.call(this, config);
  }

  fn.inherit(ListingPageController, BasePageController);

  /**
   *
   * @return {void}
   */
  ListingPageController.prototype.initDependancies = function () {
    this._initModules();
    loadMore.init();
  };

  /**
   *
   * @return {void}
   */
  ListingPageController.prototype._initModules = function () {
    this._create('controller', 'panel', '_default');
    this._create('controller', 'formHandler', 'addToBasket');
    this._create('controller', 'formHandler', 'requestStockAlert');

    if (this._initStoreStockCheck()) {
      this._create('controller', 'stores', 'storeStockCheck');
    }
  };

  /**
   *
   * @return {boolean}
   */
  ListingPageController.prototype._initStoreStockCheck = function () {
    return !window.isKiosk() && !window.isStoreStockCheckDisabled;
  };

  module.exports = ListingPageController;
});
