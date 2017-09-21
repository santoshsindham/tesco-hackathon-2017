/*global define: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'../loader',
	'modules/custom-dropdown/common',
	'modules/tesco.utils',
	'modules/tesco.data'	
], function($, common, breakpoint, loader, dropdown, utils, data){

	var refreshAll = {

		reInit: [],

		refresh: function(e){
			var $elem = e.target;
	        
	        var request = 'splitDeliveryGroups';
	        var $form = utils.getFormByElement($elem);	        
			var url = utils.getFormAction($form);		
	        var DL = new data.DataLayer();	        
			var myData = $form.serialize();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(data) {	        	
	        	refreshAll.reInitAll(null, refreshAll.getInitialDeliveryDetails);	        	
	        });		
		},

		reInitAll: function(iDeliveryGroup, callback) {
			var i = refreshAll.reInit.length;
			var selector = '#delivery-wrapper'
				
			//loop through array and run any functions			
			while(i--){
				refreshAll.reInit[i]();
			}
							
			if (iDeliveryGroup) {
				selector = '#' + iDeliveryGroup;
			}
			
			common.customRadio(selector);
			common.customCheckBox.init($(selector));
			
			//create custom dropdowns
			$(selector + ' select').each(function(){
				dropdown.init($(this));
			});
		
			if ($.isFunction(callback)) {
				callback();
			}
			
		},
		
		init: function(delivery){
			$(document).on('click', '.split-delivery .button', refreshAll.refresh);			
			$(document).on('click', '.merge-shipping-group', refreshAll.refresh);			
		},
		
		getInitialDeliveryDetails: function() {
			$('.delivery-block').each(function() {	    		 	
	    		 var $elem = $(this).find('.tabs input[type=radio]:checked');
	    		 if ($elem.length > 0) {
	    			 $elem.trigger('click');	    			 
	    		 }
	    	 });
	    }
				
	};

	return refreshAll;

});