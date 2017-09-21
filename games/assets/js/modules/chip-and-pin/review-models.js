/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/review-models', ['modules/chip-and-pin/user-session', 'modules/chip-and-pin/bundles'], function (userSession, bundles) {
    'use strict';
    return {
        'pageModel': {
            'defaults': {
                'contentHeader': bundles['spc.chipAndPin.review.heading'] || 'Review your order before you pay'
            }
        },
        'reviewLayout': {
            'section': 'kiosk',
            'master': 'review',
            'templateId': 'reviewLayout',
            'placeholderClass': 'content'
        },
        'deliveryGroup': {
            'section': 'kiosk',
            'templateId': 'reviewDeliveryGroup',
            'placeholderClass': 'deliveryGroups',
            'injectType': 'append',
            'defaults': {
                'deliveryGroupId': '',
                'deliveryGroupNumber': 1,
                'deliveryGroupMessage': '',
                'soldBy': '',
                'completed': false,
                'deliveryGroupActive': false,
                'deliveryOn': ''
            }
        },
        'deliveryType': {
            'section': 'kiosk',
            'templateId': 'reviewDeliveryType',
            'placeholderClass': 'deliveryType',
            'injectType': 'append',
            'request': {
                'data': {
                    'id': 'reviewDeliveryTypeStoreCollection'
                }
            },
            'defaults': {
                'deliveryTypeOption': '',
                'storePostcode': '',
                'storeName': '',
                'storeCollectionTime': ''
            }
        },
        'customerDetails': {
            'section': 'kiosk',
            'templateId': 'reviewCustomerDetails',
            'placeholderClass': 'customerDetails',
            'defaults': {
                'title': '',
                'firstName': '',
                'lastName': '',
                'email': '',
                'contactNumber': ''
            },
            'request': {
                'data': {
                    'id': 'reviewCustomerDetails'
                }
            }
        },
        'courierInstrHolder': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'courierInstructionsList',
            'defaults': {
                'statusMessageClass': '',
                'statusMessageText': '',
                'formName_postcode': 'store-finder-postalcode',
                'listType' : 'getPostcodeAddress'
            }
        },
        'courierInstrListItems': {
            'section': 'kiosk',
            'placeholderClass': 'courierInstrListCollections',
            'templateId': 'courierInstrListItem',
            'defaults': {
                'nickName': '',
                'address': '',
                'postalCode': '',
                'notBlockedAddress': true,
                'listType' : 'getPostcodeAddress'
            },
            'collection': {
                'tagName': 'li'
            }
        },
        'updateCustomerDetails': {
            'section': 'kiosk',
            'templateId': 'user_details_form',
            'placeholderClass': 'dialog-content',
            'defaults': {
                'id': '',
                'titleLabelText': bundles['spc.chipAndPin.userDetails.titleLabelText'],
                'title': 'Title',
                'titleOptions': [{ 'label': 'Title', 'value': '' }, { 'label': 'Mr', 'value': 'Mr' }, { 'label': 'Mrs', 'value': 'Mrs' }, { 'label': 'Ms', 'value': 'Ms' }, { 'label': 'Miss', 'value': 'Miss' }],
                'firstNameLabelText': bundles['spc.chipAndPin.userDetails.firstNameLabelText'],
                'firstName': '',
                'surnameLabelText': bundles['spc.chipAndPin.userDetails.surnameLabelText'],
                'lastName': '',
                'emailLabelText': bundles['spc.chipAndPin.userDetails.emailLabelText'],
                'emailPlaceholderText': bundles['spc.chipAndPin.userDetails.emailPlaceholderText'],
                'email': '',
                'contactNumberLabelText': bundles['spc.chipAndPin.userDetails.contactNumberLabelText'],
                'contactNumberPlaceholderText': bundles['spc.chipAndPin.userDetails.contactNumberPlaceholderText'],
                'contactNumber': '',
                'formName_title': 'honorific-prefix',
                'formName_firstName': 'given-name',
                'formName_lastName': 'family-name',
                'formName_email': 'email',
                'formName_state': 'disabledField',
                'formName_contactNumber': 'tel',
                'isRegisteredUser': userSession.isRegisteredUser,
                'isAgeRestricted' : userSession.isAgeRestricted,
                'fnContinueButtonClass': 'fnUpdateDetailsButton',
                'continueBtnText': bundles['spc.chipAndPin.userDetails.continueBtnText'],
                'ageRestrictionDOBMessage': '',
                'footerMessage': ''
            }
        },
        'voucherButton': {
            'section': 'kiosk',
            'templateId': 'reviewVoucherButton',
            'placeholderClass': 'vouchersContainer',
            'collection': {
                'items': [
                    {voucherButtonClass: 'addVouchers', voucherButtonLabel: bundles['spc.chipAndPin.review.addVouchersButton'] || '[Add Clubcard Vouchers]', discountLabel: '[Clubcard voucher]'},
                    {voucherButtonClass: 'addECoupons', voucherButtonLabel: bundles['spc.chipAndPin.review.addECouponsButton'] || '[Add eCoupons]', discountLabel: '[eCoupon]'},
                    {voucherButtonClass: 'addGiftCards', voucherButtonLabel: bundles['spc.chipAndPin.review.payGiftCardButton'] || '[Pay with a Gift Card]', discountLabel: '[Gift card]'}
                ]
            },
            'defaults': {
                'voucherButtonClass': 'addVouchers',
                'voucherButtonLabel': '[Add Clubcard Vouchers]',
                'discountLabel': '[Clubcard voucher]'
            }
        },
        'paymentSummary': {
            'section': 'kiosk',
            'templateId': 'reviewPaymentSummary',
            'placeholderClass': 'paymentSummary',
            'defaults': {
                'subtotal': '',
                'excahngedVouchers': '',
                'vouchers':'',
                'totalToPayLabelText': bundles['spc.total.to.pay'] || 'Total to pay',
                'totalCost': '',
                'orderId': '',
                'payNowButtonText': bundles['spc.pay.now.buttonText'] || 'Pay now',
                'totalClubcardPointsLabelText': bundles['spc.clubcard.points'] || 'Total Clubcard points',
                'clubcardPoints': '',
                'extraClubcardPointsLabelText': bundles['spc.extra.clubcard.points'] || 'Extra Clubcard points',
                'extraClubcardPoints': '',
                'fuelSaveAmount': '',
                'staffDiscountAmount': '',
                'promotionAmount': '',
                'giftCardAmount': '',
                'voucherAmount': '',
                'exchangedVouchersAmount': '',
                'ecouponAmount': '',
                'discountTotal': '',
                'numberOfDiscountsApplied': '',
                'numberOfTypesOfDiscountApplied': '',
                'messageText': bundles['spc.chipAndPin.review.termsAndConditions.messageText'] || 'By Paying Now you are agreeing to Tesco',
                'linkText': bundles['spc.chipAndPin.review.termsAndConditions.linkText'] || 'terms and conditions'
            }
        },
        'termsAndConditionsOverlayHeader': {
            'section': 'kiosk',
            'templateId': 'termsAndConditionsOverlayHeader',
            'placeholderClass': 'dialog-header',
            'defaults': {
                'overlayHeader': bundles['spc.chipAndPin.review.termsAndConditions.headerText'] || 'Terms and Conditions'
            }
        },
        'termsAndConditionsOverlayContent': {
            'section': 'kiosk',
            'templateId': 'termsAndConditionsOverlayContent',
            'placeholderClass': 'dialog-content',
            'defaults': {
                'overlayContent': 'default-content'
            }
        },
        'termsAndConditionsOverlayFooter': {
            'section': 'kiosk',
            'templateId': 'termsAndConditionsOverlayFooter',
            'placeholderClass': 'dialog-footer',
            'defaults': {
                'overlayBtnRequest': 'default-request',
                'overlayBtnText': bundles['spc.chipAndPin.review.privacyPolicy.btnText'] || 'Privacy and cookies policy',
                'overlayCloseBtnText': bundles['spc.chipAndPin.review.termsAndConditions.closeBtnText'] || 'Close'
            }
        },
        'whatsThisChargeOverlayHeader': {
            'section': 'kiosk',
            'templateId': 'whatsThisChargeOverlayHeader',
            'placeholderClass': 'dialog-header',
            'defaults': {
                'overlayHeader': 'default-content'
            }
        },
        'whatsThisChargeOverlayContent': {
        	'section': 'kiosk',
            'templateId': 'whatsThisChargeOverlayContent',
            'placeholderClass': 'dialog-content',
            'defaults': {
                'overlayContent': 'default-content'
            }
        }

    };
});
