/*global define:true, Microsoft: true */
define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'modules/custom-dropdown/common',
	'modules/overlay/common',

	'./delivery/update-options',
	'./delivery/update-details',

	'./delivery/stores',
	'./delivery/store-details',

	'./delivery/lockers',

	'./delivery/datepicker',
	'./delivery/collection-details',
	'./delivery/edit-collection-details',
	'./delivery/new-address',
	'./delivery/courier',
	'./delivery/delivery-options-list',
	'./delivery/refresh-all',
	'./delivery/different-address',
	'./delivery/update-days',
	'./delivery/recipient-details',
	'./gift-message',
	'modules/textbox-session-storage/common',
	'./delivery/flowers-recipient-details'

], function(
	$, common, breakpoint, dropdown, overlay, updateOptions, updateDetails, stores, storeDetails, lockers,
	datepicker, collectionDetails, editCollectionDetails, newAddress, courier, deliveryOptionsList,
	refreshAll, differentAddress, updateDays, recipientDetails, giftMessage, textboxSessionStorage, flowersRecipientDetails
){

	var delivery = {

		mobileClubcardExchange: function(e){
			e.preventDefault();
			e.stopPropagation();

			var $info = $(e.target).closest('.clubcard-exchange').find('.info');

				if(breakpoint.mobile){
					var content = $.trim($('<div></div>').html($info.clone()).html());
					common.virtualPage.show({
						content: content,
						customClass: 'store-not-found'
					});
					$('#virtual-page').find('.info').show();
				} else {
					$(".clubcard-exchange .info").hide();
					if ($info[0].style.display !== 'block') {
						$info.show();
					} else {
						$info.hide();
					}
				}

			return false;
		},


		storeNotFound: function(e){
			e.preventDefault();
			var content,
				$info = $(e.target).closest('.store-not-found').find('.info');
			if(breakpoint.mobile){
				content = $.trim($('<div></div>').html($info.clone()).html());
				common.virtualPage.show({
					content: content,
					customClass: 'store-not-found'
				});
				$('#virtual-page').find('.info').show();
			}else{
				if ($info[0].style.display !== 'block') {
					$info.show();
				} else {
					$info.hide();
				}
			}

			return false;
		},



		changeDeliveryType: function(e){
			//update tab styles
			var tabs = $(e.target).closest('.tabs'),
				isChangeDeliveryType = true;
			tabs.find('.selected').removeClass('selected');
			var $elem = $(e.target).closest('li');
			$elem.addClass('selected');

			var group = $(e.target).closest('.delivery-block');
			$('.datepicker-tooltip.visible').removeClass('visible').hide();
			updateOptions.update(group, $elem, false, isChangeDeliveryType);

			var DeliveryTitle = $(e.target).parents('li').find('.deliveryGroupTitle').val();
			$(e.target).parents(".wrapperForDeliveryBlock").find('.checkoutTitles h3').html(DeliveryTitle);

		},

		setup: function(){
			//create custom dropdowns
			$('.delivery-wrapper select').each(function(){
				dropdown.init( $(this) );

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
			});

			//generate custom checkboxes
			common.customCheckBox.init($('.checkout'));

			//initialize storeDetails
			storeDetails.init();

			//initialize changestore
			stores.init();

			//initialize change lockers
			if (lockers.isLockersOn()) {
				lockers.init();
			}

			//intialize edit collection details
			editCollectionDetails.init();

			//bind datepicker
			datepicker.init();

			//new address
			newAddress.init();

			//courier
			courier.init();

			//delivery options list
			deliveryOptionsList.init();

			//split delivery
			refreshAll.init(delivery);

			// Init changing delivery address
			updateDetails.init();

			// Recipient Details
			recipientDetails.init();

			updateDays.init();

			giftMessage.init();

			refreshAll.reInit.push(function() {
			    if ($('.personal-gift-message-wrapper').length) {
                    textboxSessionStorage.init('.uiGiftMessage textarea');
                    giftMessage.init();
                }
			});

		},

		breakpointReset: function () {
			$('.clubcard-exchange .info').hide();
			$('.store-not-found .info').hide();
		},

		unbindEvents: function(){
			$(document).off('click', '.delivery-type .tabs input[type="radio"]');
			$(document).off('tap click', '.store-options-module .view-more-stores');
			$(document).off('tap click', '.store-options-module .delivery-contact-snippet .edit');
			$(document).off('tap click', '.different-address .label');
			$(document).off('tap click', '.delivery-options-list .custom-radio');
		},

		init: function(){
			var deliverySaver = $('.delivery-saver');
			delivery.unbindEvents();
			window.picturefill();

			//attach click event to view more stores
			$(document).on('tap click', '.store-options-module .view-more-stores', stores.toggleViewMore);

			//attach click event to edit collection details
			$(document).on('tap click', '.store-options-module .delivery-contact-snippet .edit', function(e){
				if(!breakpoint.mobile){
					collectionDetails.toggle(e);
				}else{
					editCollectionDetails.mobile(e);
				}
			});

			$(document).on('click', '.delivery-type .tabs input[type="radio"]', delivery.changeDeliveryType);
			$(document).on('tap click', '.different-address .label', differentAddress.show);
			$(document).on('tap click', function (e) {
				if ($(e.target).is('.store-not-found a')) {
					delivery.storeNotFound(e);
				} else {
					if (!breakpoint.mobile) {
						$('.store-not-found').find('.info').hide();
					} else {
						return;
					}
				}
			});

			if($('.flowers-module').length){
				$(document).on('tap click', '.flowers-recipient .added-new-recipient .edit', function(e){
					flowersRecipientDetails.changeDetails(e, $('.added-new-recipient'), $('.edit-new-recipient'));
				});
				$(document).on('tap click', '.flowers-recipient .saved-address .edit', function(e) {
					flowersRecipientDetails.changeDetails(e, $('.saved-address'), $('.edit-saved-address'));
				});
				$(document).on('tap click', '.flowers-new-recipient .newFlowersRecipientInfo .edit', function(e) {
					flowersRecipientDetails.changeDetails(e, $('.newFlowersRecipientInfo'), $('.editNewFlowersRecipientInfo'));
				});
				$(document).on('tap click', '.flowers-recipient .address-link', function (e) {
					flowersRecipientDetails.toggleFlowersAddress(e);
				});
				$(document).on('change', '.flowers-recipient .edit-courier-instructions select', function(e) {
					var $courierForm = $(this).parents('.edit-courier-instructions form');
					var $save = $courierForm.find('input.save');

					$courierForm.find('.save').one("click", function(event) {
						 courier.save($courierForm);
						 return false;
					});
				});
			}

			//todo
			if(deliverySaver.length){
				$('.delivery-saver a').each(function(i){
					$(this).on('click', function(e){
						var deliverySaver = $(this).parent(),
						tooltip = deliverySaver.next(),
						overlayContent = tooltip.clone(true).html();
						var toolTipPointer=deliverySaver.find('a');
						var params = {
									content: overlayContent,
									customClass: 'delivery-saver-tooltip',
									hideOnOverlayClick: true,
									hideOnEsc: true
						};
						if(breakpoint.mobile){
							var backLink = "<a href='#' class='back'><span class='icon' data-icon='g' aria-hidden='true'></span> Back to checkout</a>";
							var opts = {
									content: backLink + overlayContent,
									closeSelector: '.back'
							};
							common.virtualPage.show(opts);
							$('#virtual-page').addClass('delivery-saver-context');
							$('.close').css({'display':'none'});
						} else{
							var topPos = toolTipPointer.offset().top;
							//leftPos = deliverySaver.position().left;
							tooltip.css({
									'display':'block',
									'position':'absolute',
									'top': topPos-25
									//'left':leftPos-30

							});
						}
					});
				});

				$('.delivery-saver-tooltip').each(function(i){
								var $this = $(this);
								$(this).find('.close').on('click', function(e){
										$this.css("display", "none");
								});
				});
			}

			//changes ends


			delivery.clubcardBoostInfo();
			delivery.setup();
		},

		clubcardBoostInfo: function(){
			$(document).off('tap click', '.clubcard-exchange a').on('tap click', '.clubcard-exchange a', function (e) {
				e.preventDefault();
				e.stopPropagation();

				var content = "",
					$info = $(this).parents('.clubcard-exchange').find('div.info');

				if (breakpoint.mobile) {
					content = $.trim($('<div></div>').html($info.clone()).html());
					common.virtualPage.show({
						content: content,
						customClass: 'store-not-found'
					});
					$('#virtual-page').find('.info').show();
				} else {
					content = $(this).parents('.clubcard-exchange').find('div.info div.info-box').html();
					common.tooltip.show({
						trigger: $(this),
						html: content,
						close: true,
						closeTriggers: "a.close"
					});
				}
			});
		},

		getInitialDeliveryDetails: function() {
	    	 $('.delivery-block').each(function() {
	    		 var $elem = $(this).find('.tabs li.selected');
	    		 if ($elem.length > 0) {
	    			 updateOptions.update($(this), $elem, true);
	    			 //$elem.trigger('click');
	    		 }
	    	 });
	    }

	};

	breakpoint.mobileIn.push(function () {
		delivery.breakpointReset();
	});

	return delivery;

});
