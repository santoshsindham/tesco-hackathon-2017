/**
 * Main.js for Tesco Direct
 */

var TESCO = TESCO || {};

/** Mobile check **/
var isTouch = function () {
  // might need to imporove this for touch capabilities???
  var supportZepto = ('__proto__' in {}) ? true : false;

  if (Modernizr.touch && supportZepto && !window.isKiosk()) {
    window.zeptoMerge();
    return true;
  } else {
    return false;
  }
};


/***
 * If Zepto is supported by the device, we need to override the default $ variable from jQuery to Zepto
 * jQuery is loaded by default due to the inline jQuery dependancies which cannot be removed from the site.
 * Semi-violating require.js modular pattern, but other modules are using the correct format.
 */
var zeptoMerge = function () {
  if (!navigator.userAgent.match(/MSIE\s/)) {
    if (typeof $.hasMergedNow === 'undefined' && typeof window.Zepto !== 'undefined') {
      window.Zepto.hasMergedNow = true;
      $.extend(false, $, window.Zepto);
    }
  }
};

/** Configuration **/
require.config({
	baseUrl: '/directuiassets/SiteAssets/NonSeasonal/en_GB/js',
	waitSeconds: 15,
	paths: {
		'domlib': 'lib/domlib.legacy',
		'placeholder': 'lib/html5placeholder.jquery',
		'orientationFix': 'lib/ios-orientation-fix',
		'validate': 'lib/jquery.validate',
		'validate.methods': 'lib/jquery.validate.methods',
		'zepto.scroll': 'lib/zepto.scroll',
		'zepto.extras': 'lib/zepto.extras',
		'dotdotdot': 'lib/jquery.zepto.dotdotdot-1.5.6',
		'zepto.selector': 'lib/zepto.selector',
		'zepto.assets': 'lib/zepto.assets',
		'zepto.touch': 'lib/zepto.touch',
		'jquery.touch': 'lib/jquery.zepto.touch.legacy',
		'zepto.data': 'lib/zepto.data',
		'zepto.ghostclick': 'lib/zepto.ghostclick',
		'zepto.stack': 'lib/zepto.stack',
		'pinit': 'lib/pinit',		
		'jquery.cookie': 'lib/jquery.cookie',
		'jquery.datepicker': 'lib/bootstrap-datepicker',
		'fastclick': 'lib/fast-click',
		'mustache': 'lib/mustache',
		'password.strength': 'lib/password.strength',
		'hoverIntent': 'lib/jquery.hoverIntent',
        'jquery.countdown': 'lib/jquery.countdown',
		'backbone': 'lib/backbone-1.1.2.min',
		'underscore': 'lib/underscore-1.6.0.min'
	},
	shim: {
		'domlib': {
			exports: '$'
		},
		'zepto.scroll': {
			deps: ['domlib'],
			exports: '$'
		},
		'zepto.stack': {
			deps: ['domlib'],
			exports: '$'
		},
		'zepto.extras': {
			deps: ['domlib'],
			exports: '$'
		},
		'zepto.selector': {
			deps: ['domlib', 'zepto.extras'],
			exports: '$'
		},
		'zepto.assets': {
			deps: ['domlib'],
			exports: '$'
		},
		'zepto.touch': {
			deps: ['domlib'],
			exports: '$'
		},
		'jquery.touch': {
			deps: ['domlib'],
			exports: '$'
		},
		'zepto.data': {
			deps: ['domlib'],
			exports: '$'
		},
		'zepto.ghostclick': {
			deps: ['domlib'],
			exports: '$'
		},
		'placeholder': ['domlib'],
		'jQueryUI': ['domlib'],
		'validate': ['domlib'],
		'validate.methods': ['domlib', 'validate'],
		'dotdotdot': ['domlib'],
		'pinit': ['pinit'],		
		'jquery.cookie': ['domlib'],
		'jquery.datepicker': ['domlib'],
		'jquery.countdown': ['domlib'],
		'fastclick': []
	}
});

if (isTouch() && !window.isKiosk()) {
  require([
    'domlib',
    'jquery.cookie',
    'modules/asyncBlock',
    'modules/recommenders/common',
    'modules/adsense/index',
    'modules/analytics/common',
    'modules/product-description/eventMessagingCountDown',
    'orientationFix',
    'zepto.extras',
    'zepto.scroll',
    'zepto.selector',
    'zepto.touch',
    'zepto.assets',
    'zepto.data',
    'zepto.ghostclick',
    'zepto.stack',
    'touch'
  ], function () {
    if (window.addEventListener) {
      // For some reason iPad (iOS7) there appears to be a delay in firing the resize event, there for I've applied the orientation event first....
      window.addEventListener('orientationchange', function () {
        window.updateStyleSheet(true);
      }, false);
      window.addEventListener('resize', function () {
        window.currentViewportHeight = $(window).height();
        window.updateStyleSheet(true);
      }, false);
    }
    zeptoMerge();
    // iOS issue with click events on elements which are not "supposed" to be clicked.
    if (/ip(hone|od)|ipad/i.test(navigator.userAgent)) {
      $('body').css('cursor', 'pointer');
    }
  });
} else if (window.isKiosk()) {
  require([
    'domlib',
    'modules/asyncBlock',
    'modules/recommenders/common',
    'modules/adsense/index',
    'modules/analytics/common',
    'modules/product-description/eventMessagingCountDown',
    'jquery.cookie',
    'jquery.touch',
    'kiosk'
  ], function () {

  });
} else {
  require([
    'domlib',
    'modules/asyncBlock',
    'modules/recommenders/common',
    'modules/adsense/index',
    'modules/analytics/common',
    'modules/product-description/eventMessagingCountDown',
    'modules/cursor-movement/common',
    'jquery.cookie',
    'desktop'
  ], function () {
    $(window).resize(function () {
      window.currentViewportHeight = $(window).height();
      window.updateStyleSheet(true);
    });
  });
}
