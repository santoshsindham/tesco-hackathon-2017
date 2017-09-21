define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    createElements = require('modules/helpers/create-elements/index');

  /**
   * AdSense Custom Search Ads documentation can be found here:
   * https://developers.google.com/custom-search-ads/docs/reference
   *
   * @constructor
   * @param {Object} config
   * @return {void}
   */
  function Adsense(config) {
    var _config = config || {};

    if (window.isKiosk()) {
      return;
    }

    this._errors = [];

    if (!_config.placeholder || typeof _config.placeholder !== 'string') {
      this._errors.push('Adsense module: Placeholder property is not valid.');
    }

    if (!$('#' + _config.placeholder).length) {
      this._errors.push('Adsense module: Placeholder is not a valid selector.');
    }

    if (!_config.container || typeof _config.container !== 'string') {
      this._errors.push('Adsense module: Container property is not valid.');
    }

    if (!_config.query || typeof _config.query !== 'string') {
      this._errors.push('Adsense module: Query property is not valid.');
    }

    if (this._errors.length) {
      return;
    }

    this._placeholder = _config.placeholder;

    // AdSense Page Level Parameters
    this._pageOptions = {
      // Required
      pubId: 'tesco-com-vip',
      query: this._santizeQuery(_config.query),
      // Optional
      adsafe: 'high',
      adtest: 'off',
      hl: 'en',
      ie: 'utf-8',
      oe: 'utf-8',
      domainLinkAboveDescription: true,
      fontSizeLocation: 12,
      clickToCall: true,
      location: true,
      sellerRatings: true,
      siteLinks: typeof _config.siteLinks === 'boolean' ? _config.siteLinks : true
    };

    // AdSense Unit Level Parameters
    this._unitOptions = {
      // Required
      container: _config.container,
      width: '100%',
      // Optional
      number: _config.number || 4,
      fontSizeDescription: 11,
      fontSizeDomainLink: 11,
      fontSizeTitle: 12,
      colorAdSeparator: 'EEEEEE',
      colorDomainLink: '00539F',
      colorText: '666666',
      colorTitleLink: '00539F',
      noTitleUnderline: true,
      titleBold: true,
      longerHeadlines: typeof _config.longerHeadlines === 'boolean'
          ? _config.longerHeadlines : true,
      // Not documented
      adLayout: 'sellerFirst',
      adLoadedCallback: typeof _config._adLoadedCallback === 'function'
          ? _config._adLoadedCallback : this._adLoadedCallback
    };

    this._containerOptions = fn.isObject(_config.containerOptions)
        ? _config.containerOptions : { tagName: 'div', id: _config.container };
  }

  Adsense.prototype = {
    /**
     *
     * @param {string} container
     * @param {boolean} loaded
     * @return {void}
     */
    _adLoadedCallback: function (container, loaded) {
      if (!loaded) {
        $('#' + this._placeholder)[0].innerHTML = '';
      }
    },
    /**
     *
     * @private
     * @return {string}
     */
    _buildContainer: function () {
      var output = createElements(this._containerOptions);

      if (output.errors.length) {
        this._errors = this._errors.concat(output.errors);
      }

      return output.elements;
    },
    /**
     *
     * @private
     * @param {string} query
     * @return {string}
     */
    _santizeQuery: function (query) {
      return query.replace(/&amp;/g, '&');
    },
    /**
     *
     * @return {void|Object}
     */
    render: function () {
      var container = null,
        placeholder = null;

      if (window.isKiosk()) {
        return {};
      }

      if (!this._errors.length) {
        container = this._buildContainer();
      }

      if (this._errors.length) {
        return { errors: this._errors };
      }

      placeholder = $('#' + this._placeholder);
      placeholder[0].appendChild(container);

      try {
        // eslint-disable-next-line
        new google.ads.search.Ads(this._pageOptions, this._unitOptions);
      } catch (err) {
        placeholder[0].innerHTML = '';
        this._errors.push('Adsense module: ' + err);
      }

      if (this._errors.length) {
        return { errors: this._errors };
      }

      return {};
    }
  };

  module.exports = Adsense;
});
