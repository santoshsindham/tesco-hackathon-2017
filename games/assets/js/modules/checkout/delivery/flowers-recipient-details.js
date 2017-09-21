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
	'modules/checkout/payment',
	'modules/validation',
	'modules/editable-addresses/common',
	'modules/checkout/resetForm',
	'./courier',
	'./new-address'
], function($, common, breakpoint, loader, dropdown, refreshAll, utils, data, payment, validationExtras, PCA_EditableAddress, resetForm, courier, newAddress) {

	var updatePostCodePlaceholder;
	var flowersRecipientDetails = {
			group: null,
            editButtonClicked: false,
            editButtonEnabled: false,
            containerSelector: '.flowers-recipient',
            pcaAddressSelected: false,

            enableSave: function (myForm) {
                var self = flowersRecipientDetails.validation;
                myForm = $(myForm);
                if (myForm) {
                    validationExtras.enableSave(
                        myForm.find('[name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]'), /* ** EPIC 2571 : Changes ** */
                        myForm.find('input.add-recipient')
                    );
                } else {
                    validationExtras.enableSave(
                        self.$form.find('[name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]'), /* ** EPIC 2571 : Changes ** */
                        self.$form.find('input.add-recipient')
                    );
                }

            },
            recipientType: function(e){

	        	var tabs = $(e.target).closest('.address-tabs');
				tabs.find('.selected').removeClass('selected');
				var $elem = $(e.target).closest('li');
				$elem.addClass('selected');

	        	var $form = utils.getFormByElement($elem);
	        	var request = 'selectRecipientFlowers';
				var url = $elem.attr('data-url');
				var DL = new data.DataLayer({singleton:true});
				var myData = $form.serialize()
				DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(data) {
					 flowersRecipientDetails.update(data);
					 var $elem = $( '.flowers-pick-date .datepicker-cta'),
						$newRecipientFormOpen = $('.edit-new-recipient'),
						$savedAddressFormOpen = $('.edit-saved-address');
					 if($newRecipientFormOpen.is(':visible')){
						  if ($('.edit-da-block.new-address').length) {
							$('.edit-da-block.new-address').each(function () {
								if ($(this).is(':visible')) {
									$(this).find('.cancel').trigger('click');
									 $(this).find('table.pcaCapturePlusTable, div#ed59pz86tg22kf685176, input.postal-code-pca, button.edit-address-button, .manually-add-address').remove();
								}
							});
						}
					 }
					 flowersRecipientDetails.initialisePCAField($('.collection-details.flowers-recipient'));
					 if($newRecipientFormOpen.is(':visible') || $savedAddressFormOpen.is(':visible')){
						if(!$elem.hasClass('disabled')){
							$elem.addClass('disabled');
						}
						$('.flowers-pick-date').find('.flowers-pick-date-error').hide();
					 }
				});
	        },
	        cancelRecipient: function () {
	        	flowersRecipientDetails.manualAddressSignUpSlideUp();
                if($('.edit-new-recipient').length){
                	el = $('.edit-new-recipient').find('.manually-add-address');
                	$elem = $('.edit-new-recipient').eq(0).find('form');
                	$elem.find('[name=honorific-prefix], [name=recipient-fname], [name=recipient-lname], [name=tel], [name=tel-alt], [name=nick-names], [id=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]').removeClass('valid').val('');
                }
                else {
                	el = $('.edit-saved-address').find('.manually-add-address');
                	$elem = $('.edit-saved-address').eq(0).find('form');
                	$elem.find('[name=save-honorific-prefix], [name=save-recipient-fname], [name=save-recipient-lname], [name=tel], [name=tel-alt]').removeClass('valid').val('');
                }
                $elem.validate().resetForm();
                var $form = $('.flowers-recipient').find('form');
				resetForm.init($form);
            },
						recipientAddress: function(e) {
							var tabs = $(e.target).closest('.address-tabs'),
								$elem = $(e.target).closest('li');

							tabs.find('.selected').removeClass('selected');
							$elem.addClass('selected');
							tabs.find('.checked').removeClass('checked');
							$elem.find('.custom-radio').addClass('checked');
							tabs.find('input[type=radio]').prop('checked', false);
							$elem.find('input[type=radio]').prop('checked', true);

							if($elem.hasClass('add-new selected')) {
								$('.new-flower-address').addClass('open');
								$('.new-flower-address').show();
								$('.saved-flower-address').removeClass('open');
								if ($('.edit-da-block.new-address').length) {
									$('.edit-da-block.new-address').each(function () {
										if ($(this).is(':visible')) {
											$(this).find('.cancel').trigger('click');
											 $(this).find('table.pcaCapturePlusTable, div#ed59pz86tg22kf685176, input.postal-code-pca, button.edit-address-button, .manually-add-address').remove();
										}
									});
								}
								flowersRecipientDetails.initialisePCAField($('.collection-details.flowers-recipient'));
							} else {
								$('.new-flower-address').removeClass('open');
								$('.new-flower-address').hide();
								$('.saved-flower-address').addClass('open');
								$('.editNewFlowersRecipientInfo .address-link').hide();
								flowersRecipientDetails.clearPCAField();
								flowersRecipientDetails.removeHTMLFromDom();
							}
						},
			validation: function ($group, $mobileTarget) {

	            $('.edit-new-recipient form', $group).each(function () {
	                var self = this;

	                var $save = $(self).find('input[type=submit]');
	                var $mobile = $(self).find('[name=tel]');
	                var $alternate = $(self).find('[name=tel-alt]');
	                var $checkbox = $(self).find('.dg-d-da-nonumber');
	                var mapFields = ['postal-code-pca', 'companyname', 'flatnumber', 'buildingname', 'street', 'locality', 'city'];
	                var $toCompare = [];
	                	$toCompare = $('.collection-details.flowers-recipient').find('#address-nickname-1');


	                $(flowersRecipientDetails.containerSelector).find('input[name="postal-code-pca"]').data('isAddressSelected', false);

	                var getFields = function () {
	                    var $fields = $(self).find('[name=honorific-prefix], [name=recipient-fname], [name=recipient-lname], [name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]');

	                    if ($checkbox.is(':checked')) {
	                        $fields = $fields.add($alternate);
	                    } else {
	                        $fields = $fields.add($mobile);
	                    }

	                    return $fields;
	                };

	                // add the custom validation methods to the validation library before form validation setup
	                validationExtras.customMethods.nameCheck();
	                validationExtras.customMethods.telephone();
	                validationExtras.customMethods.mobile();

	                $(self).validate({
	                    onkeyup: function (elm) {
	                        if (this.check(elm)) {
	                            $(elm).addClass('valid');
	                        } else {
	                            $(elm).removeClass('valid');
	                        }
	                        validationExtras.enableSave(getFields(), $save);
	                    },
	                    focusInvalid: false,
	                    onfocusout: function (elm) {
	                        this.element(elm);
	                        validationExtras.enableSave(getFields(), $save);
	                    },
	                    errorPlacement: function (error, element) {
	                    	switch (element.attr("name")) {
                            case "postal-code-pca":
                                error.insertBefore(element.parents('form').find(".pcaCapturePlusTable"));
                                break;
                            case "companyname":
                            case "flatnumber":
                            case "buildingname":
                                error.insertBefore(element.parents('form').find("input[name='companyname']")); /* ** EPIC : 2571 : Changes ** */
                                break;
                            default:
                            	error.insertAfter(validationExtras.errorPlacementElement(element));
                            }
	                    },
	                    errorElement: 'span',
	                    groups: {
                            editableAddressesError: "companyname flatnumber buildingname"
                        },
	                    rules: {
	                        'honorific-prefix': {
	                            required: true
	                        },
	                        'recipient-fname': {
	                            required: true,
	                            nameCheck: {
	                                isLastname: false
	                            }
	                        },
	                        'recipient-lname': {
	                            required: true,
	                            nameCheck: {
	                                isLastname: true
	                            }
	                        },
	                        // mobile phone number only required if the checkbox IS NOT selected
	                        'tel': {
	                            required: function () {
	                                return !$checkbox.is(':checked');
	                            },
	                            mobile: function () {
	                                return !$checkbox.is(':checked');
	                            }
	                        },

	                        // alternate phone number only required if the checkbox IS selwected
	                        'tel-alt': {
	                            required: function () {
	                                return $checkbox.is(':checked');
	                            },
	                            telephone: function () {
	                                return $checkbox.is(':checked');
	                            }
	                        },
	                        'nick-names': {
	                        	required: true,
	                        	isUnique: {
	                        		fieldToCompare: $toCompare
	                        	}
	                        },
	                        'postal-code-pca': {
                                required: true
                            },
                            'companyname': {
                                checkEditableAddresses: true
                            },
                            'flatnumber': {
                                checkEditableAddresses: true
                            },
                            'buildingname': {
                                checkEditableAddresses: true
                            }
	                    },
	                    messages: {
	                        'honorific-prefix': {
	                            required: validationExtras.msg.title.required
	                        },
	                        'recipient-fname': {
	                            required: validationExtras.msg.firstname.required,
	                            nameCheck: validationExtras.msg.firstname.inValid
	                        },
	                        'recipient-lname': {
	                            required: validationExtras.msg.lastname.required,
	                            nameCheck: validationExtras.msg.lastname.inValid
	                        },
	                        'tel': {
	                            required: validationExtras.msg.mobile.required,
	                            mobile: validationExtras.msg.mobile.inValid
	                        },
	                        'tel-alt': {
	                            required: validationExtras.msg.alternateTelephone.required,
	                            telephone: validationExtras.msg.alternateTelephone.inValid
	                        },
	                        'nick-names': {
	                            required: validationExtras.msg.addressNickname.required,
	                            isUnique: validationExtras.msg.isUnique.inValid
	                        },
	                        'postal-code-pca': {
                                required: validationExtras.msg.postcode.required
                            }
	                    },
	                    submitHandler: function (form) {
	                    	   var $container = $(flowersRecipientDetails.containerSelector),
	                               fieldLength = mapFields.length,
	                               fieldValue = '',
                     		       fieldNameHdn = '';
	                           for (var m = 0; m < fieldLength; m++) {
	                               fieldValue = $container.find('[name=' + mapFields[m] + ']').val();
	                               fieldNameHdn = mapFields[m].replace(/-/g, "");
	                               $container.find("#form-values-" + fieldNameHdn).val(fieldValue);
	                           }
	                    	flowersRecipientDetails.save($(form), $mobileTarget);
	                    }
	                });

	                // apply focus fix for android devices
	                validationExtras.focusoutFix($(self));
	                validationExtras.selectChangeFix($(self), getFields(), $save);

	                // set up max character limits
	                validationExtras.limitCharacters($(self).find('[name=recipient-fname]'), 25);
	                validationExtras.limitCharacters($(self).find('[name=recipient-lname]'), 20);
	                validationExtras.limitCharacters($(self).find('[name=tel], [name=tel-alt]'), 11);
	                validationExtras.limitCharacters($(this).find('[name=nick-names]'), 20);

	              if ($(self).find('[name=tel]').val().length > 0 && $checkbox.prop('checked')) {
	                    $checkbox.click();
	                }

	                // check if the save should be enabled
	                validationExtras.enableSave(getFields(), $save);
	            });

							$('.editNewFlowersRecipientInfo form', $group).each(function () {
	                var self = this;

	                var $save = $(self).find('input[type=submit]'),
										$addNewRadio = $(self).find('.add-new-radio'),
										$savedAddRadio = $(self).find('.saved-add-radio'),
										$addNewFields = $(self).find('[name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]'),
										$savedAddDropdown = $(self).find('#address-nickname-1'),
	                	mapFields = ['postal-code-pca', 'companyname', 'flatnumber', 'buildingname', 'street', 'locality', 'city'],
	                	$toCompare = [];

									$toCompare = $('.collection-details.flowers-recipient').find('#address-nickname-1');


	                $(flowersRecipientDetails.containerSelector).find('input[name="postal-code-pca"]').data('isAddressSelected', false);

	                var getFields = function () {
	                    var $fields = $(self).find('[name=honorific-prefix], [name=recipient-fname], [name=recipient-lname], [name=contact-no]');

	                    if ($addNewRadio.is(':checked')) {
	                        $fields = $fields.add($addNewFields);
	                    } else if ($savedAddRadio.is(':checked')) {
	                        $fields = $fields.add($savedAddDropdown);
	                    }

	                    return $fields;
	                };

	                // add the custom validation methods to the validation library before form validation setup
	                validationExtras.customMethods.nameCheck();
	                validationExtras.customMethods.phone();

	                $(self).validate({
	                    onkeyup: function (elm) {
	                        if (this.check(elm)) {
	                            $(elm).addClass('valid');
	                        } else {
	                            $(elm).removeClass('valid');
	                        }
	                        validationExtras.enableSave(getFields(), $save);
	                    },
	                    focusInvalid: false,
	                    onfocusout: function (elm) {
	                        this.element(elm);
	                        validationExtras.enableSave(getFields(), $save);
	                    },
	                    errorPlacement: function (error, element) {
	                    	switch (element.attr("name")) {
                            case "postal-code-pca":
                                error.insertBefore(element.parents('form').find(".pcaCapturePlusTable"));
                                break;
                            case "companyname":
                            case "flatnumber":
                            case "buildingname":
                                error.insertBefore(element.parents('form').find("input[name='companyname']"));
                                break;
                            default:
                            	error.insertAfter(validationExtras.errorPlacementElement(element));
                            }
	                    },
	                    errorElement: 'span',
	                    groups: {
                            editableAddressesError: "companyname flatnumber buildingname"
                        },
	                    rules: {
	                        'honorific-prefix': {
	                            required: true
	                        },
	                        'recipient-fname': {
	                            required: true,
	                            nameCheck: {
	                                isLastname: false
	                            }
	                        },
	                        'recipient-lname': {
	                            required: true,
	                            nameCheck: {
	                                isLastname: true
	                            }
	                        },
	                        'contact-no': {
	                            required: true,
															phone: true
	                        },

	                        // if add new recipient radio button is selected
	                        'nick-names': {
														required: function () {
																return $addNewRadio.is(':checked');
														},
	                        	isUnique: {
	                        		fieldToCompare: $toCompare
	                        	}
	                        },
	                        'postal-code-pca': {
															required: function () {
																	return $addNewRadio.is(':checked');
															}
                            },
                            'companyname': {
                                checkEditableAddresses: function () {
																	return $addNewRadio.is(':checked');
																}
                            },
                            'flatnumber': {
                                checkEditableAddresses: function () {
																	return $addNewRadio.is(':checked');
																}
                            },
                            'buildingname': {
                                checkEditableAddresses: function () {
																	return $addNewRadio.is(':checked');
																}
                            }
	                    },
	                    messages: {
	                        'honorific-prefix': {
	                            required: validationExtras.msg.title.required
	                        },
	                        'recipient-fname': {
	                            required: validationExtras.msg.firstname.required,
	                            nameCheck: validationExtras.msg.firstname.inValid
	                        },
	                        'recipient-lname': {
	                            required: validationExtras.msg.lastname.required,
	                            nameCheck: validationExtras.msg.lastname.inValid
	                        },
	                        'contact-no': {
	                            required: validationExtras.msg.phone.required,
	                            phone: validationExtras.msg.phone.inValid
	                        },
	                        'nick-names': {
	                            required: validationExtras.msg.addressNickname.required,
	                            isUnique: validationExtras.msg.isUnique.inValid
	                        },
	                        'postal-code-pca': {
                                required: validationExtras.msg.postcode.required
                          },
													'address-nickname-1': {
														required: "Please select the address from the list"
													}
	                    },
	                    submitHandler: function (form) {
	                    	   var $container = $(flowersRecipientDetails.containerSelector),
	                               fieldLength = mapFields.length,
	                               fieldValue = '',
                     		       fieldNameHdn = '';
	                           for (var m = 0; m < fieldLength; m++) {
	                               fieldValue = $container.find('[name=' + mapFields[m] + ']').val();
	                               fieldNameHdn = mapFields[m].replace(/-/g, "");
	                               $container.find("#form-values-" + fieldNameHdn).val(fieldValue);
	                           }
	                    	flowersRecipientDetails.saveRecipientDetails($(form), $mobileTarget);
	                    }
	                });

	                // apply focus fix for android devices
	                validationExtras.focusoutFix($(self));
	                validationExtras.selectChangeFix($(self), getFields(), $save);

	                // set up max character limits
	                validationExtras.limitCharacters($(self).find('[name=recipient-fname]'), 25);
	                validationExtras.limitCharacters($(self).find('[name=recipient-lname]'), 20);
	                validationExtras.limitCharacters($(self).find('[name=contact-no]'), 11);
	                validationExtras.limitCharacters($(this).find('[name=nick-names]'), 20);

	              /*if ($(self).find('[name=nicknames], [name=postal-code-pca]').val().length > 0 && $addNewRadio.prop('checked')) {
	                    $addNewRadio.click();
	              }
								if ($(self).find('[name=address-nickname-1]').val().length > 0 && $savedAddRadio.prop('checked')) {
	                    $savedAddRadio.click();
	              } */

	                // check if the save should be enabled
	                validationExtras.enableSave(getFields(), $save);
	            });

	            $('.edit-saved-address form', $group).each(function () {
	                var self = this;

	                var $save = $(self).find('input[type=submit]');
	                var $mobile = $(self).find('[name=tel]');
	                var $alternate = $(self).find('[name=tel-alt]');
	                var $checkbox = $(self).find('.dg-d-da-nonumber');

	                var getFields = function () {
	                    var $fields = $(self).find('[name=save-honorific-prefix], [name=save-recipient-fname], [name=save-recipient-lname]');

	                    if ($checkbox.is(':checked')) {
	                        $fields = $fields.add($alternate);
	                    } else {
	                        $fields = $fields.add($mobile);
	                    }

	                    return $fields;
	                };

	                // add the custom validation methods to the validation library before form validation setup
	                validationExtras.customMethods.nameCheck();
	                validationExtras.customMethods.telephone();
	                validationExtras.customMethods.mobile();

	                $(self).validate({
	                    onkeyup: function (elm) {
	                        if (this.check(elm)) {
	                            $(elm).addClass('valid');
	                        } else {
	                            $(elm).removeClass('valid');
	                        }
	                        validationExtras.enableSave(getFields(), $save);
	                    },
	                    focusInvalid: false,
	                    onfocusout: function (elm) {
	                        this.element(elm);
	                        validationExtras.enableSave(getFields(), $save);
	                    },
	                    errorPlacement: function (error, element) {
	                    	error.insertAfter(validationExtras.errorPlacementElement(element));
	                    },
	                    errorElement: 'span',
	                    rules: {
	                        'save-honorific-prefix': {
	                            required: true
	                        },
	                        'save-recipient-fname': {
	                            required: true,
	                            nameCheck: {
	                                isLastname: false
	                            }
	                        },
	                        'save-recipient-lname': {
	                            required: true,
	                            nameCheck: {
	                                isLastname: true
	                            }
	                        },
	                        // mobile phone number only required if the checkbox IS NOT selected
	                        'tel': {
	                            required: function () {
	                                return !$checkbox.is(':checked');
	                            },
	                            mobile: function () {
	                                return !$checkbox.is(':checked');
	                            }
	                        },

	                        // alternate phone number only required if the checkbox IS selwected
	                        'tel-alt': {
	                            required: function () {
	                                return $checkbox.is(':checked');
	                            },
	                            telephone: function () {
	                                return $checkbox.is(':checked');
	                            }
	                        }
	                    },
	                    messages: {
	                        'save-honorific-prefix': {
	                            required: validationExtras.msg.title.required
	                        },
	                        'save-recipient-fname': {
	                            required: validationExtras.msg.firstname.required,
	                            nameCheck: validationExtras.msg.firstname.inValid
	                        },
	                        'save-recipient-lname': {
	                            required: validationExtras.msg.lastname.required,
	                            nameCheck: validationExtras.msg.lastname.inValid
	                        },
	                        'tel': {
	                            required: validationExtras.msg.mobile.required,
	                            mobile: validationExtras.msg.mobile.inValid
	                        },
	                        'tel-alt': {
	                            required: validationExtras.msg.alternateTelephone.required,
	                            telephone: validationExtras.msg.alternateTelephone.inValid
	                        }
	                    },
	                    submitHandler: function (form) {
	                    	flowersRecipientDetails.save($(form), $mobileTarget);
	                    }
	                });

	                // apply focus fix for android devices
	                validationExtras.focusoutFix($(self));
	                validationExtras.selectChangeFix($(self), getFields(), $save);

	                // set up max character limits
	                validationExtras.limitCharacters($(self).find('[name=save-recipient-fname]'), 25);
	                validationExtras.limitCharacters($(self).find('[name=save-recipient-lname]'), 20);
	                validationExtras.limitCharacters($(self).find('[name=tel], [name=tel-alt]'), 11);

	              if ($(self).find('[name=tel]').val().length > 0 && $checkbox.prop('checked')) {
	                    $checkbox.click();
	                }

	                // check if the save should be enabled
	                validationExtras.enableSave(getFields(), $save);
	            });
	        },
	        noMobileNumberToggle: function (e) {
	        	var $target = $(e.target).closest('.edit-new-recipient');
				if($target.hasClass('edit-new-recipient')){
					$target = $(e.target).closest('.edit-new-recipient');
				} else {
					$target = $(e.target).closest('.edit-saved-address');
				}
	            var $altBlock = $target.find('.tel-alt-block');
	            var $save = $target.find('input[type=submit]');
	            var $mobile = $target.find('[name=tel]');
	            var $alternate = $target.find('[name=tel-alt]');
	            var $checkbox = $target.find('.dg-d-da-nonumber');

	            var $enable, $disable;

	            if (!$checkbox.is(':checked')) {
	                $enable = $mobile;
	                $disable = $alternate;

	                if (common.isTouch()) {
	                    $altBlock.removeClass('open').hide();
	                } else {
	                    $altBlock.removeClass('open').slideUp();
	                }
	            } else {
	                $enable = $alternate;
	                $disable = $mobile;

	                if (common.isTouch()) {
	                    $altBlock.addClass('open').show();
	                } else {
	                    $altBlock.addClass('open').slideDown();
	                }
	            }

	            $enable
	                .prop('disabled', false)
	                .addClass('required')
	                .removeClass('valid');

	            $disable
	                .prop('disabled', true)
	                .removeClass('required')
	                .removeClass('valid')
	                .removeClass('error')
	                .next('.error').remove();

	            if ($disable[0] === $alternate[0]) {
	                //$disable.val('');
	            }

	        },
	        save: function ($target, $mobileTarget) {

	            var $form = $target;
	            $target = $target.closest('.flowersNewRecipient').find('.new-recipient');

	            var myDeliveryGroup = utils.getDeliveryGroup($form);
	            var request = 'saveNewRecipient';
	            var url = utils.getFormAction($form);
	            var $elem = $form;
	            var DL = new data.DataLayer();
	            var myData = $form.serialize();
	            DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (data) {
	            	flowersRecipientDetails.update(data);
	            	$('.new-recipient').find('.loader').remove();
	            	$('.datepicker-tooltip-module').find('.loader').remove();
								$('body, html').animate({
									scrollTop: $('.flowers-module').offset().top
								});
					var responseTxt = $.parseJSON(data.responseText);
					var datapickerObj = responseTxt.flowersDeliverySlotSelection;
					$('.flowers-pick-date .datepicker-tooltip-module').html(datapickerObj);
					common.customRadio($('.flowers-pick-date'));

	            	 if(($('.edit-new-recipient').show()).length > 0) {
	                     $('.edit-new-recipient').hide();
	                     $('.added-new-recipient').show();
	                     $('.flowers-pick-date').find('.datepicker-cta').removeClass('disabled');
	                     $('.flowers-pick-date').find('.flowers-pick-date-error').hide();
	                 } else {
	                     $('.saved-address').show();
	                     $('.edit-saved-address').hide();
	                     $('.flowers-pick-date').find('.flowers-pick-date-error').hide();
	                     $('.recipient-address-div').removeClass('disable-flowers-address');
	                     $('.flowers-pick-date').find('.datepicker-cta').addClass('disabled');
	                 }
	            });

	        },
					saveRecipientDetails: function ($target, $mobileTarget) {
	            var $form = $target;
	            $target = $target.closest('.flowers-recipient').find('.editNewFlowersRecipientInfo');

	            var myDeliveryGroup = utils.getDeliveryGroup($form);
	            var request = 'saveFlowersRecipient';
	            var url = utils.getFormAction($form);
	            var $elem = $form;
	            var DL = new data.DataLayer();
	            var myData = $form.serialize();
	            DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (data) {
								var responseTxt = $.parseJSON(data.responseText),
									datapickerObj = responseTxt.flowersDeliverySlotSelection;
	            	flowersRecipientDetails.update(data);
	            	$('.flowers-new-recipient').find('.loader').remove();
	            	$('.datepicker-tooltip-module').find('.loader').remove();
								$('.flowers-pick-date .datepicker-tooltip-module').html(datapickerObj);
								$( '.flowers-pick-date .datepicker-cta').removeClass('disabled');
								$('body, html').animate({
									scrollTop: $('.flowers-module').offset().top
								});
	            });
	        },
	        update: function (result, open) {
	        	$('.flowers-recipient select').each(function(){
					dropdown.init( $(this) );
	        	});

	            common.customCheckBox.init($('.flowers-module'));

	            flowersRecipientDetails.validation($('.flowers-module'));
	            common.customRadio($('.flowers-module'));

	        },
	        changeDetails: function(e, $parent, $editParent){
            	var target = $(e).find('.collection-details');

    			if (e.type) {
    				e.preventDefault();
    				e.stopPropagation();

    				target = $(e.target);
    			}

    			var form = target.closest('.flowers-recipient').find($editParent);

    			if (form.hasClass('open')) {
    				target.closest('.collection-details').find($parent).show();
    				form.removeClass('open').slideUp();
    			} else {
    				target.closest('.collection-details').find($parent).hide();
    				form.addClass('open').slideDown();
    				if(target.hasClass('change-address')){
    					$('body, html').animate({
    						scrollTop: $('.new-flower-address').offset().top
    					});
    				}

    				common.customCheckBox.init(target.closest('.collection-details'));
    				dropdown.updateSelectDimension( form.find('.customDropdown') );
    				flowersRecipientDetails.initialisePCAField(target.closest('.collection-details'));
    			}
            },
            changeFlowersAddress: function($elem) {

    			var request = 'saveNewRecipient';
    	        var $form = utils.getFormByElement($elem);
    	        var url = utils.getFormAction($form);
    	        var DL = new data.DataLayer();
    	        var myData = $form.serialize();
    	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(result) {
    	        	$('.new-recipient').find('.loader').remove();
    				dropdown.init($('.new-recipient').find('select'));
    				common.customCheckBox.init($('.collection-details'));

    				$('.edit-saved-address').hide();
    		        $('.saved-address').show();
    		        $('.recipient-address-div').removeClass('disable-flowers-address');
    		        $('.flowers-pick-date .datepicker-tooltip-module').find('.loader').remove();

    		        var responseTxt = $.parseJSON(result.responseText);
					var datapickerObj = responseTxt.flowersDeliverySlotSelection;
					$('.flowers-pick-date .datepicker-tooltip-module').html(datapickerObj);
					common.customRadio($('.flowers-pick-date'));

    				var noOptionStr = $('.recipient-address-div').find('.customDropdown a span.innerText').text();
	                if (noOptionStr != 'Select a saved address') {
	                	$( '.flowers-pick-date .datepicker-cta').removeClass('disabled');
	                	$('.flowers-pick-date').find('.flowers-pick-date-error').hide();
	                }
    	        });

    		},
	        pickDateValidation: function(){
	        	var $elem = $( '.flowers-pick-date .datepicker-cta'),
					$newRecipientFormOpen = $('.edit-new-recipient'),
					$newRecipientAddress = $('.new-flower-address'),
					$savedAddressFormOpen = $('.edit-saved-address'),
					$savedAddressCollapse = $('.saved-address'),
					$savedAddressDropdown = $('.recipient-address-div'),
					$pickDateError = $('.flowers-pick-date').find('.flowers-pick-date-error'),
					$newFlowersRecipientForm = $('.flowers-new-recipient');

	        	var chkSelected = function () {
	        		var noOptionStr = $('.recipient-address-div').find('.customDropdown a span.innerText').text();
	                if (noOptionStr == 'Select a saved address') {
	                	$('.flowers-pick-date .datepicker-tooltip-module').find('.datepicker-tooltip').removeClass('visible').hide();
	                	if(!$elem.hasClass('disabled')){
							$elem.addClass('disabled');
						}
	                }
	            };

				if($elem.hasClass('disabled')){

					switch (true) {
						case ($newRecipientFormOpen.is(':visible')):
							var $save = $newRecipientFormOpen.find('input[type=submit]');
							$save.trigger('click');
							if(!$newRecipientAddress.hasClass('open')){
								$('.flowers-new-address-error').show();
							}
							break;
						case ($savedAddressFormOpen.is(':visible')):
							var $save = $savedAddressFormOpen.find('input[type=submit]');
							$save.trigger('click');
							break;
						case ($savedAddressCollapse.is(':visible')):
							chkSelected();
							break;
						case ($newFlowersRecipientForm.is(':visible')):
							var $save = $newFlowersRecipientForm.find('input[type=submit]');
							$save.trigger('click');
							break;
					}
					$pickDateError.show();

				}

	        },
	        initialisePCAField: function ($container) {

                var el,
                    pca,
                    fieldLimits = {
                        companyName: 60,
                        flatNumber: 30,
                        buildingName: 55,
                        primaryStreet: 70
                    };
                if ($("#postal-code-pca").length === 0) {
                    $container.find('div.post-code').append('<input id="postal-code-pca" class="input postal-code-pca required highlight" type="text" title="Enter a postcode" placeholder="Enter a postcode" name="postal-code-pca" maxlength="8"><div id="ed59pz86tg22kf685176"></div>');
                }
                el = $container.find('input[name="postal-code-pca"]');
                el.data('isAddressSelected', false);

                // Global function defined in PCA library
                loadCapturePlus();
                if ($(".edit-address-button").length === 0) {
                    $container.find('.pcaCapturePlusTable').after('<button class="primary-button disabled edit-address-button">Edit</button>');
                }
								if ($(".manually-add-address").length === 0) {
                	$container.find('.post-code').after('<div class="manually-add-address"><div class="field-wrapper"><label for="nv-Company">Company name</label><input id="nv-Company" title="Please complete one of the following three fields" placeholder="Company name" name="companyname" value="" type="text" class="highlight" maxlength="' + fieldLimits.companyName + '"></div><div class="field-wrapper"><label for="nv-FlatNumber">Flat / unit number</label><input id="nv-FlatNumber" title="Please complete one of the following three fields" placeholder="Flat / unit number" name="flatnumber" value="" type="text" class="highlight" maxlength="' + fieldLimits.flatNumber + '"></div><div class="field-wrapper"><label for="nv-BuildingName">Building number / name</label><input id="nv-BuildingName" title="Please complete one of the following three fields" placeholder="Building number / name" name="buildingname" value="" type="text" class="highlight" maxlength="' + fieldLimits.buildingName + '"></div><div class="field-wrapper"><label for="nv-PrimaryStreet">Street</label><input id="nv-PrimaryStreet" title="Street" placeholder="Street" name="street" value="" type="text" maxlength="' + fieldLimits.primaryStreet + '"></div><div class="field-wrapper"><input id="nv-Locality" title="Locality"  name="locality" value="" type="hidden" /><input id="nv-City" title="City" placeholder="City" name="city" value="" type="hidden" /><div class="locality-city"></div></div></div>');
								}
                pca = new PCA_EditableAddress(flowersRecipientDetails, $container, true, flowersRecipientDetails.updatePostCodePlaceholder);

                flowersRecipientDetails.validation($container); // initialise validation since new fields are added
            },
        	 clearPCAField: function () {
                 var _oPCAElem = $(flowersRecipientDetails.containerSelector).find('input[name="postal-code-pca"]');
                 if (_oPCAElem.data('isAddressSelected')) {
                     _oPCAElem.val('').data('isAddressSelected', false).valid();
                 }

                 flowersRecipientDetails.editButtonClicked = false;
                 flowersRecipientDetails.manualAddressSignUpSlideUp();
             },

             removeHTMLFromDom: function () {
                 $(flowersRecipientDetails.containerSelector).find('table.pcaCapturePlusTable, div#ed59pz86tg22kf685176, input.postal-code-pca, button.edit-address-button, .manually-add-address').remove();
             },
             manualAddressSignUpSlideUp: function () {
            	 var el, $elem;

                 el = $(flowersRecipientDetails.containerSelector).find('.manually-add-address');

                 if (!el.is(':visible')) {
                     return;
                 }

                 $elem = $(flowersRecipientDetails.containerSelector).eq(0).find('form');

                 $elem.find('[name=companyname], [name=flatnumber], [name=buildingname]').removeClass('valid').val('');
                 $elem.validate().resetForm();

                 flowersRecipientDetails.enableSave($elem);

                 el.slideUp('fast', function () {
                	 flowersRecipientDetails.editButtonClicked = false;
                	 flowersRecipientDetails.pcaAddressSelected = false;
									 if($('.flowers-new-recipient').length) {
										 $('.hospital-msg-wrapper').hide();
									 }
                 });
             },
             manualAddressSignUpSlideDown: function () { // show the panel
                 var el = $(flowersRecipientDetails.containerSelector).find('.manually-add-address'),
                     self = this,
                     $addressInputs = el.find('input:text');
                 el.slideDown('fast', function () {
                     validationExtras.updatePlaceholders('.manually-add-address');

                     if (common.isIE9OrLower()) {
                         $addressInputs.each(function () {
                             if ($(this).val()) {
                                 $(this).closest('.placeholder').find('label').hide();
                             } else {
                                 $(this).closest('.placeholder').find('label').show();
                             }
                         });
                     }

										 if($('.flowers-new-recipient').length) {
											 $('.hospital-msg-wrapper').show();
										 }

                     var $save = $(flowersRecipientDetails.containerSelector).find('input[type=submit]');
 					 var $fields = $(flowersRecipientDetails.containerSelector).find('[name=honorific-prefix], [name=recipient-fname], [name=recipient-lname], [name=nick-names], [name=postal-code-pca], [name=companyname], [name=flatnumber], [name=buildingname]');

                     validationExtras.enableSave($fields, $save);
                 });
             },

             clearNewAddress: function (context) {
            	 resetForm.init($('form', context));
             },

             updatePostCodePlaceholder: function () {

                 if (common.isIE9OrLower()) {

                     var $tdContainer = $('#postal-code-pca').closest('td'),
                         $inputPostcode = $('#postal-code-pca');
                     validationExtras.updatePlaceholders('.post-code');
                     $inputPostcode.prependTo($tdContainer);
                     $tdContainer.css({
                         'position': 'relative'
                     });
                     $tdContainer.find('.placeholder').css({
                         'height': '36px',
                         'position': 'absolute',
                         'top': '0',
                         'overflow': 'auto',
                         'white-space': 'nowrap',
                         'width': $tdContainer.width()
                     });
                 }
             },

             createMessage: function () {
                 if ($(flowersRecipientDetails.containerSelector).find('.pcaCapturePlusTable .message').length) {
                     return;
                 }
                 $(flowersRecipientDetails.containerSelector).find('.pcaCapturePlusTable .pcaAutoCompleteSmall').before('<div class="message"></div>');

             },
             showMessage: function (showError) {
            	 flowersRecipientDetails.createMessage();
                 var el = $(flowersRecipientDetails.containerSelector).find('.pcaCapturePlusTable .message'),
                     message = 'If you can\'t find the right address enter the full postcode and select Edit',
                     errorClass = 'error-text';

                 el.removeClass(errorClass);

                 if (showError) {
                     message = 'Sorry, we don\'t recognise this postcode. Please enter another postcode.';
                     el.addClass(errorClass);
                 }

                 el.html(message).show();
             },

             hideMessage: function () {
                 $(flowersRecipientDetails.containerSelector).find('.pcaCapturePlusTable .message').hide();
             },

             newFlowerAddress: function () {

            	 flowersRecipientDetails.editButtonClicked = false;

            	 var $details = $('.collection-details.flowers-recipient');
                 var $content = $details.find('.new-flower-address');
                 var $form = $(flowersRecipientDetails.containerSelector).eq(0).find('form');

                 //$('.manually-add-address').remove();

                   var showCallback = function () {
                     validationExtras.updatePlaceholders($content);
                     flowersRecipientDetails.initialisePCAField($details);

                   };

                   if (typeof jQuery !== 'undefined') {
                       $content.not(':animated').slideDown(function () {
                           showCallback();
                       });
                   } else {
                       showCallback();
                   }

                 return false;
            },
            toggleFlowersAddress : function(e){
            	e.preventDefault();

            	var $target = $(e.target);
            	var $parent = $target.parents('.flowers-recipient .edit-new-recipient').length ? $('.flowers-recipient .edit-new-recipient') : $('.flowers-recipient .flowers-new-recipient .editNewFlowersRecipientInfo');
            	var $addressConatiner = $parent.find('.new-flower-address');
            	if($addressConatiner.hasClass('open')){
            		$addressConatiner.hide();
            		$addressConatiner.removeClass('open');
            		flowersRecipientDetails.clearPCAField();
            		flowersRecipientDetails.removeHTMLFromDom();
            		$target.show();
            	}
            	else {
					if ($('.edit-da-block.new-address').length) {
                        $('.edit-da-block.new-address').each(function () {
                            if ($(this).is(':visible')) {
                                $(this).find('.cancel').trigger('click');
                                $(this).find('table.pcaCapturePlusTable, div#ed59pz86tg22kf685176, input.postal-code-pca, button.edit-address-button, .manually-add-address').remove();
                            }
                        });
                    }
            		$addressConatiner.show();
            		$addressConatiner.addClass('open');
            		flowersRecipientDetails.initialisePCAField($('.flowers-recipient'));
            		$target.hide();
            	}

            },
			init: function(){
				common.customRadio($('.flowers-module'));
				if($('.new-flowers-checkout').length) {
					$('.flowers-recipient select').each(function() {
						dropdown.init($(this));
		      });
					$(document).on('click', '.flowers-new-recipient .custom-radio', flowersRecipientDetails.recipientAddress);
					$(document).on('focus', '.flowers-new-recipient input[name="postal-code-pca"]', flowersRecipientDetails.clearPCAField);
				} else {
					$(document).on('click', '.flowers-recipient .address-tabs input[type="radio"]', flowersRecipientDetails.recipientType);

					flowersRecipientDetails.newFlowerAddress();

					$(document).on('change', '.edit-new-recipient .dg-d-da-nonumber', flowersRecipientDetails.noMobileNumberToggle);
					$(document).on('change', '.edit-saved-address .dg-d-da-nonumber', flowersRecipientDetails.noMobileNumberToggle);

					$(document).on('focus', '.edit-new-recipient input[name="postal-code-pca"]', flowersRecipientDetails.clearPCAField);

					$(document).on('click', '.flowers-recipient .edit-new-recipient .cancel', flowersRecipientDetails.cancelRecipient);
					$(document).on('click', '.flowers-recipient .edit-saved-address .cancel', flowersRecipientDetails.cancelRecipient);
					$(document).on('change', '.recipient-address-div select', function(e) {
						flowersRecipientDetails.changeFlowersAddress($(this));
					});
				}
				flowersRecipientDetails.validation($('.checkout'));
        refreshAll.reInit.push(function () {
        	flowersRecipientDetails.validation($('.checkout'));
        });

        $(document).on('click', '.flowers-pick-date .datepicker-cta', flowersRecipientDetails.pickDateValidation);
			}

	};

	return flowersRecipientDetails;
});
