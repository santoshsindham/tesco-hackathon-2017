define(function (require, exports, module) {
  'use strict';

  /**
   *
   * @param {Object} data
   * @return {void}
   */
  module.exports = function MarketingSku(data) {
    this.id = data.id || null;
    this.pings = data.pings || null;
    this.promotions = data.promotions || null;
    this._links = data._links || null;
  };
});
