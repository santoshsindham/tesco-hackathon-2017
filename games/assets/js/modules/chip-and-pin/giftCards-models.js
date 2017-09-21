/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/giftCards-models', ['modules/chip-and-pin/bundles'], function (bundles) {
    'use strict';
    return {
        'pageModel': {
            'defaults': {}
        },

        'giftCardsModalHeader': {
            'section': 'kiosk',
            'templateId': 'giftCardsModalHeader',
            'placeholderClass': 'dialog-header',
            'defaults': {
                'heading': bundles['spc.chipAndPin.giftCards.addGiftCardsHeading']
            }
        },

        'giftCardsEntryForm': {
            'section': 'kiosk',
            'templateId': 'giftCardsEntryModalContent',
            'placeholderClass': 'dialog-content',
            'defaults': {
                'formName_giftCardCode': 'txt-giftCardCode',
                'giftCardsPlaceholderText': 'Enter code',
                'formName_giftCardPin': 'txt-giftCardPin',
                'giftCardsPINPlaceholderText': 'Enter PIN',
                'statusMessageClass': '',
                'statusMessageText': '',
                'atgData_addCoupon': ''
            }
        },

        'giftCardsEntryCodes': {
            'valid1': 'success-1',
            'valid2': 'success-2',
            'valid3': 'success-3',
            'valid4': 'success-4',
            'invalid': 'invalid-code-132131',
            'noBalance': 'nobalance',
            'expired': 'expired',
            'validPin': '0',
            'invalidPin': '1234'
        },

        'giftCardsWalletModalContent': {
            'section': 'kiosk',
            'templateId': 'giftCardsWalletModalContent',
            'placeholderClass': 'dialog-content',
            'defaults': {}
        },

        'giftCardsListItems': {
            'section': 'kiosk',
            'templateId': 'giftCardsListItem',
            'placeholderClass': 'giftCardsList',
            'target': 'dialog-content',
            'collection': {
                'tagName': 'li'
            }
        },

        'giftCardsModalFooter': {
            'section': 'kiosk',
            'templateId': 'giftCardsModalFooter',
            'placeholderClass': 'dialog-footer',
            'defaults': {}
        },

        'giftCardsWalletModalFooter': {
            'section': 'kiosk',
            'templateId': 'giftCardsWalletModalFooter',
            'placeholderClass': 'dialog-footer',
            'defaults': {}
        }
    };
});