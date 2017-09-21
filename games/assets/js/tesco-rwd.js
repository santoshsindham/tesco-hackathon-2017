/** @namespace {Object} The main Tesco Direct site namespace */
var TESCO = TESCO || {};
/*!
 * TESCO RWD - Header module
 */

/*global window, document, $:false, jQuery, LBI, self, Modernizr */


/** @namespace */
TESCO.bp = {

	//viewport variables
	mobile: false,
	vTablet: false,
	hTablet: false,
	desktop: false,
	largeDesktop: false,
	kiosk: false,

	/**
	 * Check which viewport we are in, entered & left and run the relevant function.
	 */
	check: function () {

		var windowWidth = $(window).innerWidth();
		var self = this;


		//mobile
		if (windowWidth > 599) {
			if (self.mobile) {
				self.mobileOut();
			}
		}

		//Vertical Tablet
		if (windowWidth < 600 || windowWidth > 767) {
			if (self.vTablet) {
				self.vTabletOut();
			}
		}
		//Horizontal Tablet
		if (windowWidth < 768 || windowWidth > 959) {
			if (self.hTablet) {
				self.hTabletOut();
			}
		}
		//Desktop
		if (windowWidth < 960 || windowWidth > 1199) {
			if (self.desktop) {
				self.desktopOut();
			}
		}
		if (window.isKiosk() === false) {
			// Large Desktop
			if (windowWidth < 1200) {
				if (self.largeDesktop) {
					self.largeDesktopOut();
				}
			}
		} else {
			// Large Desktop on Kiosk
			if (windowWidth < 1200 || windowWidth > 1789) {
				if (self.largeDesktop) {
					self.largeDesktopOut();
				}
			}
			// Kiosk
			if (windowWidth < 1790) {
				if (self.kiosk) {
					self.kioskOut();
				}
			}
		}

		//mobile
		if (windowWidth < 600) {
			if (!self.mobile) {
				self.mobileIn();
			}
		}
		//Vertical Tablet
		if (windowWidth > 599 && windowWidth < 768) {
			if (!self.vTablet) {
				self.vTabletIn();
			}
		}
		//Horizontal Tablet
		if (windowWidth > 767 && windowWidth < 960) {
			if (!self.hTablet) {
				self.hTabletIn();
			}
		}
		//Desktop
		if (windowWidth > 959 && windowWidth < 1200) {
			if (!self.desktop) {
				self.desktopIn();
			}
		}
		if (window.isKiosk() === false) {
			//Large Desktop
			if (windowWidth > 1199) {
				if (!self.largeDesktop) {
					self.largeDesktopIn();
				}
			}
		} else {
			// Large Desktop on Kiosk
			if (windowWidth > 1199 && windowWidth < 1790) {
				if (!self.largeDesktop) {
					self.largeDesktopIn();
				}
			}
			// Kiosk
			if (windowWidth > 1789) {
				if (!self.kiosk) {
					self.kioskIn();
				}
			}
		}
	},


	/**
	 * Mobile in functions
	 */
	mobileIn: function () {
		var self = this;
		self.mobile = true;
		$('#mobile-css').removeProp('disabled');
		$('#tablet-css').removeProp('disabled');
		TESCO.tileCarousel.setNumPanels(1);
		TESCO.tileCarousel.resetAll();
		TESCO.productTile.Height.init();
		TESCO.header.setButtonText('in');
		TESCO.mainNav.setSmall();
		TESCO.footer.checkAccordianItemsHeight($(".accordion"));
		TESCO.breadcrumb.mobile(true);
		TESCO.loadMore.showTile('small');
		TESCO.addToCompare.init('mobile');
		if ($('#recently-viewed').length) {
			TESCO.recentlyViewed.mobile(true);
			TESCO.recentlyViewed.smallTitle(true);
		}
		TESCO.productFilters.touch.init();
		TESCO.expandCollapse.init();
		if (TESCO.buyFrom.moduleExists()) {
			TESCO.buyFrom.toggleAlternativeSellerLinks($(".buy-from"));
		}
	},

	/**
	 * Mobile out functions
	 */
	mobileOut: function () {
		var self = this;
		self.mobile = false;
		TESCO.header.setButtonText('out');
		TESCO.breadcrumb.mobile(false);
		TESCO.footer.checkAccordianItemsHeight($(".accordion"));
		if ($('#recently-viewed').length) {
			TESCO.recentlyViewed.mobile(false);
		}
		TESCO.productFilters.touch.reset();
	},



	/**
	 * Vertical Tablet in functions
	 */
	vTabletIn: function () {
		var self = this;
		self.vTablet = true;
		$('#tablet-css').removeProp('disabled');
		$('#mobile-css').removeProp('disabled');
		TESCO.tileCarousel.setNumPanels(2);
		TESCO.tileCarousel.resetAll();
		TESCO.productTile.Height.init();
		TESCO.mainNav.setSmall();
		TESCO.loadMore.showTile('medium');
		TESCO.addToCompare.init('mobile');
		if ($('#recently-viewed').length) {
			TESCO.recentlyViewed.smallTitle(true);
		}
		TESCO.productFilters.touch.init();
		TESCO.expandCollapse.init();
		if (TESCO.buyFrom.moduleExists()) {
			TESCO.buyFrom.toggleAlternativeSellerLinks($(".buy-from"));
		}
	},

	/**
	 * Vertical Tablet out functions
	 */
	vTabletOut: function () {
		var self = this;
		self.vTablet = false;
		TESCO.productFilters.touch.reset();
	},



	/**
	 * Horizontal Tablet in functions
	 */
	hTabletIn: function () {
		var self = this;
		self.hTablet = true;
		$('#tablet-css').removeProp('disabled');
		$('#mobile-css').removeProp('disabled');
		TESCO.tileCarousel.setNumPanels(2);
		TESCO.tileCarousel.resetAll();
		TESCO.productTile.Height.init();
		TESCO.mainNav.setLarge();
		TESCO.loadMore.showTile('medium');
		TESCO.addToCompare.init('mobile');
		if ($('#recently-viewed').length) {
			TESCO.recentlyViewed.smallTitle(false);
		}
		TESCO.productFilters.touch.init();
		if (TESCO.buyFrom.moduleExists()) {
			TESCO.buyFrom.toggleAlternativeSellerLinks($(".buy-from"));
		}

	},

	/**
	 * Horizontal Tablet out functions
	 */
	hTabletOut: function () {
		var self = this;
		self.hTablet = false;
		TESCO.productFilters.touch.reset();
	},



	/**
	 * Desktop in functions
	 */
	desktopIn: function () {
		var self = this;
		self.desktop = true;
		// Load remaining CSS
		$('#desktop-css').removeProp('disabled');
		TESCO.tileCarousel.setNumPanels(4);
		TESCO.tileCarousel.resetAll();
		TESCO.productTile.Height.init();
		TESCO.mainNav.setLarge();
		TESCO.colourSwatch.init();
		TESCO.loadMore.showTile('large');
		TESCO.addToCompare.init();
		TESCO.productFilters.allDesktop.init();
		TESCO.productFilters.desktop.init();
		TESCO.productFilters.desktop.setFilterOptionHeights($('#product-filters li.selected .filter-options'));
		if (TESCO.buyFrom.moduleExists()) {
			TESCO.buyFrom.toggleAlternativeSellerLinks($(".buy-from"));
		}
	},

	/**
	 * Desktop out functions
	 */
	desktopOut: function () {
		var self = this;
		self.desktop = false;
		TESCO.productFilters.allDesktop.reset();
		TESCO.productFilters.desktop.reset();
	},



	/**
	 * Large desktop in functions
	 */
	largeDesktopIn: function () {
		var self = this;
		self.largeDesktop = true;
		// Load remaining CSS
		$('#large-desktop-css').removeProp('disabled');
		TESCO.tileCarousel.setNumPanels(4);
		TESCO.tileCarousel.resetAll();
		TESCO.productTile.Height.init();
		TESCO.mainNav.setLarge();
		TESCO.colourSwatch.init();
		TESCO.loadMore.showTile('large');
		TESCO.addToCompare.init();
		TESCO.productFilters.allDesktop.init();
		if (TESCO.buyFrom.moduleExists()) {
			TESCO.buyFrom.toggleAlternativeSellerLinks($(".buy-from"));
		}
	},

	/**
	 * Large desktop out functions
	 */
	largeDesktopOut: function () {
		var self = this;
		self.largeDesktop = false;
		TESCO.productFilters.allDesktop.reset();
	},



	/**
	 * Kiosk in functions
	 */
	kioskIn: function () {
		var self = this;
		self.kiosk = true;
		$('#desktop-css').prop('disabled');
		$('#large-desktop-css').prop('disabled');
		$('#kiosk-css').removeProp('disabled');
		$('html').addClass('kiosk');
		TESCO.tileCarousel.setNumPanels(6);
		TESCO.tileCarousel.resetAll();
		TESCO.productTile.Height.init();
		TESCO.mainNav.setLarge();
		TESCO.addToCompare.init('kiosk');
		TESCO.colourSwatch.init('kiosk');
		TESCO.productFilters.kiosk.init();
	},

	/**
	 * Kiosk out functions
	 */
	kioskOut: function () {
		var self = this;
		self.kiosk = false;
		$('#desktop-css').removeProp('disabled');
		$('#large-desktop-css').removeProp('disabled');
		$('#kiosk-css').prop('disabled');
		$('html').removeClass('kiosk');
		$('h1.page-title').trigger('destroy');
	},



	/**
	 * Initialize breakpoint check. Add event listeners to resize and orientation size.
	 */
	init: function () {
		var self = this;

		//self.setup();
		self.check();

		$(window).resize(function () {
			self.check();
			TESCO.resizeFunctions();
		});

		//orientation change
		$(window).bind('orientationchange', function () {
			self.check();
			TESCO.resizeFunctions();
		});
	}
};


/**
 * Functions that need to trigger
 */
TESCO.resizeFunctions = function () {
	//window.setTimeout(TESCO.breadcrumb.truncate, 100); //delay to allow dom update with css
	window.setTimeout(TESCO.grid.init, 100);
};


/**
 * Supress any console logs which may have made it into the build.
 */
TESCO.supressConsoleLogs = function () {
	if (typeof 'console' === 'undefined') {
		window.console = {
			log: function () {
				// this empty function captures console.log events
			}
		};
	}
};

/**
 * Additional touch detection for Windows mobile
 */
TESCO.ieTouch = function () {
	var IEhasTouch = navigator.msMaxTouchPoints > 0;
	if (IEhasTouch) {
		$('html').removeClass('no-touch').addClass('touch');
	}
};

//Are there any dropdowns active?
TESCO.activeDropdownClose = null;

/**
 * Check if any other dropdowns are visible, if so close them first!
 * @param  {function} toggle The toggle function for the dropdown
 */
TESCO.dropdownCheck = function (toggle) {

	if (TESCO.activeDropdownClose !== null) {
		TESCO.activeDropdownClose();
	}

	TESCO.activeDropdownClose = toggle;

};

/**
 * Unbind and cleanup dropdown close detection
 */
TESCO.clearCancelDropdown = function () {
	$('body').unbind('tap click touchstart touchend touchmove onclick');
	TESCO.activeDropdownClose = null;
};

/**
 * Hide address bar on mobile browsers to make use of the full screen.
 */
TESCO.hideAddressBar = function () {
	setTimeout(function () {
		// Hide the address bar!
		window.scrollTo(0, 1);
	}, 0);
};


TESCO.androidDetect = function () {
	var ua = navigator.userAgent.toLowerCase();
	var isAndroid = ua.indexOf("android") > -1;
	if (isAndroid) {
		$('html').addClass('android');
	}
};


//Document ready!
$(document).ready(function () {

	/** pre module setup **/
	TESCO.ieTouch();
	TESCO.androidDetect();


	/** Init modules in this order **/
	TESCO.header.init();
	TESCO.carousel.init();
	TESCO.mainNav.init();

	// TESCO Modification
	TESCO.Utils.viewport.init();
	// -->

	TESCO.Navigation.init();
	TESCO.productTile.Ellipsis.init();
	TESCO.VisualNav.init();
	TESCO.basketPreview.init();
	TESCO.breadcrumb.init();
	TESCO.tileCarousel.init();
	TESCO.tileCarousel.initTabs();
	$('h1.page-title').dotdotdot({
		ellipsis: '…',
		wrap: 'letter',
		watch: true
	});
	if ($('#recently-viewed').length) {
		TESCO.recentlyViewed.init();
	}
	TESCO.addToBasket.init();
	TESCO.productSortBy.init();
	TESCO.footer.init();
	TESCO.loadMore.init();
	TESCO.signIn.init();
	TESCO.register.init();
	//Run breakpoint dependant JS
	TESCO.bp.init();
	TESCO.hideAddressBar();
	TESCO.supressConsoleLogs();
	TESCO.sortBy.init();
	TESCO.buyFrom.init();
	TESCO.basketAttach.init();
	//remove animation preload class
	$('body').removeClass('preload');

});