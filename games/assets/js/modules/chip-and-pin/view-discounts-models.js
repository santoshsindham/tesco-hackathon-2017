/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/view-discounts-models', ['modules/chip-and-pin/bundles'], function (bundles) {
    'use strict';
    return {
        'pageModel': {
            'defaults': {}
        },

        'viewDiscountsModalHeader': {
            'section': 'kiosk',
            'templateId': 'viewDiscountsModalHeader',
            'placeholderClass': 'dialog-header',
            'defaults': {
                'heading': bundles['spc.chipAndPin.discounts.viewDiscountsListHeading']
            }
        },

        'viewDiscountsWalletModalContent': {
            'section': 'kiosk',
            'templateId': 'viewDiscountsWalletModalContent',
            'placeholderClass': 'dialog-content',
            'defaults': {}
        },

        'viewDiscountsListItems': {
            'section': 'kiosk',
            'templateId': 'viewDiscountsListItem',
            'placeholderClass': 'viewDiscountsList',
            'target': 'dialog-content',
            'collection': {
                'tagName': 'li'
            },
            'defaults': {
                'discountValue': '',
                'discountType': ''
            }
        },

        'viewDiscountsWalletModalFooter': {
            'section': 'kiosk',
            'templateId': 'viewDiscountsWalletModalFooter',
            'placeholderClass': 'dialog-footer',
            'defaults': {}
        }
    };
});