/*global define: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'../loader',
	'modules/custom-dropdown/common',
	'./courier',
	'./edit-collection-details',
	'./new-address',
	'./collection-details',
	'modules/checkout/delivery',
	'modules/tesco.utils',
	'modules/tesco.data',
	'./refresh-all'
], function($, common, breakpoint, loader, dropdown, courier, editCollectionDetails, newAddress, collectionDetails, delivery, utils, data, refreshAll) {

	var details = {

		refresh: function(result, group){
			var newTarget = $('.collection-details', group).replaceWith(result.deliveryDetails);

			common.customCheckBox.init($('.collection-details', group));

			//create custom dropdowns
			$($('.collection-details select', group)).each(function(){
				dropdown.init($(this));
			});

			courier.validation(group);
			editCollectionDetails.validation(group);
			newAddress.validation(group);

			//update collection details
			if($('.collection-time',group).length){
				collectionDetails.get(group);
			}

		},

		update: function(group){

			loader($('.collection-details', group), 'Searching for your collection details');

			$.ajax({
				url: '/stubs/checkout/delivery-details.php',
				dataType: 'json',
				type: 'GET',
				success: function(result){
					details.refresh(result, group);
				}
			});
		},
		init: function() {
			$(document).on('change', '.address-nickname select', function(e) {
				details.changeDeliveryAddress($(this));					
			});	
			
			$(document).on('change', '.groceryDeliveryAddress select', function(e) {
				details.changeDBTAddress($(this));					
			});					
		},
		changeDeliveryAddress: function($elem) {			
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
		changeDBTAddress: function($elem) {	
			
			var request = 'changeGrocerySlot';
	        var $form = utils.getFormByElement($elem);	        
	        var url = utils.getFormAction($form); 
	        var DL = new data.DataLayer();
	        var myData = $form.serialize();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(result) {	
	        	var address = $elem.closest('.groceryDelivery'),
                parsedResponse = $.parseJSON(result.responseText),
                addressResponse = parsedResponse.groceryAddress;
				address.find('.loader').remove();
				address.html(addressResponse);
				dropdown.init($('.groceryDelivery').find('select'));
				if ($('.groceryDeliveryAddress').length) {
                    var optionStr = $('.groceryDeliveryAddress .customDropdown').find("a");
                    optionStr.each(function() {
                        if ($(this).html().lastIndexOf('|') != -1) {
                            var str = $(this).html(),
                                strLastIndex = str.lastIndexOf('|'),
                                str1 = str.substring(0, strLastIndex),
                                str2 = str.substring(strLastIndex + 1);
                            $(this).html(str1 + '<span class="postcode">' + str2 + '</span>')
                        }
                    });
                    if (common.isTouch() && !breakpoint.kiosk) {
						var selOption = $( ".groceryDeliveryAddress select option" );
						selOption.each(function(){
							if($(this).text().lastIndexOf('|') != -1){
								var str = $(this).text(),
									strLastIndex = str.lastIndexOf('|'),
									str1 = str.substring(0,strLastIndex),
									str2 = str.substring(strLastIndex+1);
									$(this).text(str1+str2);
							}
						});
					}
                    
                    $('.groceryDeliveryAddress .customDropdown').css('background', '#fff');
				}

	        });			
	        		
		}
		
		

	};

	return details;

});