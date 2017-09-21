/*
This file contains all the inline global variable dependancies blah blah blah used for testing purposes only!
*/

/** Mobile check **/

var isTouch = function () {
	//might need to imporove this for touch capabilities???
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
		if (typeof $.hasMergedNow === "undefined" && typeof window.Zepto !== "undefined") {
			window.Zepto.hasMergedNow = true;
			$.extend(false, $, window.Zepto);
		}
	}
}

window.ENV = 'buildkit';

window.globalSecureStaticJSPath = 'http://trunk.buildkit.tscl.com:80/assets/js/';

isKiosk = function () {
	if (document.location.href.indexOf('kiosk') > 0) {
		if (!document.documentElement.className.match(new RegExp('(\s|^)testKiosk(\s|$)'))) {
			document.documentElement.className += ' testKiosk';
		}
		return true;
	} else {
		return !!navigator.userAgent.match(/(KIOSKNAME)\S/gi) && !!navigator.userAgent.match(/(STOREID)\S/gi);
	}
}
getScreenWidth = function () {
	var x = 0;
	if (window.innerHeight) {
		x = window.innerWidth;
	} else if (document.documentElement && document.documentElement.clientHeight) {
		x = document.documentElement.clientWidth;
	} else if (document.body) {
		x = document.body.clientWidth;
	}
	x = Math.ceil(x);
	return x;
}

var ADSIZE = {
	"MPU_S": [320, 50],
	"MPU_M": [320, 50],
	"MPU_L": [300, 250],
	"MPU_LL": [300, 250],
	"SkyScrapper_S": [320, 50],
	"SkyScrapper_M": [468, 60],
	"SkyScrapper_L": [728, 90],
	"SkyScrapper_LL": [160, 600]
};

addToDOM = function (sRef, bAfterLoad) {
	if (bAfterLoad) {
		$('head').append(sRef);
	} else {
		document.write(sRef);
	}
}

window.updateStyleSheet = function (bAfterLoad) {
	var width = getScreenWidth(),
		smallViewPort = 600,
		mediumViewPort = 960,
		largeViewPort = 1200;

	if (window.isKiosk()) {
		if (!document.getElementById('kiosk-css')) {
			window.addToDOM('<link rel="stylesheet" id="kiosk-css" href="http://trunk.buildkit.tscl.com:80/assets/css/all-styles-kiosk.css?t=37f227c67a6f408cfda57d14462f00e3" media="screen and (min-width: 1790px)" />', bAfterLoad);
		}
	} else if (width < 600) {
		if (!document.getElementById('mobile-css')) {
			window.addToDOM('<link rel="stylesheet" id="mobile-css" href="http://trunk.buildkit.tscl.com:80/assets/css/all-styles-mobile.css?t=37f227c67a6f408cfda57d14462f00e3" media="screen and (max-width: 599px)" />', bAfterLoad);
		}
	} else if (width > (600 - 1) && width < 960) {
		if (!document.getElementById('tablet-css')) {
			window.addToDOM('<link rel="stylesheet" id="tablet-css" href="http://trunk.buildkit.tscl.com:80/assets/css/all-styles-tablet.css?t=37f227c67a6f408cfda57d14462f00e3" media="screen and (min-width: ' + smallViewPort + 'px) and (max-width: ' + (mediumViewPort - 1) + 'px)" />', bAfterLoad);
		}
	} else if (width > (960 - 1) && width < 1200) {
		if (!document.getElementById('desktop-css')) {
			window.addToDOM('<link rel="stylesheet" id="desktop-css" href="http://trunk.buildkit.tscl.com:80/assets/css/all-styles-desktop.css?t=37f227c67a6f408cfda57d14462f00e3" media="screen and (min-width: ' + mediumViewPort + 'px) and (max-width: ' + (largeViewPort - 1) + 'px)" />', bAfterLoad);
		}
	} else if (width > (largeViewPort - 1)) {
		if (!document.getElementById('large-desktop-css')) {
			window.addToDOM('<link rel="stylesheet" id="large-desktop-css" href="http://trunk.buildkit.tscl.com:80/assets/css/all-styles-large-desktop.css?t=37f227c67a6f408cfda57d14462f00e3" media="screen and (min-width: 1200px)" />', bAfterLoad);
		}
	}
}

// Trigger default call
window.updateStyleSheet(false);

if (window.isKiosk()) {
	document.documentElement.className += ' kiosk';
	var windowWidth = parseInt(window.innerWidth, 10);
	if (windowWidth > 1800) {
		var e = document.getElementById('large-desktop-css');
		if (e !== null) {
			e.disabled = true;
		}
	}
}