/*global define: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'../loader',
	'modules/custom-dropdown/common',
	'./refresh-all',
	'modules/tesco.utils',
	'modules/tesco.data',
	'modules/checkout/payment'
], function($, common, breakpoint, loader, dropdown, refreshAll, utils, data, payment) {

	var collectionDetails = {

		group: null,

		hideDeliveryBlock: function() {
			// close new address block. Close only visible address block in case of multiple delivery blocks
			$('.edit-da-block.new-address').each(function () {
				if ($(this).is(':visible')) {
					$(this).find('.cancel').trigger('click');
				}
			});
		},
		
		/*
		 * Toggle collection details form
		 */
		toggle: function(e){
			var target = $(e).find('.collection-details');

			if (e.type) {
				e.preventDefault();
				e.stopPropagation();

				target = $(e.target);
			}

			var form = target.closest('.collection-details').find('.edit-contact-details');

			//fix for 53388
			//var newAddChk =($('.new-address').show()) ? $('.new-address').hide() : $('.new-address').show();
			collectionDetails.hideDeliveryBlock(); // close the open delivery blocks
			
			var editCourierChk = function(){
				if($('.edit-d-instruction-block').show()){
					$('.edit-d-instruction-block').hide();
					$('.courier-instructions').show()
				}
				else{
					$('.edit-d-instruction-block').show();
					$('.courier-instructions').hide();
				}
			}
			
			if (form.hasClass('open')) {
				if (common.isTouch()) {
					form.removeClass('open').hide();
				} else {
					form.removeClass('open').slideUp();
				}
				target.closest('.collection-details').find('.delivery-contact-snippet').show();
				
				//fix for 53388
				//newAddChk;
				editCourierChk();
			} else {
				target.closest('.collection-details').find('.delivery-contact-snippet').hide();
				
				//fix for 53388
				//newAddChk;
				editCourierChk();
				
				if (common.isTouch()) {
					form.addClass('open').show();
				} else {
					form.addClass('open').slideDown();
				}

				// if it's a touch device, we need to update the dimensions of the select box to ensure that
				// it's clickable over the .control element - this is normally done in the setup of the custom
				// drop down, but doesn't work in this scenario as it's hidden by default so the dimensions
				// cannot be retrieved
				
				common.customCheckBox.init(target.closest('.collection-details'));
				dropdown.updateSelectDimension( form.find('.customDropdown') );
			}

			return false;
		},

		update: function(result){
			//update delivery collection time
			$('.collection-time', collectionDetails.group).html(result.storeCollectionTime);
			//update delivery cost
			$('.delivery-cost-module .value', collectionDetails.group).replaceWith(result.deliveryCost);
		},

		get: function(group, callbackFn){
			collectionDetails.group = group;			

			$elem = $(collectionDetails.group).find('.collection-time');
			
			var request = 'updateCollectionTime';
	        var $form = utils.getFormByElement($elem);	        
			var url = $elem.attr('data-url');
	        var DL = new data.DataLayer({singleton:true});	        
	        var myData = 'data:{"data"}';

	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(data) {
	        	refreshAll.reInitAll();
	        	if (typeof callbackFn === 'function') {
	        		callbackFn();
	        	}
	        	if(collectionDetails.group.find('.collection-details .selected-delivery-date').length){
					collectionDetails.group.find('.date-time').hide();
				}
	        	if($(".delivery-saver-message")){
					payment.bindEvents();
				}
	        	var elem = $('.store-details-container .store-info-details.selected .vcard-info .store-opening-times .storefinder-openingtimes-times');   
                $(elem).each(function (){
                    if ($(this).text().length > 11) {                        
                        $(this).text($(this).text().substr(0, 11));
                    }
                });
	        });			
						
		}
	};

	return collectionDetails;
});