define('modules/pdp/reviews/bazaarvoice', [
  'modules/tesco.utils',
  'modules/product-description/common'
], function (
  tescoUtils,
  pdp
) {
  'use strict';

  var asyncBVLibrary = null,
    initBV = null,
    sSkuId = '';

  asyncBVLibrary = function (sBVSrcURL) {
    var sBVSrc = sBVSrcURL || 'http://display-stg.ugc.bazaarvoice.com/static/Tesco/bvapi.js',
      oBVJS = null,
      oHead = null;

    window.PDPLazyLoadBV = true;
    if (window.PDPLazyLoadBV) {
      $(window).load(function () {
        tescoUtils.lazyLoadJS(sBVSrc).done(function () {
          try {
            initBV(sSkuId);
          } catch (e) {
            // continue regardless of error
          }
        });
      });
    } else {
      oBVJS = document.createElement('script');
      oHead = document.getElementsByTagName('head')[0];

      oBVJS.type = 'text/javascript';
      oBVJS.src = sBVSrc;
      oBVJS.async = true;
      oHead.appendChild(oBVJS);
    }
  };

  initBV = function (sSkuIdToShow) {
    sSkuId = sSkuIdToShow;
    if (window.$BV !== undefined) {
      window.$BV.configure('global', {
        productId: sSkuId,
        events: {
          bvRender: function () {
            if (!window.isKiosk()) {
              pdp.formatCustomisedBV();
            } else {
              $(window).trigger('bazaarVoiceLoaded');
            }
          }
        }
      });
      setTimeout(function initBVInt() {
        window.$BV.ui('rr', 'show_reviews');
      }, 10);
    }
  };

  return {
    asyncBVLibrary: asyncBVLibrary,
    initBV: initBV
  };
});
