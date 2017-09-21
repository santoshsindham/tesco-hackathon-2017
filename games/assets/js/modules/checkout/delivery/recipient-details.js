/*global define: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'../loader',
	'./edit-collection-details',
	'modules/checkout/resetForm',
	'modules/custom-dropdown/common',
	'modules/validation',
	'./refresh-all',
	'modules/tesco.utils',
	'modules/tesco.data'
], function($, common, breakpoint, loader, editCollectionDetails, resetForm, dropdown, validationExtras, refreshAll, utils, data) {

	/*
	 * Recipient Details Functions
	 */
	var recipientDetails = {

		group: null,

		update: function(result, validation){

			var newTarget = $('.recipientDetails', recipientDetails.group).html(result.recipientDetails);

			// generate custom fields
			common.customCheckBox.init( newTarget );

			// re-initialise forms
			// editCollectionDetails.validation( newTarget );

			$('select', newTarget).each(function(){
				$(this).hide();
				dropdown.init($(this));
			});

			editCollectionDetails.validation();
		},

		get: function(e, validation, mobileTarget){
			var target;

			if(mobileTarget){
				target = mobileTarget;
			}else{
				target = $(e);
				if(e.type){
					target = $(e.target);
				}
			}

			recipientDetails.group = target.closest('.collection-details');

			//loader($('.recipientDetails', recipientDetails.group), 'Updating your contact details');
						
			var request = 'saveDeliveryRecipient';	        	        
	        var url = utils.getFormAction($form);
	        var $elem = $form;
	        var DL = new data.DataLayer();
	        var myData = $form.serialize();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(data) {	        	
	        	recipientDetails.update(data, validation);
	        });	        

			return false;		
			
		},
		cancel: function(e){
			e.preventDefault();

			var $form = $(e.currentTarget).parents('.edit-contact-details');

			editCollectionDetails.toggle(e);
			resetForm.init($form);

			var $fields = $form.find('[name=honorific-prefix], [name=given-name], [name=family-name]');

			if ($form.find('[name=no-tel]').attr('checked')) {
				$fields = $fields.add( $form.find('[name=tel-alt]') );
			} else {
				$fields = $fields.add( $form.find('[name=tel]') );
			}

			var $save = $form.find('input[type=submit]');

			// check if the save should be enabled
			validationExtras.enableSave( $fields, $save );

			return false;
		},
		init: function(){
			// bind events
			$(document).on('tap click','.recipientDetails .edit-contact-details input[type="button"]', recipientDetails.cancel);			
			//$(document).on('tap click','.recipientDetails .edit-contact-details input[type="submit"]', recipientDetails.cancel);
			
			// setup validation
			editCollectionDetails.validation( $('.checkout') );

			refreshAll.reInit.push(function(){
				editCollectionDetails.validation( $('.checkout') );
			});
		}

	};

	return recipientDetails;

});