define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/sticky-sidebar/common'], function($, breakpoint, common, stickySidebar){

	var saveForLater = {

		$wrapper : '#save-for-later',
		$toggle  : '#save-for-later .show-more',
		$noItems : '#save-for-later .no-items',
		isDeferred : true,
		
		// max number of items to display when showing less
		displayLimit: 3,

		// sets a busy flag so only one item can be removed at a time
		isRemoveBusy: false,

		slideDown: function($elm, fnCallback, forceTop){
			var self = saveForLater;

			stickySidebar.lock(forceTop);

			$elm.css('display', 'block').animate({
				opacity: 1,
				height : $elm.data('original-height')
			}, 500, null, function(){
				stickySidebar.animate();

				if (typeof fnCallback === 'function') {
					fnCallback();
				}
			});
		},

		slideUp: function($elm, fnCallback, forceTop){
			var self = saveForLater;

			stickySidebar.lock(forceTop);

			$elm.css({
				overflow: 'hidden',
				height  : $elm.outerHeight()
			});

			$elm.animate({
				opacity : 0,
				height  : 0
			}, 500, null, function(){
				stickySidebar.animate();

				if (typeof fnCallback === 'function') {
					fnCallback();
				}
			});
		},

		// remove item from list
		remove: function(e){
			e.preventDefault();
			e.stopPropagation();
			
			$.get($(e.target).attr('href'), function(res) {				
				
				var self   = saveForLater;
				var $item  = $(e.target).parents('li');
				var $items = self.$wrapper.find('.products > li');
				var index  = $items.index( $item );

				// sets a busy flag so only one can be removed at a time
				// is set back to false on slide up animation completion
				if (self.isRemoveBusy) {
					return false;
				}

				self.isRemoveBusy = true;

				// animate and remove the item
				self.slideUp($item, function(){
					$item.remove();

					// if there are no more items, remove the entire list wrapper
					if (self.$wrapper.find('.products > li').length < 1) {
						self.$wrapper.find('.products').remove();
					}

					self.update();
					self.isRemoveBusy = false;
				});

				// exit if the remaining items are less than/at the display limit
				if ($items.length - 1 < self.displayLimit) {
					return;
				}

				// reveal the next item after the remove to ensure we're always showing
				// the number of items meeting the display limit
				var $next = $items.filter(':hidden').eq(0);

				if ($next.length) {
					self.slideDown( $next );
				}

			});
			
			
			return false;
		},

		// update the display state of the show more/less button and no items message
		update: function(){
			var self   = saveForLater;
			var length = self.$wrapper.find('.products > li').length;

			// no more items, hide the show more and show the no items message
			if (length < 1) {
				self.$toggle.hide();
				self.$noItems.show();
			}

			// total items not exceeding the limit, so hide both the show more and no items message
			else if (length <= self.displayLimit) {

				// rollup the show more button
				if (self.$toggle.is(':visible')) {
					stickySidebar.lock();

					self.$toggle.animate({
						'margin-bottom'  : 0,
						'padding-bottom' : 0,
						'margin-top'  : 0,
						'padding-top' : 0,
						'opacity' : 0,
						'height'  : 0
					}, 250, function(){
						self.$toggle.hide();
						stickySidebar.animate();
					});
				}

				self.$noItems.hide();
			}

			// assume we've items, so show the show more and hide the no items message
			else {
				self.$toggle.show();
				self.$noItems.hide();
			}
		},

		// show more/less toggle
		toggle: function(e) {
			var self = saveForLater;

			e.preventDefault();
			e.stopPropagation();

			// show more
			if (self.$toggle.html() === self.$toggle.data('all')) {
				self.$toggle
					.data('original-top',  self.$toggle.offset().top - (self.$toggle.offset().top - $(document).scrollTop()) )
					.html( self.$toggle.data('less') );

				self.$wrapper.find('.products > li:hidden').each(function(){
					self.slideDown( $(this), null, true );
				});

			// show less (stop at display limit)
			} else {
				self.$toggle.html( self.$toggle.data('all') );

				// scroll back up to the original click/top position
				if (common.isTouch()) {
					$(document).scrollTop(
						self.$toggle.data('original-top')
					);
				} else {
					$('html, body').animate({
						scrollTop: self.$toggle.data('original-top')
					}, 500);
				}

				self.$wrapper.find('.products > li').each(function(i){
					if (i >= self.displayLimit) {
						var $item = $(this);
						self.slideUp($item, function(){
							$item.hide();
						});
					}
				});
			}

			// blur event added to stop the button appearing as active state
			self.$toggle.blur();

			self.update();

			return false;
		},

		init: function () {
			var self = saveForLater;

			self.$wrapper = $('#save-for-later');
			self.$toggle = $('#save-for-later .show-more');
			self.$noItems = $('#save-for-later .no-items');
			
			if (!self.$wrapper.length) {
				return false;
			} else if (self.$wrapper.length && self.isDeferred===false) { 
				/* Fix for #52340
				 * Even when the block is not deferred, "saveForLater.init();" -
				 * gets called and events are attached multiple times
				 * */
				return false;
			}
			
			self.isDeferred = false;
			
			// set the min-height of the produsts wrapper to match the height of the no items message
			// this is to stop the entire wrapper disappering before the no items message is displayed
			self.$wrapper.find('.products-wrapper').css('min-height', self.$noItems.outerHeight(true) + 2 );

			self.$wrapper.find('.products > li').each(function(i){

				// store the original hide for animation
				$(this).data('original-height', $(this).outerHeight() );

				// remove item function
				$(this).find('a.remove').on(self.event, self.remove);

				// hide items exceeding the display limit
				if (i >= self.displayLimit) {
					$(this).css({
						overflow : 'hidden',
						display  : 'none',
						height   : 0
					});
				}
			});


			// show more/less link
			self.$toggle.on(self.event, self.toggle);

			// update the display state of the show more/less button and no items message
			self.update();
		}
	};

	common.init.push(function(){
		saveForLater.init();
	});
	
	common.deferredInit.push(function(){
		saveForLater.init();
	});
	
	

	return saveForLater;
});