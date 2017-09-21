/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/voucher-models', ['modules/chip-and-pin/bundles'], function (bundles) {
    'use strict';
    return {
        'pageModel': {
            'defaults': {
                'contentHeader': bundles['spc.chipAndPin.vouchers.AddClubcardVouchersTitleBeggining'] || 'Add your Clubcard Vouchers'
            }
        },
        'voucherOverlayLayout': {
            'section': 'kiosk',
            'templateId': 'voucherOverlayLayout',
            'placeholderClass': 'kiosk-lightbox',
            'defaults': {
                'overlayHeader': bundles['spc.chipAndPin.vouchers.addClubcardVouchersTitleBeggining'] || 'Add your Clubcard Vouchers'
            }
        },
        'voucherItem': {
            'section': 'kiosk',
            'templateId': 'voucherItem',
            'placeholderClass': 'voucherItems',
            'collection': {
                'tagName': 'li'
            },
            /*'request': {
                'data': {
                    'id': 'getVoucherItems'
                }
            },*/
            'defaults': {
                'voucherID': null,
                'voucherSelected': false,
                'voucherMessage': '',
                'voucherStatus': 'Voucher is selected',
                'voucherAmount': 0,
                'voucherCode': '',
                'expiryDate': '',
                'atgData': '',
                'expiryText': bundles['spc.chipAndPin.vouchers.voucherItemExpiryText'] || 'expires',
                'screenOneStatusMessage': ''
            }
        },
        'voucherFooter': {
            'section': 'kiosk',
            'templateId': 'voucherFooter',
            'placeholderClass': 'footerContainer',
            'defaults': {
                'buttonIHaveAVoucherCode': bundles['spc.chipAndPin.vouchers.footerButtonIHaveAVoucherCode'] || 'I have a voucher code',
                'textSelected': bundles['spc.chipAndPin.vouchers.footerTextSelected'] || 'selected',
                'buttonAdd': bundles['spc.chipAndPin.vouchers.footerButtonAdd'] || 'Update',
                'buttonCancel': bundles['spc.chipAndPin.vouchers.footerButtonCancel'] || 'Cancel all'

            }
        },

        'voucherEntryFooter': {
            'section': 'kiosk',
            'templateId': 'voucherEntryFooter',
            'placeholderClass': 'footerContainer',
            'defaults': {
                'buttonCancel': bundles['spc.chipAndPin.vouchers.entryFooterButtonCancel'] || 'Cancel'
            }
        },

        'voucherCodeOverlayLayout': {
            'section': 'kiosk',
            'templateId': 'voucherCodeOverlayLayout',
            'placeholderClass': 'kiosk-lightbox',
            'defaults': {
                'overlayHeader': bundles['spc.chipAndPin.vouchers.addVoucherHeading'] || 'Add a Clubcard voucher code',
                'overlayIntro': bundles['spc.chipAndPin.vouchers.addVoucherIntro'] || 'Clubcard is our way of saying thank you.',
                'overlayLabel': bundles['spc.chipAndPin.vouchers.addVoucherLabel'] || 'Enter the voucher code exactly as it appears - including any spaces',
                'buttonAdd': bundles['spc.chipAndPin.vouchers.buttonAdd'] || 'Add',
                'overlayPlaceholder': bundles['spc.chipAndPin.vouchers.addVoucherPlaceholder'] || '',
                'screenTwoStatusMessage': '',
                'statusMessageClass': '',
                'statusMessageText': '',
                'addVoucherCode': '',
                'formName_addVoucherCode': 'store-finder-postalcode-from-default-model'
            }
        }
    };
});