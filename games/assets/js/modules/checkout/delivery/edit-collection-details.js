/*global define:true, Microsoft: true */
define([
    'domlib',
    'modules/common',
    'modules/breakpoint',
    '../loader',
    './collection-details',
    './refresh-all',
    'modules/custom-dropdown/common',
    'modules/checkout/resetForm',
    'modules/validation',
    'modules/tesco.utils',
    'modules/tesco.data',
    './courier'
], function ($, common, breakpoint, loader, collectionDetails, refreshAll, customDropdown, resetForm, validationExtras, utils, data, courier) {

    /*
     * Edit collection details form
     */
    var editCollectionDetails = {

        update: function (result, $target, $mobileTarget) {
            var $checkbox = $target.find('.dg-d-da-nonumber'),
                $courierContainer = null;

            if ($mobileTarget && $mobileTarget.length) {
                common.virtualPage.close();
            }
            common.customCheckBox.init($target);
            $('select', $target).each(function () {
                customDropdown.init($(this));
            });
            editCollectionDetails.validation($target);
            if ($('#spc-delivery2-mob').val().length > 0 && $checkbox.prop('checked')) {
                $checkbox.click();
            }
            $courierContainer = $target.find('.edit-courier-instructions');
            courier.validation($courierContainer);
        },

        save: function ($target, $mobileTarget) {
            //var msg = 'Updating your contact details';
            var $form = $target;
            $target = $target.closest('.collection-details').find('.recipientDetails');

            /*
			if ($mobileTarget && $mobileTarget.length) {
				loader( $mobileTarget, msg );
			} else {
				loader( $target, msg );
			}
			*/
            var myDeliveryGroup = utils.getDeliveryGroup($form);
            var request = 'saveCollectionRecipient';
            var url = utils.getFormAction($form);
            var $elem = $form;
            var DL = new data.DataLayer();
            var myData = $form.serialize();
            DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (data) {
                $form = myDeliveryGroup.find('.recipientDetails');
                editCollectionDetails.update(data, $form, $mobileTarget);
                require(['modules/checkout/delivery/new-address'], function(newAddress) {
					newAddress.init();
				});
                if(breakpoint.mobile){
                	common.virtualPage.recipientChange = $.parseJSON(data.responseText).recipientDetails;
                }
            });

            return false;
        },

        cancel: function (e) {
            e.preventDefault();

            var $form = $(e.currentTarget).parents('.edit-contact-details');

            collectionDetails.toggle(e);
            resetForm.init($form);

            var $fields = $form.find('[name=honorific-prefix], [name=given-name], [name=family-name]');

            if ($form.find('.dg-d-da-nonumber').attr('checked')) {
                $fields = $fields.add($form.find('[name=tel-alt]'));
            } else {
                $fields = $fields.add($form.find('[name=tel]'));
            }

            var $save = $form.find('input[type=submit]');

            // check if the save should be enabled
            validationExtras.enableSave($fields, $save);

            return false;
        },

        mobile: function (e) {
            var target = $(e).closest('.collection-details');

            if (e.type) {
                e.preventDefault();
                target = $(e.target);
            }

            var content = $.trim($('<div></div>').html(target.closest('.collection-details').find('.edit-contact-details').clone()).html());

            common.virtualPage.show({
                content: content,
                callbackIn: function () {
                    var $vp = $('#virtual-page');

                    var $checkbox = $('#virtual-page').find('.dg-d-da-nonumber');
                    var eventBoundCheckbox = $checkbox.siblings(".checkbox");
                    eventBoundCheckbox.removeClass('eventBound');

                    common.customCheckBox.init($vp);

                    // remove the '.customDropdown' wrappers - as the html has been cloned, these will need to be setup again
                    $vp.find('.customDropdown').remove();
                    $vp.find('select').removeClass('been-customised');
                    customDropdown.init($vp.find('select'));

                    editCollectionDetails.validation($vp, $vp.find('.form-mobile-wrapper'));
                },
                callbackOut: function(){
                	target.closest('.collection-details').find('.recipientDetails').html(common.virtualPage.recipientChange);
                },
                closeSelector: '.cancel'
            });
            return false;
        },

        noMobileToggle: function (e) {
            var $target = $(e.target).closest('.edit-contact-details');
            var $altBlock = $target.find('.tel-alt-block');
            var $save = $target.find('input[type=submit]');
            var $mobile = $target.find('[name=tel]');
            var $alternate = $target.find('[name=tel-alt]');
            var $checkbox = $target.find('.dg-d-da-nonumber');

            var $enable, $disable;

            if ($checkbox.is(':checked')) {
                $enable = $alternate;
                $disable = $mobile;

                if (common.isTouch()) {
                    $altBlock.addClass('open').show();
                } else {
                    $altBlock.addClass('open').slideDown();
                }
            } else {
                $enable = $mobile;
                $disable = $alternate;

                if (common.isTouch()) {
                    $altBlock.removeClass('open').hide();
                } else {
                    $altBlock.removeClass('open').slideUp();
                }
            }

            $enable
                .prop('disabled', false)
                .addClass('required')
                .removeClass('valid');

            $disable
                .val('')
                .prop('disabled', true)
                .removeClass('required')
                .removeClass('valid')
                .removeClass('error')
                .next('.error').remove();

            if ($disable[0] === $alternate[0]) {
                //$disable.val('');
            }

            var $form = $(e.currentTarget).parents('.edit-contact-details');
            var $fields = $form.find('[name=honorific-prefix], [name=given-name], [name=family-name]');
            var $save = $form.find('input[type=submit]');

            if ($form.find('.dg-d-da-nonumber').is(':checked')) {
                $fields = $fields.add($form.find('[name=tel-alt]'));
            } else {
                $fields = $fields.add($form.find('[name=tel]'));
            }

            validationExtras.enableSave($fields, $save);

        },

        validation: function ($group, $mobileTarget) {
            $('.edit-contact-details form', $group).each(function () {
                var self = this;

                var $save = $(self).find('input[type=submit]');
                var $mobile = $(self).find('[name=tel]');
                var $alternate = $(self).find('[name=tel-alt]');
                var $checkbox = $(self).find('.dg-d-da-nonumber');
                var getFields = function () {
                    var $fields = $(self).find('[name=honorific-prefix], [name=given-name], [name=family-name]');
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
                        validationExtras.enableSave(getFields(), $save); // save enabler must be placed after the element validation
                    },
                    focusInvalid: false,
                    onfocusout: function (elm) {
                        this.element(elm);
                        validationExtras.enableSave(getFields(), $save); // save enabler must be placed after the element validation
                    },
                    errorPlacement: function (error, element) {
                        error.insertAfter(validationExtras.errorPlacementElement(element));
                    },
                    errorElement: 'span',
                    rules: {
                        'honorific-prefix': {
                            required: true
                        },
                        'given-name': {
                            required: true,
                            nameCheck: {
                                isLastname: false
                            }
                        },
                        'family-name': {
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
                        'honorific-prefix': {
                            required: validationExtras.msg.title.required
                        },
                        'given-name': {
                            required: validationExtras.msg.firstname.required,
                            nameCheck: validationExtras.msg.firstname.inValid
                        },
                        'family-name': {
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
                        editCollectionDetails.save($(form), $mobileTarget);
                    }
                });

                // apply focus fix for android devices
                validationExtras.focusoutFix($(self));
                validationExtras.selectChangeFix($(self), getFields(), $save);

                // set up max character limits
                validationExtras.limitCharacters($(self).find('[name=given-name]'), 25);
                validationExtras.limitCharacters($(self).find('[name=family-name]'), 20);
                validationExtras.limitCharacters($(self).find('[name=tel], [name=tel-alt]'), 11);

                // if there is a mobile number deselect tickbox
                if ($(self).find('[name=tel]').val().length > 0 && $checkbox.is(':checked')) {
                    $checkbox.click();
                    $checkbox.prop('checked', false);
                }

                // check if the save should be enabled
                validationExtras.enableSave(getFields(), $save);
            });
        },

        init: function () {
            // bind events
            //$(document).on('tap click','.collection .edit-contact-details input[type="button"]', editCollectionDetails.cancel);
            $(document).on('change', '.edit-contact-details .dg-d-da-nonumber', editCollectionDetails.noMobileToggle);

            // setup validation
            editCollectionDetails.validation($('.checkout'));

            refreshAll.reInit.push(function () {
                editCollectionDetails.validation($('.checkout'));
            });
        },
        toggle: function (e) {
            collectionDetails.toggle(e);
        }
    };

    return editCollectionDetails;

});
