/**
 * Breakpoint Module
 */
define(['domlib'], function ($) {
	return {

		//viewport variables
		mobile: false,
		vTablet: false,
		hTablet: false,
		desktop: false,
		largeDesktop: false,
		kiosk: false,

		//Function arrays to be triggered on viewport change
		mobileOut: [],
		vTabletOut: [],
		hTabletOut: [],
		desktopOut: [],
		largeDesktopOut: [],
		kioskOut: [],
		mobileIn: [],
		vTabletIn: [],
		hTabletIn: [],
		desktopIn: [],
		largeDesktopIn: [],
		kioskIn: [],
		newViewport: '',
		oldViewport: '',
		oldViewport: '',
		newViewport: '',
		currentViewport: '',
		currentWindowWidth: 0,

		/**
		 * Check to see if the viewport has changed.
		 * @return {string} breakpoint function array (false if no change)
		 */
		check: function (force) {

			var self = this,
				windowWidth = window.currentDocumentWidth, // get width of body not window to compensate for scrollbar (http://jira.lbi.co.uk/browse/TDCO-2077)
				newBreakpoint = false,
				newViewport = '',
				eBreakpointChange = $.Event('breakpointChange');

			// IN check
			// --------------------------------------


			//mobile
			if (windowWidth < 600) {
				if (!self.mobile || force) {
					newBreakpoint = 'mobileIn';
					newViewport = 'mobile';
				}
			}
			//Vertical Tablet
			if (windowWidth > 599 && windowWidth < 768) {
				if (!self.vTablet || force) {
					newBreakpoint = 'vTabletIn';
					newViewport = 'vtablet';
				}
			}
			//Horizontal Tablet
			if (windowWidth > 767 && windowWidth < 960) {
				if (!self.hTablet || force) {
					newBreakpoint = 'hTabletIn';
					newViewport = 'htablet';
				}
			}
			//Desktop
			if (windowWidth > 959 && windowWidth < 1200) {
				if (!self.desktop || force) {
					newBreakpoint = 'desktopIn';
					newViewport = 'desktop';
				}
			}
			if (window.isKiosk() === false) {
				//Large Desktop
				if (windowWidth > 1199) {
					if (!self.largeDesktop || force) {
						newBreakpoint = 'largeDesktopIn';
						newViewport = 'largedesktop';
					}
				}
			} else {
				// Large Desktop on Kiosk
				if (windowWidth > 1199 && windowWidth < 1790) {
					if (!self.largeDesktop || force) {
						newBreakpoint = 'largeDesktopIn';
						newViewport = 'largedesktop';
					}
				}
				// Kiosk
				if (windowWidth > 1789) {
					if (!self.kiosk || force) {
						newBreakpoint = 'kioskIn';
						newViewport = 'kiosk';
					}
				}
			}

			// OUT check
			// --------------------------------------

			//mobile
			if (windowWidth > 599) {
				if (self.mobile) {
					newBreakpoint = 'mobileOut';
				}
			}

			//Vertical Tablet
			if (windowWidth < 600 || windowWidth > 767) {
				if (self.vTablet) {
					newBreakpoint = 'vTabletOut';
				}
			}
			//Horizontal Tablet
			if (windowWidth < 768 || windowWidth > 959) {
				if (self.hTablet) {
					newBreakpoint = 'hTabletOut';
				}
			}
			//Desktop
			if (windowWidth < 960 || windowWidth > 1199) {
				if (self.desktop) {
					newBreakpoint = 'desktopOut';
				}
			}
			if (window.isKiosk() === false) {
				// Large Desktop
				if (windowWidth < 1200) {
					if (self.largeDesktop) {
						newBreakpoint = 'largeDesktopOut';
					}
				}
			} else {
				// Large Desktop on Kiosk
				if (windowWidth < 1200 || windowWidth > 1789) {
					if (self.largeDesktop) {
						newBreakpoint = 'largeDesktopOut';
					}
				}
				// Kiosk
				if (windowWidth < 1790) {
					if (self.kiosk) {
						newBreakpoint = 'kioskOut';
					}
				}
			}

			if ($('html').hasClass('ie8')) {
				newBreakpoint = 'largeDesktopIn';
			}


			switch (newBreakpoint) {
			case ('mobileIn'):
				self.mobile = true;
				break;
			case ('vTabletIn'):
				self.vTablet = true;
				break;
			case ('hTabletIn'):
				self.hTablet = true;
				break;
			case ('desktopIn'):
				self.desktop = true;
				break;
			case ('largeDesktopIn'):
				self.largeDesktop = true;
				break;
			case ('kioskIn'):
				self.kiosk = true;
				break;
			case ('mobileOut'):
				self.mobile = false;
				break;
			case ('vTabletOut'):
				self.vTablet = false;
				break;
			case ('hTabletOut'):
				self.hTablet = false;
				break;
			case ('desktopOut'):
				self.desktop = false;
				break;
			case ('largeDesktopOut'):
				self.largeDesktop = false;
				break;
			case ('kioskOut'):
				self.kiosk = false;
				break;
			}

			if (self.currentViewport && newViewport &&
					self.currentViewport !== newViewport) {
				eBreakpointChange.newViewport = self.newViewport = newViewport;
				eBreakpointChange.oldViewport = self.oldViewport
					= self.currentViewport;

				$(window).trigger(eBreakpointChange);
			}

			if (!self.currentViewport && newViewport) {
				self.newViewport = newViewport;
			}

			self.currentViewport = newViewport || self.currentViewport;

			return newBreakpoint;
		},


		/**
		 * Trigger events added to the array from modules on viewport change
		 * @param  {string} bp breakpoint function array (if no change then false)
		 */
		update: function (bp) {
			var i, self = this;
			if (bp) {
				i = this[bp].length;
				//loop through array and run any functions
				while (i--) {
					this[bp][i]();
				}

				//if were moving out of a viewport we need to run the next viewport In functions!
				if (bp.match(/Out/g)) {
					self.update(self.check());
				}

			}

		},


		/**
		 * Initialise this module!
		 */
		init: function () {
			var self = this;
			window.currentDocumentWidth = window.innerWidth ||
				document.documentElement.clientWidth || document.body.clientWidth;
			window.currentDocumentHeight = $(document).height();

			//this checkpoint is failing in ie8 as we cannot add ie8 class to xhtml doctype
			if (!$('html').hasClass('ie8')) {
				$(window).resize(function () {
					var iDocumentWidthTemp = window.innerWidth ||
				document.documentElement.clientWidth || document.body.clientWidth;
					window.currentDocumentHeight = $(document).height();
					if (iDocumentWidthTemp !== window.currentDocumentWidth) {
						window.currentDocumentWidth = iDocumentWidthTemp;
						self.update(self.check());
						$('#body-wrapper').height(window.innerHeight);
					}
				});

				//feature detection for ie8 - does not support addEventListener
				/*
				if(window.addEventListener) {
					window.addEventListener("orientationchange", function() {
					    console.log('orientation change - ' + window.orientation);
						self.update(self.check());
					}, false);
				}
				*/
			}
		}
	};
});
