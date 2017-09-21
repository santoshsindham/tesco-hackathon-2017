/*global define: true */
define(['domlib', 'modules/common', 'modules/breakpoint', 'modules/overlay/common'], function($, common, breakpoint, overlay) {

	var navigation = {
		clickEvent: window.isKiosk() ? 'touchstart click' : 'tap click',
		// id of the current active secondary menu
		activeSecondaryID: '',
		// overlay/lightbox content width
		overlayWidth: 0,
		// string to create the id for the secondary menu (category id from list item data-id is appended)
		secondaryID: 'sub-menu-',
		// json category data
		categoryData: null,
		// jquery animate speed
		animSpeed: 500,

		getWrapperSelector: function() {
			return breakpoint.kiosk ? '#lightbox' : '#navigation';
		},
		getPrimarySelector: function() {
			return breakpoint.kiosk ? '#lightbox-content' : '#navigation > .wrapper';
		},

		setupPrimaryMenu: function(){
			var self = navigation;

			// wrap the existing content - treat as primary menu
			$( self.getPrimarySelector() ).wrapInner('<div id="main-menu" />');
			
			if (window.isKiosk()) {
				$('#main-menu .menu ul > li > a').on(navigation.clickEvent, function(e){				
					e.stopImmediatePropagation();
	
					// exit if the json data hasn't loaded
					if (!self.categoryData) {
						return;
					}
	
					e.preventDefault();
					
					var $item = $(this).parent('li');
	
					if (typeof self.categoryData[$item.data('id')] === 'object') {
						self.showSecondaryMenu($item);
					}
				});
			}
		},

		// slide out the secondary and slide in the primary
		showPrimaryMenu: function() {
			var self = navigation;
			var $primary = $('#main-menu');
			var $secondary = $('#' + self.activeSecondaryID);

			$secondary.animate({
				left: $( self.getWrapperSelector() ).outerWidth(),
				opacity: 0
			}, self.animSpeed);

			$primary.animate({
				left: 0,
				opacity: 1
			}, self.animSpeed);

			// as primary is now the view, adjust the overlay height to match
			self.updateOverlayHeight( $primary.outerHeight() );
		},

		// slide out the primary and slide in the secondary
		showSecondaryMenu: function($item) {
			var self = navigation;
			var $primary = $('#main-menu');
			var $secondary = $('#' + self.secondaryID + $item.data('id'));

			// check if the menu has already been created
			if (!$secondary.length) {
				$secondary = self.createSecondaryMenu($item);
			}

			$primary.animate({
				left: 0 - $( self.getWrapperSelector() ).outerWidth(),
				opacity: 0
			}, self.animSpeed);

			$secondary.animate({
				left: 0,
				opacity: 1
			}, self.animSpeed);

			// store the current/active secondary id
			self.activeSecondaryID = $secondary.attr('id');

			// as secondary is now the view, adjust the overlay height to match
			self.updateOverlayHeight( $secondary.outerHeight() );
		},

		createSecondaryMenu: function($item) {
			var self  = navigation;
			var data  = self.categoryData[$item.data('id')];
			var $menu = $( $('#tmplt-overlay-submenu').html().trim() );

			// update secondary menu properties
			$menu.attr('id', self.secondaryID + $item.data('id'));
			$menu.css('left', $( self.getWrapperSelector() ).outerWidth() );
			$menu.appendTo( $( self.getPrimarySelector() ) );


			// header
			$menu.find('.title h2').html(data.title);

			// if not kiosk, then allow the title to be clickable
			if (!breakpoint.kiosk) {
				$menu.find('.title h2').on('click', function(){
					$(this).prev('a.back').trigger('click');
				});
			}

			// view all button
			var $viewAll = $('.title .view-all', $menu);

			$viewAll.find('span').html(data.viewAll.label);
			$viewAll.data('url', data.viewAll.link).on('click', function(){
				document.location.href = $(this).data('url');
			});

			// back button
			$menu.find('.title > a.back').on(navigation.clickEvent, function(e){
				var self = navigation;
				e.preventDefault();
				e.stopPropagation();
				self.showPrimaryMenu();
			});

			// generate list
			var $list = $menu.find('ul');

			$(data.list).each(function(key, value){
				$list.append('<li><a href="' + value[1] + '"><span>' + value[0] + '</span></a></li>');
			});

			return $menu;
		},

		// adjust the overlay height to match the passed view size
		updateOverlayHeight: function( newHeight ){
			var self = navigation;

			$( self.getPrimarySelector() ).animate({
				height: newHeight + 1
			}, navigation.animSpeed);
		},

		jumpTo: function(position) {
			if (typeof jQuery !== 'undefined') {
				$('html, body').animate({
					scrollTop: position
				}, 500);
			} else {
				$(document).scrollTop( position );
			}
		},

		init: function init() {
			var self = navigation;

			if (!$('#navigation').length) {
				return;
			}
			
			/*Below code is to hide view-all-categories button when there are no popular cat navigation items from backend*/
			if(breakpoint.kiosk && $('#navigation').find('li').length > 0) {
				$('#view-all-categories').show();
			}
			
			if (breakpoint.kiosk) {
				$('#view-all-categories').on(navigation.clickEvent, function(e){
					e.preventDefault();
					e.stopImmediatePropagation();

					var content = $( $.trim( $('#tmplt-overlay').html() ) );
					
					content.filter('#lightbox-content').html( $.trim( $('#navigation').html() ) );
					content = content.wrapAll('<div />').parent().html();

					overlay.show({
						content: content
					});

					self.setupPrimaryMenu();
				});
			} else {
				self.setupPrimaryMenu();
			}

			$('#visual-nav .anchor .wrapper').on(navigation.clickEvent, function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				self.jumpTo( $('#navigation').offset().top );
				return false;
			});

			$('#navigation .anchor .wrapper').on(navigation.clickEvent, function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				if ($('#visual-nav').length) {
					self.jumpTo( $('#visual-nav').offset().top );
				}
				else {
					self.jumpTo( $('#page-container').offset().top );
				}
				return false;
			});
		}
	};

	breakpoint.mobileIn.push(navigation.init);
	breakpoint.vTabletIn.push(navigation.init);
	breakpoint.hTabletIn.push(navigation.init);
	breakpoint.desktopIn.push(navigation.init);
	breakpoint.largeDesktopIn.push(navigation.init);
	breakpoint.kioskIn.push(navigation.init);

	return navigation;
});