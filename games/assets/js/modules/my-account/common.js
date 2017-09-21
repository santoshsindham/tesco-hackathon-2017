define([
	'domlib',
	'modules/common',
	'modules/breakpoint',
	'modules/custom-dropdown/common',
	'modules/checkout/resetForm',
	'modules/validation',
	'modules/sticky-sidebar/common',
	'modules/navigation/common',
	'modules/editable-addresses/common',
	'modules/tesco.utils',
	'modules/tesco.analytics',
	'modules/bfpo/common'
], function($, common, breakpoint, dropdown, resetForm, validationExtras, stickySidebar, navigation, PCA_EditableAddress, utils, analytics, bfpo){

	var groupFields = '[name=companyname], [name=flatnumber], [name=buildingname]';
	var myAccount = {

		// default event is click
		eventName: 'click',
		orderDetailsNav: '#order-header-actions .actions-list',
		dropdownButton: '#order-header-actions .custom',

		containerSelector: '.my-account',
		editButtonClicked: false,
		pcaAddressSelected: false,
		typingStarted: false,
		isEditPage: false,
		groupFields: groupFields,
		enableSaveFields: '[name=nick-names], [name=postal-code-pca], ' + groupFields + ', [name=dayphone], [name=eveningphone], [name=mobilephone]',
		elementsToHide: '.customDropdown',
		isLegacyAddressPage: false,
		enableBfpo: false,

		setup: function(){
			//create custom dropdowns
			$('.sort select, .order-details-block select').each(function(){
				$(this).addClass('visually-hidden-select');
				dropdown.init( $(this) );
			});
		},

		virtualPage: function (e, elementId, content) {
			e.preventDefault();

			common.virtualPage.show({
				content: $('<div />', {id: elementId}).html(content),
				closeSelector: '.back',
				callbackIn: myAccount.virtualPageEvents
			});
		},
		virtualPageEvents: function () {
			var $vp = $('#virtual-page');
			$vp.find('.back, .cancel').on('tap click', function(e){
				var $target = $(this);
				if (!$vp.find('.error').length) {
					common.virtualPage.close();
				}
				return false;
			});

		},

		/*
		 * Order Details Page
		 */

		// Print page - found in order details in-page navigation
		printLinks: function(e){
			myAccount.unbindEvents();

			e.preventDefault();
			e.stopPropagation();
			window.print();
		},

		// Show and Hide Delivery Details - Accordion
		// replace slideUp and slideDown with animate, for zepto
		deliveryDetailsToggle: function(){

			var $el = $(this).siblings('.delivery-details-expanded');

			if ($el.hasClass('animate')) {
				$el.removeClass('animate');
				$(this).text('Show delivery details');
			}
			else {
				$el.addClass('animate');
				$(this).text('Hide delivery details');
			}
			return false;
		},

		// Show and Hide Order History
		orderHistoryButton: '#order-history-btn',
		orderHistoryContent: '#order-history',
		handleOrderHistory: function(e) {
			myAccount.unbindEvents();

			var $el = $('#order-history');

			if(breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet){

				$('#virtual-page #order-history').addClass('animate');
				myAccount.virtualPage(e, 'order-history', $('#order-history').html());
				myAccount.virtualPageEvents();
				return false;
			}else{
				if ($el.hasClass('animate')) {
					$(myAccount.orderHistoryButton).children('span.icon').attr('data-icon', 'a');
					$el.removeClass('animate');
				}
				else {
					$(myAccount.orderHistoryButton).children('span.icon').attr('data-icon', 'c');
					$el.addClass('animate');
				}
				return false;
			}
		},
		closeOrderHistoryAccordion: function(e){
			$(myAccount.orderHistoryContent).removeClass('animate');
			$(myAccount.orderHistoryButton).children('span.icon').attr('data-icon', 'a');
		},

		// Toggle Order Details dropdown navigation (mobile and tablet)
		closeCustomDropdown: function(){
			$(myAccount.orderDetailsNav).removeClass('expand').addClass('collapse');
			$(myAccount.dropdownButton).children('span.icon').attr('data-icon', '2');
		},
		openCustomDropdown: function(){
			$(myAccount.orderDetailsNav).removeClass('collapse').addClass('expand');
			$(myAccount.dropdownButton).children('span.icon').attr('data-icon', '1');
		},

		customActionsDropdown: function(e){
			if ($(myAccount.orderDetailsNav).is(':visible')) {
				myAccount.closeCustomDropdown();
			}
			else {
				myAccount.openCustomDropdown();
			}
			return false;
		},
		closeDropdownOnBody: function(){
			if ($(myAccount.orderDetailsNav).is(':visible')) {
				$(myAccount.orderDetailsNav).removeClass('expand').addClass('collapse');
				$(myAccount.dropdownButton).children('span.icon').attr('data-icon', '2');
			}
		},

		bindEvents: function(){

			myAccount.dropdownButton.on(myAccount.eventName, myAccount.customActionsDropdown);

			$('body').on(myAccount.eventName, myAccount.closeDropdownOnBody);

			$('.toggle-delivery-details').on(myAccount.eventName, myAccount.deliveryDetailsToggle);
			$('#order-header-actions li').not('.payment-summary-link, .print').find('a').on('tap click', function(){location.href=$(this).attr('href')});
			$('#order-header-actions').find('.print a').on(myAccount.eventName, myAccount.printLinks);
			$('#order-header-title .title-links').find('.print a').on(myAccount.eventName, myAccount.printLinks);

			myAccount.orderHistoryButton.on(myAccount.eventName, myAccount.handleOrderHistory);
		},

		unbindEvents: function(){
			myAccount.closeDropdownOnBody();
		},

		// reset values and clear the errors just for the new address section
		clearmyAccount: function(context) {
			if (breakpoint.mobile) {
				resetForm.init( $('#virtual-page form') );
			} else {
				resetForm.init( $('form', context) );
			}
		},

		clearPCAField: function(){

			/*var _oPCAElem = $('input[name="postal-code-pca"]');

			if(_oPCAElem.data('isAddressSelected')){
				_oPCAElem.val('').data('isAddressSelected', false).valid();
			}
			*/
			myAccount.editButtonClicked = false; // Reset edit button clicked
			myAccount.manualAddressSignUpSlideUp();
		},

		manualAddressSignUpSlideUp: function(){
			var el,
				$elem,
				self = this;

			el = $(myAccount.containerSelector).find('.manually-add-address');

			if (self.enableBfpo) {
                bfpo.close($(myAccount.containerSelector));
            }

			// Only slide up and reset form if visible
			if (!el.is(':visible')) {
				return;
			}

			$elem = $(myAccount.containerSelector).find('form#add-address');

			$elem.find(self.groupFields).removeClass('valid').val('');
			$elem.find(self.groupFields).addClass('required');

			el.find("input[type='text']").removeClass('error');
			el.find("span.error").remove();

			//$elem.validate().resetForm();

			// Re-enable the validation on the nickname field if it's empty.
			// Temp fix as it doesn't work on first attempt on edit address page
			if (myAccount.isEditPage) {
				var nm = $(myAccount.containerSelector).find('[name=nick-names]');
				if (nm.val() === '') {
					nm.valid();
				}
			}

			myAccount.validation.enableSave($elem);

			el.slideUp('fast', function() {
				myAccount.editButtonClicked = false;
				myAccount.pcaAddressSelected = false;
			});
		},

		manualAddressSignUpSlideDown: function(){
			var el = $(myAccount.containerSelector).find('.manually-add-address'),
				$form = el.closest('form');

			el.slideDown('fast', function () {
				if ($form.data('isBfpoAddress')) {
          bfpo.open($form);
        }
			});

			if (myAccount.isLegacyAddressPage) {
				if (el.closest('form').closest('.application-content').find('.save').hasClass('disabled')) {
					el.closest('form').closest('.application-content').find('.save').removeClass('disabled');
				}
			} else {
				if (el.closest('form').find('.save').hasClass('disabled')) {
					el.closest('form').find('.save').removeClass('disabled');
				}
			}
		},

		validation: {

			$form: [],

			enableSave: function(myForm){
				var sEnableSaveFields = myAccount.enableSaveFields;

				myForm = $(myForm);

				if (myForm.data('isBfpoAddress')) {
					sEnableSaveFields = '[name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=dayphone], [name=eveningphone]';
				}

				if (typeof $(myForm).attr('id') !== 'undefined') {
					validationExtras.enableSave(
						myForm.find(sEnableSaveFields),
						$(myAccount.containerSelector).find('input.save')
					);
				}
			},

			// init: function(group, overlay, callback, mobile){
			// init: function(context, $target, callback){
			init: function(context, $target, callback){
				var self = myAccount.validation;
				$(document).on('tap click', '.add-pca-address button.edit-add-button', function (e) {
					//set omniture var -  US2571-40
					//e.preventDefault();
					if(!$(this).hasClass('disabled')){
						self.editButtonClicked = true;
					//	hideMessage();
						$(document).find('.pnlResultsSmall .pcaContent div').trigger('click');
					  var _oWebAnalytics = new analytics.WebMetrics();
					  var v = [{'eVar65' : 'MA_EA_E1', 'events' : 'event65'}];
					  _oWebAnalytics.submit(v);
					}
				});


				   var mapFields = ['postal-code-pca', 'companyname', 'flatnumber', 'buildingname', 'street', 'locality', 'city'];	/* ** EPIC : 2571 : Changes ** */

				var $toCompare = [];

				self.$form = myAccount.isLegacyAddressPage ?
						$('#main-content form', context) :
						$('form', context);

				$(myAccount.containerSelector).find('input[name="postal-code-pca"]').data('isAddressSelected', false);

				// add the custom validation methods to the validation library before form validation setup
				validationExtras.customMethods.telephone();
				validationExtras.customMethods.eveningTelephone();
				validationExtras.customMethods.mobile();
				validationExtras.customMethods.isUniqueFromString();
				validationExtras.customMethods.companyNameCheck();
				validationExtras.customMethods.companyNameLastCharacterCheck();
				validationExtras.customMethods.checkEditableAddresses();
				validationExtras.customMethods.validateSpecialInvalidCharacters();

				$toCompare = self.$form.find('.field-wrapper').data('nicknames');

				self.$form.validate({
					errorClass: 'error',
			        validClass: 'valid',
					onkeyup: function(elm) {
						if (this.check(elm)) {
							$(elm).addClass('valid');
						} else {
							$(elm).removeClass('valid');
						}
						self.enableSave(this.currentForm); // save enabler must be placed after the element validation
					},
					focusInvalid: false,
					onfocusout: function(elm) {
						this.element(elm);
						self.enableSave(this.currentForm); // save enabler must be placed after the element validation
					},
					invalidHandler: function(form, validator) {
						var errors = validator.numberOfInvalids(),
							$elem = null;

				        if (errors) {
				            if (breakpoint.mobile) {
				            	$elem = $(validator.errorList[0].element).closest('.field-wrapper');
				            }
				            else {
				            	$elem = $(validator.errorList[0].element).closest('.field-wrapper').siblings('span');
				            }
				            validationExtras.scrollToError($elem);
				        }
					},
					errorElement: 'span',
					groups: {
						editableAddressesError: "companyname flatnumber buildingname"
					},
					errorElement: 'span',
					rules: {
						'nick-names': {
							required: true,
							isUniqueFromString: {
								fieldToCompare: $toCompare
							},
							validateSpecialInvalidCharacters: true
						},
						'postal-code-pca': {
							required: true
						},

						'dayphone': {
							telephone: true
						},
						'eveningphone': {
							eveningTelephone: true
						},
						'mobilephone': {
							mobile: true
						},
						'companyname': {
							checkEditableAddresses: true,
							validateSpecialInvalidCharacters: true
						},
						'flatnumber': {
							checkEditableAddresses: true,
							validateSpecialInvalidCharacters: true
						},
						'buildingname': {
							checkEditableAddresses: true,
							validateSpecialInvalidCharacters: true
						},
						'street' : {
							validateSpecialInvalidCharacters: true
						}
					},
					messages: {
						'nick-names': {
							required: validationExtras.msg.newAddressNickname.required,
							isUniqueFromString: validationExtras.msg.isUnique.inValid,
							validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
						},
						'postal-code-pca': {
							required: validationExtras.msg.postcode.required
						},
						'companyname': {
							checkEditableAddresses: validationExtras.msg.editableAddress.required,
							validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
						},
						'flatnumber': {
							checkEditableAddresses: validationExtras.msg.editableAddress.required,
							validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
						},
						'buildingname': {
							checkEditableAddresses: validationExtras.msg.editableAddress.required,
							validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
						},
						'street': {
							checkEditableAddressesInvalidCharacters: validationExtras.msg.editableAddress.inValid,
							validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
						},

						'dayphone': {
							required: validationExtras.msg.daytimeTelephone.required
						},
						'eveningphone': {
							required: validationExtras.msg.eveningTelephone.required
						},
						'mobilephone': {
							required: validationExtras.msg.mobile.required
						}
					},
					errorPlacement: function(error, element) {
						switch (element.attr("name")) {
							case "postal-code-pca":
								if (breakpoint.mobile) {
									error.insertBefore(element.parents('form').find('div.pca-container'));
								} else {
									if (myAccount.isLegacyAddressPage) {
										error.insertBefore(element.closest('.field-wrapper'));
									} else {
										error.insertBefore(validationExtras.errorPlacementElement(element));
									}
								}
								break;
							case "companyname":
                            case "flatnumber":
                            case "buildingname":
								error.insertBefore(element.parents('form').find("input[name='companyname']"));
								break;
							default:
								if (breakpoint.mobile) {
									error.insertBefore(element);
								} else {
									if (myAccount.isLegacyAddressPage) {
										error.insertBefore(element.closest('.field-wrapper'));
									} else {
										error.insertBefore(validationExtras.errorPlacementElement(element));
									}
								}
								break;
						}
					},
					submitHandler: function(form) {
						/* ** EPIC : 2571 : Start ** */
						var $container = $(myAccount.containerSelector),
							fieldLength = mapFields.length,
							fieldValue = '',
						    	fieldNameHdn = '';
						for (var m=0; m<fieldLength; m++) {
							if(mapFields[m] == 'city') {
								fieldValue = $container.find('[id=locality-city]').html();
								var cityAndLocality = fieldValue.split('<br>');
								var templocality = '', tempCity = '';
								if (cityAndLocality.length > 1 ) {
								 templocality = cityAndLocality[0];
								 tempCity = cityAndLocality[1];
								} else {
								  tempCity = fieldValue;
								}
								fieldNameHdn = mapFields[m].replace(/-/g,"");
								$container.find("#form-values-locality").val(templocality);
								$container.find("#form-values-city").val(tempCity);
							} else {
								fieldValue = $container.find('[name='+mapFields[m]+']').val();
								fieldNameHdn = mapFields[m].replace(/-/g,"");
								$container.find("#form-values-"+fieldNameHdn).val(fieldValue);
							}

						}
						/* ** EPIC : 2571 : End ** */
						myAccount.save( $(form), $target );
					}
				});

				// apply focus fix for android devices
				validationExtras.focusoutFix( $(this) );

				// set up max character limits
				validationExtras.limitCharacters( $(myAccount.containerSelector).find('[name=postal-code-pca]'), 8 );
				validationExtras.limitCharacters( $(myAccount.containerSelector).find('[name=nick-names]'), 20 );
				validationExtras.limitCharacters( $(myAccount.containerSelector).find('[name=companyname]'), 60 );
				validationExtras.limitCharacters( $(myAccount.containerSelector).find('[name=flatnumber]'), 30 );
				validationExtras.limitCharacters( $(myAccount.containerSelector).find('[name=buildingname]'), 55 );
				validationExtras.limitCharacters( $(myAccount.containerSelector).find('[name=street]'), 70 );

				// check if the save should be enabled
				self.enableSave($(this));

				// If edit page, valididate the form fields
				if (myAccount.isEditPage) {
					$(myAccount.containerSelector).find('input:text').each(function(i) {
						if ($(this).val() !== '') {
							$(this).valid();
						}
					});
					self.enableSave(self.$form);
				}

			}
		},

		expandCollapseMyAccountNav: function () {
            $('.my-account .secondary-content, .my-account #secondary-content, #my-account-landing-nav').off().on('click', '.toggle-expand-collapse', function () {
                $(this).toggleClass('is-expanded');
                $(this).siblings('.expand-collapse-content').toggleClass('is-expanded');
            });
        },

        unbindExpandCollapseMyAccountNav: function () {
            $('.my-account .secondary-content, .my-account #secondary-content, #my-account-landing-nav').off('click', '.toggle-expand-collapse');
        },

		init: function (){

			var self = myAccount,
				myAccountElm = $('#wrapper.add-pca-address').length > 0 ?
						$('#wrapper.add-pca-address') :
						$('div.my-account-form-pca'),
				sLegacyPcaContainer = '.delivery-details',
				$legacyPcaContainer = $(sLegacyPcaContainer);

			if ($legacyPcaContainer.length > 0) {
				self.isLegacyAddressPage = true;
			}

			if (myAccountElm.hasClass('my-account-edit')) {

				self.isEditPage = true;
			}

			self.setup();

			// el: order history button
			self.orderHistoryButton = $(self.orderHistoryButton);

			// el: dropdown button
			self.dropdownButton = $(self.dropdownButton);


			// mobile - scroll to payment summary at bottom of page
			$('#order-header-actions .payment-summary-link').on('tap click', function(e){
				e.preventDefault();
				e.stopPropagation();
				navigation.jumpTo( $('#payment-summary').offset().top );

				$(self.orderDetailsNav).removeClass('expand').addClass('collapse');
				$(self.dropdownButton).children('span.icon').attr('data-icon', '2');
				return false;
			});

			// scroll to top
			$('#page-container .order-details-top a').on('tap click', function(e){
				e.preventDefault();
				e.stopPropagation();
				navigation.jumpTo( $('#wrapper').offset().top );
				return false;
			});

			self.bindEvents();

			stickySidebar.init({
				$wrapper   : $('#order-details'),
				$primary   : $('#order-summary'),
				$secondary : $('#payment-summary')
			});


			breakpoint.mobileIn.push(self.closeOrderHistoryAccordion);
			breakpoint.hTabletIn.push(self.closeOrderHistoryAccordion);
			breakpoint.vTabletIn.push(self.closeOrderHistoryAccordion);

			if (myAccountElm.length) {

				if (self.isLegacyAddressPage) {
					self.initialisePCAField($legacyPcaContainer);
				} else {
					self.initialisePCAField($('.my-account-form-pca'));
					self.setEnableBfpo();

					if (self.enableBfpo) {
						bfpo.bindToggle($('.my-account-form-pca'));
					}
				}

				var pca = new PCA_EditableAddress( self, myAccountElm, false );
				// For the edit page, set PCA Address Selected to true
				if (self.isEditPage) {
					self.pcaAddressSelected = true;
				}
			}

			myAccountElm.on('click', '.form-container .cancel', function(e) {
				e.preventDefault();
				self.manualAddressSignUpSlideUp();
			});

			myAccountElm.on('tap click', '.cancel', function(e){
				//alert('Back to previous page');
				e.preventDefault();
			});

			// If the add address button hasn't been clicked, return
			// This is to fix the save button being enabled if a valid postcode format has been entered
			myAccountElm.on('click', '.save', function(e) {
				if (!self.pcaAddressSelected && !self.typingStarted) {
					e.preventDefault();
				}
			});

			//myAccountElm.on('focus', 'input[name="postal-code-pca"]', self.clearPCAField );
			self.validation.init( myAccountElm );

            breakpoint.mobileIn.push(self.expandCollapseMyAccountNav);
            breakpoint.vTabletIn.push(self.expandCollapseMyAccountNav);
            breakpoint.hTabletIn.push(self.expandCollapseMyAccountNav);
            breakpoint.desktopIn.push(self.unbindExpandCollapseMyAccountNav);
            breakpoint.largeDesktopIn.push(self.unbindExpandCollapseMyAccountNav);
		},

		initialisePCAField: function($container) {

			var el,
				prePopulatedPostcode = '',
				pca,
				postCodeWrapper = null;

			// Remove all instances of post code lookup as we generate on the fly
			$('.pcaCapturePlusTable, div#ed59pz86tg22kf685176, input.postal-code-pca, button.edit-address-button').remove();
			$container.find('.pca-container').append('<input id="postal-code-pca" class="form-textinput required postal-code-pca" type="text" title="Enter a postcode" name="postal-code-pca" maxlength="8"><div id="ed59pz86tg22kf685176"></div>');

			el = $('input[name="postal-code-pca"]');
			el.data('isAddressSelected', false);

			// Global function defined in PCA library
			loadCapturePlus();

			// Pre-pop post code with a value
			postCodeWrapper = $container.find('.field-wrapper.post-code');
			if (postCodeWrapper !== null) {
				prePopulatedPostcode = postCodeWrapper.data('pre-pop-postcode');
				postCodeWrapper.find('input[name="postal-code-pca"]').val(prePopulatedPostcode);
			}

			$('.pcaCapturePlusTable').after('<button class="primary-button disabled edit-address-button edit-add-button ">Edit</button>');

		},

		setEnableBfpo: function setEnableBfpo() {
			myAccount.enableBfpo = true;
		}
	};

	return myAccount;

});
