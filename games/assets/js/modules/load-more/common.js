define(function (require, exports, module) {
  'use strict';

  var fn = require('../mvc/fn');
  var ProductListingController = require('../product-listing-controller/index');
  var utils = require('../tesco.utils');

  /**
   *
   * @private
   * @param {string} [url]
   * @return {Object}
   */
  var _getRequestParams = function getRequestParams(url) {
    var _url = url || undefined;
    var urlParams = utils.getURLParams(_url);
    var $wrapper = $('#listing div.products-wrapper');
    var $featureTileVariables = $wrapper.find('li.featureTiledata-variables').last();
    var $lastFeatureTile = $wrapper.find('li.feature-tile').last();

    var params = {
      catId: urlParams.catId || $wrapper.data('endecaid') || null,
      clrAll: urlParams.clrAll || null,
      currentPageType: utils.removeSpaces(window.currentPageType) || null,
      eventId: $wrapper.data('eventid') || null,
      featuretileblock: $featureTileVariables.data('featuretileblock') || null,
      featureTileCount: $lastFeatureTile.data('count') || null,
      hasFTTemplate: $featureTileVariables.data('hasfeaturetiletemplate') || null,
      imagePreset: (function () {
        var presets = ['imagePreset-Detail', 'imagePreset-Default', 'imagePreset-portrait', 'imagePreset-portraitxl'];
        var $listing = $('#listing');
        var preset = null;

        for (var i = 0; i < presets.length; i += 1) {
          if ($listing.hasClass(presets[i])) {
            preset = presets[i];
            break;
          }
        }

        return preset;
      }()),
      lazyload: true,
      modifySearchQuery: $wrapper.data('modifysearchquery') || null,
      pageViewType: 'grid',
      productPresetCount: $featureTileVariables.data('productpresetcount') || null,
      promoBucketId: $wrapper.data('promobucketid') || null,
      promoId: $wrapper.data('promoid') || null,
      range: urlParams.range || null,
      rowNumber: $featureTileVariables.data('rowcount') || null,
      segmentCount: $wrapper.data('segmentcount') || null,
      sellerId: $wrapper.data('sellerid') || null,
      searchquery: urlParams.searchquery || null,
      sortBy: urlParams.sortBy || $wrapper.data('selectedsortoption') || null,
      tileCountInRequest: $featureTileVariables.data('tilecountinrequest') || null,
      view: 'grid'
    };

    if (_url) fn.mergeObjects(params, urlParams, { extend: true });
    return params;
  };

  /**
   *
   * @private
   * @return {Object}
   */
  var _getCtlrOptions = function getCtlrOptions() {
    var $wrapper = $('#listing div.products-wrapper');
    var paginationStyle = window.isKiosk() ? 'CarouselScroll' : fn.getValue(window, '__MVT__', 'productListing', 'paginationStyle') || 'InfinityScroll';

    var opts = {
      defaultSortOption: $wrapper.data('selectedsortoption'),
      getRequestParams: _getRequestParams,
      model: {},
      totalProducts: $('#listing').data('maxcount'),
      view: { paginationStyle: paginationStyle }
    };

    if (window.isRichSortEnabled) {
      opts.model.provider = { name: window.richSortProvider };
      var provider = opts.model.provider;

      if (provider.name === 'Attraqt') {
        provider.endpoint = window.Data.PLP.Attraqt.endpoint;
        provider.sessionID = $.cookie('JSESSIONID');
        provider.siteID = window.Data.PLP.Attraqt.siteId;
        provider.userID = window.s.eVar24;
      } else if (provider.name === 'SlickStitch') {
        var dataset = $wrapper.data('schoolskulist') || '';
        provider.dataset = dataset.split(',');
        provider.orgID = $wrapper.data('schoolid');
        provider.sortFilterEnabled = true;
      }
    }

    return opts;
  };

  /**
   *
   * @private
   * @return {string}
   */
  var _getPageLoadSkuList = function getPageLoadSkuList() {
    var skuList = window.Data.PLP.pageLoadSkuList || '';
    var skuIDs = skuList.split(',');
    if (!skuIDs.length) return '';
    return ';' + skuIDs.join(',;');
  };

  /**
   *
   * @private
   * @return {void}
   */
  var _showProducts = function showProducts() {
    $('#listing').removeClass('hideProducts');
  };

  /**
   *
   * @type {Object}
   */
  var loadMore = {
    /**
     *
     * @param {Object} opts
     * @param {string} opts.phase
     * @param {string} opts.url
     * @param {JQueryDeferred} deferred
     * @return {Promise}
     */
    getFilters: function (opts, deferred) {
      loadMore._controller.fetchFilters({ phase: opts.phase, url: opts.url })
        .done(function (res) {
          deferred.resolve(res);
        })
        .fail(function () {
          // TODO:...
        });

      return deferred.promise();
    },
    /**
     *
     * @return {string}
     */
    getQueryParams: function () {
      return loadMore._controller.getActiveQueryParams();
    },
    /**
     *
     * @param {Object} opts
     * @param {string} opts.phase
     * @param {string} opts.url
     * @return {Promise}
     */
    getResults: function (opts) {
      var deferred = $.Deferred();

      if (opts.getFilters) return loadMore.getFilters(opts, deferred);

      loadMore._controller.fetchTiles({ phase: opts.phase, url: opts.url })
        .done(function (res) {
          var markup = loadMore._controller.getTileMarkup(res, { phase: opts.phase });

          loadMore._controller.updateView({
            view: { method: 'html', pagination: { loading: false }, tiles: markup }
          });

          loadMore._controller.setVariantsData(
            loadMore._controller.getVariantsData(res, { phase: opts.phase })
          );

          loadMore._controller.sendAnalyticsData(
            opts.phase, loadMore._controller.getAnalyticsData(res)
          );

          loadMore._controller.initDependencies();
          deferred.resolve(res[0]);
        })
        .fail(function () {
          // TODO:...
        });

      return deferred.promise();
    },
    /**
     *
     * @return {void}
     */
    init: function () {
      loadMore._controller = new ProductListingController(_getCtlrOptions());
      var target = '#listing ul.products';
      var markup = $(target)[0].innerHTML;
      var analytics = { products: _getPageLoadSkuList() };

      loadMore._controller.renderView({
        target: target,
        view: { pagination: { loading: true } }
      });

      _showProducts();
      var bookmark = loadMore._controller.getBookmark();
      var allPages = loadMore._controller.allPages(bookmark.page);
      var phase = bookmark.page ? 'cacheLoad' : 'pageLoad';

      loadMore._controller.fetchTiles({ allPages: allPages, page: bookmark.page, phase: phase })
        .done(function (res) {
          if (res) markup = loadMore._controller.getTileMarkup(res);
          loadMore._controller.updateView({ view: { method: 'html', pagination: { loading: false }, tiles: markup } });

          if (loadMore._controller.getPaginationStyle() === 'CarouselScroll' && bookmark.scrollLeft) {
            loadMore._controller.carouselScrollToBookmark(bookmark.scrollLeft);
          } else if (loadMore._controller.getPaginationStyle() === 'InfinityScroll' && bookmark.pageYOffset) {
            loadMore._controller.infinityScrollToBookmark(bookmark.pageYOffset);
          }

          if (res) analytics = loadMore._controller.getAnalyticsData(res);
          loadMore._controller.sendAnalyticsData(phase, analytics);
          if (res) loadMore._controller.setVariantsData(loadMore._controller.getVariantsData(res));
          loadMore._controller.initDependencies();
          loadMore._controller.bindEvents();
        })
        .fail(function () {
          // TODO:...
        });
    }
  };

  module.exports = loadMore;
});
