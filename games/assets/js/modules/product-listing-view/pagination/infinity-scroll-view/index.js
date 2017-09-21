define(function (require, exports, module) {
  'use strict';

  var fn = require('../../../mvc/fn');
  var mustache = require('mustache');
  var template = require('text!templates/views/pagination/infinityScroll.html');

  /**
   *
   * @constructor
   * @return {View}
   */
  var View = function InfinityScrollView() {
    this._data = { id: fn.createId() };
  };

  /**
   *
   * @private
   * @return {string}
   */
  View.prototype._render = function () {
    return mustache.render(template, { data: this._data });
  };

  /**
   *
   * @param {Object} opts
   * @return {void}
   */
  View.prototype.setData = function (opts) {
    fn.mergeObjects(this._data, opts, { extend: true });
  };

  /**
   *
   * @return {void}
   */
  View.prototype.update = function () {
    var selector = '#' + this._data.id;
    $(selector).replaceWith(this._render());
  };

  module.exports = View;
});
