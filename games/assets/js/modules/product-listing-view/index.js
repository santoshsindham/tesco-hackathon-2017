define(function (require, exports, module) {
  'use strict';

  var fn = require('../mvc/fn');
  var CarouselScroll = require('./pagination/carousel-scroll-view/index');
  var InfinityScroll = require('./pagination/infinity-scroll-view/index');
  var mustache = require('mustache');
  var PageNumbers = require('./pagination/page-numbers-view/index');
  var template = require('text!templates/views/productListing.html');

  /**
   *
   * @private
   * @type {Object}
   */
  var _paginationViews = {
    CarouselScroll: CarouselScroll,
    InfinityScroll: InfinityScroll,
    PageNumbers: PageNumbers
  };

  /**
   *
   * @constructor
   * @param {Object} [opts]
   * @return {View}
   */
  var View = function ProductListingView(opts) {
    var _opts = opts || {};
    this._data = { id: fn.createId() };
    this._paginationStyle = _opts.paginationStyle || 'InfinityScroll';
    this._views = { bottomPagination: this._createPaginationView() };

    if (_opts.paginationStyle === 'PageNumbers') {
      this._views.topPagination = this._createPaginationView();
    }
  };

  /**
   *
   * @private
   * @param {string} name
   * @return {Object}
   */
  View.prototype._createPaginationView = function () {
    var PaginationView = _paginationViews[this._paginationStyle];
    return new PaginationView();
  };

  /**
   *
   * @param {Object} opts
   * @return {void}
   */
  View.prototype._setData = function (opts) {
    if (this._views.topPagination) this._views.topPagination.setData(opts.pagination);
    this._views.bottomPagination.setData(opts.pagination);
    fn.mergeObjects(this._data, opts, { extend: true });
  };

  /**
   *
   * @return {string}
   */
  View.prototype.getPaginationStyle = function () {
    return this._paginationStyle;
  };

  /**
   *
   * @param {Object} opts
   * @return {string}
   */
  View.prototype.render = function (opts) {
    this._setData(opts);
    return mustache.render(template, { data: this._data, views: this._views });
  };

  /**
   *
   * @param {Object} opts
   * @return {void}
   */
  View.prototype.update = function (opts) {
    this._setData(opts);
    var selector = '#' + this._data.id;
    if (opts.method) $(selector)[opts.method](opts.tiles);
    if (this._views.topPagination) this._views.topPagination.update(opts.pagination);
    this._views.bottomPagination.update(opts.pagination);
  };

  module.exports = View;
});
