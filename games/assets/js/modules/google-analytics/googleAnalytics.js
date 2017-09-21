/* globals define,window,document,s,$ */
define('modules/google-analytics/googleAnalytics', ['modules/common', 'modules/google-analytics/cookie', 'modules/google-analytics/pdpTracking', 'modules/google-analytics/orderTracking', 'modules/breakpoint'], function (common, cookie, pdpTracking, orderTracking, breakPoint) {
  'use strict';

  var GAModule = {
    getUserID: function getUserID() {
      return window.s.eVar24 !== undefined ? window.s.eVar24 : 'null';
    },
    getFirstTimeShopper: function getFirstTimeShopper() {
      if (window.s) {
        return window.s.prop7 === 'repeat customer' ? 'false' : 'true';
      }
      return 'false';
    },
    getViewport: function getViewport() {
      var sViewport = 'BIGWEB';

      if (breakPoint.mobile || breakPoint.vTablet || breakPoint.hTablet) {
        sViewport = 'MWEB';
      }
      return sViewport;
    },
    createGAData: function createGAData() {
      return {
        dimension1: this.getUserID(),
        dimension2: this.getFirstTimeShopper(),
        dimension3: this.getViewport(),
        dimension4: 'GMO'
      };
    }
  };

  common.init.push(function () {
    if (!cookie.getCookieFromPaidSearch()) {
      cookie.setCookieIfFromPaidSearch(document.referrer);
    }
    if (common.isPage('orderConfirmation')) {
      orderTracking.setOrderConfirmationPageView();
    }
    if (window.ga) {
      if (!common.isPage('PDP')) {
        if (window.AsyncBlockController.isCachedPage()
        && !window.AsyncBlockController.hasCompleted()) {
          $(window).on('AsyncBlockControllerComplete', function () {
            window.ga('send', 'pageview', GAModule.createGAData());
          });
        } else {
          window.ga('send', 'pageview', GAModule.createGAData());
        }
      }
    }
  });
});
