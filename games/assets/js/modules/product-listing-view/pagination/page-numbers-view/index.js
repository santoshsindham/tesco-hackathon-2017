define(function (require, exports, module) {
  'use strict';

  var fn = require('../../../mvc/fn');
  var mustache = require('mustache');
  var template = require('text!templates/views/pagination/pageNumbers.html');

  /**
   *
   * @constructor
   * @return {View}
   */
  var View = function PageNumbersView() {
    this._data = { id: fn.createId() };
  };

  /**
   *
   * @private
   * @param {number} currentPage
   * @param {number} totalPages
   * @return {Function}
   */
  View.prototype._checkPageEnd = function (currentPage, totalPages) {
    var _this = this;

    return function () {
      var spred = _this._getPageSpred(currentPage, totalPages);
      return spred.max < totalPages;
    };
  };

  /**
   *
   * @private
   * @param {number} currentPage
   * @param {number} totalPages
   * @return {Function}
   */
  View.prototype._checkPageEndEllipsis = function (currentPage, totalPages) {
    var _this = this;

    return function () {
      var spred = _this._getPageSpred(currentPage, totalPages);
      return spred.max !== (totalPages - 1);
    };
  };

  /**
   *
   * @private
   * @param {number} currentPage
   * @param {number} totalPages
   * @return {Function}
   */
  View.prototype._checkPageSpred = function (currentPage, totalPages) {
    var _this = this;

    return function () {
      var spred = _this._getPageSpred(currentPage, totalPages);
      var page = Number(this); // eslint-disable-line consistent-this
      return page >= spred.min && page <= spred.max;
    };
  };

  /**
   *
   * @private
   * @param {number} currentPage
   * @param {number} totalPages
   * @return {Function}
   */
  View.prototype._checkPageStart = function (currentPage, totalPages) {
    var _this = this;

    return function () {
      var spred = _this._getPageSpred(currentPage, totalPages);
      return spred.min > 1;
    };
  };

  /**
   *
   * @private
   * @param {number} currentPage
   * @param {number} totalPages
   * @return {Function}
   */
  View.prototype._checkPageStartEllipsis = function (currentPage, totalPages) {
    var _this = this;

    return function () {
      var spred = _this._getPageSpred(currentPage, totalPages);
      return spred.min !== 2;
    };
  };

  /**
   *
   * @private
   * @return {Function}
   */
  View.prototype._disablePrev = function () {
    return function () {
      return function (prevPage, render) {
        return Number(render(prevPage)) === 0 ? 'disabled' : '';
      };
    };
  };

  /**
   *
   * @private
   * @param {number} totalPages
   * @return {Function}
   */
  View.prototype._disableNext = function (totalPages) {
    return function () {
      return function (nextPage, render) {
        return Number(render(nextPage)) > totalPages ? 'disabled' : '';
      };
    };
  };

  /**
   *
   * @private
   * @param {number} currentPage
   * @return {Function}
   */
  View.prototype._disableNumber = function (currentPage) {
    return function () {
      return function (page, render) {
        return Number(render(page)) === currentPage ? 'disabled' : '';
      };
    };
  };

  /**
   *
   * @private
   * @param {number} currentPage
   * @param {number} totalPages
   * @return {Object}
   */
  View.prototype._getPageSpred = function (currentPage, totalPages) {
    return {
      max: (currentPage + 2) > totalPages ? totalPages : currentPage + 2,
      min: (currentPage - 2) < 1 ? 1 : currentPage - 2
    };
  };

  /**
   *
   * @private
   * @param {number} currentPage
   * @param {number} totalPages
   * @return {Function}
   */
  View.prototype._checkPageSpred = function (currentPage, totalPages) {
    return function () {
      var min = (currentPage - 2) < 1 ? 1 : currentPage - 2;
      var max = (currentPage + 2) > totalPages ? totalPages : currentPage + 2;
      var page = Number(this); // eslint-disable-line consistent-this
      return page >= min && page <= max;
    };
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
   * @private
   * @return {Function}
   */
  View.prototype._renderPageNumber = function () {
    return function () {
      return this;
    };
  };

  /**
   *
   * @param {Object} opts
   * @return {void}
   */
  View.prototype._setData = function (opts) {
    var _opts = {
      checkPageEnd: this._checkPageEnd(opts.currentPage, opts.totalPages),
      checkPageEndEllipsis: this._checkPageEndEllipsis(opts.currentPage, opts.totalPages),
      checkPageSpred: this._checkPageSpred(opts.currentPage, opts.totalPages),
      checkPageStart: this._checkPageStart(opts.currentPage, opts.totalPages),
      checkPageStartEllipsis: this._checkPageStartEllipsis(opts.currentPage, opts.totalPages),
      disablePrev: this._disablePrev(),
      disableNext: this._disableNext(opts.totalPages),
      disableNumber: this._disableNumber(opts.currentPage),
      pageNumbers: this._setPageNumbers(opts.totalPages),
      renderPageNumber: this._renderPageNumber()
    };

    return fn.mergeObjects(_opts, opts);
  };

  /**
   *
   * @private
   * @param {number} totalPages
   * @return {Array<number>}
   */
  View.prototype._setPageNumbers = function (totalPages) {
    var numbers = [];

    for (var i = 1; i <= totalPages; i += 1) {
      numbers.push(i);
    }

    return numbers;
  };

  /**
   *
   * @param {Object} opts
   * @return {void}
   */
  View.prototype.setData = function (opts) {
    fn.mergeObjects(this._data, this._setData(opts), { extend: true });
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
