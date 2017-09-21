window.TESCO = window.TESCO || {};


/**
 * @return {boolean}
 */
window.isTouch = function () {
  if (window.Modernizr.touch && !window.isKiosk()) {
    return true;
  }

  return false;
};


require([
  'domlib',
  'modules/breakpoint',
  'modules/common',
  'modules/asyncBlock',
  'modules/adsense/index',
  'modules/analytics/common',
  'modules/domlib-utils/common',
  'validate',
  'modules/google-analytics/googleAnalytics',
  'modules/ui-components/common',
  'dotdotdot',
  'modules/dfp/common'
], function () {});


if (window.isTouch() && !window.isKiosk()) {
  require([
    'orientationFix',
    'jquery.touch'
  ], function () {
    if (window.addEventListener) {
      /*
        * For some reason iPad (iOS7) there appears to be a delay in firing the resize event,
        * there for I've applied the orientation event first...
        */
      window.addEventListener('orientationchange', function () {
        window.updateStyleSheet(true);
      }, false);
      window.addEventListener('resize', function () {
        window.currentViewportHeight = $(window).height();
        window.updateStyleSheet(true);
      }, false);
    }

    /*
      * iOS issue with click events on elements which are not "supposed" to be clicked.
      */
    if (/ip(hone|od)|ipad/i.test(navigator.userAgent)) {
      $('body').css('cursor', 'pointer');
    }

  });
} else if (window.isKiosk()) {
  require([
    'jquery.touch'
  ], function () {
    var invokePictureFillHQKiosk = function () {
      var $ps = null,
        $picImg = null,
        $picSrc = null;

      $ps = $('.product-carousel').not('#listing').find('a.thumbnail div');
      $ps.each(function loopPictureDivs() {
        if ($(this).data('picture') !== null) {
          if ($(this).find('img')) {
            $picImg = $(this)
              .find('img')
              .eq(0);
            $picSrc = $(this)
              .find('div')
              .eq(0)
              .data('src');

            if ($picSrc !== null) {
              $picImg.prop('src', $picSrc);
            }
          }
        }
      });
      $(window).off('pictureFill.complete.invoke', invokePictureFillHQKiosk);
    };

    $(window).on('pictureFill.complete.invoke', invokePictureFillHQKiosk);
  });
} else {
  require([
    'modules/cursor-movement/common'
  ], function () {
    $(window).resize(function () {
      window.currentViewportHeight = $(window).height();
      window.updateStyleSheet(true);
    });
  });
}
