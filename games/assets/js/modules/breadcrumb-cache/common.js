define(function (require, exports, module) {
  'use strict';

  var common = require('modules/common'),
    fn = require('modules/mvc/fn'),
    mustache = require('mustache'),
    template = require('text!templates/views/breadcrumbListView.html'),
    breadcrumbCache = null;

  breadcrumbCache = {
    allowedParams: { catId: true, searchquery: true },
    breadcrumbKey: 'breadcrumbs',
    plpBreadcrumbId: null,
    pdpBreadcrumbId: null,
    /**
     *
     * @param {Object} options
     * @return {void}
     */
    init: function init(options) {
      var _options = options || {},
        breadcrumb = null;

      this.pdpBreadcrumbId = _options.pdpBreadcrumbId || 'breadcrumb-v2';
      this.plpBreadcrumbId = _options.plpBreadcrumbId || 'breadcrumb';

      if (window.localStorage) {
        if (common.isPage('PLP')) {
          this.cacheBreadcrumb(document.location.href + document.location.search);
        } else if (common.isPage('PDP')) {
          this.renderBreadcrumb(document.referrer);
          breadcrumb = document.getElementById(this.pdpBreadcrumbId);

          if (breadcrumb) {
            breadcrumb.style.visibility = 'visible';
          }
        }
      }
    },
    /**
     *
     * @param {string} key
     * @return {void}
     */
    renderBreadcrumb: function renderBreadcrumb(key) {
      var breadcrumb = $('#' + this.pdpBreadcrumbId + ' ul'),
        content = null,
        _key = this.normaliseKey(key),
        cache = null;

      if (!breadcrumb.length || !_key) {
        return;
      }

      cache = this.getCache();
      content = cache[_key];

      if (!content) {
        return;
      }

      breadcrumb[0].innerHTML = mustache.render(template, { items: content });
    },
    /**
     *
     * @param {string} key
     * @return {void}
     */
    cacheBreadcrumb: function cacheBreadcrumb(key) {
      var _this = this,
        $breadcrumb = $('#' + this.plpBreadcrumbId),
        $listItems = null,
        _key = this.normaliseKey(key),
        cache = null,
        data = null;

      if ($breadcrumb.length && _key) {
        $listItems = $breadcrumb.find('li');

        data = $listItems.map(function (index, elm) {
          return _this.extractAttributes(_key, elm, index, $listItems.length);
        });

        cache = this.getCache();
        cache[_key] = data.get();
        this.saveCache(cache);
      }
    },
    /**
     *
     * @param {string} key
     * @param {Element} elm
     * @param {number} index
     * @param {number} count
     * @return {Object}
     */
    extractAttributes: function extractAttributes(key, elm, index, count) {
      var className = '',
        url = '';

      if (!elm || !elm.getAttribute) {
        return {};
      }

      if (index === 0) {
        className = 'first';
      } else if (index === count - 1) {
        className = 'last';
        url = key;
      }
      return {
        className: className,
        url: elm.getAttribute('data-bc-href') || url,
        text: elm.getAttribute('data-bc-text') || '',
        itemscope: elm.getAttribute('itemscope') || '',
        itemtype: elm.getAttribute('itemtype') || '',
        categoryID: elm.getAttribute('data-bc-category-id') || ''
      };
    },
    /**
     *
     * @return {Object}
     */
    getCache: function getCache() {
      return fn.getLocalStorageData(this.breadcrumbKey) || {};
    },
    /**
     *
     * @param {string} url
     * @return {Object}
     */
    getHierarchy: function getHierarchy(url) {
      var cache = this.getCache();
      return cache[this.normaliseKey(url)] || [];
    },
    /**
     *
     * @param {string} url
     * @return {Object}
     */
    getHierarchyIDs: function getHierarchyIDs(url) {
      var hierarchy = this.getHierarchy(url);

      var ids = hierarchy.map(function (obj) {
        return obj && obj.categoryID;
      });

      return ids.filter(function (value) {
        return !!value;
      });
    },
    /**
     *
     * @param {string} url
     * @return {Object}
     */
    getCurrentCategory: function getCurrentCategory(url) {
      var hierarchy = this.getHierarchy(url);
      return hierarchy.pop() || {};
    },
    /**
     *
     * @param {string} url
     * @return {Object}
     */
    getCurrentCategoryID: function getCurrentCategoryID(url) {
      var cat = this.getCurrentCategory(url);
      return cat.categoryID || '';
    },
    /**
     *
     * @param {Object} cache
     * @return {void}
     */
    saveCache: function saveCache(cache) {
      fn.setLocalStorageData(this.breadcrumbKey, cache);
    },
    /**
     *
     * @param {string} url
     * @return {string}
     */
    normaliseKey: function normaliseKey(url) {
      var parts = url.split('?'),
        path = parts[0] || '',
        params = parts[1] || '',
        paramsList = [],
        allowedParams = this.allowedParams;

      if (!path) {
        return '';
      }

      paramsList = params.split('&').reduce(function (accumulator, param) {
        var pair = param.split('=');

        if (pair.length > 1 && allowedParams[pair[0]]) {
          accumulator.push(param);
        }

        return accumulator;
      }, []);

      path += '?' + paramsList.join('&');
      return path;
    },


    /**
     *
     * @param {string} key
     * @return {!object}
     */
    getItem: function getItem(key) {
      var _key = this.normaliseKey(key),
        cache = this.getCache(),
        content = null;

      if (!_key) {
        return null;
      }

      content = cache[_key];

      if (!fn.isArray(content, { notEmpty: true })) {
        return null;
      }

      return content;
    },


    /**
     *
     * @param {string} key
     * @return {!string}
     */
    getCategoryID: function getCategoryID(key) {
      var content = this.getItem(key),
        categoryID = null;

      if (!content) {
        return null;
      }

      categoryID = content.pop().categoryID;

      return categoryID || null;
    }
  };

  module.exports = breadcrumbCache;
});
