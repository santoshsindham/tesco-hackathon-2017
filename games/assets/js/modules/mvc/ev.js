define(function (require, exports, module) {
  'use strict';


  var ev = {},
    fn = require('modules/mvc/fn');


  /**
   *
   * @param {Object} data
   * @param {Object} [opts]
   * @return {void}
   */
  ev.renderView = function (data, opts) {
    var args = {},
      _opts = opts || {};

    args.name = 'render';
    args.data = data;
    args.propName = 'oData';

    if (!_opts.timeout) {
      fn.createEvent(args).fire();
      return;
    }

    setTimeout(function () {
      fn.createEvent(args).fire();
    }, _opts.timeout);
  };


  module.exports = ev;
});
