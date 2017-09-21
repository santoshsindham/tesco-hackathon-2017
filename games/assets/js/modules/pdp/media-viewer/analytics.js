define('modules/pdp/media-viewer/analytics', [
  'modules/tesco.analytics',
  'modules/device-specifications/common',
  'modules/pdp/media-viewer/config'
], function (
  analytics,
  deviceSpecifications,
  config
) {
  'use strict';

  var mediaViewerAnalytics = {},
    oAnalyticsVars = {};

  mediaViewerAnalytics.analyticsThumbClick = function (analyticThumbIndex) {
    var imagePathFull = null,
      imagePathTruncate = null,
      imageIdentity = null,
      _oWebAnalytics = new analytics.WebMetrics();

    imagePathFull = $(config.sDOM_SELECTORS.mvCarousel).find('.active img').attr('src');

    if (imagePathFull === undefined || imagePathFull === null) {
      imagePathFull = $(config.sDOM_SELECTORS.mvCarousel).find('.active span').attr('class');
    }

    imagePathTruncate = imagePathFull.split('?')[0];
    imageIdentity = imagePathTruncate.substring(
      imagePathTruncate.lastIndexOf('/') + 1, imagePathTruncate.length
    );

    _oWebAnalytics.submit([{
      prop19: 'carousel items container - ' + imageIdentity,
      eVar45: 'carousel items container - ' + imageIdentity,
      prop42: 'pdp - carousel items container - p' + analyticThumbIndex,
      eVar59: 'pdp - carousel items container - p' + analyticThumbIndex,
      events: 'event45'
    }]);
  };

  mediaViewerAnalytics.setOmnitureDefaults = function setOmnitureDefaults() {
    var sBreadCrumbText = [],
      sText = '';

    $('li a', $('#breadcrumb')).each(function () {
      sText = $.trim($(this).text());
      sBreadCrumbText.push(sText);
    });

    if (sBreadCrumbText[1]) {
      oAnalyticsVars.prop1 = sBreadCrumbText[1];
    }

    if (sBreadCrumbText[2]) {
      oAnalyticsVars.prop2 = sBreadCrumbText[2];
    }

    if (sBreadCrumbText[3]) {
      oAnalyticsVars.prop3 = sBreadCrumbText[3];
    }

    sBreadCrumbText.length = 0;

    oAnalyticsVars.eVar56 = deviceSpecifications.os;
    oAnalyticsVars.prop23 = deviceSpecifications.os;

    if (window.refEvar22) {
      oAnalyticsVars.eVar22 = window.refEvar22;
    }

    if (window.refEvar24) {
      oAnalyticsVars.eVar24 = window.refEvar24;
    }
  };

  return mediaViewerAnalytics;
});
