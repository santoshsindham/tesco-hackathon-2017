define(function (require, exports, module) {
  'use strict';


  var breakpoint = require('modules/breakpoint');
  var productFilterTracking = {
    filters: {
      D_Price_Range: 'Applied Price Filter'
    },
    tracker: {}
  };


  /**
   *
   * @param {JQueryEvent} e
   * @returns {void}
   */
  productFilterTracking.selectFilterHandler = function selectFilterHandler(e) {
    var el = $(e.currentTarget);
    var value = el.data('facet-option-value');
    var group = el.closest('ul.filter-filterOptionListWrap').data('facet-group-name');

    if (!value || !productFilterTracking.filters[group]) return;

    var selected = el.hasClass('filter-filterOption_active');
    var label = productFilterTracking.filters[group];

    if (breakpoint.largeDesktop) {
      if (!selected) productFilterTracking.sendAnalytics(label, value);
      return;
    }

    var id = el.data('facet-option-id');

    if (selected) productFilterTracking.removeFilter(id);
    if (!selected) productFilterTracking.addFilter(id, label, value);
  };


  /**
   *
   * @param {string} id
   * @returns {void}
   */
  productFilterTracking.removeFilter = function removeFilter(id) {
    delete this.tracker[id];
  };


  /**
   *
   * @param {string} id
   * @param {string} label
   * @param {string} value
   * @returns {void}
   */
  productFilterTracking.addFilter = function addFilter(id, label, value) {
    this.tracker[id] = { label: label, value: value };
  };


  /**
   *
   * @param {string} [label]
   * @param {string} [value]
   * @returns {void}
   */
  productFilterTracking.sendAnalytics = function sendAnalytics(label, value) {
    if (!window.ga) return;

    if (label && value) {
      window.ga('send', 'event', 'GMO PLP', label, value);
      return;
    }

    var _tracker = this.tracker;

    Object.keys(_tracker).forEach(function (i) {
      window.ga('send', 'event', 'GMO PLP', _tracker[i].label, _tracker[i].value);
    });

    productFilterTracking.clearTracker();
  };


  /**
   *
   * @returns {void}
   */
  productFilterTracking.clearTracker = function clearTracker() {
    this.tracker = {};
  };


  module.exports = productFilterTracking;
});
