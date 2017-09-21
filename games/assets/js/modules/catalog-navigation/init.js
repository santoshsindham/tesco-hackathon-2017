define(function (require) {
  'use strict';

  var CatalogNav = require('./common');
  var common = require('../common');
  var fn = require('../mvc/fn');

  common.init.push(function () {
    var catalogNav = new CatalogNav();
    var forceTouch = fn.getValue(window, '__MVT__', 'catalogNavigation', 'forceTouch') || false;
    catalogNav.init(forceTouch);
  });
});
