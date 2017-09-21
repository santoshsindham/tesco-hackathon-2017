define(['domlib', 'modules/common', 'modules/breakpoint', './delivery', './payment', 'modules/integrated-registration/common', 'modules/checkout/delivery/delivery-options-list', 'modules/validation', 'placeholder', 'modules/tesco.utils', 'modules/tesco.data', 'modules/textbox-session-storage/common', './gift-message', 'modules/overlay/common'
], function ($, common, breakpoint, delivery, payment, integratedRegistration, deliveryOptionsList, validationExtras, placeholder, utils, data, textboxSessionStorage, giftMessage, overlay) {

	var checkout = {

		el: '#wrapper.checkout',

		init: function (bFromIR) {
			checkout.el = $(checkout.el);

			if (checkout.el.length) {
				if (bFromIR) {
					$(checkout.el).removeClass('irSPC');
					//checkout.initBindings();
					checkout.setupSPCAfterIR();
					if ($('.personal-gift-message-wrapper').length) {
						textboxSessionStorage.init('.uiGiftMessage textarea');
					}
				} else {
					/*
					 * Native 4.1.1 Android browser has issue with tabindex on inserted DOM elements and when pressing
					 * "next or "prev" in the on-screen keyboard, it is "clicking" the home page link at the top of the page, this method is a workaround to
					 * stop this as we cannot control the behaviour of the browser, issue was fixed in 4.1.2 browser.
					 */
					if (common.isNativeAndroidBrowserForFourPointOne()) {
						/*
						 * binding to touchstart as the browser is triggering a native "click" on the element and the event
						 * does not have anything unique to it to differentiate from a user invoked click from an artificial one.
						 */
						$('#branding').data('oldRef', $('#branding').attr('href')).attr('href', '#').on('touchstart', function () {
							window.location = $(this).data('oldRef');
							return;
						});
					}
					delivery.clubcardBoostInfo();
					checkout.initFramework();
					if ($('#lazyLoadURL').length && !$('#integrated-registration').length) {
						checkout.getInitialDeliveryGroups();
					} else {
						checkout.initBindings();
						if (!$('#integrated-registration').length) {
							delivery.getInitialDeliveryDetails();
						}
					}
					giftMessage.init();
					if ($('.personal-gift-message-wrapper').length) {
						textboxSessionStorage.init('.uiGiftMessage textarea');
					}
				}

				$('#progress-bar li.done a').click(function () {
					if ($('.personalGiftMessage').length) {
    				    if ($('.personalGiftMessage').val() !== "") {
    						textboxSessionStorage.save();

    					}
				    }
				});

			}
			//removed
		},
		setupSPCAfterIR: function () {
			var $form = $('<form/>'),
				sRequest = 'setupSPCAfterIR',
				sUrl = $("#lazyLoadURL").attr('data-url') + '?fromIR=true',
				$elem = $form,
				DL = new data.DataLayer({
					singleton: true
				}),
				myData = {};

			DL.get(sUrl, null, null, data.Handlers.Checkout, sRequest, null, null, function (result) {
				$('.loader').remove();
				$('body').css('position', 'static');
				if ($('.registered').length) {
					$('.checkout').removeClass('registered');
					integratedRegistration.aboutYouComplete();
					validationExtras.scrollToError($('#about-you-complete'));
				}
				$('.irspc-delivery-options').addClass('delivery-options').removeClass('irspc-delivery-options');
				checkout.initBindings();
				delivery.getInitialDeliveryDetails(true);

			});

		},
		initBindings: function () {
			//initiate collect module
			// Only init when it is on the page, as the checkout is lazy loaded, we need to be re-init without any other issues.
			if (!integratedRegistration.initialised) {
				integratedRegistration.init();
			}
			if ($('.shipping-group-form').length) {
				//init custom radio buttons!
				common.customRadio('.checkout');

				if ($('.personal-gift-message-wrapper').length) {
					textboxSessionStorage.init('.uiGiftMessage textarea');
				}
				if (!$('#integrated-registration').length) {
					delivery.init();
					payment.init();

					// $('[placeholder]').placeholder({ inputWrapper: '<span class="placeholder" />' });
					// had to use a different element for the placeholder - couldn't locate the issue with
					// using the span after the placeholder hides the span - it was still set to be visible
					// can't setup placeholders on elements that are hidden - won't be able to retrieve widths
					$('[placeholder]').each(function () {
						if (!$(this).parents('.add-new-address, .new-address').length && this.defaultValue === "") {
							$(this).placeholder({
								inputWrapper: '<div class="placeholder" />'
							});
						}
					});

					// bind change event to update address for show-address
					$(document).on('change', '.show-address select', checkout.displayAddress);
				} else {
					$(document).on('click', '.delivery-type .tabs input[type="radio"]', delivery.changeDeliveryType);
					deliveryOptionsList.init();
					giftMessage.init();
				}
			}

		},

		getInitialDeliveryGroups: function () {
			var request = 'getInitialDeliveryOptions';
			var url = $("#lazyLoadURL").attr('data-url');
			var DL = new data.DataLayer({
				singleton: true
			});
			if (url !== undefined) {
				DL.get(url, null, null, data.Handlers.Checkout, request, null, null, function (oResp, oElem) {
					checkout.initBindings();
					delivery.getInitialDeliveryDetails();
					//TESCO.Checkout.lazyLoadedBindings();
				});
			} else {
				//_pageReload = true;
				checkout.initBindings();
				delivery.getInitialDeliveryDetails();
			}
		},

		displayAddress: function (e) {
			var dataValue = '',
				textValue = '',
				$currentTarget = $(e.currentTarget);
			if (e.currentTarget.tagName === 'SELECT') {
				dataValue = $currentTarget.find('option:selected').data('other');
			} else {
				dataValue = $currentTarget.find('a').data('other');
			}
			textValue = $currentTarget.find('option:selected').text();
			$currentTarget.next().find('.innerText').text(textValue);
			$currentTarget.parents('.show-address').find('.address-details').text(dataValue);
		},
		initFramework: function () {
			// Generic initialisation of Ajax framework
			var _myInlineRequests = ['getStoreDetails', 'saveCourierInstruction'];

			var _myRequests = {
				'selectDeliveryMethodStore': ['deliveryOptionsAll', 'deliveryCostAll', 'deliveryStoreOptions', 'collectionDetails', 'deliveryCost', 'totalCost', 'loadBCVEBlock', 'loadBCVEInfo'],
				'selectDeliveryMethodHome': ['deliveryOptionsAll', 'deliveryDetails', 'deliveryCostAll', 'totalCost', 'loadBCVEBlock', 'loadBCVEInfo'],
				'selectDeliveryOptionStore': ['deliveryOptionsAll', 'deliveryCostAll', 'totalCost', 'loadBCVEBlock', 'loadBCVEInfo', 'storeCollectionTime'],
				'selectDeliveryOptionHome': ['deliveryOptionsAll', 'deliveryCostAll', 'totalCost', 'loadBCVEBlock', 'loadBCVEInfo', 'lockersAvailability'],
				'selectDeliveryOptionHomeDBT': ['deliveryOptionsAll','deliveryAddressDetails', 'deliveryCostAll', 'totalCost', 'loadBCVEBlock', 'loadBCVEInfo', 'lockersAvailability'],
				'storeSearch': ['searchStore', 'deliveryCost', 'totalCost'],
				'selectStoreOption': [],
				'selectSlots': ['deliveryOptions'],
				'updateCollection': ['collectionDetails'],
				'addGiftCard': ['giftCard', 'totalCost'],
				'removeGiftCard': ['giftCard', 'totalCost'],
				'addCouponVoucher': ['deliveryOptionsAll', 'deliveryCost', 'totalCost', 'eCouponVoucher', 'productCostModule'],
				'removeVoucher': ['deliveryGroups', 'totalCost'],
				'splitDeliveryGroups': ['deliveryGroups', 'totalCost', 'loadBCVEBlock', 'loadBCVEInfo'],
				'addDeliveryAddress': ['deliveryGroups', 'paymentCard', 'totalCost'],
				'getStoreDetails': ['storeDetails'],
				'saveDeliveryRecipient': ['recipientDetails'],
				'saveCourierInstruction': ['courierInstruction'],
				'selectDeliveryAddress': ['deliveryOptions', 'deliveryDetails', 'deliveryCost', 'totalCost', 'paymentCard'],
				'updateCollectionTime': ['storeCollectionTime', 'deliveryCost', 'totalCost', 'collectionReminder'],
				'getInitialDeliveryOptions': ['initialDeliveryGroups', 'loadBCVEBlock', 'loadBCVEInfo'],
				'saveCollectionRecipient': ['recipientDetails'],
				'findNewAddress': ['findAddress'],
				'loadVoucher': ['addDelVoucherDetails'],
				'addNewAddress': ['deliveryGroups', 'totalCost', 'billAddress'],
				'changeNewAddress': ['deliveryGroups', 'totalCost'],
				'findNewBillAddress': ['findBillingAddress'],
				'addNewBillAddress': ['newBillingAddress'],
				'loadBCVEVoucher': ['loadBCVEBlock', 'loadBCVEInfo'],
				'loadBCVE': ['loadBCVEBlock', 'loadBCVEInfo'],
				'loadBCVEInfoBlock': ['loadBCVEInfo'],
				'cancelBCVE': ['loadBCVEBlockCancel', 'loadBCVEInfoCancel'],
				'updateCoupon': ['loadBCVEBlock', 'totalCost', 'productCostModule', 'loadBCVEInfo'],
				'loadBCVEForm': ['loadBCVEContainer'],

				'updateECoupon': ['ecouponContainer', 'totalCost', 'productCostModule'],
				'addeCoupon': ['deliveryOptionsAll', 'deliveryCost', 'totalCost', 'ecouponContainer', 'productCostModule'],
				'addVoucher': ['deliveryOptionsAll', 'deliveryCost', 'totalCost', 'voucherContainer', 'productCostModule'],
				'selectVoucher': ['voucherScroller'],
				'loadEcoupon': ['ecouponScroller'],
				'updateVoucher': ['voucherScroller', 'totalCost', 'productCostModule'],
				'setupSPCAfterIR': ['paymentCard'],
				'selectDeliveryMethodStoreIR': ['deliveryOptionsAll', 'deliveryCostAll', 'deliveryStoreOptions', 'collectionDetails', 'deliveryCost', 'totalCost'],
				'selectDeliveryMethodHomeIR': ['deliveryOptionsAll', 'deliveryStoreOptions', 'deliveryDetails', 'deliveryCostAll', 'totalCost'],
				'selectStoreOptionLockersOn': ['storesContainer', 'moreStores', 'loadBCVEInfo'],
				'searchForStoresLockersOn': ['moreStores'],
				'searchForLockers': ['moreLockers'],
				'selectDeliveryMethodLocker': ['deliveryLockerOptions', 'moreLockers', 'deliveryCostAll', 'totalCost', 'collectionReminder', 'storeCollectionTime'],
				'changeGrocerySlot': ['groceryAddress'],
				'selectRecipientFlowers': ['flowersNewRecipient'],
				'saveNewRecipient': ['flowersNewRecipient', 'flowersDeliverySlotSelection'],
				'saveFlowersRecipient': ['flowersRecipientSection', 'flowersDeliverySlotSelection'],
				'selectPreferredStore': ['preferredStore']
			};
			var _myModules = {
				'deliveryCost': ['div.delivery-cost-module', '', false],
				'productCostModule': ['div.product-cost-module', 'Retrieving the product cost', true],
				'deliveryCostAll': ['div.delivery-cost-module', '', true],
				'totalCost': ['#totalCost', '', true],
				'deliveryStoreOptions': ['.store-options-module', 'Searching for your nearest store', false],
				'deliveryOptions': ['div.delivery-options', 'Searching for the best delivery option', false, false, true],
				'deliveryOptionsAll': ['.delivery-options', 'Searching for the best delivery option', true],
				'deliveryAddressDetails': ['.dg-d-details.collection-details', 'Updating your delivery details', true],
				'collectionDetails': ['div.dg-d-details', 'Searching for your collection details', false],
				'deliveryDetails': ['div.dg-d-details', 'Searching for your delivery details', false],
				'recipientDetails': ['.recipientDetails', 'Updating your contact details', false],
				'deliveryGroups': ['#delivery-wrapper', 'Updating the checkout', true],
				'loadBCVEBlock': ['div#bcve-ecoupon-voucher-details', 'Updating your voucher details'],
				'loadBCVEBlockCancel': ['div#bcve-ecoupon-voucher-details', 'Updating your voucher details', '', true],
				'loadBCVEInfo': ['p.bcve-block-text', 'Updating message', true],
				'loadBCVEInfoCancel': ['p.bcve-block-text', 'Updating message', '', true],
				'initialDeliveryGroups': ['.temp-spinny', 'Searching for the best delivery option', true],
				'paymentCard': ['.payment-group-block', 'Loading payment details', false],
				'storeDetails': ['div.store-details-holder', 'Getting store information', false],
				'searchStore': ['div.store-search-form', 'Finding your nearest stores', false],
				'storeCollectionTime': ['.collection-time', 'Searching for your collection time', false],
				'eCouponVoucherDetails': ['div#ecoupon-voucher-details', '', true],
				'eCouponVoucher': ['#ecouponVoucherErrMsg', '', true],
				'findAddress': ['div.edit-da-block', 'Finding your address', false],
				'findBillingAddress': ['fieldset.edit-bill-adr-block .add-bill-adr-street-dd', 'Finding your address', true],
				'newBillingAddress': ['#payment .billing-address', 'Adding new address', true],
				'courierInstruction': ['div.edit-courier-instructions', 'Updating Courier Instruction', false],
				'addDelVoucherDetails': ['div#ecoupon-voucher-details .jt-tooltip-content', 'Loading eCoupon/Voucher details', true],
				'billAddress': ['div.billing-address', 'Updating Address', true],
				'giftCard': ['.gift-card-container', '', true],
				'loadBCVEContainer': ['div.bcve-container', 'Loading Ewallet', true],
				'ecouponContainer': ['#bcve-ecoupon .accordian-content', 'Updating eWallet', true],
				'voucherContainer': ['#bcve-voucher .accordian-content', 'Updating eWallet', true],
				'ecouponScroller': ['.ecoupon-scroller', '', true],
				'voucherScroller': ['.your-clubcard-vouchers .voucher-scroller', 'Updating eWallet', true, { "ajaxLoader": function() {
                    require(['modules/checkout/loader'], function (loader) {
                        loader(".clubcard-vouchers", 'Updating eWallet');
                    });
                }}],
				'ecouponErrorContainer': ['#ecouponErrorContainer', '', true],
				'voucherErrorContainer': ['#voucherErrorContainer', '', true],
				'displayEcouponUsedNumbers': ['.ecoupon-link #displayEcouponUsedNumbers', '', true],
				'voucherHeader': ['.vouchers h3', '', true],
				'voucherSubHeader': ['#bcve-voucher .accordian-header-info', '', true],
				'runningTotal': ['.running-total', '', true],
				'couponType': ['#couponTypeContainer', '', true],
				'loadBCVEFlags': ['#loadBCVEFlags', '', true],
				'IRSPCOptions': ['.irspc-delivery-options', '', false],
				'deliveryLockerOptions': ['.js-locker-collection', 'Searching for your nearest lockers', false],
				'moreLockers': ['.more-lockers-holder', '', true],
				'moreStores': ['.more-stores-holder', '', true],
				'storesContainer': ['.stores-container', 'Searching for your nearest stores', true],
				'collectionReminder': ['.collection-reminder', '', false],
				'lockersAvailability': [],
				'collectionDetails': ['.collection-details', '', false],
				'groceryAddress': ['.groceryDelivery', '', false],
				'flowersNewRecipient': ['.new-recipient', '', false],
				'flowersDeliverySlotSelection': ['.flowers-pick-date .datepicker-tooltip-module', '', false],
				'flowersRecipientSection': ['.flowers-new-recipient', '', false],
				'preferredStore': ['#dg-1 .store-options-module ul', '', false],
			};

			// This will be produced/generated from the server side. If this object does not exist, it will default to _myDefaultActions
			var _myActions = {
				'selectDeliveryMethod': ['/stubs/select-delivery-method.php'],
				'selectDeliveryOption': ['/stubs/select-delivery-option.php'],
				'selectStoreOption': ['/stubs/select-store-option.php'],
				'getInitialDeliveryOptions': ['/stubs/get-initial-delivery-options.php'],
				'getStoreDetails': ['/stubs/store-details.php'],
				'removeGiftCard': [''],
				'addCouponVoucher': ['/stubs/add-ecoupon-voucher.php'],
				'removeVoucher': [''],
				'splitDeliveryGroups': [''],
				'addDeliveryAddress': [''],
				'saveDeliveryRecipient': ['/stubs/save-delivery-recipient.php'],
				'saveCourierInstruction': ['/stubs/save-courier-instruction.php'],
				'saveCollectionRecipient': ['/stubs/save-collection-recipient.php'],
				'selectDeliveryAddress': [''],
				'updateCollectionTime': ['/stubs/get-store-collection-time.php'],
				'selectDeliveryAddress': ['/stubs/select-delivery-address.php'],
				'addNewAddres': ['/stubs/add-new-address.php'],
				'addGiftCard': ['/stubs/add-giftcard.php'],
				'loadBCVE': ['/stubs/stored_bcve_details.php'],
				'loadBCVEVoucher': ['/stubs/stored_bcve_details_eCoupon.php'],
				'updateCoupon': ['/stubs/update-ecoupon.php'],
				'updateECoupon': ['/stubs/update-ecoupon.php'],
				'addeCoupon': ['/stubs/update-ecoupon.php'],
				'selectVoucher': ['/stubs/stored_bcve_details_ecoupon.php'],
				'updateVoucher': ['/stubs/stored_bcve_details_ecoupon.php'],
				'addVoucher': ['/stubs/stored_bcve_details_ecoupon.php'],
				'setupSPCAfterIR_integrated': ['/stubs/checkout/initAfterIR.php'],
				'selectDeliveryMethodHome': ['/stubs/checkout/homedelivery.php'],
				'selectDeliveryMethodStore': ['/stubs/checkout/storeDetails.php']
			};

			// This will be present in the JS file as it holds the default values for this specific functionailty/module i.e. Checkout
			var _myDefaultActions = {
				'selectDeliveryMethod': ['/stubs/select-delivery-method.php'],
				'selectDeliveryOption': ['/stubs/select-delivery-option.php'],
				'selectStoreOption': ['/stubs/select-store-option.php'],
				'getInitialDeliveryOptions': ['/stubs/get-initial-delivery-options.php'],
				'getStoreDetails': ['/stubs/store-details.php'],
				'removeGiftCard': [''],
				'addCouponVoucher': ['/stubs/add-ecoupon-voucher.php'],
				'removeVoucher': [''],
				'splitDeliveryGroups': [''],
				'addDeliveryAddress': [''],
				'saveDeliveryRecipient': ['/stubs/save-delivery-recipient.php'],
				'saveCourierInstruction': ['/stubs/save-courier-instruction.php'],
				'saveCollectionRecipient': ['/stubs/save-collection-recipient.php'],
				'selectDeliveryAddress': [''],
				'updateCollectionTime': ['/stubs/get-store-collection-time.php'],
				'selectDeliveryAddress': ['/stubs/select-delivery-address.php'],
				'addNewAddres': ['/stubs/add-new-address.php'],
				'addGiftCard': ['/stubs/add-giftcard.php'],
				'loadVoucher': ['/stubs/stored_eCoupon_voucher.php'],
				'loadBCVE': ['/stubs/stored_bcve_details.php'],
				'loadBCVEVoucher': ['/stubs/stored_bcve_details_eCoupon.php'],
				'updateCoupon': ['/stubs/update-ecoupon.php'],
				'selectDeliveryMethodStoreIR': ['/stubs/checkout/storeDetailsIR.php'],
				'selectDeliveryMethodHomeIR': ['/stubs/checkout/homeDeliveryIR.php'],
				'selectDeliveryMethodLocker': ['/stubs/checkout/lockerDetails.php'],
				'setupSPCAfterIR': ['/stubs/checkout/initAfterIR.php']
			};

			var _myTimeout = 60000;
			//Set timeout on Ajax requests from backend.
			if ($('#ajaxTimeout').length) {
				_myTimeout = $('#ajaxTimeout').data('timeout');
			}

			data.Global.init({
				'inlineRequests': _myInlineRequests,
				'requests': _myRequests,
				'modules': _myModules,
				'actions': _myActions,
				'defaultActions': _myDefaultActions,
				'timeout': _myTimeout
			});

		}

	};

	common.init.push(checkout.init);

	return checkout;

});
