/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/payment-models', function () {
    'use strict';
    return {
        'pageModel': {
            'defaults': {
                'contentHeader': 'Chip and PIN Payment Section'
            }
        },
        'paymentLayout': {
            'section': 'kiosk',
            'master': 'payment',
            'templateId': 'paymentLayout',
            'placeholderClass': 'content',
            'defaults': {
                'paymentFormAction' : '',
                'paymentInstructionsMessage': 'Insert your card in the<br/><strong>Chip and PIN</strong> reader to pay',
                'paymentCardsMessage': 'Pay for your item(s) with'
            }
        }
    };
});