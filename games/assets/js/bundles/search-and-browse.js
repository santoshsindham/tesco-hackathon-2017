require([
  'modules/tile-carousel/common',
  'modules/footer/common',
  'modules/breadcrumb/common',
  'modules/navigation/common',
  'modules/catalog-navigation/init',
  'modules/fixed-header/init',
  'modules/product-offers/common',
  'modules/product-sort-by/common',
  'modules/recently-viewed/common',
  'modules/product-filters/common',
  'modules/home-page-stamps/common',
  'modules/basket/common',
  'modules/compare-page/common',
  'modules/visual-nav/common',
  'modules/seller-directory/common',
  'modules/buying-guides/common',
  'modules/buying-guides-directory/common',
  'modules/deferred-block/common',
  'modules/pdp-configurator/common',
  'modules/pdp/controllers/AppController',
  'modules/ues/common',
  'modules/hooklogic/common',
  'modules/affiliate/common',
  'modules/add-on-items/common'
], function () {});


if (window.isTouch() && !window.isKiosk()) {
  require([
    'modules/carousel/touch',
    'modules/tile-carousel/touch',
    'modules/buy-from/touch',
    'modules/add-to-compare/touch',
    'modules/delivery-options/touch',
    'modules/save-for-later/touch',
    'modules/product-description/touch',
    'modules/scroll-to/touch'
  ], function () {});
} else if (window.isKiosk()) {
  require([
    'modules/carousel/desktop',
    'modules/tile-carousel/kiosk',
    'modules/buy-from/kiosk',
    'modules/basket/kiosk',
    'modules/product-description/kiosk',
    'modules/delivery-options/desktop',
    'modules/scroll-to/desktop'
  ], function () {});
} else {
  require([
    'modules/carousel/desktop',
    'modules/tile-carousel/desktop',
    'modules/buy-from/desktop',
    'modules/add-to-compare/desktop',
    'modules/product-description/desktop',
    'modules/delivery-options/desktop',
    'modules/save-for-later/desktop',
    'modules/scroll-to/desktop'
  ], function () {});
}


require(['modules/common', 'modules/breakpoint'], function (common, breakpoint) {
  $(function () {
    if (window.isTouch()) {
      common.androidDetect();
    } else {
      common.windowsPhoneDetect();
    }

    breakpoint.init();
    breakpoint.check();
    common.app();
    common.helpRatings();
    setTimeout(function () {
      breakpoint.update(breakpoint.check(true));
    }, 4);
  });
});
