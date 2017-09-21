define('modules/pdp/pageControllerMap', [
  'modules/pdp/controllers/ProductPageController',
  'modules/pdp/controllers/ListingPageController'
], function (ProductPageController, ListingPageController) {
  'use strict';

  var pageControllerMap = {
    controller: {
      productDetails: ProductPageController,
      listings: ListingPageController
    },
    get: function (pageGroup) {
      return pageControllerMap.controller[pageGroup] || null;
    }
  };

  return pageControllerMap;
});
