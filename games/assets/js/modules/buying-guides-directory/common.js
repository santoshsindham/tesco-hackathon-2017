/*global define:true, Microsoft: true */
define(['domlib', 'modules/common', 'modules/breakpoint'], function($, common, breakpoint){

	var buyingGuidesDirectory = {

		$wrapper: $('#buying-guides-directory'),

		eventClick: 'click',
		eventTransitionEnd: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',

		animSpeed: 500,

		isBusy: false,

		classNoSubMenu: 'no-sub-menu',

		// used for the breakpoint reset
		currentSubMenu: [],

		getParentMenu: function( $elm ) {
			return $elm.parents('ul').first();
		},

		getParentItem: function( $elm ) {
			if ($elm[0].tagName.toLowerCase() !== 'li') {
				$elm = $elm.parents('li').eq(0);
			}
			return $elm;
		},

		getSubMenu: function( $elm ) {
			return buyingGuidesDirectory.getParentItem( $elm ).find('> .sub-menu > ul, > ul');
		},

		setSelected: function( $elm ) {
			return buyingGuidesDirectory.getParentItem( $elm ).addClass('selected');
		},

		// adjust the wrapper height to match the passed elements height
		updateWrapperHeight: function( $subMenu ) {
			var self = buyingGuidesDirectory;

			if (!$subMenu || !$subMenu.length) {
				return false;
			}

			self.$wrapper.animate({
				height: $subMenu.outerHeight()
			}, self.animSpeed);
		},

		showLevelTwo: function(e) {
			var self = buyingGuidesDirectory;

			e.preventDefault();
			e.stopPropagation();

			if (self.isBusy) {
				return false;
			}

			self.isBusy  = true;

			var $target  = $(e.target);
			var $subMenu = self.getSubMenu( $target );

			// create the link to go back to level two
			if (!$subMenu.find('.level-back').length) {
				var backHTML   = '<li class="level-back"><a href="#">All buying guides</a></li>';
				var $backUpper = $( backHTML ).addClass('upper').on( self.eventClick, self.animateOut );
				var $backLower = $( backHTML ).addClass('lower').on( self.eventClick, self.animateOut );

				$subMenu.prepend( $backUpper );
				$subMenu.append( $backLower );
			}

			self.animateIn( $target );

			return false;
		},

		showLevelThree: function(e) {
			var self = buyingGuidesDirectory;

			e.preventDefault();
			e.stopPropagation();

			if (self.isBusy) {
				return false;
			}

			self.isBusy  = true;

			var $target  = $(e.target);
			var $subMenu = self.getSubMenu( $target );

			// create the link to go back to level two
			if (!$subMenu.find('.level-back').length) {
				var backHTML   = '<li class="level-back"><a href="#">All ' + $target.text() + ' buying guides</a></li>';
				var $backUpper = $( backHTML ).addClass('upper').on( self.eventClick, self.animateOut );
				var $backLower = $( backHTML ).addClass('lower').on( self.eventClick, self.animateOut );

				$subMenu.prepend( $backUpper );
				$subMenu.append( $backLower );
			}

			self.animateIn( $target );

			return false;
		},

		animateIn: function( $target ) {
			var self        = buyingGuidesDirectory;
			var $parentItem = self.getParentItem( $target );
			var $parentMenu = self.getParentMenu( $target );
			var $subMenu    = self.getSubMenu( $target );

			// slide in the sub menu
			$subMenu.show();

			self.updateWrapperHeight( $subMenu );
			$parentItem.addClass('selected');
			$parentMenu.addClass('animateIn').one( self.eventTransitionEnd, function() {
				self.isBusy = false;
			});

			self.currentSubMenu = $subMenu; // used for the breakpoint reset
		},

		animateOut: function(e) {
			var self    = buyingGuidesDirectory;

			e.preventDefault();
			e.stopPropagation();

			if (self.isBusy) {
				return false;
			}

			self.isBusy = true;

			var $target       = $(e.target);
			var $subMenu      = self.getParentMenu( $target );
			var $parentItem   = self.getParentItem( $target );
			var $selectedItem = $target.parents('.selected').first();
			var $animateMenu  = $target.parents('.animateIn').first();

			self.updateWrapperHeight( $animateMenu );

			// slide out the menu
			$animateMenu.addClass('animateOut').one( self.eventTransitionEnd, function() {
				$selectedItem.removeClass('selected');
				$animateMenu.removeClass('animateIn animateOut');
				$subMenu.hide();

				// used for the breakpoint reset
				if (self.currentSubMenu.hasClass('level-three')) {
					self.currentSubMenu = self.currentSubMenu.parents('.level-two');
				}
				else if (self.currentSubMenu.hasClass('level-two')) {
					self.currentSubMenu = self.currentSubMenu.parents('.level-one');
				}

				self.isBusy = false;
			});
		},

		bindEvents: function() {
			var self  = buyingGuidesDirectory;

			self.$wrapper.find('.level-one > li').not('.' + self.classNoSubMenu ).find('> a').on( self.eventClick, self.showLevelTwo );
			self.$wrapper.find('.level-two > li').not('.' + self.classNoSubMenu ).find('> a').on( self.eventClick, self.showLevelThree );
		},

		// if there's no sub menu is for a categery/sub category, then assume there is none
		// so add 'no-sub-menu' class to ensure the arrow icon is hidden
		hasSubMenuCheck: function( $menu ) {
			var self = buyingGuidesDirectory;

			self.$wrapper.find('ul.level-one, ul.level-two').each(function(){
				var $menu = $(this);

				$menu.find('> li').each(function(){
					var $item = $(this);

					if (!self.getSubMenu( $item ).length) {
						$item.addClass( self.classNoSubMenu );
					}
				});
			});
		},

		breakpointReset: function() {
			var self = buyingGuidesDirectory;
			self.updateWrapperHeight( self.currentSubMenu );
		},

		init: function() {
			var self = buyingGuidesDirectory;

			if (!self.$wrapper.length) {
				return;
			}

			// update the event type for touch devices
			if (common.isTouch()) {
				self.eventClick = common.isWindowsPhone() ? 'MSPointerDown' : 'tap click';
			}

			self.hasSubMenuCheck();
			self.bindEvents();
		}
	};

	// init module
	common.init.push(buyingGuidesDirectory.init);


	breakpoint.mobileIn.push(function() {
		buyingGuidesDirectory.breakpointReset();
	});

	breakpoint.vTabletIn.push(function() {
		buyingGuidesDirectory.breakpointReset();
	});

	breakpoint.hTabletIn.push(function() {
		buyingGuidesDirectory.breakpointReset();
	});

	breakpoint.desktopIn.push(function() {
		buyingGuidesDirectory.breakpointReset();
	});

	breakpoint.largeDesktopIn.push(function() {
		buyingGuidesDirectory.breakpointReset();
	});

	return buyingGuidesDirectory;
});
