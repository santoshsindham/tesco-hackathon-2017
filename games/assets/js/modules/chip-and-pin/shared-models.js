/*jslint plusplus: true, nomen: true, regexp: true, indent: 4 */
/*globals define,TescoData */
define('modules/chip-and-pin/shared-models', ['modules/chip-and-pin/bundles', 'modules/tesco.utils'], function (bundles, utils) {
    'use strict';
    return {
        'page': {
            'section': 'kiosk',
            'placeholderClass': 'spi',
            'templateId': 'page',
            'defaults': {
                'contentHeader': 'Kiosk Chip & Pin',
                'footerLogoUrl':  utils.getImagePath() + "logo_tesco_putty_kiosk.png"
            }
        },

        'breadcrumb': {
            'section': 'kiosk',
            'templateId': 'breadcrumb',
            'defaults': {
                'position': '1'
            }
        },

        'message': {
            'section': 'kiosk',
            'templateId': 'message',
            'defaults': {
                'type': 'error',
                'text': ''
            }
        },

        'deliveryItems': {
            'section': 'kiosk',
            'templateId': 'deliveryItem',
            'placeholderClass': 'fnItems',
            'defaults': {
                'catalogueNumber': '1',
                'itemName': 'Default item name',
                'price': '0.00',
                'quantity': 1,
                'productImgURL': 'http://direct.tescoassets.com/directuiassets/ProductAssets/Books/Large/87/78/47/10/9788778471048_PI_Thumb.jpg',
                'ageRestricted': null,
                'type': null,
                'message': '',
                'giftMessageIndicativeText': null,
                'giftMessageHeader': null,
                'giftMessageLength': null,
                'giftMessageWarn': null,
                'giftMessageCharacters': null,
                'giftMessagePlaceholder': null,
                'deliveryGroupId': "",
                'section': null
            },
            'collection': {
                'tagName': 'li',
                'emptyParent': true
            }
        },
        'deliveryMethod': {
            'section': 'kiosk',
            'templateId': 'reviewDeliveryType',
            'placeholderClass': 'deliveryType',
            'injectType': 'append',
            'defaults': {
                'deliveryTypeOption': '',
                'postalCode': '',
                'name': '',
                'collectionTime': ''
            }
        },
        'overlayLayout': {
            'section': 'kiosk',
            'templateId': 'overlayLayout',
            'placeholderClass': 'kiosk-lightbox',
            'defaults': {
                'overlayHeader': bundles['spc.chipAndPin.userDetails.heading']
            }
        },
        'storeDetails': {
            'section': 'kiosk',
            'templateId': 'deliveryStoreDetailInformation',
            'placeholderClass': 'storeDetailsList',
            'collection': {
                'tagName': 'div'
            },
            'defaults': {
                'drivingDistanceUnit': bundles['spc.chipAndPin.delivery.drivingDistanceUnit'] || 'Miles',
                'openingTimesHeader': bundles['spc.chipAndPin.delivery.openingTimesHeader'] || 'Opening hours',
                'storeAddressHeader': bundles['spc.chipAndPin.delivery.storeAddressHeader'] || 'Store address',
                'selectStoreBtnText': bundles['spc.chipAndPin.delivery.selectStoreBtnText'] || 'Select',
                'selectNotStoreBtnText': bundles['spc.chipAndPin.delivery.selectNotStoreBtnText'],
                'openingTimesMonday': bundles['spc.chipAndPin.delivery.openingTimesMonday'] || 'Monday',
                'openingTimesTuesday': bundles['spc.chipAndPin.delivery.openingTimesTuesday'] || 'Tuesday',
                'openingTimesWednesday': bundles['spc.chipAndPin.delivery.openingTimesWednesday'] || 'Wednesday',
                'openingTimesThursday': bundles['spc.chipAndPin.delivery.openingTimesThursday'] || 'Thursday',
                'openingTimesFriday': bundles['spc.chipAndPin.delivery.openingTimesFriday'] || 'Friday',
                'openingTimesSaturday': bundles['spc.chipAndPin.delivery.openingTimesSaturday'] || 'Saturday',
                'openingTimesSunday': bundles['spc.chipAndPin.delivery.openingTimesSunday'] || 'Sunday',
                'cncResErrorMSG': bundles['spc.chipAndPin.delivery.cncResErrorMSG'],
                'isRestrictedStore': false
            }
        },
        'deliveryGroups': {
            'section': 'kiosk',
            'templateId': 'deliveryGroup',
            'placeholderClass': 'deliveryGroups',
            'injectType': 'replace',
            'defaults': {
                'deliveryGroupId': '',
                'deliveryGroupNumber': 1,
                'soldBy': '',
                'completed': false,
                'deliveryGroupActive': false
            },
            'collection': {
                'tagName': 'div',
                'emptyParent': true
            }
        }
    };
});