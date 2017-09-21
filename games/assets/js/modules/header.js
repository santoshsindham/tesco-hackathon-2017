/*!
 * TESCO RWD - Header module
 */

/*global window, document, $:false, jQuery, LBI, self, Modernizr */


//Define our root namespace if necessary
var TESCO = window.TESCO || {};

/**
 * @namespace ...
 */
TESCO.header = {

	button: null,
	lastY: null,
	userNavTimer: null,
	userNavisVisible: false,
	mouseLeaveTimer: null,

	/**
	 * Set button text depending on viewport
	 * @param {string} dir in/out of mobile viewport
	 */
	setButtonText: function (dir) {
		var self = this;
		switch (dir) {
		case('in'):
			self.button.val(self.button.data('text'));
			$('#search').removeClass('search-button');
			break;

		case('out'):
			self.button.val(self.button.data('alt-text'));
			$('#search').addClass('search-button');
			break;
		}
	},


	/**
	 * Toggle the visiblity of the user navigation
	 * @param  {event} evt Touch/Click event
	 */
	toggleUserNav: function (evt) {
		var self = TESCO.header;

		if (self.userNavisVisible) {
			self.closeUserNav();
		} else {
			self.openUserNav();
		}
		
	},


	/**
	 * Close the user naviation
	 */
	closeUserNav: function () {
		var self = TESCO.header,
			userNav = $('#headerbar #nav-bar .navigation, #user');

		userNav.removeClass('dropdown-visible');
		$('#user .icon-dropdown').attr('data-icon', 'd');
		window.clearTimeout(self.userNavTimer);
		TESCO.clearCancelDropdown();
		self.userNavisVisible = false;
	},


	/**
	 * Open user navigation
	 */
	openUserNav: function () {
		var self = TESCO.header,
			userNav = $('#headerbar #nav-bar .navigation, #user');
		
		TESCO.dropdownCheck(self.closeUserNav);
		self.userNavisVisible = true;
		userNav.addClass('dropdown-visible');
		$('#user .icon-dropdown').attr('data-icon', 'e');
		window.clearTimeout(self.userNavTimer);

		self.userNavTimer = setTimeout(function () {
			self.closeUserNav();
		}, 10000); //10 seconds

	},

	/**
	 * Handle mouse enter event and clear mouse leave timer
	 * @param  {event} e mouseenter event
	 */
	userMouseEnter: function (e) {
		var self = TESCO.header;
		window.clearTimeout(self.mouseLeaveTimer);
	},

	/**
	 * Handle mouse leave event and set mouse leave timer
	 * @param  {event} e mouseleave event
	 */
	userMouseLeave: function (e) {
		var self = TESCO.header;
		self.mouseLeaveTimer = setTimeout(function () {
			if (self.userNavisVisible) {
				self.closeUserNav();
			}
		}, 300);

	},

	scrollToRecentlyViewed: function (e) {
		var self = TESCO.header;

		$('html, body').animate({
			scrollTop: $("#recently-viewed").offset().top
		}, 1500, 'easeInOutQuint');
		
		self.closeUserNav();
		
		e.preventDefault();
		e.stopPropagation();
		return false;
	},

	/**
	 * Initialize module
	 */
	init: function () {
		var self = this;

		self.button = $('#search #search-submit');

		/** bind events **/
		if (!$('html').hasClass('touch')) {
			$('#user, #headerbar #nav-bar .navigation').on('mouseenter', self.userMouseEnter);
			$('#user, #headerbar #nav-bar .navigation').on('mouseleave', self.userMouseLeave);
		}

		/** Search placeholder **/
		$('#search input[placeholder]').placeholder({color: '#01539d'});

	}

};