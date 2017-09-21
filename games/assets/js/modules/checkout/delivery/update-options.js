/*global define: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'modules/custom-dropdown/common',
	'modules/checkout/delivery/new-address',
	'../loader',
	'./stores',
	'./lockers',
	'./collection-details',
	'./refresh-all',
	'modules/tesco.utils',
	'modules/tesco.data',
	'modules/checkout/payment',
	'./flowers-recipient-details'
], function($, common, breakpoint, customDropdown, newAddress, loader, stores, lockers, collection, refreshAll, utils, data, payment, flowersRecipientDetails){

	var options = {

		refresh: function(result, group){
			//$('.delivery-options', group).html(result.deliveryOptions);
			//necessary re-bindings
			common.customRadio($('.delivery-options', group));
			stores.validation(group);
		},

		update: function(group, $elem, isPageLoad, isChangeDeliveryType) {
			var bIsStoreCollect = false;
			lockers.removeLockers();

			if ($('#integrated-registration').length) {
				if ($elem.hasClass("store-collect")) {
					var request = 'selectDeliveryMethodStoreIR';
					bIsStoreCollect = true;
				}
				else {
					var request = 'selectDeliveryMethodHomeIR';
				}
			}
			else {
				if ($elem.hasClass("store-collect")) {
					var request = 'selectDeliveryMethodStore';
					bIsStoreCollect = true;
				}
				else {
					var request = 'selectDeliveryMethodHome';
				}
			}

			var $form = utils.getFormByElement($elem);
			var url;
			if (isPageLoad) {
				url = $elem.attr('data-url');
			}
			else {
				url = utils.getFormAction($form);
			}

			if (window.ENV && window.ENV === "buildkit") {
				url = $elem.attr('data-url');
			}

			var DL = new data.DataLayer({singleton:true});
			var myData = $form.serialize()
			DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(data) {
				var isCollection = $elem.hasClass("store-collect");
				// on Complete
				options.refresh(data, group);
				if (bIsStoreCollect) {
					// Need to invoke store collection time call
					collection.get(group);
						var res = JSON.parse(data.responseText);
						var isPostcodeSearch = false;
						if (isCollection && lockers.isLockersOn() && res.lockersAvailability === "Available") {
							lockers.updateLockers(group, isPostcodeSearch);
						}

				}
				else {
					$('.collection-details .edit-da-block').each(function(i, e){
						if($(this).find('label.invalid2').length){
							$(this).closest('.edit-da-block').show();
							var $details = $(this).parents('.collection-details');
							customDropdown.init($details.find('select'));
							newAddress.initialisePCAField($details);
						}
						if(group.find('.collection-details .selected-delivery-date').length){
							group.find('.datepicker-tooltip-module .date-time').hide();
						}
					 });
					refreshAll.reInitAll();
					if($(".delivery-saver-message")){
						payment.bindEvents();
					}

					if (group.find('.rdo-standard-delivery').is(':checked') || group.find('.rdo-grocery-delivery').is(':checked')) {
						group.find('.datepicker-wrapper, .pick-delivery-btn').hide();
					} else {
						if(group.find('.datepicker-wrapper, .pick-delivery-btn').length > 0){
							group.find('.datepicker-wrapper, .pick-delivery-btn').show();
						}
					}
					$(".delivery-block .datepicker-tooltip-module").each(function( index ) {
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
									$(this).html(str1+'<span class="postcode">'+str2+'</span>')
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
				}
				if ($('.deliveryTypeRefreshText').length && $('.deliveryTypeRefreshText').html() != "") {
					var refreshTxt = $('.deliveryTypeRefreshText').attr('id');
					$('.delivery-type').find("p.groceryDeliveryText#"+refreshTxt).show().html($('.deliveryTypeRefreshText').html());

					if($('.delivery-block ul.tabs li').length == 1){
						if(breakpoint.mobile){
							$('p.groceryDeliveryText').css('margin-left', '0');
						}
						else {
							var deliveryTxtWid = $('p.groceryDeliveryText').prev().width() + 50 + 'px';
							$('p.groceryDeliveryText').css('margin-left', deliveryTxtWid);
						}
					}
				}

				if(group.find('.flowers-module').length){
					flowersRecipientDetails.init();
					$('.flowers-recipient').find('.address-tabs li.selected input[type="radio"]').trigger('click');
				}

			});
		}
	};

	return options;

});
