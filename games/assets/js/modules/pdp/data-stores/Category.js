define(function (require, exports, module) {
  'use strict';

  /**
   *
   * @param {Object} data
   * @return {void}
   */
  module.exports = function Category(data) {
    this.id = data.id || null;
    this.links = data.links || null;
  };
});
