/* globals define, window, document */
define('modules/show-more/ShowMoreConfig', function () {
  'use strict';
    //
    // ShowMoreConfig
    // -------------------------------------
  return [{
    selector: '.product-description-block',
    height: 400
  }, {
    selector: '.product-spec-block',
    height: 600,
    subtreeListener: true
  }, {
    selector: '.product-spec-block-2',
    height: 600
  }, {
    selector: '.biography-block',
    height: 400
  }, {
    selector: '.synopsis-block',
    height: 400
  }, {
    selector: '.sitewide-promo-block',
    height: 400
  }];
});
