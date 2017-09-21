/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/eCoupon-models', ['modules/chip-and-pin/bundles'], function (bundles) {
    'use strict';
    return {
        'pageModel': {
            'defaults': {}
        },

        'eCouponModalHeader': {
            'section': 'kiosk',
            'templateId': 'eCouponModalHeader',
            'placeholderClass': 'dialog-header',
            'defaults': {
                'heading': bundles['spc.chipAndPin.eCoupon.addECouponHeading']
            }
        },

        'eCouponEntryForm': {
            'section': 'kiosk',
            'templateId': 'eCouponEntryModalContent',
            'placeholderClass': 'dialog-content',
            'defaults': {
                'formName_eCouponEntry': 'txt-eCoupon',
                'textboxPlaceholderText': 'Enter the eCoupon code exactly as it appears - including hyphens',
                'statusMessageClass': '',
                'statusMessageText': '',
                'atgData_addCoupon': ''
            }
        },

        'eCouponEntryCodes': {
            'expired': '1X2F-1114-CSFRE-DSTAW',
            'invalid': '14337D4-XXZZYY-RAVED698',
            'alreadyUsed': '10110XXZZ-1SHUYT67Z-DAHDU',
            'linkedToAnotherAccount': 'TSRX-0954-QWER-BAUER',
            'adddedToAnotherAccount': '0CS3T-2014-T00Z-4678',
            'notFirstTimeShopper': '007-0CS3T-ZXY-HAT5T',
            'validCoupon': 'XXX-007-ERT-429',
            'unspecifiedError': 'XXXX-XXXX-UUUU'
        },

        'eCouponWalletModalContent': {
            'section': 'kiosk',
            'templateId': 'eCouponWalletModalContent',
            'placeholderClass': 'dialog-content',
            'defaults': {}
        },

        'eCouponListItems': {
            'section': 'kiosk',
            'templateId': 'eCouponListItem',
            'placeholderClass': 'eCouponList',
            'target': 'dialog-content',
            'collection': {
                'tagName': 'li'
            }
        },

        'eCouponModalFooter': {
            'section': 'kiosk',
            'templateId': 'eCouponModalFooter',
            'placeholderClass': 'dialog-footer',
            'defaults': {}
        },

        'eCouponWalletModalFooter': {
            'section': 'kiosk',
            'templateId': 'eCouponWalletModalFooter',
            'placeholderClass': 'dialog-footer',
            'defaults': {}
        }
    };
});