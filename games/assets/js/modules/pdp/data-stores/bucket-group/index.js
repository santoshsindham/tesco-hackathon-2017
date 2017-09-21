define(function (require, exports, module) {
  'use strict';

  /**
   *
   * @param {Object} data
   * @return {void}
   */
  module.exports = function BucketGroup(data) {
    this.id = data.id || null;
    this.displayName = data.displayName || null;
    this.links = data.links || null;
  };
});
