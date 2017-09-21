/* eslint-disable */
/*global define:true, Microsoft: true */
define(
    [
        'domlib',
        'modules/common',
        'modules/breakpoint',
        'modules/custom-dropdown/common',
        'modules/checkout/loader',
        'modules/checkout/resetForm',
        'modules/validation',
        'modules/checkout/form-changed',
        'validate',
        'placeholder',
        'modules/editable-addresses/common',
        'modules/mvc/fn',
        'modules/tesco.utils',
        'modules/tesco.data',
        'modules/overlay/common',
        'modules/tesco.analytics',
        'dotdotdot'
    ],
    function ($, common, breakpoint, customDropdown, loader, resetForm, validationExtras, formChanged, validate, placeholder, PCA_EditableAddress, fn, utils, data, overlay, analytics) {
        var groupFields = '[name=companyname], [name=flatnumber], [name=buildingname]',
            updatePostCodePlaceholder;
        var payment = {

            /* ** EPIC 2571 : Start ** */
            editButtonClicked: false,
            containerSelector: '.add-new-address',
            pcaAddressSelected: false,
            editButtonEnabled: false,
            /* ** EPIC 2571 : End ** */
            checkboxState: [],
            isCheckBoxSelected: false,
            bScheduleDelivery: true,
            bGroceryDelivery: true,
            egamingTC: false,
            enableSaveFields: '[name=nick-names], [name=postal-code-pca], ' + groupFields,

            isTotalZero: false,

            accordionDefaults: {
                wrapper: [],
                content: [],
                doScroll: true,
                isForceOpen: false,
                showCallback: '',
                hideCallback: ''
            },

            inProgress: false,

            virtualPageWrapper: function (elementId, content) {
                return $('<div />', {
                    id: elementId
                }).html(content);
            },

            unbindEvents: function () {
                // payments form
                var $payment = $('#payment');

                $payment.find('.cvv').off('tap click');
                $payment.find('#billing-address').off('tap click change');
                $payment.find('.payment-group-block .new-address').off('tap click'); // should this be removed?
                $(document).off('tap click', '#payment input.cancel', payment.toggleNewAddress);
                $('#fuel-save-heading').off('tap click');
                $('#fuel-save-mask').off('tap click');
                $('#fuel-save-tooltip .close').off('tap click');
            },
            overlay: {

                position: function ($overlay) {
                    var self = payment,
                        scrollY = $(document).scrollTop(),
                        marginTop = parseInt($overlay.css('margin-top'), 10) + scrollY;

                    if ($overlay.offset().top < scrollY) {
                        $overlay.css('margin-top', marginTop);
                    }
                },

                init: function () {
                    var self = payment;

                    $(document).on('tap click', '.remove-gift-card', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        payment.requests.giftCard.get($(this).parents('form'));
                    });
                }
            },
            placeOrderBtnActions: function (e) {
                if (payment.inProgress) {
                    e.preventDefault();
                    return;
                }

                payment.inProgress = true;

                if (payment.isCheckBoxSelected) {
                    $('#voucher-error').show();
                    payment.positionError();
                    return false;
                }

                $('.ba-find-btn-fh').remove();
                $('.ba-save-btn-fh').remove();

                payment.bScheduleDelivery = payment.validateScheduleDeliveryGroups();
                payment.bGroceryDelivery = payment.validateGrocerylivery();

                if ($('.personal-gift-message-wrapper').length) {
                    $('.uiGiftMessage').find('.personalGiftMessage').each(function () {
                        var textBoxId = $(this);
                        $(".holder").children("input[id$=" + textBoxId.attr('id').split('-')[1] + "]").val($(this).val());
                    });
                }

                payment.egamingTC = true;
                payment.eGamingTCActions();

                if($('.all-store-restrict-error').length){
					$('.place-order').addClass('disabled');
					setTimeout(function () {
						var pos = $('p.all-store-restrict-error:visible').eq(0).offset();
						$(window).scrollTop(pos.top - 60);

					}, 50);
                    payment.inProgress = false;
					return false;
				}

                if (payment.validation.cardDetails.$form.validate().checkForm()) {
                    if (!payment.bScheduleDelivery) {
                        payment.positionError();
                        return false;
                    }
                }

                if (payment.validation.cardDetails.$form.validate().checkForm()) {
                    if (!payment.bGroceryDelivery) {
                        payment.positionError();
                        return false;
                    }
                }

                if (payment.validation.cardDetails.isNewAddress) {
                    if (payment.validation.cardDetails.$form.validate().checkForm()) {
                        return false;
                    } else {
                        payment.validation.cardDetails.$form.validate();
                    }
                }

                if (payment.validation.cardDetails.$form.validate().checkForm()) {
					if($('#egaming-tc-container .checkbox.required').length){
						payment.positionError();
						return false;
					} else {
						payment.validation.cardDetails.$form.validate();
					}
				}

                payment.positionError();
            },

            //For products with digital delivery
            eGamingTCActions: function () {
                var eGamingCheckbox = $('.egaming-tc-checkbox');
                var eGamingTCRequired = $('.egaming-tc-check-label').html();

                if(payment.egamingTC && !eGamingCheckbox.is(':checked')){ //On click of the pay now button
                	$('#egaming-tc-container .checkbox, .egaming-tc-check-label').addClass('required').addClass('error');
                	$('.egaming-tc-check-label').html(eGamingTCRequired);
                	payment.egamingTC = false;
                }
                else if(payment.egamingTC && eGamingCheckbox.is(':checked')) {
                	payment.egamingTC = false;
                }
                else { //On click of the checkbox
                    if(eGamingCheckbox.is(':checked')) {
		                    eGamingCheckbox.removeAttr('checked');
		                    $('#egaming-tc-container .checkbox').addClass('required').addClass('error').removeClass('selected');
		                    $('.egaming-tc-check-label').html(eGamingTCRequired).addClass('required');
		                    eGamingCheckbox.removeClass('valid');
                    }
                    else {
                            eGamingCheckbox.prop('checked', true).attr('checked', true);
                            $('#egaming-tc-container .checkbox').removeClass('required').removeClass('error').addClass('selected');
                            $('.egaming-tc-check-label').html(eGamingTCRequired).removeClass('required');
                            eGamingCheckbox.addClass('valid');
                    }
                }
                payment.validation.cardDetails.enableSave();
            },

            validateScheduleDeliveryGroups: function () {
                $('.scheduleDayError').remove();
                var bRes = true;
                $('.delivery-group-block .dg-d-options .delivery-options').each(function (i, e) {
                    var datePicker = $(this).find('.datepicker-wrapper');

                    if (datePicker.length) {
                        // User has selected "scheduled delivery
                        var $eC = datePicker.parents('li').find('input[type="radio"]');
                        if ($eC.is(':checked')) {
                            //User has not chosen a date
                            var $eC2 = $eC.parents('.delivery-options-list').find('.dDeliveryDate');
                            if ($eC2.attr('value') === undefined || $eC2.attr('value') === '' || $eC2.attr('value') === 'default') {
                                payment.showScheduleDeliveryError('Please choose a date for your delivery', $(this).find('.expected .datepicker-wrapper'));
                                $('.place-order').addClass('disabled');
                                bRes = false;
                            }
                        }
                    }
                });
                return bRes;
            },
            validateGrocerylivery: function () {
                var bRest = true;
                if ($('.groceryDelivery').length) {
                    $('.groceryDeliveryAddress').each(function (e) {
                        var noOptionStr = $(this).find('.customDropdown a span.innerText').text();
                        if ($('.groceryDO').prev('.checked') && (noOptionStr == "Select an active grocery delivery slot")) {
                            $('#gds-error').show();
                            $(this).find('.customDropdown').css('background', '#fefde8');
                            $('.place-order').addClass('disabled');
                            bRest = false;
                        }
                    });
                }

                return bRest;
            },
            positionError: function () {
                setTimeout(function () {
                    if (($('span.error:visible').length && $('span.error:visible').eq(0).html() != '') || $('.error:visible').length) {
                        var pos = $('span.error:visible, .error:visible').eq(0).offset();
                        $(window).scrollTop(pos.top - 60);
                        payment.inProgress = false;
                    }
                }, 50);
            },
            showScheduleDeliveryError: function (sMsg, oElem) {
                if (oElem.find('label.scheduleDayError').length == 0) {
                    oElem.append('<span class="invalid2 error scheduleDayError">' + sMsg + '</span>');
                }
            },
            hideScheduleDeliveryError: function (oDeliveryOptionsContainer) {
                oDeliveryOptionsContainer.find('span.scheduleDayError').remove();
            },
            placeOrderBtnOnTotZero: function () {
                var self = payment.validation.cardDetails;
                var totalAmount = $('#total-cost-val').val();

                if (totalAmount == '0.0' || totalAmount <= '0') {
                    payment.isTotalZero = true;

                    $('.payment-details').addClass('total-nill').append('<div class="payment-overlay"></div>');
                    $('.payment-details .errors').remove();

                    if ($('#card-validator').length)
                        $('#card-validator').val('');

                    $('.payment-details').find('input[type="text"], input[type="password"], select').attr('disabled', 'disabled');

                    if ($('#payment').validate().checkForm()) {
                        $('.place-order').removeClass('disabled');
                    }
                } else {
                    $('.payment-details').removeClass('total-nill');
                    $('.payment-overlay').remove();

                    $('.payment-details').find('input[type="text"], input[type="password"], select').removeAttr('disabled');

                    if ($('#card-validator').length)
                        $('#card-validator').val('oldcard');

                    payment.isTotalZero = false;

                    if (self.$form.validate().checkForm() && !$('#integrated-registration').length) {
                        $('.place-order').removeClass('disabled');
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

            },
            bindMobileEvents: function () {
                payment.unbindEvents();
                payment.scrollable(false);

                var $payment = $('#payment');

                $payment.data('non-mobile-accordion-setup', false); // reset setup flag for tablet, desktop and large desktop (see bind events)

                // is this needed?
                // $payment.find('.total').on('tap click', '.open-ewallet', payment.goTo);

                $(document).on('tap click', '#fuel-save-heading', function (e) {
                    e.preventDefault();
                    payment.triggerFuelSaveTooltip();
                });

                $(document).on('tap click', '#fuel-save-mask', function (e) {
                    e.preventDefault();
                    $('#fuel-save-tooltip').hide();
                    $('#fuel-save-mask').hide();
                });

                $(document).on('tap click', '#fuel-save-tooltip .close', function (e) {
                    e.preventDefault();
                    $('#fuel-save-tooltip').hide();
                    $('#fuel-save-mask').hide();
                });
                setTimeout(function () {
                    /*$(document).on('tap click', '.delivery-saver-message span.help', function(e){
					   payment.deliverySaverPopup(e);
					   return false;
					});
					$(document).on('tap click', '.delivery-saver-tooltip-content .close', function(e){
					   payment.deliverySaverClose();
					   return false;
					});*/
                    $(".delivery-saver-message span.help").on('click tap', function (e) {
                        payment.deliverySaverPopup(e);
                        return false;
                    });
                    $(".delivery-saver-tooltip-content .close").on('click tap', function (e) {
                        payment.deliverySaverClose();
                        return false;
                    });
                    $(document).click(function (e) {
                        if (!$(e.target).hasClass('help') && $('.container').is(':visible')) {
                            payment.deliverySaverClose();
                        }
                    });
                }, 1000);
            },

            initiateCustomDropdownDimension: function () {
                setTimeout(function () {
                    $('.checkout .customDropdown:visible').each(function () {
                        customDropdown.updateSelectDimension($(this));
                    });
                }, 500);
            },

            /* ** EPIC 2571 : Start ** */
            initialisePCAField: function ($container) {
                var el,
                    pca,
                    fieldLimits = {
                        companyName: 60,
                        flatNumber: 30,
                        buildingName: 55,
                        primaryStreet: 70
                    };

                $container.find('div.post-code').append('<input id="postal-code-pca" class="input postal-code-pca required highlight" type="text" title="Enter a postcode" placeholder="Enter a postcode" name="postal-code-pca" maxlength="8"><div id="ed59pz86tg22kf685176"></div>');

                el = $container.find('input[name="postal-code-pca"]');
                el.data('isAddressSelected', false);

                // Global function defined in PCA library
                loadCapturePlus();

                $container.find('.pcaCapturePlusTable').after('<button class="primary-button disabled edit-address-button">Edit</button>');
                $container.find('div.post-code').after('<div class="manually-add-address"><div class="field-wrapper"><label for="nv-Company" class="hidden">Company name</label><input id="nv-Company" title="Please complete one of the following three fields" placeholder="Company name" name="companyname" value="" type="text" class="highlight" maxlength="' + fieldLimits.companyName + '"></div><div class="field-wrapper"><label for="nv-FlatNumber" class="hidden">Flat / unit number</label><input id="nv-FlatNumber" title="Please complete one of the following three fields" placeholder="Flat / unit number" name="flatnumber" value="" type="text" class="highlight" maxlength="' + fieldLimits.flatNumber + '"></div><div class="field-wrapper"><label for="nv-BuildingName" class="hidden">Building number / name</label><input id="nv-BuildingName" title="Please complete one of the following three fields" placeholder="Building number / name" name="buildingname" value="" type="text" class="highlight" maxlength="' + fieldLimits.buildingName + '"></div><div class="field-wrapper"><label for="nv-PrimaryStreet" class="hidden">Street</label><input id="nv-PrimaryStreet" title="Street" placeholder="Street" name="street" value="" type="text" maxlength="' + fieldLimits.primaryStreet + '"></div><div class="field-wrapper"><input id="nv-Locality" title="Locality"  name="locality" value="" type="hidden" /><input id="nv-City" title="City" placeholder="City" name="city" value="" type="hidden" /><div class="locality-city"></div></div></div>');

                pca = new PCA_EditableAddress(payment, $container, true, payment.updatePostCodePlaceholder);
            },
            /* ** EPIC 2571 : End ** */

            bindEvents: function () {
                payment.unbindEvents();

                $(document).on('tap click', '#payment input.cancelAddNewAddress', payment.toggleNewAddress);

                // payment/card details
                var $payment = $('#payment');

                // only setup the scrollable 'Clubcard vouchers and eCoupons' area once for tablet, desktop and large desktop
                // mobile shows all of the clubcard vouchers and ecoupons
                if (!$payment.data('non-mobile-accordion-setup')) {
                    if (common.isTouch()) {
                        payment.scrollable(false);
                    } else {
                        payment.scrollable(true);
                    }

                    /*
					payment.toggleAccordion({
						wrapper: $('#ecoupon-voucher'),
						content: $('#ewallet-container')
					});
					*/

                    // store setup flag
                    $payment.data('non-mobile-accordion-setup', true);
                }

                $(document).on('tap click', '#fuel-save-heading', function (e) {
                    e.preventDefault();
                    payment.triggerFuelSaveTooltip();
                });

                $(document).on('tap click', '#fuel-save-mask', function (e) {
                    e.preventDefault();
                    $('#fuel-save-tooltip').hide();
                    $('#fuel-save-mask').hide();
                });

                $(document).on('tap click', '#fuel-save-tooltip .close', function (e) {
                    e.preventDefault();
                    $('#fuel-save-tooltip').hide();
                    $('#fuel-save-mask').hide();
                });

                setTimeout(function () {
                    $(".delivery-saver-message span.help").on('click tap', function (e) {
                        payment.deliverySaverPopup(e);
                        return false;
                    });
                    $(".delivery-saver-tooltip-content .close").on('click tap', function (e) {
                        payment.deliverySaverClose();
                        return false;
                    });
                    $(document).on('click tap', function (e) {
                        /*if($(e.target).is('.delivery-saver-tooltip-content.popup *, .delivery-saver-tooltip-content.popup')){
							return false;
						}
						else{*/
                        if (!$(e.target).hasClass('help') && $('.container').is(':visible')) {
                            payment.deliverySaverClose();
                        }
                        //}
                    });
                }, 1000);

            },
            deliverySaverPopup: function (e) {
                e.stopPropagation();
                if (!window.isKiosk()) {
                	if (breakpoint.mobile) {

                        common.virtualPage.show({
                            content: payment.virtualPageWrapper('delivery-saver-tooltip-content', $('.delivery-saver-tooltip-content').html()),
                            closeSelector: '.close',
                        });
                    }
                	else{
                    var self = payment;
                    var remWidth = $(document).width() - e.pageX;
                    var rightPos = -(remWidth);
                    if (e.pageX <= 300) {
                        $('.delivery-saver-tooltip-content').css('left', -30);
                    }
                    if (e.pageX <= 300 && e.pageX >= 250) {
                        $('.delivery-saver-tooltip-content').css('left', -75);
                    }
                    //var arrowPos = parseInt(($(document).width() - e.pageX)/4);
                    //var remWidth = - (($(document).width() - e.pageX) - 15);
                    if (remWidth <= 300 && e.pageX >= 300) {
                        $('.delivery-saver-tooltip-content.popup').css('right', rightPos + 20);
                    }
                    if (remWidth >= 300 && e.pageX <= 350) {
                        $('.delivery-saver-tooltip-content.popup').css('left', -50);
                    }
                    $(e.target).parents('.delivery-saver-message').find('.container').css('display', 'inline-block');
                }
                }
            },
            deliverySaverClose: function (e) {
                if (!window.isKiosk()) {
                    $('.delivery-saver-message').find('.container').hide();
                }
            },
            triggerFuelSaveTooltip: function () {
                var self = payment;

                if (breakpoint.mobile) {
                    var html = $('#fuel-save-tooltip').find('.content').clone().wrap('<p>').parent().html();
                    var back = '<a href="#" class="back"><span class="icon" data-icon="g" aria-hidden="true"></span> Back</a>';

                    common.virtualPage.show({
                        content: back + html + back,
                        closeSelector: '.close',
                        customClass: 'fuel-save-vp'
                    });

                } else {
                    $('#fuel-save-tooltip').show();
                    $('#fuel-save-mask').show();
                }
            },

            showMore: function (e) {
                e.preventDefault();
                $(e.currentTarget).prev().css('height', 'auto');
                $(e.currentTarget).remove();
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
            // can't setup placeholders on elements that are hidden - won't be able to retrieve widths
            // run as show callback to the toggleAccordion function
            // MOVE THIS INTO THE VALEXTRAS
            updateNewAddressPlaceholders: function () {
                var $newAddress = (breakpoint.mobile) ? $('#virtual-page #add-new-address') : $('#payment .add-new-address'),
                    $nickname,
                    $nicknameTooltip;

                /* ** EPIC 2571 : Start ** */
                // Add the following class to the mobile (virtual-page) #add-new-address in order
                // to get the PCA_EditableAddress working
                $('#virtual-page #add-new-address').addClass('add-new-address');
                /* ** EPIC 2571 : End ** */

                // $('[placeholder]').placeholder({ inputWrapper: '<span class="placeholder" />' });
                // had to use a different element for the placeholder - couldn't locate the issue with
                // using the span after the placeholder hides the span - it was still set to be visible
                $newAddress.find('[placeholder]').each(function () {
                    // placeholder script does check if already setup
                    if (!$(this).parents('.placeholder').length) {
                        $(this).placeholder({
                            inputWrapper: '<div class="placeholder" />',
                            placeholderCSS: {
                                'position': 'absolute',
                                'top': 'auto',
                                'right': 'auto',
                                'bottom': '0',
                                'left': '0'
                            }
                        });
                    }
                });

                $nickname = $('.placeholder #add-billadr-nickname', $newAddress),
                $nicknameTooltip = $('#add-billadr-nickname-hint-messaging', $newAddress);
                common.enableHintMessagingIfPlaceholderAdded($nickname, $nicknameTooltip);
            },

            positionTotalBlock: function () {
                var blockHeight = $('#payment .total').height();
                $('.coupons-group').css('margin-bottom', blockHeight + 50);
            },

            goToLink: function (link) {
                location.hash = link;
            },

            scrollTo: function (element) {
                var animSpeed = 300;

                // scroll to the wrapper
                if (typeof jQuery !== 'undefined') {
                    $('html, body').animate({
                        scrollTop: element.offset().top
                    }, animSpeed);
                } else {
                    $.scroll(element.offset().top - element.outerHeight(), animSpeed);
                }
            },

            toggleAccordion: function (options) {
                var defaults = payment.accordionDefaults;
                var opts = $.extend({}, defaults, options);

                if (!opts.wrapper.length || !opts.content.length) {
                    return;
                }

                // hide/collpase
                if (opts.content.is(':visible')) {
                    // just run the show callback and exit if we need to keep the accordion open
                    if (opts.isForceOpen) {
                        if (typeof (opts.showCallback) === 'function') {
                            opts.showCallback();
                        }
                        return;
                    }

                    if (typeof jQuery !== 'undefined') {
                        opts.content.not(':animated').slideUp(function () {
                            opts.wrapper.addClass('hide');
                            if (typeof (opts.hideCallback) === 'function') {
                                opts.hideCallback();
                            }
                        });
                    } else {
                        opts.content.hide();
                        opts.wrapper.addClass('hide');
                        if (typeof (opts.hideCallback) === 'function') {
                            opts.hideCallback();
                        }
                    }
                }
                // show/reveal
                else {
                    opts.wrapper.removeClass('hide');
                    opts.content.removeClass('hidden');

                    if (typeof jQuery !== 'undefined') {
                        opts.content.not(':animated').slideDown(function () {
                            if (typeof (opts.showCallback) === 'function') {
                                opts.showCallback();
                            }
                        });
                    } else {
                        opts.content.show();
                        if (typeof (opts.showCallback) === 'function') {
                            opts.showCallback();
                        }
                    }
                }
            },

            // reset the state of the payment form new address on breakpoint change
            breakpointReset: function () {

                if (breakpoint.mobile) {
                    payment.validation.cardDetails.isNewAddress = false;
                    $('#payment .add-new-address').hide();
                    $('#ecoupon-voucher').addClass('hide');
                    $('#ewallet-container').css('display', '');
                    payment.removeHTMLFromDom();
                }
            },


            // payment/card details functions
            // ---------------------------------------------------

            // virtual page for the "what's this"
            securityCodeVirtualPage: function () {
                common.virtualPage.show({
                    content: payment.virtualPageWrapper('cvv-text', $('#cvv-text').html()),
                    closeSelector: '.back'
                });
            },

            cvvPopup: function (e) {
                e.preventDefault();
                if (breakpoint.mobile) {
                    payment.securityCodeVirtualPage();
                } else {
                    $(e.target).parent().next().show();
                }
            },

            cvvClose: function (e) {
                e.preventDefault();
                $(e.target).parents('div#cvv-text').hide();
            },

            changeBillingAddress: function () {
                var $payment = $('#payment'),
                    bool = (formChanged.isChanged($payment)) ? false : true;
                //resetForm.init( $payment, $('[name=billing-address]'), bool); // bool flag - do not restore default values
                $payment.find(".address-details").html($('#billing-address').find('option:selected').attr('title'));
            },

            billingAddressDotDotDot: function () {
                /*
				$('#billing-address', $('#payment')).dotdotdot({
					ellipsis: '\u2026',
					wrap: 'word',
					watch: false
				});
*/
            },

            changePaymentCard: function (e) {
                e.stopImmediatePropagation();
                var $payment = $('#payment');
                $payment.find('.saved-card').hide();
                $payment.find('.change-card').show();
                $('#card-number').attr('name', 'creditCardNumber');
                $('#existing-card-handler').remove();
                // re-run the custom drop downs as they're initally hidden so haven't been setup correctly
                $payment.find('.change-card .customDropdown').remove();
                $payment.find('.change-card select').each(function () {
                    $(this).data(customDropdown.isSetupFlag, false).removeClass('been-customised');
                    customDropdown.init($(this));
                });
                payment.clearPaymentDetails();

                payment.validation.cardDetails.isNewCard = true;

                $('.change-card input#security-code').attr('name', 'cc-csc');
                $('.saved-card input#security-code').remove();

                // payment.initialisePCAField($('.add-new-address')); /* ** EPIC 2571 : Changes ** */
                payment.validation.cardDetails.enableSave();

            },

            clearPaymentDetails: function () {
              var $expiryMonth = $('#expiry-month'),
                $expiryYear = $('#expiry-year'),
                sDisplayMonth = null,
                i = null;

                payment.resetField($('#name-on-card'));
                payment.resetField($('#card-number'));

                $expiryYear.find(':selected').removeAttr('selected');
                $expiryYear.find('option').eq(0).attr('selected', 'selected');
                $expiryYear.next('.customDropdown').find('.innerText').text('YYYY');
                $expiryYear.next('.customDropdown').find('li a.sort.current').removeClass('current');


                $expiryMonth.next('.customDropdown').find('.innerText').text('MM');
                $expiryMonth.next('.customDropdown').find('li a.sort.current').removeClass('current');

                $expiryMonth.empty().append('<option>MM</option>');
                for (i = 1; i <= 12; i += 1) {
                  sDisplayMonth = ('0' + i).slice(-2);
                  $expiryMonth.append('<option value="' + sDisplayMonth + '">' + sDisplayMonth + '</option>');
                }

                $('.place-order').addClass('disabled');
            },

            resetField: function ($elem) {
                $elem.val('');
                $elem.removeClass('valid error');
            },

            // update the expiry months visibilty based on the selected expiry year
            // note: touch devices default to show the native os select, so need to
            // update the dom by adding/removing options in the select element
            updateExpiryMonths: function () {
                var $year = $('#expiry-year');
                var $month = $('#expiry-month');

                var $monthOptions = $month.find('option').clone();
                var $monthItems = customDropdown.getWrapper($month).find('li').not('.alt-heading');

                var curDate = new Date();
                var curYear = curDate.getFullYear();
                var curMonth = curDate.getMonth() + 1;

                // need to clone options then remove/restore
                var updateMonths = function (e) {
                    var year = '';
                    $year = $('#expiry-year');
                    $month = $('#expiry-month');

                    // assume clicked on the custome drop down list item link
                    if (e && e.target.tagName.toLowerCase() === 'a') {
                        year = $(e.target).data('value');
                    }

                    // get the selected index from the year drop down
                    else {
                        year = $year.find('option').eq($year[0].selectedIndex).val();
                    }

                    year = parseInt(year, 10);

                    // show/hide the expiry month select options based on passed year value
                    if (common.isTouch() && !breakpoint.kiosk) {
                        if(year === curYear) {
                          var currentMonthSelected = $month.val();

                          $month.empty();
                          $monthOptions.each(function () {
                              var $elm = $(this);
                              var month = parseInt($elm.val(), 10);

                              if (isNaN(month) || month >= curMonth) {
                                  if ($elm.val() === currentMonthSelected) {
                                      $elm.prop('selected', true);
                                  }
                                  $month.append($elm);
                              }
                          });
                          $month.next().find('.control .innerText').text($month.find('option:selected').text());
                        }
                    }

                    // show/hide the expiry month list items based on passed year value
                    else {
                        $monthItems.each(function () {
                            var $elm = $(this);
                            var month = parseInt($elm.find('a').data('value'), 10);

                            if (isNaN(month) || month >= curMonth) {
                                $elm.show();
                            } else {
                                $elm.hide();
                            }
                        });
                    }

                    // only show the months available for the current year
                    if (year !== 'NaN' && year === curYear) {
                        var monthSelectedValue = parseInt($month.val(), 10);

                        // if the user has made a pre selection that falls on a prevous month to the
                        // current then reset their selection
                        if (monthSelectedValue < curMonth) {
                            var $opts = $month.find('option');

                            // remove existing selected flag
                            $opts.find(':selected').removeAttr('selected');

                            // set selected back to the first/default options
                            $opts.find('li').eq(0).attr('selected', 'selected');
                            $month[0].selectedIndex = 0;
                            $($opts).eq(0).attr('selected', 'selected');

                            // update the display text for when dropdown is closed
                            $month.next().find('.control .innerText').text($($opts).eq(0).text());
                        }


                    }

                    // show all months
                    else {

                        // check if the expiry month select options have been modified before updating the dom
                        if (common.isTouch() && !breakpoint.kiosk) {
                           var $internalMonth = $('#expiry-month');
                            if ($internalMonth.find('option').length !== $monthOptions.length) {
                                $internalMonth.empty();
                                $monthOptions.each(function (i) {
                                    $internalMonth.append($(this));
                                });
                                $internalMonth.next().find('.control .innerText').text($month.find('option:selected').text());
                            }
                        }

                        // show all expiry month list items
                        else {
                            $monthItems.show();
                        }
                    }
                };

                // change event for the expiry month select element
                if (common.isTouch() && !breakpoint.kiosk) {
                    $year.on('change', updateMonths);
                }

                // tap/click event for the expiry month list items links
                else {
                    customDropdown.getWrapper($year).find('ul > li > a').on('tap click', updateMonths);
                }

                // update the expiry months on load in case of pre-selection
                updateMonths();
            },

            // reset values and clear the errors just for the new address section
            clearNewAddress: function () {
                if (breakpoint.mobile) {
                    resetForm.init($('#virtual-page form'));
                } else {
                    resetForm.init($('#payment .add-new-address'));
                }
                $('#payment').find('.new-address').removeClass('open');
            },

            /* ** EPIC 2571 : Start ** */
            clearPCAField: function () {
                var _oPCAElem = $(payment.containerSelector).find('input[name="postal-code-pca"]');

                if (_oPCAElem.data('isAddressSelected')) {
                    _oPCAElem.val('').data('isAddressSelected', false).valid();
                }

                payment.editButtonClicked = false; // Reset edit button clicked
                payment.manualAddressSignUpSlideUp();
            },

            removeHTMLFromDom: function () {
                $(payment.containerSelector).find('table.pcaCapturePlusTable, div#ed59pz86tg22kf685176, input.postal-code-pca, button.edit-address-button, .manually-add-address').remove();
            },

            manualAddressSignUpSlideUp: function () {
                var el, paymentElm;

                el = $(payment.containerSelector).find('.manually-add-address');

                // Only slide up and reset form if visible
                if (!el.is(':visible')) {
                    return;
                }

                paymentElm = $('#payment');
                paymentElm.find('[name=companyname], [name=flatnumber], [name=buildingname]').removeClass('valid').val('');
                paymentElm.validate().resetForm();

                payment.validation.cardDetails.enableSave();

                el.slideUp('fast', function () {
                    payment.editButtonClicked = false;
                    payment.pcaAddressSelected = false;
                });
            },

            manualAddressSignUpSlideDown: function () {
                var el = $(payment.containerSelector).find('.manually-add-address');
                var self = this;
                el.slideDown('fast', function () {

                    validationExtras.updatePlaceholders('.manually-add-address');
                });
            },

            enableEditButton: function () {
                var el = $(payment.containerSelector).find('.edit-address-button');
                el.attr('disabled', false);
                el.removeClass('disabled');
                payment.editButtonEnabled = true;
            },

            disableEditButton: function () {
                var el = $(payment.containerSelector).find('.edit-address-button');
                el.attr('disabled', true);
                el.addClass('disabled');
                payment.editButtonEnabled = false;
            },

            createMessage: function () {
                //If message element doesn't exist, create it
                if ($(payment.containerSelector).find('.pcaCapturePlusTable .message').length) {
                    return;
                }
                $(payment.containerSelector).find('.pcaCapturePlusTable .pcaAutoCompleteSmall').before('<div class="message"></div>');
            },

            showMessage: function (showError) {
                payment.createMessage();
                var el = $('.pcaCapturePlusTable .message'),
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
                $(payment.containerSelector).find('.pcaCapturePlusTable .message').hide();
            },

            hideDeliveryBlock: function () {
                // close new address block. Close only visible address block in case of multiple delivery blocks
                $('.edit-da-block.new-address').each(function () {
                    if ($(this).is(':visible')) {
                        $(this).find('.cancel').trigger('click');
                    }
                });
            },
            /* ** EPIC 2571 : End ** */

            toggleNewAddress: function (e) {
                e.preventDefault();

                var $target = $(e.target);
                var $payment = $('#payment');
                var $wrapper = $payment.find('.new-address');
                var $content = $payment.find('.add-new-address');

                /* ** EPIC 2571 : Start ** */
                $('.manually-add-address').remove(); // Remove all
                payment.hideDeliveryBlock();
                /* ** EPIC 2571 : End ** */

                $('.change-card input#security-code').attr('name', 'cc-csc');
                $('.saved-card input#security-code').attr('name', 'cc-csc-new');

                if (breakpoint.mobile) {
                    var html = '<form id="payment">' + $.trim($content.clone().html()) + '</form>';

                    $content = payment.virtualPageWrapper('add-new-address', html);

                    common.virtualPage.show({
                        content: $content,
                        closeSelector: '.back, .cancel',
                        callbackIn: function () {
                            payment.validation.cardDetails.isNewAddress = true;
                            payment.validation.cardDetails.init('#virtual-page', $target);
                            payment.updateNewAddressPlaceholders();
                            payment.initialisePCAField($content);

                        },
                        callbackOut: function () {
                            payment.validation.cardDetails.isNewAddress = false;
                            payment.clearNewAddress();
                            resetForm.init($('#payment .add-new-address'));
                            /* ** EPIC 2571 : Start ** */
                            payment.manualAddressSignUpSlideUp();
                            payment.removeHTMLFromDom();
                            /* ** EPIC 2571 : End ** */
                        }
                    });
                } else {
                    var $paymentWrapper = $('.payment-wrapper', $('.checkout')),
                        sNewBillingAddress = 'newBillingAddressOpen',
                        sAjaxAddressAdded = 'ajaxAddressAdded';

                    $paymentWrapper.removeClass(sAjaxAddressAdded);

                    payment.toggleAccordion({
                        wrapper: $wrapper,
                        content: $content,
                        showCallback: function () {
                            $paymentWrapper.addClass(sNewBillingAddress);
                            payment.validation.cardDetails.isNewAddress = true;
                            payment.validation.cardDetails.enableSave();
                            payment.updateNewAddressPlaceholders();
                            payment.initialisePCAField($content);


                        },
                        hideCallback: function () {
                            $paymentWrapper.removeClass(sNewBillingAddress);
                            payment.validation.cardDetails.isNewAddress = false;
                            payment.clearNewAddress();
                            /* ** EPIC 2571 : Start ** */
                            payment.manualAddressSignUpSlideUp();
                            payment.removeHTMLFromDom();
                            /* ** EPIC 2571 : End ** */
                        }
                    });
                }
                //set omniture variable
                var _oWebAnalytics = new analytics.WebMetrics();
                var v = [{
                    'eVar65': 'EBA_P1',
                    'events': 'event65'
                }];
                _oWebAnalytics.submit(v);
            },


            // gift card functions
            // ---------------------------------------------------

            toggleGiftCard: function (e) {
                var $giftCard = $('#gift-card');
                var isForceOpen = false;

                $giftCard.find('.invalid2').hide();

                if (e && e.target) {
                    e.preventDefault(); 
                    isForceOpen = $(e.target).hasClass('open-giftcard'); // link within the subtotal/total wrapper
                }

                if (payment.toggleAll()) {
                    if (breakpoint.mobile) {
                        var $content = payment.virtualPageWrapper('gift-card-mod', $('.coupons-groups.last').html());
                        if (!$('#virtual-page #gift-card-form').is(':visible')) {
                            common.virtualPage.show({
                                content: $content,
                                closeSelector: '.back, .cancel-voucher',
                                callbackIn: function () {
                                    $('#main-content #gift-card-form').attr('id', 'gift-card-temp');
                                    payment.validation.giftCard();
                                },
                                callbackOut: function () {
                                    $('#main-content #gift-card-temp').attr('id', 'gift-card-form');
                                    resetForm.init($('#gift-card-form'));
                                }
                            });
                        } else {
                            $('#virtual-page').html($content);
                            $('#main-content #gift-card-form').attr('id', 'gift-card-temp');
                            payment.validation.giftCard();
                        }
                    } else {


                        $("#dg-giftCardErrMsg").html('');
                        $(".gift-card #code, .gift-card #pin").val('');


                        payment.toggleAccordion({
                            wrapper: $giftCard,
                            content: $giftCard.find('.gift-card-container'),
                            isForceOpen: isForceOpen
                        });
                    }
                }
            },

            // whats this charge function
            //----------------------------------------------------
            whatsThisChargePopup: function(e){
            	e.preventDefault();
            	if (breakpoint.mobile||breakpoint.vTablet) {
            		var $content = payment.virtualPageWrapper('whatsThisChargeMessage', $('#whatsThisChargeMessage').html());
            		common.virtualPage.show({
                        content: $content,
                        closeSelector: '.back'
                    });
            	}
            	else{
            	$(e.target).next().show();
            	}

            },
            whatsThisChargeClose: function(e){
            	e.preventDefault();
            	$(e.target).parents('#whatsThisChargeMessage').hide();

            },


            // clubcard vouchers and eCoupon functions
            // ---------------------------------------------------

            closeVouchersVirtualPage: function () {
                var $virtualPage = $('#virtual-page');

                $virtualPage.find('.back').on('tap click', function (e) {
                    e.preventDefault();

                    if (payment.isCheckBoxSelected) {
                        $(this).after('<span class="error" id="vp-voucher-error">' + $('#voucher-error').html() + '</span>');
                        return false;
                    } else {
                        $('#vp-voucher-error').remove();
                        common.virtualPage.close();
                    }
                });
            },

            toggleAddNewForm: function (e) {
                if (e && e.target) {
                    e.preventDefault();
                }

                var me = $(this);

                if (payment.isCheckBoxSelected) {
                    $('#voucher-error').show();
                    return;
                }

                if (!breakpoint.mobile) {

                    if (!$('.add-new-form').hasClass('open')) {
                        $('#ecoupon-voucher #ecoupon-voucher-form, .voucher-scroller').slideToggle();
                        $('.add-new-form').addClass('open').hide();
                        $('.button-container').hide();
                    } else {
                        $('#ecoupon-voucher #ecoupon-voucher-form, .voucher-scroller').slideToggle();
                        $('.add-new-form').removeClass('open').show();
                        $('.button-container').show();
                    }
                } else {
                    if (!$('#virtual-page .add-new-form').hasClass('open')) {
                        $('#virtual-page  #ecoupon-voucher-form, #virtual-page .voucher-scroller').slideToggle();
                        $('#virtual-page .add-new-form').addClass('open').hide();
                        $('#virtual-page .button-container,#virtual-page .runningTotal ').hide();
                    } else {
                        $('#virtual-page  #ecoupon-voucher-form,#virtual-page .voucher-scroller').slideToggle();
                        $('#virtual-page .add-new-form').removeClass('open').show();
                    }
                }
            },

            toggleAll: function () {
                var $walletWrapper = $('.wallet-wrapper');

                if (payment.isCheckBoxSelected) {
                    $('#voucher-error').show();
                    return false;
                }

                $walletWrapper.each(function () {
                    if (!$(this).hasClass('hide')) {
                        $(this).addClass('hide').parents('.coupons-groups').find('.wallet-content, .add-code').slideUp();
                    }
                });

                return true;
            },


            // toggleVouchers: function(e, forceOpen, scrollToElement, isScrollToWrapper) {
            toggleVouchers: function (e, options) {
                if (e && e.target) {
                    e.preventDefault();
                }

                var me = $(this);

                if (payment.isCheckBoxSelected) {
                    $('#voucher-error').show();
                    return;
                } else {
                    $('#voucher-error').hide();
                }

                if (breakpoint.mobile) {
                    common.virtualPage.show({
                        content: payment.virtualPageWrapper('ewallet-container', $('#ewallet-container').html()),
                        closeSelector: '.back, .cancel-voucher',
                        callbackIn: function () {
                            $('#main-content .voucher-container').removeClass('voucher-scroller');
                            payment.displayVouchers(me);
                            $('#virtual-page .voucher-container').addClass('scroller').css('height', '');
                            payment.closeVouchersVirtualPage();
                            var voucherForm = $('<div id="ecoupon-voucher" />').append($('#main-content #ecoupon-voucher-form').clone());
                            $('#virtual-page #ewallet').append(voucherForm);
                            $('#main-content #ecoupon-voucher-form').attr('id', 'ecoupon-voucher-form-tmp');
                            payment.validation.ecoupon();

                            $('#virtual-page #ecoupon-voucher-form, #virtual-page .button-container').hide();
                            $('#virtual-page .add-new-form').removeClass('open').show().wrap('<div class="add-new-form-wrapper" />');
                        },
                        callbackOut: function () {
                            $('#main-content .voucher-container').addClass('voucher-scroller');
                            $('#main-content #ecoupon-voucher-form-tmp').attr('id', 'ecoupon-voucher-form');
                            resetForm.init($('#ecoupon-voucher-form'));
                            $('#virtual-page #vp-voucher-error').remove();
                            $('.add-new-form').removeClass('open').show();
                        }
                    });
                } else {
                    var defaults = payment.accordionDefaults;
                    var opts = $.extend({}, defaults, options);
                    if (!$('#main-content .voucher-container').hasClass('voucher-scroller')) {
                        $('#main-content .voucher-container').addClass('voucher-scroller')
                    }

                    $('.vouchers .errors').append($('#ecouponVoucherErrMsg').html(''));
                    $('.vouchers #coupon-code').val('');

                    opts.wrapper = $('#ecoupon-voucher');
                    opts.content = $('#ewallet-container');
                    opts.showCallback = function () {
                        payment.displayVouchers(me);
                        //$('#ecoupon-voucher #ecoupon-voucher-form').show();
                        $('.add-new-form').removeClass('open').show();
                        $('#ecouponVoucherErrMsg').show();
                    }
                    opts.hideCallback = function () {
                        $('#ecoupon-voucher #ecoupon-voucher-form, #ecouponVoucherErrMsg').hide();
                    }


                    payment.validation.voucherSelection();

                    if ((e && $(e.target).hasClass('open-ewallet')) || opts.content.find('.error').length) {
                        opts.isForceOpen = true;
                    }
                    if (payment.toggleAll()) {
                        payment.toggleAccordion(opts);
                    }
                }
            },

            toggleCoupons: function (e, options) {
                if (e && e.target) {
                    e.preventDefault();
                }
                var me = $(this);
                if (breakpoint.mobile) {
                    common.virtualPage.show({
                        content: payment.virtualPageWrapper('ecoupon-wallet-container', $('#ecoupon-wallet-container').html()),
                        closeSelector: '.back, .cancel-voucher',
                        callbackIn: function () {
                            $('#main-content .ecoupon-container').removeClass('ecoupon-scroller');
                            payment.displayeCoupons(me);
                            //common.customCheckBox.init( $('#virtual-page') );
                            payment.closeVouchersVirtualPage();
                            var couponForm = $('<div id="ecoupon-voucher-container" />').append($('#main-content #ecoupon-voucher-form-container').clone());
                            $('#virtual-page #ecoupon-wallet').after(couponForm);
                            $('#main-content #ecoupon-voucher-form-container').attr('id', 'ecoupon-voucher-form-container-tmp');
                            payment.validation.ecoupons();

                            if (common.isAndroid()) {
                                $('#virtual-page #ecoupon-voucher-form-container #coupon-code').on({
                                    focus: function () {
                                        $('#virtual-page .ecoupon-scroller, .back').hide();
                                    },
                                    blur: function () {
                                        $('#virtual-page .ecoupon-scroller, .back').show();
                                    }
                                });
                            }
                        },
                        callbackOut: function () {
                            $('#main-content .ecoupon-container').addClass('ecoupon-scroller');
                            $('#main-content #ecoupon-voucher-form-container-tmp').attr('id', 'ecoupon-voucher-form-container');
                            resetForm.init($('#ecoupon-voucher-form-container'));
                        }
                    });
                } else {
                    var defaults = payment.accordionDefaults;
                    var opts = $.extend({}, defaults, options);
                    if (!$('#main-content .ecoupon-container').hasClass('ecoupon-scroller')) {
                        $('#main-content .ecoupon-container').addClass('ecoupon-scroller')
                    }

                    $('.ecoupons .errors').append($('#ecouponVoucherErrMsg').html(''));
                    $('.ecoupons #coupon-code').val('');

                    opts.wrapper = $('#ecoupon-voucher-container');
                    opts.content = $('#ecoupon-wallet-container');
                    opts.showCallback = function () {
                        payment.displayeCoupons(me);
                        $('#ecoupon-voucher-form-container, #ecouponVoucherErrMsg').show();
                    }
                    opts.hideCallback = function () {
                        $('#ecoupon-voucher-form-container, #ecouponVoucherErrMsg').hide();
                        resetForm.init($('#ecoupon-voucher-form-container'));
                    }

                    //payment.validation.voucherSelection();

                    if ((e && $(e.target).hasClass('open-ewallet')) || opts.content.find('.error').length) {
                        opts.isForceOpen = true;
                    }

                    if (payment.toggleAll()) {
                        payment.toggleAccordion(opts);
                    }
                }
            },

            displayVouchers: function (oElem) {
                var context = (breakpoint.mobile) ? $('#virtual-page') : $('#main-content');
                var oElem = $(oElem);
                var _request = 'selectVoucher';
                var _url = oElem.attr('data-url');
                var DL = new data.DataLayer();
                DL.get(_url, null, oElem, data.Handlers.Checkout, _request, null, null, function (result) {
                    payment.checkboxState = [];
                    common.customCheckBox.init($('#ewallet', context));
                    if ($('.voucher-scroller li', context).length) {
                        $('.voucher-scroller').show();
                        payment.scrollable(true);
                    }
                    //if(breakpoint.mobile){
                    if ($('.voucher-scroller .highlighted-view').length) {
                        var hlPos = $('.voucher-scroller .highlighted-view').position();
                        $('.voucher-scroller').scrollTop(hlPos.top);
                    }
                    //}
                });


                /*var $form = $(target).parents('form');
			var request = 'selectVoucher';
	        var url = utils.getFormAction($form);
	        var $elem = target;
	        var DL = new data.DataLayer();
	        var myData = $form.serialize();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(result) {
	        	datepicker.update(result)
	        });	*/

            },
            displayeCoupons: function (oElem) {
                var context = (breakpoint.mobile) ? $('#virtual-page') : $('#main-content');
                var oElem = $(oElem);
                var _request = 'loadEcoupon';
                var _url = oElem.attr('data-url');
                var DL = new data.DataLayer();
                DL.get(_url, null, oElem, data.Handlers.Checkout, _request, null, null, function (result) {
                    payment.checkboxState = [];
                    common.customCheckBox.init($('#ewallet', context));
                    if ($('.ecoupon-scroller li', context).length) {
                        $('.ecoupon-scroller').show();
                    }

                    if (breakpoint.mobile && $('#virtual-page .ecoupons-list').length) {
                        var isEcouponpresent;
                        $('#virtual-page .ecoupons-list').each(function () {
                            isEcouponpresent = true;
                            if (!$(this).find('li').length) {
                                $(this).remove();
                                isEcouponpresent = false;
                            }
                        });

                        if (isEcouponpresent) {
                            $('#virtual-page .ecoupon-scroller').addClass('btm-border');
                        }
                    }
                });



                /*var $form = $(target).parents('form');
			var request = 'selectVoucher';
	        var url = utils.getFormAction($form);
	        var $elem = target;
	        var DL = new data.DataLayer();
	        var myData = $form.serialize();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(result) {
	        	datepicker.update(result)
	        });	*/

            },
            checkBoxActions: function (e) {
                var context = (breakpoint.mobile) ? $('#virtual-page') : $('#main-content'),
                    $form = $(e.target).parent().find('form'),
                    request = 'selectVoucher',
                    url = utils.getFormAction($form),
                    $elem = $(e.target),
                    DL = new data.DataLayer(),
                    myData = $form.serialize(),
                    sDeliveryPrice = '';
                DL.get(url, myData, null, data.Handlers.Checkout, request, null, null, function (result) {
                    payment.checkboxState = [];
                    common.customCheckBox.init($('#ewallet', context));
                    payment.updateCta.call(e);
                    $('.delivery-options').find('h3').remove();
                    $('.delivery-cost-module').each(function() {
          						sDeliveryPrice = $(this).find('.cost-val').text();
          						if (sDeliveryPrice === '') {
          						  sDeliveryPrice = $(this).find('.value').text();
          						}
          						$(this).html('<p class="label">Delivery Cost:</p><p class="value">'+ sDeliveryPrice +'</p>');
          					});
                    require(['modules/checkout/delivery/update-options'], function (updateOptions) {
                      $('.delivery-block').each(function() {
                        updateOptions.refresh(null, $(this));
                      });
                    });
                });
            },
            storeCheckboxState: function (e, revert) {
                if (!revert) { // boolean passed by the revertChanges function
                    var index = $.inArray(this, payment.checkboxState); // .indexOf doesn't work in IE8
                    if (index === -1) {
                        payment.checkboxState.push(this);
                    } else {
                        payment.checkboxState.splice(index, 1);
                    }
                } else {
                    payment.checkboxState = [];
                }
                payment.updateCheckboxText.call(e);
                payment.updateCta.call(e);
            },

            updateCheckboxText: function () {
                var $parent = $(this.currentTarget).parents('li').toggleClass('selected');
                var message = $parent.hasClass('selected') ? 'Voucher added' : 'Voucher not added';
                $parent.find('.voucher-status').text(message);
            },

            updateCta: function () {
                var $buttons = $('.your-clubcard-vouchers input'),
                    $virtualPage = $(this.currentTarget).parents('#virtual-page');

                payment.isCheckBoxSelected = true;

                if (breakpoint.mobile) {
                    $('.button-container').show();
                } else {
                    $('.button-container').not('.first-set').show();
                }

                $('.add-new-form').hide();

                //if (payment.checkboxState.length) {
                $virtualPage.addClass('updated');
                $buttons.removeClass('disabled');
                /*} else {
					$virtualPage.removeClass('updated');
					$buttons.addClass('disabled');
				}*/
            },

            revertChanges: function (e) {
                if ($(e.target).hasClass('disabled')) {
                    return false;
                }

                payment.removeError(e);

                var checkboxStateArray = payment.checkboxState,
                    arrayLength = checkboxStateArray.length;

                for (var i = 0; i < arrayLength; i++) {
                    $(checkboxStateArray[i]).trigger('change', [true]);
                }

                /*if (breakpoint.mobile) {
					resetForm.init( $('#virtual-page form'));
				} else {
					resetForm.init( $('#ewallet'));
				}*/

                payment.checkboxState = [];
                payment.updateCta.call(e);
            },

            removeError: function () {
                $('.your-clubcard-vouchers').find('.error').remove();
            },

            goTo: function (e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                $('#ecoupon-voucher .vouchers-link').trigger('click');
            },

            goToeCoupon: function () {
                $('#ecoupon-voucher-container .ecoupon-link').trigger('click');
            },

            // for both club card vouchers and ecoupons in the ewallet
            scrollable: function (enable) {
                var wrapper = $('#ewallet');

                $('fieldset.your-clubcard-vouchers, #ecoupons', wrapper).each(function () {

                    var list = $('ul', this),
                        items = $('li', list);

                    // clear any scrolling - used for virtual pages
                    list.parents('.field-wrapper').removeClass('scroller').css('height', 'auto');

                    if (items.length > 3) {

                        // cannot get height of a child element when parent element is set to display: none, so toggling classes
                        if (!enable) {
                            $('#ewallet-container').removeClass('hidden');
                        }

                        var maxHeight = 0;
                        items.filter(':nth-child(-n+3)').each(function () {
                            maxHeight += $(this).outerHeight(true);
                        });

                        list.parents('.field-wrapper').css('height', maxHeight);

                        // check if scrolling is to be added
                        // note: enabled set to false in bindMobileEvents() so that only the reset is run
                        if (enable) {
                            list.parents('.field-wrapper').addClass('scroller');
                        } else {
                            if (!list.parents('fieldset').find('.show-more').length) {
                                //list.parents('.field-wrapper').after('<a href="" class="show-more">More</a>');
                            }
                        }
                    }

                    if (!enable) {
                        $('#ewallet-container').addClass('hidden');
                    }
                });
            },


            showHintMessaging: function ($ageConfirmationFields, $ageRestrictionHintMessaging) {
                $ageConfirmationFields.addClass('with-hint');
                $ageRestrictionHintMessaging.addClass('focussed');
            },

            hideHintMessaging: function ($ageConfirmationFields, $ageRestrictionHintMessaging) {
                if (!payment.focusInAgeConfirmationFields()) {
                    $ageConfirmationFields.removeClass('with-hint');
                    $ageRestrictionHintMessaging.removeClass('focussed');
                }
            },

            focusInAgeConfirmationFields: function () {
                if ($(document.activeElement).closest('.age-confirmation-fields').length) {
                    return true;
                }
                return false;
            }
        };

        payment.validation = {

            // on init, context is the main content wrapper - sets up the payments form for all breakpoints
            // context changes to setup the new address form in the mobile virtual page
            cardDetails: {

                // 'isNewAddress' is used to determine which form fields are required for the 'cardDetails' validation
                // state changes when the new address section is shown/hidden, and is reset on breakpoint change
                isNewAddress: false,
                isNewCard: false,

                $form: [],

                clearValidation: function () {
                    var self = payment.validation.cardDetails;
                    $fields = self.$form.find('[name=name], [name=creditCardNumber], [name=cc-exp-month], [name=cc-exp-year], [name=cc-csc]');
                    $fields.each(function (i, e) {
                        $(e).removeClass("valid");
                    });
                },

                enableSave: function () {
                    var self = payment.validation.cardDetails;
                    var $fields;
                    var $save;
                    //console.log($(document).find('[class=egaming-tc-checkbox]')[0]);
                    if (self.isNewAddress) {
                        $fields = self.$form.find('[name="nick-names"], [name="postal-code-pca"], [name="companyname"], [name="flatnumber"], [name="buildingname"]'); /* ** EPIC 2571 : Changes ** */
                        $save = self.$form.find('input.save');
                    } else if (self.isNewCard && !payment.isTotalZero) {
                        $fields = self.$form.find('[name=name], [name=creditCardNumber], [name=cc-exp-month], [name=cc-exp-year], [name=cc-csc], [name=billing-address], [name=bday-day], [name=bday-month], [name=bday-year], [name=egaming-tc-checkbox], .egaming-tc-checkbox');
                        $save = self.$form.find('input.place-order');
                        //$fields.push($(document).find('.egaming-tc-checkbox')[0]);
                    } else if (self.isNewCard && payment.isTotalZero) {
                        $fields = self.$form.find('[name=bday-day], [name=bday-month], [name=bday-year], [name=egaming-tc-checkbox], .egaming-tc-checkbox');
                        $save = self.$form.find('input.place-order');
                        //$fields.push($(document).find('.egaming-tc-checkbox')[0]);
                    } else if (!self.isNewCard && !payment.isTotalZero) {
                        $fields = self.$form.find('[name=cc-csc], [name=billing-address], [name=bday-day], [name=bday-month], [name=bday-year], [name=egaming-tc-checkbox], .egaming-tc-checkbox');
                        $save = self.$form.find('input.place-order');
                        //$fields.push($(document).find('.egaming-tc-checkbox')[0]);
                    } else {
                        $fields = self.$form.find('[name=bday-day], [name=bday-month], [name=bday-year], [name=egaming-tc-checkbox], .egaming-tc-checkbox');
                        $save = self.$form.find('input.place-order');
                        //$fields.push($(document).find('.egaming-tc-checkbox')[0]);
                    }

                    validationExtras.enableSave($fields, $save);
                },
                init: function (context, $target) {
                    var self = payment.validation.cardDetails;
                    var $toCompare = [];
                    var mapFields = ['postal-code-pca', 'companyname', 'flatnumber', 'buildingname', 'street', 'locality', 'city']; /* ** EPIC 2571 : Changes ** */

                    self.$form = $('#payment', context);
                    $("#expiry-month, #expiry-year", $('.payment-wrapper')).on("change", function () {
                        self.$form.validate().element($('#expiry-month'));
                        self.$form.validate().element($('#expiry-year'));
                        self.enableSave();
                    });

                    $("#spc-age-confirmation-module-dd, #spc-age-confirmation-module-mm, #spc-age-confirmation-module-yyyy").bind("change keyup", function () {
                        self.$form.validate().element(this);
                        self.enableSave();
                    });

                    $(payment.containerSelector).find('input[name="postal-code-pca"]').data('isAddressSelected', false); /* ** EPIC : 2571 : Changes ** */

                    // add the custom validation methods to the validation library before form validation setup
                    validationExtras.customMethods.isUnique();
                    validationExtras.customMethods.ageverification();
                    validationExtras.customMethods.checkEditableAddresses(); /* ** EPIC : 2571 : Changes ** */
                    validationExtras.customMethods.validateSpecialInvalidCharacters();

                    // locate the field to compare the new address nickname against
                    if ($target && $target.length) {
                        $toCompare = $target.parents('.billing-address');
                    } else {
                        $toCompare = self.$form;
                    }

                    //$toCompare = $toCompare.find('[name=billing-address]');
                    //$toCompare = $toCompare.find('select#billing-address');		/* ** EPIC : 2571 : Changes ** */

                    if ($('#singleAddressNickname').length) {
                        $toCompare = $toCompare.find('#singleAddressNickname');
                    } else {
                        $toCompare = $toCompare.find('select#billing-address');
                    }

                    self.$form.validate({
                        errorClass: 'error',
                        /* ** EPIC : 2571 : Changes ** */
                        validClass: 'valid',
                        /* ** EPIC : 2571 : Changes ** */
                        focusInvalid: false,
                        onkeyup: function (elm) {
                            if (this.check(elm)) {
                                $(elm).addClass('valid');
                            } else {
                                $(elm).removeClass('valid');
                            }
                            if (!$('.datepicker-wrapper .scheduleDayError').length) {
                                self.enableSave(); // save enabler must be placed after the element validation
                            }
                        },
                        onfocusout: function (elm) {
                            this.element(elm);

                            if ($('#age-restriction').length > 0) {
                                if ($('#spc-age-confirmation-module-dd').val() !== '' &&
                                    $('#spc-age-confirmation-module-mm').val() !== '' &&
                                    $('#spc-age-confirmation-module-yyyy').val() !== '') {

                                    if (!this.check($('#spc-age-confirmation-module-yyyy'))) {
                                        this.element($('#spc-age-confirmation-module-yyyy'));
                                    }
                                }
                            }

                            if (!$('.datepicker-wrapper .scheduleDayError').length) {
                                self.enableSave(); // save enabler must be placed after the element validation
                            }
                        },
                        errorElement: 'span',
                        errorPlacement: function (error, element) {
                            var name = element.prop('name');

                            if (name === 'cc-exp-month' || name === 'cc-exp-year') {
                                element = $('select[name="cc-exp-year"]').next();
                            } else if (name === 'cc-csc') {
                                element = $('.cvv-link-container');
                            }

                            switch (name) {
                            case 'bday-day':
                            case 'bday-month':
                            case 'bday-year':
                                element = $('select[name="' + name + '"]').closest('fieldset');
                                error.appendTo(element);
                                break;

                            case "nick-names":
                                error.insertBefore(element.parents('form').find("input[name='nick-names']")); /* ** EPIC : 2571 : Changes ** */
                                break;

                            case 'postal-code-pca':
                                error.insertBefore(element.parents('form').find(".pcaCapturePlusTable")); /* ** EPIC : 2571 : Changes ** */
                                break;

                            case "companyname":
                            case "flatnumber":
                            case "buildingname":
                                error.insertBefore(element.parents('form').find("input[name='companyname']")); /* ** EPIC : 2571 : Changes ** */
                                break;

                            default:
                                error.insertAfter(element);
                                break;
                            }

                        },
                        showErrors: function (errorMap, errorList) {
                            var expiryMonthName = 'cc-exp-month';
                            var expiryYearName = 'cc-exp-year';

                            if (errorMap[expiryMonthName] || errorMap[expiryYearName]) {
                                var errorIndex = 0;
                                var $expiryMonth = $('[name="' + expiryMonthName + '"]');
                                var $expiryYear = $('[name="' + expiryYearName + '"]');

                                // assume single field validation
                                if (errorList.length === 1) {

                                    // the isReady flag is used to track when the user has focused on a field - this is used to ensure that
                                    // both the month and year get touched/focused before the validation is run - stops the error message
                                    // appearing early when leaving the first field in the expiry of group
                                    errorList[0].element.isReady = true;

                                    // if either the month or year have yet to be focused on, then clear any errors and wait till the user has
                                    // attempted to complete both fields in the group first before allowing a validation message to appear
                                    if (!$expiryMonth[0].isReady || !$expiryYear[0].isReady) {
                                        this.errorList = [];
                                    }

                                    // if there is an existing error then exit to stop duplicate messages from appearing
                                    if ($('#payment .field-wrapper.expiry select.error').length > 0) {
                                        return;
                                    }
                                }

                                // assume form submission validation (all fields)
                                else {
                                    var hasMonthAndYearError = typeof errorMap[expiryMonthName] !== 'undefined' && typeof errorMap[expiryYearName] !== 'undefined';

                                    // stop duplicates being shown (clear either the month or year error message)
                                    if (hasMonthAndYearError) {
                                        for (var i = 0; i < errorList.length; i++) {
                                            var error = errorList[i];
                                            if (error.element.name === expiryMonthName) {
                                                error.message = null;
                                            }
                                        }
                                    }
                                }
                            }

                            // if mobile and the save button was pressed, scroll to the top of payemnt form so user can see errors
                            // as the payment form may not be in view when the save button is pressed
                            if (breakpoint.mobile && $(this.submitButton).hasClass('place-order')) {
                                $(document).scrollTop($('#payment').offset().top);
                            }

                            this.defaultShowErrors();
                            //var pos = $('span.error:visible').eq(0).offset();
                            //$(window).scrollTop( pos.top - 60 );
                        },
                        groups: {
                            editableAddressesError: "companyname flatnumber buildingname" /* ** EPIC : 2571 : Changes ** */
                        },
                        rules: {
                            'name': {
                                required: function () {
                                    return !self.isNewAddress && !payment.isTotalZero; // NOT new address
                                }
                            },
                            'creditCardNumber': {
                                required: function () {
                                    return !self.isNewAddress && !payment.isTotalZero; // NOT new address
                                },
                                creditcard: true,
                                minlength: 11
                            },
                            'cc-number': {
                                required: function () {
                                    return !self.isNewAddress; // NOT new address
                                },
                                creditcard: true,
                                minlength: 11
                            },
                            'cc-exp-month': {
                                required: function () {
                                    return !self.isNewAddress && !payment.isTotalZero; // NOT new address
                                }
                            },
                            'cc-exp-year': {
                                required: function () {
                                    return !self.isNewAddress && !payment.isTotalZero; // NOT new address
                                }
                            },
                            'cc-csc': {
                                required: function () {
                                    return !self.isNewAddress && !payment.isTotalZero; // NOT new address
                                },
                                number: true,
                                minlength: 3,
                                maxlength: 4
                            },
                            'billing-address': {
                                required: function () {
                                    return !self.isNewAddress && !payment.isTotalZero; // NOT new address
                                }
                            },
                            'nick-names': { /* ** EPIC 2571 : Changes ** */
                                required: function () {
                                    return self.isNewAddress; // IS new address
                                },
                                isUnique: {
                                    fieldToCompare: $toCompare
                                },
                                validateSpecialInvalidCharacters: true
                            },
                            'postal-code-pca': {
                                required: function () {
                                    return self.isNewAddress; // IS new address
                                }
                                /* ** EPIC 2571 : Changes ** */
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
                            'bday-day': {
                                required: function () {
                                    return !self.isNewAddress; // NOT new address
                                }
                            },
                            'bday-month': {
                                required: function () {
                                    return !self.isNewAddress; // NOT new address
                                }
                            },
                            'bday-year': {
                                required: function () {
                                    return !self.isNewAddress; // NOT new address
                                },
                                ageverification: true
                            },
                            'street':{
                            	validateSpecialInvalidCharacters: true
                            }

                        },
                        messages: {
                            'name': {
                                required: validationExtras.msg.nameOnCard.required
                            },
                            'creditCardNumber': {
                                required: validationExtras.msg.cardNumber.required,
                                creditcard: validationExtras.msg.cardNumber.required,
                                minlength: validationExtras.msg.cardNumber.required
                            },
                            'cc-exp-month': {
                                required: validationExtras.msg.expiryDate.required
                            },
                            'cc-exp-year': {
                                required: validationExtras.msg.expiryDate.required
                            },
                            'cc-csc': {
                                required: validationExtras.msg.securityCode.required,
                                number: validationExtras.msg.securityCode.number,
                                minlength: validationExtras.msg.securityCode.minLength,
                                maxlength: validationExtras.msg.securityCode.maxLength
                            },
                            'billing-address': {
                                required: validationExtras.msg.billingAddress.required
                            },
                            'nick-names': {
                                required: validationExtras.msg.newAddressNickname.required,
                                isUnique: validationExtras.msg.isUnique.inValid,
                                validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
                            },
                            'postal-code-pca': {
                                required: validationExtras.msg.postcode.required,
                            },
                            'address': {
                                required: validationExtras.msg.postcode.required
                            },
                            'bday-day': {
                                required: validationExtras.msg.ageverification.dayRequired
                            },
                            'bday-month': {
                                required: validationExtras.msg.ageverification.monthRequired
                            },
                            'bday-year': {
                                required: validationExtras.msg.ageverification.yearRequired,
                                ageverification: validationExtras.msg.ageverification.inValid
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
                            'street':{
                            	validateSpecialInvalidCharacters: validationExtras.msg.newAddressNickname.inValid
                            }

                        },
                        submitHandler: function (form) {

                            /* ** EPIC 2571 : Start ** */
                            var $container = $(payment.containerSelector),
                                fieldLength = mapFields.length,
                                fieldValue = '',
                                fieldNameHdn = '';

                            for (var m = 0; m < fieldLength; m++) {
                                fieldValue = $container.find('[name=' + mapFields[m] + ']').val();
                                fieldNameHdn = mapFields[m].replace(/-/g, "");
                                $container.find("#form-values-" + fieldNameHdn).val(fieldValue);
                            }
                            /* ** EPIC 2571 : End ** */

                            if (self.isNewAddress && $(this.submitButton).hasClass('save')) {
                                $('.ba-find-btn-fh').remove();
                                payment.requests.newAddress.get($('.payment-group-block #payment'));
                                self.clearValidation();
                            } else if (!$(this.submitButton).hasClass('cancel')) {
                                $('input[name=cc-csc-new]').remove();
                                form.submit();
                            }

                            return false;
                        }
                    });

                    // apply focus fix for android devices
                    validationExtras.focusoutFix(self.$form);

                    // set up max character limits
                    // validationExtras.limitCharacters( self.$form('[name=name]'), 25 );
                    validationExtras.limitCharacters(self.$form.find('[name=creditCardNumber]'), 19);
                    validationExtras.limitCharacters(self.$form.find('[name=cc-csc]'), 4);
                    validationExtras.limitCharacters(self.$form.find('[name=nickname]'), 20);

                    // check if the save should be enabled
                    self.enableSave();
                }
            },

            giftCard: function () {
                var $form = $('#gift-card-form');
                var $code = $form.find('[name=giftcardcode]');
                var $pin = $form.find('[name=giftcardpin]');

                var $submitButton = $form.find('#btn-giftcard-add');

                var isGroupInValid = function () {
                    return !$code.val().length && !$code.hasClass('valid') && !$pin.val().length && !$pin.hasClass('valid');
                };

                $form.validate({
                    focusInvalid: false,
                    onkeyup: function () {
                        if (this.check($code) && this.check($pin)) {
                            $submitButton.prop('disabled', false);
                        } else {
                            $submitButton.prop('disabled', true);
                        }
                    },
                    onfocusout: function (elm) {
                        !!elm.value && this.element(elm);
                    },
                    errorElement: 'span',
                    errorPlacement: function (error, element) {
                        error.insertAfter($pin.parents('.field-wrapper'));
                    },
                    rules: {
                        'giftcardcode': {
                            minlength:10,
                            required: true,
                            digits: true
                        },
                        'giftcardpin': {
                            required: true,
                            minlength: 4,
                            digits:true
                        }
                    },
                    messages: {
                        'giftcardcode': {
                            required: validationExtras.msg.giftCardNumber.required,
                            minlength: validationExtras.msg.giftCardNumber.required,
                            digits: validationExtras.msg.giftCardNumber.required
                        },
                        'giftcardpin': {
                            required: validationExtras.msg.giftCardPin.required,
                            minlength: validationExtras.msg.giftCardPin.required,
                            digits: validationExtras.msg.giftCardPin.required
                        }
                    },
                    errorPlacement: function (error, element) {
                        var name = element.prop('name');
                        switch (name) {
                        case "giftcardcode":
                            element.siblings('#dg-giftCardErrMsg').html(error);
                            break;
                        case "giftcardpin":
                            error.appendTo(element.parents('.field-wrapper-mini'));
                            break;
                        default:
                            error.insertAfter(element);
                            break;
                        }
                    },
                    submitHandler: function (form) {
                        payment.requests.giftCard.get(form);
                    }
                });
            },


            ecoupon: function () {
                var $form = $('#ecoupon-voucher-form');

                $form.validate({
                    submitHandler: function ($form) {
                        payment.requests.ecoupon.get($form);
                    },
                    errorElement: 'span',
                    rules: {
                        'vochercode': {
                            required: true
                        }
                    },
                    messages: {
                        'vochercode': {
                            required: validationExtras.msg.voucherCode.required
                        }
                    }
                });

                // apply focus fix for android devices
                validationExtras.focusoutFix($form);
            },
            ecoupons: function () {
                var $form = $('#ecoupon-voucher-form-container');

                $form.validate({
                    submitHandler: function ($form) {
                        payment.requests.ecoupon.updateeCoupons($form);
                    },
                    errorElement: 'span',
                    rules: {
                        'couponcode': {
                            required: true
                        }
                    },
                    messages: {
                        'couponcode': {
                            required: validationExtras.msg.couponCode.required
                        }
                    }
                });

                // apply focus fix for android devices
                validationExtras.focusoutFix($form);
            },

            voucherSelection: function (e) {
                var $header = $('.your-clubcard-vouchers h3');

                if (payment.checkboxState.length && !$header.next('.error').length) {
                    var message = 'You have made changes to your clubcard vouchers. Press the "Apply" button or cancel the changes before you return to checkout.';
                    $header.after($('<span class="error voucher-error">' + message + '</span>'));
                }
            }
        };

        payment.requests = {

            newAddress: {
                update: function (result, $target) {
                    //$target.replaceWith( result.deliveryDetails );
                    $('div.billing-address .add-new-address').each(function (i, e) {
                        if ($(this).find('.error').length) {
                            $(this).closest('.add-new-address').show();
                        }

                        // payment.initialisePCAField($(this)); /* ** EPIC 2571 : Changes ** */
                        customDropdown.init($('#payment select'));
                    });
                },

                get: function ($form) {
                    var $target;

                    if (breakpoint.mobile) {
                        $target = $form.find('.billing-address');
                        $('.payment-group-block .add-new-address').html($('#virtual-page #add-new-address form').html());
                        $('.payment-group-block .add-new-address #add-billadr-nickname').val($('#virtual-page #add-new-address form #add-billadr-nickname').val());
                        $('.payment-group-block .add-new-address #postal-code-pca').val($('#virtual-page #add-new-address form #postal-code-pca').val());
                    } else {
                        $target = $form.find('.billing-address');
                    }

                    var request = 'addNewBillAddress';
                    var $elem = $form.find('.save');
                    var url = utils.getFormAction($form);
                    var DL = new data.DataLayer();
                    var myData = $form.serialize();
                    DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (result) {
                        if (breakpoint.mobile) {
                            common.virtualPage.close(null, function () {
                                payment.validation.cardDetails.init('#wrapper');
                                payment.validation.cardDetails.isNewAddress = false;
                                payment.clearNewAddress();

                                if ($('.payment-group-block .add-new-address span.error').length) {
                                    $('.payment-group-block .add-new-address').hide();
                                    $form.find('.address-update a.new-address').trigger('click');
                                }
                            });
                            $target = $('#wrapper #payment .billing-address');
                        }
                        payment.requests.newAddress.update(result, $target);

                        if ($('.billing-address span.error').length < 1) {
                            payment.validation.cardDetails.isNewAddress = false;
                        }

                        $('.payment-wrapper', $('.checkout')).addClass('ajaxAddressAdded');

                    });
                }
            },

            giftCard: {

                update: function (result) {
                    var $giftCard = $('#gift-card');

                    //$giftCard.html( result.giftcard );
                    $giftCard.find('.delete, #dg-giftCardSummary .remove-gift-card').on('tap click', payment.requests.giftCard.get);

                    payment.validation.giftCard();
                    payment.positionTotalBlock();
                },

                get: function (e) {
                    var self = payment.requests.giftCard;
                    var $target = $(e);

                    if (e && e.target) {
                        e.preventDefault();
                        $target = $(e.target);
                    }

                    var request = 'addGiftCard';
                    var $form = $target;
                    var $elem = $('#btn-giftcard-add');
                    var url = utils.getFormAction($form);
                    var DL = new data.DataLayer();
                    var myData = $form.serialize();
                    DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (data) {
                        var hasErrors = fn.getValue(data, 'responseJSON', 'dg-giftCardErrMsg') !== '&nbsp;';

                        self.update();
                        if (!hasErrors) {
                            resetForm.init($('#gift-card-form'));
                        }
                        if (breakpoint.mobile) {
                            $('#main-content #gift-card-temp').attr('id', 'gift-card-form');
                            payment.toggleGiftCard();
                        }
                    });

                }
            },

            ecoupon: {

                updateVouchers: function (e, _request) {
                    if (e && e.target) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                    var context = (breakpoint.mobile) ? $('#virtual-page') : $('#main-content');

                    var $form = $(e.target).parents('form');
                    var request = 'addVoucher';
                    var url = utils.getFormAction($form);
                    var $elem = $(e.target);
                    var DL = new data.DataLayer();
                    var myData = $form.serialize();
                    DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (result) {
                        payment.checkboxState = [];
                        common.customCheckBox.init($('#ewallet', context));
                        var selector = '#delivery-wrapper';
                        common.customRadio(selector);
                        payment.scrollable(true);
                        $('.delivery-options').find('h3').remove();
                        payment.isCheckBoxSelected = false;

                        if (!$('.vouchers .invalid2').length) {
                            if (breakpoint.mobile) {
                                var $buttons = $('#virtual-page .button-container input');
                                $buttons.addClass('disabled');
                                $('.button-container, .running-total').hide();
                                common.virtualPage.close(null, function () {
                                    $('#main-content .voucher-container').addClass('voucher-scroller');

                                    $('.add-new-form').removeClass('open').show();
                                });
                            } else {
                                var $buttons = $('.your-clubcard-vouchers input');
                                $buttons.addClass('disabled');
                                $('.button-container').hide();
                                payment.goTo();
                            }
                        }
                    });
                },

                revertChanges: function (e) {
                    payment.removeError(e);
                    var context = (breakpoint.mobile) ? $('#virtual-page') : $('#main-content');

                    var $form = $(e.target).parents('form');
                    var request = 'selectVoucher';
                    var url = utils.getFormAction($form);
                    var $elem = $(e.target);
                    var DL = new data.DataLayer();
                    var myData = $form.serialize();
                    DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (result) {
                        var $buttons = $('.your-clubcard-vouchers input'),
                            $virtualPage = $(this.currentTarget).parents('#virtual-page');
                        payment.checkboxState = [];
                        common.customCheckBox.init($('#ewallet', context));
                        $virtualPage.removeClass('updated');
                        $buttons.addClass('disabled');
                        $('.delivery-options').find('h3').remove();
                        $('.button-container').hide();
                        $('#virtual-page .add-new-form').show();
                        $('#virtual-page #vp-voucher-error').remove();
                        payment.isCheckBoxSelected = false;
                        payment.goTo();
                        common.customRadio($('.delivery-options'));
                    });
                },

                update: function (result, context) {
                    $('#ewallet-container', context).html(result.eCouponVoucher);
                    $('#payment .total').replaceWith(result.totalCost);
                    $('.delivery-cost-module .value').replaceWith(result.deliveryCost);

                    // remove the 'Add eCoupons & Clubcard vouchers' loader
                    $('#ecoupon-voucher-form').find('.loader').remove();

                    if (!common.isTouch()) {
                        payment.scrollable(true);
                    }

                    // if there's an error, make sure the ewallet is opened then scroll to the error wrapper
                    var error = $('#ewallet fieldset.errors span.error', context);

                    if (error.length) {
                        if (breakpoint.mobile) {
                            payment.scrollTo(error);
                        } else {
                            payment.toggleVouchers(null, {
                                isForceOpen: true,
                                doScroll: false,
                                showCallback: function () {
                                    payment.scrollTo(error);
                                }
                            });
                        }
                    } else {
                        if (breakpoint.mobile) {
                            common.virtualPage.close(null, function () {
                                payment.goToLink('#total-block');
                            });
                        } else {
                            payment.toggleAccordion({
                                wrapper: $('#ecoupon-voucher', context),
                                content: $('#ewallet-container', context)
                            });
                            payment.goToLink('#total-block');
                        }
                    }

                    // payment.updateCta(); MAY BE NEEDED FOR VIRTUAL PAGE
                    payment.positionTotalBlock();
                    payment.checkboxState = [];
                    common.customCheckBox.init($('#ewallet', context));

                    $('#ewallet').find('.cancel, .update').addClass('disabled');
                },

                get: function (e) {
                    var self = payment.requests.ecoupon;
                    var message = 'Updating checkout';
                    var context = (breakpoint.mobile) ? $('#virtual-page') : $('#main-content');

                    if (e.type) {
                        e.preventDefault();
                        if ($(e.target).hasClass('disabled')) {
                            return false;
                        }
                    }
                    if (breakpoint.mobile) {
                        $('.vouchers .errors').append($('#ecouponVoucherErrMsg').html(''));
                        $('#ecouponVoucherErrMsg').show();
                    }
                    payment.removeError(e);

                    loader($('#ewallet-container', context), message);
                    loader($('#ecoupon-voucher-form'), message);
                    loader($('#payment .total'), message);
                    loader($('.delivery-cost-module .value'), '');

                    var $form = $(e);
                    var request = 'selectVoucher';
                    var url = utils.getFormAction($form);
                    var $elem = $(e.target);
                    var DL = new data.DataLayer();
                    var myData = $form.serialize();
                    DL.get(url, myData, null, data.Handlers.Checkout, request, null, null, function (result) {
                        $('#ecoupon-voucher-form, #ewallet-container, #payment .total, .delivery-cost-module .value').find('.loader').remove();
                        common.customCheckBox.init($('#ewallet', context));
                        if ($('.voucher-scroller li', context).length) {
                            $('.voucher-scroller').show();
                            payment.scrollable(true);

                            if (!$('.vouchers .error').length) {
                                payment.goTo();
                            }
                            if (breakpoint.mobile) {
                                common.virtualPage.close(null, function () {
                                    $('#main-content .voucher-container').addClass('voucher-scroller');
                                    $('#main-content #ecoupon-voucher-form-tmp').attr('id', 'ecoupon-voucher-form');

                                    if ($('.vouchers .error').length) {
                                        $('#ecoupon-voucher .vouchers-link').trigger('click');
                                    }
                                });
                            }
                        }
                    });

                },
                updateeCoupons: function (e) {
                    var self = payment.requests.ecoupon;
                    var message = 'Updating checkout';
                    var context = (breakpoint.mobile) ? $('#virtual-page') : $('#main-content');

                    if (e.type) {
                        e.preventDefault();
                        if ($(e.target).hasClass('disabled')) {
                            return false;
                        }
                    }
                    if (breakpoint.mobile) {
                        $('.ecoupons .errors').append($('#ecouponVoucherErrMsg').html(''));
                        $('#ecouponVoucherErrMsg').show();
                    }
                    payment.removeError(e);

                    loader($('#ecoupon-wallet-container', context), message);
                    loader($('#ecoupon-voucher-form-container'), message);
                    loader($('#payment .total'), message);
                    loader($('.delivery-cost-module .value'), '');

                    /*$.ajax({
						url: '/stubs/checkout/payment/ecoupon.php',
						dataType: 'json',
						type: 'GET',
						success: function(result) {
							self.update(result, context);
						}
					});*/
                    var $form = $(e);
                    var request = 'loadEcoupon';
                    var url = utils.getFormAction($form);
                    var $elem = $(e.target);
                    var DL = new data.DataLayer();
                    var myData = $form.serialize();
                    DL.get(url, myData, null, data.Handlers.Checkout, request, null, null, function (result) {
                        //self.update(result, context);
                        $('#ecoupon-voucher-form-container, #ecoupon-wallet-container, #payment .total, .delivery-cost-module .value').find('.loader').remove();
                        if ($('.ecoupon-scroller li', context).length) {
                            $('.ecoupon-scroller').show();
                        } else {
                            $('.ecoupon-scroller').hide();
                        }

                        // Reinitialise all custom radio's etc as ecoupon can return multiple delivery block modules
                        var selector = '#delivery-wrapper';
                        common.customRadio(selector);
                        common.customCheckBox.init($(selector));
                        $(selector + ' select').each(function () {
                            customDropdown.init($(this));
                        });
                        if (!$('.ecoupons .error').length) {
                            resetForm.init($('#ecoupon-voucher-form-container'));
                        }

                        if (breakpoint.mobile) {
                            common.virtualPage.close(null, function () {
                                $('#main-content .ecoupon-container').addClass('ecoupon-scroller');
                                $('#main-content #ecoupon-voucher-form-container-tmp').attr('id', 'ecoupon-voucher-form-container');

                                if ($('.ecoupons .error').length) {
                                    $('#ecoupon-voucher-container .ecoupon-link').trigger('click');
                                }
                            });

                        }
                    });

                }
            }
        };

        // bind events to the document so that we don't have to re-bind after ajax response dom injection
        payment.init = function () {
            var $ageConfirmationFields,
                $ageRestrictionHintMessaging;

            $('#payment-card select').each(function () {
                customDropdown.init($(this));
            });
            if ($('#age-restriction').length) {
                customDropdown.init($('#age-restriction select'));

                $ageConfirmationFields = $('.age-confirmation-fields'),
                $ageRestrictionHintMessaging = $('#age-restriction-hint-messaging');

                $ageConfirmationFields.on('focusin', function () {
                    payment.showHintMessaging($ageConfirmationFields, $ageRestrictionHintMessaging);
                });
                $ageConfirmationFields.on('focusout',  function () {
                    payment.hideHintMessaging($ageConfirmationFields, $ageRestrictionHintMessaging);
                });
            }

            $('#ewallet-container').css('display', 'none');

            $('#ecouponVoucherErrMsg').hide();

            if ($('.saved-card').length) {
                $('.change-card input#security-code').attr('name', 'cc-csc-new');
                $('.saved-card input#security-code').attr('name', 'cc-csc');
            } else {
                payment.validation.cardDetails.isNewCard = true;
                $('.change-card input#security-code').attr('name', 'cc-csc');
            }

            formChanged.trackChanges($('#payment'));

            // payment/card details
            $('#payment').on('submit', function (e) {
                payment.validation.voucherSelection(e);
                if (payment.checkboxState.length) {
                    e.preventDefault();
                }
            });
            $(window).resize(function () {
                if ($('.delivery-saver-message').length) {
                    $('.delivery-saver-tooltip-content.popup').css('right', '');
                    $('.delivery-saver-tooltip-content.popup').css('left', '');
                }
            });

            $(".delivery-saver-message span.help").on('click tap', function (e) {
                payment.deliverySaverPopup(e);
                return false;
            });
            $(".delivery-saver-tooltip-content .close").on('click tap', function (e) {
                payment.deliverySaverClose();
                return false;
            });
            $(document).on('change', '#payment #billing-address', payment.changeBillingAddress);
            $(document).on('click', '#payment #change-card', payment.changePaymentCard);
            $(document).on('tap click', '#payment a.new-address', payment.toggleNewAddress);
            $(document).on('focus', '#payment input[name="postal-code-pca"]', payment.clearPCAField);

            // If the save button hasn't been clicked, return
            // This is to fix the save button being enabled if a valid postcode format has been entered
            $(document).on('click', '.add-new-address input.save', function (e) {
                if (!payment.pcaAddressSelected) {
                    e.preventDefault();
                }
                //set omniture var -  US2571-40
                if (!$('.edit-da-block').is(':visible') && (!$(this).hasClass('disabled'))) {
                    var _oWebAnalytics = new analytics.WebMetrics();
                    var v = [{
                        'eVar65': 'EBA_S1',
                        'events': 'event65'
                    }];
                    _oWebAnalytics.submit(v);
                }
            });
            $(document).on('tap click', '#egaming-tc-container .checkbox', payment.eGamingTCActions);
            payment.updateExpiryMonths();
            payment.validation.cardDetails.init('#wrapper');

            // gift cards
            $(document).on('tap click', '#gift-card h3, #gift-card .cancel-voucher', payment.toggleGiftCard);

            //what's this charge
            $(document).on('tap click', '#whatsThisCharge', payment.whatsThisChargePopup);
            $(document).on('tap click', '#whatsThisChargeMessage .close', payment.whatsThisChargeClose);

            payment.overlay.init();
            //payment.toggleGiftCard();
            payment.validation.giftCard();


            // tooltip/popup for the "what's this"
            $(document).on('tap click', '.cvv span', payment.cvvPopup);
            $(document).on('tap click', '#cvv-text .close', payment.cvvClose);

            // clubcard vouchers and eCoupons
            $(document).on('tap click', '#ecoupon-voucher .vouchers-link, #ecoupon-voucher .cancel-voucher', payment.toggleVouchers);
            $(document).on('tap click', '.add-new-form', payment.toggleAddNewForm);

            $(document).on('tap click', '#ecoupon-voucher-container .ecoupon-link, #ecoupon-voucher-container .cancel-voucher', payment.toggleCoupons);
            $(document).off('change', '#ewallet input:checkbox');
            $(document).on('change', '#ewallet input:checkbox', payment.checkBoxActions);
            $(document).on('tap click', '#ewallet .update', payment.requests.ecoupon.updateVouchers);
            $(document).on('tap click', '#ecoupon-wallet .delete', function () {
                payment.requests.ecoupon.updateeCoupons($(this).parents("form"))
            });
            $(document).on('tap click', '#ewallet .cancel', payment.requests.ecoupon.revertChanges);

            $(document).on('tap click', '#ewallet .show-more', payment.showMore);

            payment.validation.ecoupon();
            payment.validation.ecoupons();
            $(document).on('tap click', '.place-order', payment.placeOrderBtnActions);


            // subtotal/total wrapper
            $(document).on('tap click', '#payment .total .open-ewallet, #Link-xvoucher', payment.goTo);
            $(document).on('tap click', '#payment #Link-eCoupon, .delivery-group-block #Link-eCoupon', payment.goToeCoupon);

            $(document).on('tap click', '#payment .total .open-giftcard', payment.toggleGiftCard);

            $(document).ajaxComplete(function () {
                //payment.validation.cardDetails.enableSave();
                payment.placeOrderBtnOnTotZero();
                payment.positionTotalBlock();

                // fix for #52706 -removing ajax loader when theres no store closeby
                if ($('#payment .total').length && $('.stores-container .error').length) {
                    $('#payment .total').find('.loader').remove();
                }

            });
        };


        breakpoint.mobileIn.push(function () {
            if (common.isPage('SPC')) {
                payment.breakpointReset();
                payment.positionTotalBlock();
                payment.bindMobileEvents();
                payment.initiateCustomDropdownDimension();
            }
        });

        breakpoint.vTabletIn.push(function () {
            if (common.isPage('SPC')) {
                payment.breakpointReset();
                payment.positionTotalBlock();
                payment.bindEvents();
                payment.initiateCustomDropdownDimension();
            }
        });

        breakpoint.hTabletIn.push(function () {
            if (common.isPage('SPC')) {
                payment.breakpointReset();
                payment.positionTotalBlock();
                payment.bindEvents();
                payment.initiateCustomDropdownDimension();
            }
        });

        breakpoint.desktopIn.push(function () {
            if (common.isPage('SPC')) {
                payment.breakpointReset();
                payment.bindEvents();
                payment.initiateCustomDropdownDimension();
            }
        });

        breakpoint.largeDesktopIn.push(function () {
            if (common.isPage('SPC')) {
                payment.breakpointReset();
                payment.bindEvents();
                payment.initiateCustomDropdownDimension();
            }
        });

        /* ** EPIC 2571 : Start ** */
        /*
		window.CapturePlusNoResults = function(uid, response){
			var self = payment.validation.cardDetails;
			var _oPCAElem = $('input[name="postal-code-pca"]');
			var _oForm = _oPCAElem.parents('form');

			_oForm.data('dirty', false);
			//_oPCAElem.attr('title',_oPCAElem.attr("placeholder")).valid();
			_oForm.validate();

			_oPCAElem.data('isAddressSelected', false).valid();

			validationExtras.enableSave(
				_oPCAElem.parents('form').find('[id=add-billadr-nickname], [id=postal-code-pca]'),
				_oPCAElem.parents('form').find('input.save')
			);

		}

		window.CapturePlusCallback = function(uid, response) {
			var self = payment.validation.cardDetails;
		    var reqFields = ['Line1','City','PostalCode','BuildingNumber','BuildingName','Type','SubBuilding','Organisation','Company','DoubleDependentLocality','DependentLocality','PrimaryStreet','SecondaryStreet'];
		    var _oPCAElem = $('input[name="postal-code-pca"]');
		    var _oForm = _oPCAElem.closest('form');

		    $.each(response, function() {
		    	if(this['FieldName'] === 'Label'){
		    		var displayAddress = this['FormattedValue'].replace(/\r?\n/g, ', ');
		    		_oPCAElem.val(displayAddress);
		    	}
		    	if($.inArray(this['FieldName'], reqFields) !== -1){
		    		_oForm.find("#form-values-"+this['FieldName']).val(this['FormattedValue']);
		    	}
		    });

			_oPCAElem.data('isAddressSelected', true).valid();

			validationExtras.enableSave(
				_oPCAElem.parents('form').find('[id=add-billadr-nickname], [id=postal-code-pca]'),
				_oPCAElem.parents('form').find('input.save')
			);

		}
		*/
        /* ** EPIC 2571 : End ** */
        return payment;

    });
