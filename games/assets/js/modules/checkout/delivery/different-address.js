/*global define:true, Microsoft: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'./refresh-all',
	'modules/custom-dropdown/common',
	'./new-address',
	'../loader',
	'modules/overlay/common',
	'modules/checkout/resetForm',
	'modules/tesco.utils',
	'modules/tesco.data'
], function($, common, breakpoint, refreshAll, dropdown, newAddress, loader, overlay, resetForm, utils, data){

	var differentAddress = {

		group: null,


		bindEvents:function(el){
			var $el = $(el);

			$('select', $el).each(function(){
				$(this).addClass('visually-hidden-select'); 
				dropdown.init($(this));
			});

			$('.close-overlay', $el).on('tap click', function(e){
				e.preventDefault();

				if (breakpoint.mobile) {
					common.virtualPage.close();
				} else {
					overlay.hide();
				}

				return false;
			});

			$el.on('tap click', '.add-new-address .edit', function(e){
				e.preventDefault();
				
				var parentDlGrp = $(this).data('open-address');
				
				if (breakpoint.mobile) {
					common.virtualPage.close(null, function() {
						$('#dg-store-infor-'+parentDlGrp).find('.address .edit').trigger('click');
					});
				} else {
					overlay.hide();
					$('#dg-store-infor-'+parentDlGrp).find('.address .edit').trigger('click');
				}
				//differentAddress.toggleNewAddress(e, $el);
				//resetForm.init($(e.currentTarget).parents('.new-address'));
			});

			//cancel default behavior of address nickname select
			//$(document).off('change', '.address-nickname select');

			//bind events to save button
			$('.different-address .save', $el).on('tap click', function(e){
				e.preventDefault();
				differentAddress.refreshAll($(this));
				if(breakpoint.mobile){
					common.virtualPage.close();
				}else{
					overlay.hide();
				}
				$(document).on('change', '.address-nickname select', function(){
					differentAddress.refreshAll($(this));					
				});
				return false;
			});

			//validate new address form
			newAddress.validation.init($el, differentAddress.group, differentAddress.update);
		},
		
		refreshAll: function($elem) {		
			if (breakpoint.mobile) 
				$('body').append('<div class="loader" id="tempLoader" style="height:'+screen.height+'px; top:'+$(document).scrollTop()+'"></div>');
			
			var request = 'changeNewAddress';
	        var $form = utils.getFormByElement($elem);	        
	        var url = utils.getFormAction($form); 
	        var DL = new data.DataLayer();
	        var myData = $form.serialize();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(data) {
	        	if (breakpoint.mobile) 
	        		$('#tempLoader').remove();
	        	
	        	refreshAll.reInitAll(null, function() {
	        		$('.delivery-block').each(function() {
			    		 var $elem = $(this).find('.tabs input[type=radio]:checked');
			    		 if ($elem.length > 0) {
			    			 $elem.trigger('click');	    			 
			    		 }
			    	 });
	        	});
	        });			
	        		
		},

		update: function(group){
			var template = $.trim($(group).find('.different-address-template').html());
			var el;

			if (breakpoint.mobile) {
				$('#virtual-page .wrapper').replaceWith(template);
				differentAddress.bindEvents($('#virtual-page .wrapper'));
			} else {
				el = $('#lightbox .wrapper').replaceWith(template);
				differentAddress.bindEvents($('#lightbox .wrapper'));
			}
		},

		// can't setup placeholders on elements that are hidden - won't be able to retrieve widths
		// run as show callback to the toggleAccordion function
		updateNewAddressPlaceholders: function( $element ) {
			// $('[placeholder]').placeholder({ inputWrapper: '<span class="placeholder" />' });
			// had to use a different element for the placeholder - couldn't locate the issue with
			// using the span after the placeholder hides the span - it was still set to be visible
			$element.find('[placeholder]').each(function(){
				// placeholder script does check if already setup
				if (!$(this).parents('.placeholder').length) {
					$(this).placeholder({ inputWrapper: '<div class="placeholder" />' });
				}
			});
		},

		toggleNewAddress: function(e, el){
			e.preventDefault();

			// hide/collpase
			if ($('.new-address',el).is(':visible')) {
				if (typeof jQuery !== 'undefined') {
					$('.new-address',el).not(':animated').slideUp();
				} else {
					$('.new-address',el).hide();
				}
				$('.different-address .form-actions input', el).removeClass('disabled');
				$('.add-new-address', el).show();
			}
			// show/reveal
			else {
				if (typeof jQuery !== 'undefined') {
					$('.new-address',el).not(':animated').slideDown(function(){
						differentAddress.updateNewAddressPlaceholders( $(this) );
					});
				} else {
					$('.new-address',el).show();
				}
				$('.different-address .form-actions input', el).addClass('disabled');
				$('.add-new-address', el).hide();
			}

			return false;
		},

		show: function(e){
			e.preventDefault();

			differentAddress.group = $(e.target).closest('.delivery-block');

			var template = $.trim($(e.target).closest('.different-address').find('.different-address-template').html());

			if (!breakpoint.mobile) {
				var opts = {
					content: template,
					callback: differentAddress.bindEvents,
					defaultBreakPointBehavior: true,
					customClass: 'checkout-different-address',
					isError: false,
					enablePagination: false,
					fixedWidth: '',
					paginationHeader: ''
				};

				overlay.show(opts);
				// $('[placeholder]').placeholder({ inputWrapper: '<span class="placeholder" />' });
			} else {
				common.virtualPage.show({
					content: template,
					customClass: 'checkout-different-address',
					closeSelector: '.different-address .cancel',
					callbackReady: function(e, el){
						differentAddress.bindEvents(e, el);
					}
				});
			}

			return false;
		}

	};

	return differentAddress;

});