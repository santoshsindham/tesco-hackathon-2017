/*global define: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'../loader',
	'modules/custom-dropdown/common',
	'modules/checkout/resetForm',
	'modules/validation',
	'./refresh-all',
	'modules/tesco.utils',
	'modules/tesco.data',
	'modules/custom-dropdown/common'
], function($, common, breakpoint, loader, dropdown, resetForm, validationExtras, refreshAll, utils, data, customDropdown) {

	var courier = {

		eventType: 'tap click',

		hideDeliveryBlock: function() {
			// close new address block. Close only visible address block in case of multiple delivery blocks
			$('.edit-da-block.new-address').each(function () {
				if ($(this).is(':visible')) {
					$(this).find('.cancel').trigger('click');
				}
			});
		},		
		
		// bind events from fn call as they'll need to be bound again after ajax call
		bindEvents: function(context){
			var self = courier;

			$(document).on(self.eventType, '.courier-instructions .edit', courier.toggle);
			$(document).on('change', '.edit-courier-instructions select', courier.change);
			
			$(document).on(self.eventType, '.edit-courier-instructions .cancel', function(e) {
				courier.toggle(e);

				$('.neighbour-house-no').hide().find('input[type="text"]').val('');
				//resetForm.init($('.edit-courier-instructions'));
				var $select = $(this).parents('form').find('select.courier-select');
				var $wrapper = $select.parent().find('.customDropdown');

				if($select.data('selected') != undefined){
					
					var $option  = $select.find('option');

					$option.removeAttr('selected');
					$option.eq($select.data('selected')).attr('selected', 'selected');
					
					$wrapper.find('.current').removeClass('current');
					$wrapper.find('li a').eq($select.data('selected')).addClass('current');
					$select[0].selectedIndex = $select.data('selected');
					customDropdown.updateControlText( $wrapper, $option.eq($select.data('selected')).text() );
				}
			});
		},

		save: function(form) {
			var target = $(form).closest('.courier-instruction-container');

			// stop the spinner from appearing over the text when the contain height is too small
			//target.addClass('loading');
        	var $elem = target;
			var request = 'saveCourierInstruction';
	        var $form = $(form);        
	        var url = utils.getFormAction($form);
	        var DL = new data.DataLayer();	        
	        var myData = $form.serialize();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, function(result) {
	        	var $select,
	        	    $deliveryGroup;
	        	
	            target.find('.courier-instructions').html(result.courierInstruction);	
	        	$deliveryGroup = utils.getDeliveryGroup(target);
	        	utils.removeAjaxLoader($deliveryGroup);
				
				$select = $elem.find('select.courier-select');
				$select.data('selected',$select[0].selectedIndex);

	        	target.find('.cancel').trigger('click');
	        }, null, function(result) {	       
	        	courier.update( target, result );
	        });			
		

		},

		update: function(target, result) {
			//target.removeClass('loading');
			dropdown.init( target.find('select') );			
			courier.validation( target );
		},

		validation: function( context ) {
			if (!context) {
				context = $('.delivery-block .edit-courier-instructions');
			}

			$('form', context).each(function(){
				var $form   = $(this);
				var $select = $form.find('[name=courier]');
				var $input  = $form.find('[name=neighbour-no]');
				var $save   = $form.find('input.save');

				if (!$input.is(':visible')) {
					$input = $form.find('.courier-select');
				}
				
				$form.validate({
					focusInvalid: false,
					onkeyup: function(elm) {
						if (this.check(elm)) {
							$(elm).addClass('valid');
						} else {
							$(elm).removeClass('valid');
						}
						validationExtras.enableSave( $input, $save ); // save enabler must be placed after the element validation
					},
					onfocusout: function(elm) {
						this.element(elm);
						validationExtras.enableSave( $input, $save ); // save enabler must be placed after the element validation
					},
					errorElement: 'span',
					rules : {
						'neighbour-no' : {
							required : function() {
								return $select.val() === 'neighbour'; // is only required if the 'neighbour' option has been selected
							}
						}
					},
					messages: {
						'neighbour-no' : {
							required : $input.attr('title')
						}
					},
					submitHandler: function(form) {
						courier.save(form);
					}
				});

				// apply focus fix for android devices
				validationExtras.focusoutFix( $form );
				validationExtras.selectChangeFix( $form, $input, $save );

				// set up max character limits
				validationExtras.limitCharacters( $form.find('[name=neighbour-no]'), 50 );

				// check if the save should be enabled
				validationExtras.enableSave( $input, $save );
			});
		},

		change: function(e){
			var self = courier;
			var $neighbourWrapper = $(e.target).closest('form').find('.neighbour-house-no');
			var $neighbourInput   = $neighbourWrapper.find('input[type="text"]');
			
			var dropdownVal = $(e.target).val(); 	
				
			if (dropdownVal.indexOf('Neighbour') > 0) {
				if (common.isTouch()) {
					$neighbourWrapper.show();
				} else {
					$neighbourWrapper.slideDown();
				}
				$neighbourInput.addClass('required');
			}
			else {
				if (common.isTouch()) {
					$neighbourWrapper.hide();
				} else {
					$neighbourWrapper.slideUp();
				}
				$neighbourInput.removeClass('required');
			}
			
			$(e.target).closest('form').validate();			
		},

		toggle: function(e) {
			e.preventDefault();
			e.stopPropagation();

			var $group = $(e.target).closest('.collection-details');
			var $info  = $group.find('.courier-instructions');
			var $edit  = $group.find('.edit-courier-instructions');
			var $select = $edit.find('select.courier-select');

			//fix for 53388
			//var newAddChk =($('.new-address').show()) ? $('.new-address').hide() : $('.new-address').show();
			courier.hideDeliveryBlock(); // close the open delivery blocks
			
			var newContactChk = function(){
				if($('.edit-contact-details').show()){
						$('.edit-contact-details').hide();
						$('.delivery-contact-snippet').show()
					}
					else{
						$('.edit-contact-details').show();
						$('.delivery-contact-snippet').hide();
					}
			};
			
			if ($info.hasClass('hidden')) {
				$info.show().removeClass('hidden');
				$edit.hide();
				
				//fix for 53388
			//	newAddChk;
				newContactChk();
			} else {
				$info.hide().addClass('hidden');
				
				$edit.show();
				
				//fix for 53388
				//newAddChk;
				newContactChk();
				// if it's a touch device, we need to update the dimensions of the select box to ensure that
				// it's clickable over the .control element - this is normally done in the setup of the custom
				// drop down, but doesn't work in this scenario as it's hidden by default so the dimensions
				// cannot be retrieved
				if (common.isTouch()) {
					dropdown.updateSelectDimension( $edit.find('select') );
				} else {
					dropdown.updateSelectDimension( $edit.find('.customDropdown') );
				}
			}
			
			if($select.data('selected') == undefined){
				$select.data('selected',$select[0].selectedIndex);
			}
			
			if($select.find(':selected').val() == 'Leave with Neighbour')
					$edit.find('.neighbour-house-no').show();

			if($(e.target).closest('.courier-instruction-container').find('.delivery-note').length){
				$edit.find('.neighbour-house-no').find('input[type="text"]').val($(e.target).closest('.courier-instruction-container').find('.delivery-note').text());
			}
			else{
				$edit.find('.neighbour-house-no input[type="text"]').attr('value','');
			}

			return false;
		},

		init: function(context) {
			var self = courier;

			// update the event type (default is click - click too slow on windows phone, tap not recognised)
			// changed tap to touch start as the tap sometimes isn't firing on iPad mini
			if (common.isTouch()) {
				self.eventType = (common.isWindowsPhone()) ? 'MSPointerDown' : 'tap click';
			}

			self.bindEvents(context);
			self.validation(context);
			
			refreshAll.reInit.push(function() {				
				courier.validation();
			});
			
		}
	};

	
	
	return courier;
});
