/*globals define, window*/
/*jslint regexp: true, plusplus: true */
define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/sticky-sidebar/common', 'modules/overlay/common', 'modules/buy-from/common'], function($, breakpoint, common, stickySidebar, overlay, buyFrom) {
    'use strict';
	var basket = {
		// store the  list of basket items
		$basketItems: $('#basket-primary, #basket-attach').find('.basket-item'),

		// check if the add to basket button should be enabled/disabled
		updateProductOptions: function( $options ) {
			var $addButton = $('input:submit', $options);

			if ($options.find('label.selected').length < 1) {
				$addButton.attr('disabled', 'disabled');
			} else {
				$addButton.removeAttr('disabled');
			}
		},

		// monitors for a change in the product option checkbox states, if one of the checkboxes becomes checked
		// then the add to basket button becomes enabled
		productOptions: function () {
			var self  = basket;

			self.$basketItems.find('.available-product-options').each(function(){
				var $options = $(this);

				$options.find('label').on(self.event, function(e){
					e.preventDefault();
                    var $target = $(e.target),
                        $checkbox = $(this).find('input:checkbox');

                    if($target.hasClass('checkbox')) {

                        $(this).toggleClass('selected');

                        if ($(this).hasClass('selected')) {
                            $checkbox.attr('checked', 'checked');
                        } else {
                            $checkbox.removeAttr('checked');
                        }

                        self.updateProductOptions( $options );

                    }
				});

				self.updateProductOptions( $options );
			});
		},

		// check if the update button should be enabled/disabled
		// check if theincrease and decrease buttons should be enabled/disabled (mobile and tablet only)
		updateItemQuantity: function($input, event) {
            var $form = $input.parents('form'),
				$update   = $form.find('input.update'),
				$increase = $form.find('a.increase'),
				$decrease = $form.find('a.decrease'),
				nValue    = $.trim( $input.val() ),
				oValue    = parseInt( $input.data('original-quantity'), 10),
				max       = $input.data('max'),
				min       = $input.data('min');

			// restore the original value if the quantiy is zero or non numeric is entered
            if (event && !(event.keyCode === 8) && isNaN(nValue) && nValue !== 0) {
				$input.val(oValue);
				nValue = oValue;
			}
			nValue    = parseInt( $.trim( $input.val() ), 10);

			// if the new value is the same as the original value, then disable the update button
			if (nValue === oValue || isNaN(nValue)) {
				$update.attr('disabled', 'disabled');
			} else {
				$update.removeAttr('disabled');
			}

			if (!breakpoint.desktop && !breakpoint.largeDesktop) {
				$increase.removeClass('disabled');
				$decrease.removeClass('disabled');

				if (nValue === min) {
					$decrease.addClass('disabled');
				}

				if (nValue === max) {
					$increase.addClass('disabled');
				}
			}
		},

		// monitors for a change in the quantity value, if value changes from what was the original value
		// then the update button becomes enabled
		// increase and decrease buttons are only setup for mobile and tablet only
		itemQuantity: function() {
			var self = basket;

			self.$basketItems.find('.quantity').each(function(){
                var $input = $('input[type=number], input[type=text]', this).eq(0);

				if (!$input.length) {
					return;
				}

				// change input type number back to number for mobile/tablet
				// not a good idea - to review for alternative

				// was originally type=number in html - but input type number ignores the maxlength
				// and uses 'max' attribute.  max attribute behaves differently across all browsers
				// most notable difference is in chrome, where the max isn't applied until the submit
				// button is pressed and then chrome will display it's own validation messages
				// set the min and max using data attributes for consistency

				// if (!breakpoint.desktop && !breakpoint.largeDesktop && !breakpoint.kiosk) {
				//	$input.attr('type', 'number');
				// }

				// store the original quantity value
				$input.data('original-quantity', $.trim( $input.val() ));

				// check onblur if the value has changed and update button disabled states
				$input.on('keyup', function(e){
					self.updateItemQuantity($(this) , e);
				});

				// update button disabled states
				self.updateItemQuantity( $input );

				// setup increase/decrease quantity buttons
				$('a.increase, a.decrease', this).on(self.event, function(e){
					e.preventDefault();
					e.stopPropagation();

					if (breakpoint.desktop || breakpoint.largeDesktop) {
						return false;
					}

					var nValue = parseInt( $input.val(), 10 ),
						max    = $input.data('max'),
						min    = $input.data('min');

					// if the user enters a value that's not a number, restore the original value
					if (isNaN(nValue)) {
						nValue = $input.data('original-quantity');
					}

					// decrease quantity value (check max limit)
					if ($(this).hasClass('increase')) {
						nValue++;
						if (nValue >= max) {
							nValue = max;
						}
					}

					// decrease quantity value (check min limit)
					if ($(this).hasClass('decrease')) {
						nValue--;
						if (nValue <= min) {
							nValue = min;
						}
					}

					// update the new value and update the disabled state of the update button
					$input.val( nValue );

					// update button disabled states
					self.updateItemQuantity( $input );
					
					
					return false;
				});
			});
		},
        
		// for mobile and tablet only! if a page error exists, display it in an overlay/modal
		pageError: function(){			
			if ($('.page-error').length) {			
				var content = $( $('#tmplt-basket-page-error-overlay').html().trim() ),
					htmlString = "";
				
				$('.page-error').each(function(){
					htmlString = htmlString + $(this).html();
				});
	
				content = content.filter('#lightbox-content').html( htmlString );
				content = content.wrapAll('<div />').parent().html();
				
				overlay.show({
					content: content,
					customClass: 'error'
				});			
			}
		},

		// for mobile, make the item count clickable in the mini summary and scroll to the basket items
		jumpToItems: function() {
			var self  = basket;

			$('#basket-summary-mini h2 span.items').on(self.event, function(e){
				e.preventDefault();
				e.stopPropagation();

				if (breakpoint.mobile) {
					$(document).scrollTop( self.$basketItems.eq(0).offset().top );
				}
			});
		},

		// generic basket overlay trigger, looks for the overlay template id in the 'data-overlay-id'
		// attribute of the triggering element
		overlay: {

			position: function($overlay){
                var scrollY = $(document).scrollTop(),
					marginTop = parseInt($overlay.css('margin-top'), 10) + scrollY;

				if ($overlay.offset().top < scrollY) {
					$overlay.css('margin-top', marginTop);
				}
			},

			init: function($elms){
				var self  = basket;

				$elms.on(self.event, function(e){
					e.preventDefault();
					e.stopPropagation();

					var content = $('#' + $(this).data('overlay-id') ).html();

					if (breakpoint.desktop || breakpoint.largeDesktop) {

						common.tooltip.show({
							trigger: $(this),
							html: content
						});
						$('#emptyBasketConfirm a.no').on(self.event, function(e){
							e.preventDefault();
							e.stopPropagation();

							common.tooltip.hide();
						});

					} else {
						overlay.show({
							content: content,
							customClass: 'basket-overlay',
							callback: self.overlay.position
						});

						$('#lightbox .lightbox-actions a.no').on(self.event, function(e){
							e.preventDefault();
							e.stopPropagation();

							overlay.hide();
						});
					}
				});
			}
		},
		
		bindMobileEvents: function () {
			basket.unbindEvents();
		},
		
		bindEvents: function () {
			basket.unbindEvents();
		},
		
		unbindEvents: function () {
			$('.bcve-show-more').off('tap click');
		},
		init: function () {
			
			$(document).on('tap click','.one', function(){
	         var opts;
	         var data = $('.blink').html();
				if (breakpoint.mobile || breakpoint.vTablet) {
	                opts = {
	                    content : data,
	                    closeSelector : '.close'
	                };
	                common.virtualPage.show(opts);
	            }
	            else {
	                opts = {
	                    content : data,
	                    callback : '',
	                    defaultBreakPointBehavior : true,
	                    customClass : '',
	                    isError : false,
	                    fixedWidth : 713
	                };
	                overlay.show(opts);
	            }
			});
			
			var self = basket;
			
			self.$basketItems = $('#basket-primary, #basket-attach').find('.basket-item');
			
			if (common.isPage('basket') || common.isPage('basketAttach')) {
			
				buyFrom.init($('#ndoURLContainer'));
				$('#basket-checkout, #basket-checkout-mini').on('click', function(){
					$('.jsEnableCheck').val('true');
				});
				
				if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
					self.pageError();
				}
				
				if (!self.$basketItems.length) {
					return;
				}
	
				self.event = 'click';
				//self.event+= breakpoint.kiosk ? '' : ' tap';
	
				self.itemQuantity();
				self.productOptions();
				
				$(document).on('tap click', '.bcve-show-more', function(e){
	
					e.preventDefault();
					e.stopPropagation();
	
					var content = $(this).parent().next('.bcve-tooltip').html();
					
					if (breakpoint.desktop || breakpoint.largeDesktop) {
	
						common.tooltip.show({
							trigger: $(this),
							html: content,
							close: true,
							closeTriggers: "a.close"
						});
	
					} else {
						overlay.show({
							content: content,
							callback: self.overlay.position
						});
					}
				});
	
				self.overlay.init( $('#basket-empty input[name="empty-basket"]') );
				self.overlay.init( self.$basketItems.find('.price-promise a') );
				self.overlay.init( self.$basketItems.find('.product-extras p.supplier a') );
	
				if (!breakpoint.kiosk) {
					// setup the sticky sidebar
					stickySidebar.init({
						$wrapper   : $('#basket-wrapper'),
						$primary   : $('#basket-primary'),
						$secondary : $('#basket-secondary')
					});
				}
				
				breakpoint.mobileIn.push(function () {
					self.bindMobileEvents();
				});
				
				breakpoint.vTabletIn.push(function () {
					self.bindMobileEvents();
				});
				
				breakpoint.hTabletIn.push(function () {
					self.bindMobileEvents();
				});
				
				if (!breakpoint.mobile && !breakpoint.vTablet && !breakpoint.hTablet) {
					return;
				}
				
				// mobile only
				if (breakpoint.mobile) {
					self.jumpToItems();
				}	
			}
		}
	};
	common.init.push(function(){
		basket.init();
        if (!window.isKiosk()) {
            common.richTexttooltipPopup.init();
        }
	});

	return basket;
});