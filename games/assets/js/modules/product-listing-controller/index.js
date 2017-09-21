define(function (require, exports, module) {
  'use strict';

  var analytics = require('../tesco.analytics');
  var colourSwatch = require('../colour-swatch/common');
  var common = require('../common');
  var Clampdown = require('../clampdown/index');
  var fn = require('../mvc/fn');
  var Model = require('../product-listing-model/index');
  var View = require('../product-listing-view/index');

  /**
   *
   * @constructor
   * @param {Object} opts
   * @return {Controller}
   */
  var Controller = function ProductListingController(opts) {
    this._currentPage = 1;
    this._defaultSortOption = opts.defaultSortOption || 1;
    this._elements = {};
    this._fetchingTiles = false;
    this._getRequestParams = opts.getRequestParams;
    this._model = new Model(opts.model);
    this._productsPerPage = opts.productsPerPage || 20;
    this._view = new View(opts.view);
    this._setPagesMetadata(opts.totalProducts);
  };

  /**
   *
   * @private
   * @return {void}
   */
  Controller.prototype._cacheElements = function () {
    this._elements.listing = $('#listing');
    this._elements.productsWrapper = $('#listing div.products-wrapper');
  };

  /**
   *
   * @private
   * @return {void}
   */
  Controller.prototype._clampTitles = function () {
    var $titles = this._elements.productsWrapper.find('div.title-author-format h3').not('.clampdown');

    /**
     *
     * @param {Element} element
     * @return {Function}
     */
    var clampTitle = function (element) {
      return function () {
        var clampdown = new Clampdown(element);
        clampdown.clamp();
        $(element).data('clampdown', clampdown);
      };
    };

    for (var i = 0; i < $titles.length; i += 1) {
      setTimeout(clampTitle($titles[i]), 10);
    }
  };

  /**
   *
   * @private
   * @return {void}
   */
  Controller.prototype._enableAddToBasket = function () {
    this._elements.productsWrapper
      .find('input.add-to-basket[disabled]')
      .removeAttr('disabled');
  };

  /**
   *
   * @private
   * @return {number}
   */
  Controller.prototype._getNextPage = function () {
    var page = this._currentPage + 1;
    return page <= this._totalPages ? page : null;
  };

  /**
   *
   * @private
   * @param {number|string} page
   * @return {number}
   */
  Controller.prototype._getPageNumber = function (page) {
    var pageNo = 1;
    if (typeof page === 'number') pageNo = page;
    if (page === 'next') pageNo = this._currentPage + 1;
    if (page === 'prev') pageNo = this._currentPage - 1;
    return pageNo;
  };

  /**
   *
   * @private
   * @param {Array<Object>} res
   * @return {number}
   */
  Controller.prototype._getPagesMetadata = function (res) {
    var path = ['totalProductsCount'];
    var count = this._parseResponse(res, { path: path });
    return Number(count[0]);
  };

  /**
   *
   * @private
   * @param {JQueryEvent} e
   * @return {void}
   */
  Controller.prototype._handleClickPaginate = function (e) {
    var $currentTarget = $(e.currentTarget);
    if ($currentTarget.is(':disabled') || $currentTarget.hasClass('disabled')) return;
    $currentTarget.addClass('submitting');
    var page = $currentTarget.data('page');
    var phase = 'paginate';
    var _this = this;
    this._fetchingTiles = true;

    this.fetchTiles({ page: page, phase: phase })
      .done(function (res) {
        var method = _this.getPaginationStyle() === 'PageNumbers' ? 'html' : 'append';
        var markup = _this.getTileMarkup(res);
        _this.updateView({ view: { method: method, tiles: markup } });
        _this._fetchingTiles = false;
        _this.setVariantsData(_this.getVariantsData(res));
        _this.sendAnalyticsData(phase, _this.getAnalyticsData(res));
        _this.initDependencies();
        $currentTarget.removeClass('submitting');
      })
      .fail(function () {
        $currentTarget.removeClass('submitting');
        // TODO:...
      });
  };

  /**
   *
   * @private
   * @param {JQueryEvent} e
   * @return {void}
   */
  Controller.prototype._handleCarouselScroll = function (e) {
    if (this._fetchingTiles) return;
    var currentTarget = e.currentTarget;
    var scrolled = currentTarget.scrollLeft;
    var buffer = scrolled + (currentTarget.clientWidth * 2);
    if (buffer < currentTarget.scrollWidth) return;
    this.updateView({ view: { pagination: { loading: true } } });
    var page = this._getNextPage();
    if (!page) return;
    var phase = 'paginate';
    var _this = this;
    this._fetchingTiles = true;

    this.fetchTiles({ page: page, phase: phase })
      .done(function (res) {
        var markup = _this.getTileMarkup(res);

        _this.updateView({
          view: { method: 'append', pagination: { loading: false }, tiles: markup }
        });

        _this._fetchingTiles = false;
        _this.setVariantsData(_this.getVariantsData(res));
        _this.sendAnalyticsData(phase, _this.getAnalyticsData(res));
        _this.initDependencies();
      })
      .fail(function () {
        // TODO:...
      });
  };

  /**
   *
   * @private
   * @return {void}
   */
  Controller.prototype._handleScrollBookmark = function () {
    var metadata = this.getBookmark();
    metadata.pageYOffset = window.pageYOffset;
    metadata.scrollLeft = this._elements.productsWrapper[0].scrollLeft;
    this._setBookmark(metadata);
  };

  /**
   *
   * @private
   * @return {void}
   */
  Controller.prototype._handleInfinityScroll = function () {
    if (this._fetchingTiles) return;
    var $target = this._elements.productsWrapper.find('button.paginate__load');
    if (!$target.length) return;
    var scrolled = window.pageYOffset + window.innerHeight;
    var buffer = scrolled + (window.innerHeight * 2);
    var targetPosition = $target.offset().top;
    if (buffer < targetPosition) return;
    this.updateView({ view: { pagination: { loading: true } } });
    var page = $target.data('page');
    var phase = 'paginate';
    var _this = this;
    this._fetchingTiles = true;

    this.fetchTiles({ page: page, phase: phase })
      .done(function (res) {
        var markup = _this.getTileMarkup(res);

        _this.updateView({
          view: { method: 'append', pagination: { loading: false }, tiles: markup }
        });

        _this._fetchingTiles = false;
        _this.setVariantsData(_this.getVariantsData(res));
        _this.sendAnalyticsData(phase, _this.getAnalyticsData(res));
        _this.initDependencies();
      })
      .fail(function () {
        // TODO:...
      });
  };

  /**
   *
   * @private
   * @param {string} phase
   * @return {boolean}
   */
  Controller.prototype._isSortFilter = function (phase) {
    return phase === 'sort' || phase === 'filter';
  };

  /**
   *
   * @private
   * @param {string} phase
   * @param {Object} params
   * @return {boolean}
   */
  Controller.prototype._isSortFilterApplied = function (phase, params) {
    var catID = String(params.catId);
    var sortFilterApplied = false;

    if (this._isSortFilter(phase)) {
      sortFilterApplied = true;
    } else if (Number(params.sortBy) !== this._defaultSortOption || (catID.split('+').length > 1)) {
      sortFilterApplied = true;
    }

    return sortFilterApplied;
  };

  /**
   *
   * @param {Array<Object>} res
   * @param {Object} opts
   * @param {Array<any>} opts.path
   * @return {Array<any>}
   */
  Controller.prototype._parseResponse = function (res, opts) {
    var output = [];

    res.forEach(function (value) {
      var args = [value].concat(opts.path);
      output.push(fn.getValue.apply(null, args));
    });

    return output;
  };

  /**
   *
   * @private
   * @return {void}
   */
  Controller.prototype._reclampTitles = function () {
    var $titles = this._elements.productsWrapper.find('div.title-author-format h3');

    /**
     *
     * @param {Element} element
     * @return {Function}
     */
    var reclampTitle = function (element) {
      return function () {
        var clampdown = $(element).data('clampdown');
        clampdown.reclamp();
      };
    };

    for (var i = 0; i < $titles.length; i += 1) {
      setTimeout(reclampTitle($titles[i]), 10);
    }
  };

  /**
   *
   * @private
   * @param {Object} metadata
   * @return {void}
   */
  Controller.prototype._setBookmark = function (metadata) {
    var _metadata = metadata || {};
    if (!metadata) _metadata.page = this._currentPage;
    var obj = {};
    obj[fn.hashValue(location.href)] = _metadata;
    fn.setSessionData('productListingBookmark', obj);
  };

  /**
   *
   * @private
   * @param {string} [target]
   * @return {string}
   */
  Controller.prototype._setCurrentTarget = function (target) {
    if (!target) return this._currentTarget;
    this._currentTarget = target;
    return this._currentTarget;
  };

  /**
   *
   * @private
   * @param {number} page
   * @return {number}
   */
  Controller.prototype._setOffset = function (page) {
    return (page * this._productsPerPage) - this._productsPerPage;
  };

  /**
   *
   * @private
   * @param {number} page
   * @return {void}
   */
  Controller.prototype._setPageNumber = function (page) {
    this._currentPage = page;
  };

  /**
   *
   * @private
   * @param {Object} [opts]
   * @return {Object}
   */
  Controller.prototype._setPaginationViewOptions = function (opts) {
    var _opts = opts || {};

    return fn.mergeObjects(_opts, {
      currentPage: this._currentPage,
      isLastPage: this._currentPage === this._totalPages,
      nextPage: this._currentPage + 1,
      prevPage: this._currentPage - 1,
      productsPerPage: this._productsPerPage,
      totalPages: this._totalPages,
      totalProducts: this._totalProducts
    });
  };

  /**
   *
   * @private
   * @param {number} totalProducts
   * @return {Object}
   */
  Controller.prototype._setPagesMetadata = function (totalProducts) {
    this._totalPages = Math.ceil(totalProducts / this._productsPerPage);
    this._totalProducts = totalProducts;
  };

  /**
   *
   * @private
   * @param {Object} opts
   * @return {void}
   */
  Controller.prototype._setViewOptions = function (opts) {
    opts.pagination = this._setPaginationViewOptions(opts.pagination);
  };

  /**
   *
   * @param {number} [page]
   * @return {boolean}
   */
  Controller.prototype.allPages = function (page) {
    var paginationStyle = this.getPaginationStyle();
    return !!page && (paginationStyle === 'CarouselScroll' || paginationStyle === 'InfinityScroll');
  };

  /**
   *
   * @return {void}
   */
  Controller.prototype.bindEvents = function () {
    var _this = this;

    this._elements.listing.on('click.paginate', '.paginate__load', function (e) {
      _this._handleClickPaginate(e);
    });

    var reclampTimer;

    $(window).on('windowResizeEnd.clampdown', function () {
      clearTimeout(reclampTimer);

      reclampTimer = setTimeout(function () {
        _this._reclampTitles();
      }, 200);
    });

    var paginationStyle = this.getPaginationStyle();

    if (paginationStyle === 'InfinityScroll' && this.infinityScrollSupported()) {
      $(window).on('scroll.infinityScroll touchmove.infinityScroll', function () {
        _this._handleInfinityScroll();
      });
    } else if (paginationStyle) {
      this._elements.productsWrapper.on('scroll.carouselScroll touchmove.carouselScroll', function (e) {
        _this._handleCarouselScroll(e);
      });
    }

    if (paginationStyle === 'InfinityScroll' || paginationStyle === 'CarouselScroll') {
      $(window).on('unload.scrollPositionBookmark pagehide.scrollPositionBookmark', function () {
        _this._handleScrollBookmark();
      });
    }
  };

  /**
   *
   * @param {number} scrollLeft
   * @return {void}
   */
  Controller.prototype.carouselScrollToBookmark = function (scrollLeft) {
    this._elements.productsWrapper[0].scrollLeft = scrollLeft;
  };

  /**
   *
   * @param {Object} opts
   * @param {number|string} opts.page
   * @param {Object} opts.params
   * @param {string} opts.phase
   * @param {string} opts.url
   * @return {Promise}
   */
  Controller.prototype.fetchFilters = function (opts) {
    var deferred = $.Deferred();
    opts.params = this._getRequestParams(opts.url);

    this._model.fetchFilters(opts)
      .done(function (res) {
        deferred.resolve(res);
      })
      .fail(function () {
        deferred.reject();
      });

    return deferred.promise();
  };

  /**
   *
   * @param {Object} opts
   * @param {boolean} opts.allPages
   * @param {number|string} opts.page
   * @param {Object} opts.params
   * @param {string} opts.phase
   * @param {string} opts.url
   * @return {Promise}
   */
  Controller.prototype.fetchTiles = function (opts) {
    var deferred = $.Deferred();
    var phase = opts.phase;

    if (phase === 'pageLoad' && !this._model.hasProvider()) {
      deferred.resolve();
      return deferred.promise();
    }

    opts.params = this._getRequestParams(opts.url);
    var pageNo = this._getPageNumber(opts.page);
    opts.sortFilterApplied = this._isSortFilterApplied(phase, opts.params);
    var promises = [];

    if (!opts.allPages) {
      opts.page = pageNo;
      opts.params.offset = this._setOffset(pageNo);
      promises.push(this._model.fetchTiles(opts));
    } else {
      for (var i = 1; i <= pageNo; i += 1) {
        var _opts = fn.copyObject(opts, { deep: true });
        _opts.page = i;
        _opts.params.offset = this._setOffset(i);
        promises.push(this._model.fetchTiles(_opts));
      }
    }

    var _this = this;

    $.when
      .apply($, promises)
        .done(function () {
          var res = fn.copyArray(arguments);
          if (_this._isSortFilter(phase)) _this._setPagesMetadata(_this._getPagesMetadata(res));
          _this._setPageNumber(pageNo);
          _this._setBookmark();
          deferred.resolve(res);
        })
        .fail(function () {
          deferred.reject();
        });

    return deferred.promise();
  };

  /**
   *
   * @return {string}
   */
  Controller.prototype.getActiveQueryParams = function () {
    return this._model.getActiveQueryParams();
  };

  /**
   *
   * @param {Array<Object>} res
   * @return {Object}
   */
  Controller.prototype.getAnalyticsData = function (res) {
    var analyticsData = this._parseResponse(res, { path: ['analytics'] });
    var data = analyticsData.pop();
    return fn.isArray(data) ? data[0] : data;
  };

  /**
   *
   * @return {Object}
   */
  Controller.prototype.getBookmark = function () {
    var obj = fn.getSessionData('productListingBookmark') || {};
    fn.clearSessionData('productListingBookmark');
    return obj[fn.hashValue(location.href)] || {};
  };

  /**
   *
   * @return {string}
   */
  Controller.prototype.getPaginationStyle = function () {
    return this._view.getPaginationStyle();
  };

  /**
   *
   * @param {Array<Object>} res
   * @param {Object} [opts]
   * @param {string} [opts.phase]
   * @return {string}
   */
  Controller.prototype.getTileMarkup = function (res, opts) {
    var _opts = opts || {};
    var phase = _opts.phase || 'paginate';
    var path = phase === 'paginate' ? ['products'] : ['productContent', 'products'];
    var products = this._parseResponse(res, { path: path });
    return products.join('');
  };

  /**
   *
   * @param {Array<Object>} res
   * @param {Object} [opts]
   * @param {string} [opts.phase]
   * @return {string}
   */
  Controller.prototype.getVariantsData = function (res, opts) {
    var _opts = opts || {};
    var phase = _opts.phase || 'paginate';
    var path = phase === 'paginate' ? ['variants'] : ['productContent', 'variants'];
    var variants = this._parseResponse(res, { path: path });
    var merged = {};

    variants.forEach(function (data) {
      var parsed = JSON.parse(data);
      fn.mergeObjects(merged, parsed, { extend: true });
    });

    return merged;
  };

  /**
   *
   * @return {boolean}
   */
  Controller.prototype.infinityScrollSupported = function () {
    return !common.isIE();
  };

  /**
   *
   * @param {number} offset
   * @return {void}
   */
  Controller.prototype.infinityScrollToBookmark = function (offset) {
    if (offset === window.pageYOffset) return;
    window.scrollTo(0, offset);
  };

  /**
   *
   * @return {void}
   */
  Controller.prototype.initDependencies = function () {
    colourSwatch.init();
    window.picturefill();
    this._clampTitles();
    this._enableAddToBasket();
  };

  /**
   *
   * @param {Object} opts
   * @param {string} [opts.target]
   * @param {Object} opts.view
   * @return {void}
   */
  Controller.prototype.renderView = function (opts) {
    var currentTarget = this._setCurrentTarget(opts.target);
    this._setViewOptions(opts.view);
    $(currentTarget).replaceWith(this._view.render(opts.view));
    this._cacheElements();
  };

  /**
   *
   * @param {string} phase
   * @param {Object} data
   * @return {void}
   */
  Controller.prototype.sendAnalyticsData = function (phase, data) {
    var webAnalytics = new analytics.WebMetrics();

    if ((phase === 'cacheLoad' || phase === 'pageLoad') && !window.pageLoadAnalyticsSuccess) {
      $(window).one('pageLoadAnalyticsSuccess', function () {
        setTimeout(function () {
          webAnalytics.submit([data]);
        }, 100);
      });
    } else {
      setTimeout(function () {
        webAnalytics.submit([data]);
      }, 1000);
    }
  };

  /**
   *
   * @param {Object} data
   * @return {void}
   */
  Controller.prototype.setVariantsData = function (data) {
    fn.mergeObjects(window.Data.PLP.Data, data, { extend: true });
  };

  /**
   *
   * @param {Object} opts
   * @param {Object} opts.view
   * @return {void}
   */
  Controller.prototype.updateView = function (opts) {
    this._setViewOptions(opts.view);
    this._view.update(opts.view);
  };

  module.exports = Controller;
});
