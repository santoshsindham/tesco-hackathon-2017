/*global define: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'../loader',
	'./collection-details',
	'modules/tesco.utils',
	'modules/tesco.data',
	'modules/checkout/payment',
	'modules/custom-dropdown/common',
  './refresh-all'
	
], function($, common, breakpoint, loader, collectionDetails, utils, data, payment, 
  customDropdown, refreshAll) {
 
	var deliveryOptionsList = {

		group: null,

		get: function(e){
			var $elem = $(e);

			if(e.type){
				e.preventDefault();
				$elem = $(e.target);
			}

			deliveryOptionsList.group = $elem.closest('.delivery-group-block');			
			
			if(deliveryOptionsList.group.find('ul label.groceryDO').length){
				var request = 'selectDeliveryOptionHomeDBT';
			}
			else{
				var request = 'selectDeliveryOptionHome';
			}

			
	        var $form = utils.getFormByElement($elem);	        
			var url = utils.getFormAction($form);		
	        var DL = new data.DataLayer({singleton:true});	        
			var myData = $form.serialize();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(data) {
	        	if($(".delivery-saver-message")){
						payment.bindEvents();
				}
	        	$(".delivery-block .datepicker-tooltip-module").each(function( index ) {
        			//console.log( index + ": " + $( this ).text() );
					if($(this).find('.rdo-standard-delivery').is(':checked') || $(this).find('.rdo-grocery-delivery').is(':checked')){
						$(this).find('.datepicker-wrapper, .pick-delivery-btn').hide();
					}
				});
	        	
	        	if($('.groceryDeliveryAddress').length){
					var optionStr = $('.groceryDeliveryAddress .customDropdown').find("a");
					optionStr.each(function(){
						if($(this).html().lastIndexOf('|') != -1){
							var str = $(this).html(),
								strLastIndex = str.lastIndexOf('|'),
								str1 = str.substring(0,strLastIndex),
								str2 = str.substring(strLastIndex+1);
								$(this).html(str1+'<span class="postcode">'+str2+'</span>');
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
				}
	        	
	        	if ($elem.hasClass('rdo-standard-delivery') || $elem.hasClass('rdo-grocery-delivery')) {
					deliveryOptionsList.group.find('.datepicker-wrapper, .pick-delivery-btn').hide();
				} else {
					deliveryOptionsList.group.find('.datepicker-wrapper, .pick-delivery-btn').show();
					
				}
				if($('div.delivery-group-block').find('div.flowers-module').length){
					$('div.flowers-recipient').find('.address-tabs li.selected input[type="radio"]').trigger('click');
				}        
				refreshAll.reInitAll();
	   });
		
			return false;
		},

		init: function(){			
			$(document).on('tap click', '.delivery-options-list .custom-radio', function(e){
				//if(e.target === this){
					deliveryOptionsList.get(e);
				//}
			});
		}
	};

	return deliveryOptionsList;
});