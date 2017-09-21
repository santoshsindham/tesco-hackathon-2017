/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/delivery-models', ['modules/chip-and-pin/bundles'], function (bundles) {
    'use strict';
    return {
        'deliveryLayout': {
            'section': 'kiosk',
            'master': 'delivery',
            'placeholderClass': 'content',
            'templateId': 'deliveryLayout',
            'defaults': {}
        },
        'deliveryOptionsArea': {
            'section': 'kiosk',
            'templateId': 'deliveryOptionsArea',
            'defaults': {
                'deliveryOptionsMessage': 'FREE returns on most Tesco products (exceptions apply).',
                'deliveryOptionsWarning': 'Sometimes it takes longer to deliver items to Northern Ireland, the Isle of Man, the Isles of Scilly, Orkney, Shetland and other Scottish islands. See Delivery Information for more details.'
            },
            'collection': {
                'tagName': 'div',
                'emptyParent': true
            }
        },
		'deliveryDatePicker': {
				'section': 'kiosk',
	            'templateId': 'deliveryDatePicker',
	            'placeholderClass': 'dialog-content',
	            'defaults': {
	                'deliveryDate': '',
	                'deliveryCharge': '',
	                'deliveryDateMessage': ''
	            }
		},
        'deliveryOptionsGroupHome': {
            'section': 'kiosk',
            'templateId': 'deliveryOptionsGroupHome',
            'placeholderClass': 'deliveryOptionsGroups',
            'defaults': {
                'colour': 'orange'
            },
            'collection': {
                'tagName': 'li'
            }
        },
        'deliveryOptionsGroupStore': {
            'section': 'kiosk',
            'templateId': 'deliveryOptionsGroupStore',
            'placeholderClass': 'deliveryOptionsGroups',
            'defaults': {
                'colour': 'red'
            },
            'collection': {
                'tagName': 'li'
            }
        },
        'storeDeliveryOption': {
            'section': 'kiosk',
            'templateId': 'deliveryOption',
            'placeholderClass': 'fnStoreDeliveryContainer',
            'defaults': {
                'deliveryMethod': 'Home default title',
                'deliveryMethodMessage': 'Home default subtitle',
                'deliveryMethodName': '',
                'deliveryMessage': 'home collection time',
                'deliveryIcon': 'standardDelivery',
                'optionid': 'this-store',
                'deliveryMethodType': '',
                'isThisStoreRestricted': false
            },
            'collection': {
                'tagName': 'li'
            }
        },
        'homeDeliveryOption': {
            'section': 'kiosk',
            'templateId': 'deliveryOption',
            'placeholderClass': 'fnHomeDeliveryContainer',
            'defaults': {
                'deliveryMethod': 'Home default title',
                'deliveryMethodMessage': 'Home default subtitle',
                'deliveryMethodName': '',
                'deliveryMessage': 'home collection time',
                'deliveryIcon': 'standardDelivery',
                'optionid': 'standard',
                'deliveryMethodType': '',
                'isThisStoreRestricted': false
            },
            'collection': {
                'tagName': 'li'
            }
        },
        'findStoreForm': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'deliveryFindStoreForm',
            'defaults': {
                'statusMessageClass': '',
                'statusMessageText': '',
                'storeFinderLabelText': bundles['spc.chipAndPin.delivery.storeFinderLabelText'] || 'Enter a postcode or town to find a store',
                'postcode': '',
                'formName_postcode': 'store-finder-postalcode'
            }
        },
        'selectDeliveryAddressForm': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'deliverySelectAddressList',
            'defaults': {
                'statusMessageClass': '',
                'statusMessageText': '',
                'formName_postcode': 'store-finder-postalcode',
                'listType' : 'getPostcodeAddress'
            }
        },
        'manuallyEnterAddressForm': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'manuallyEnterAddressForm'
        },
        'manualEnterAddressForm': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'manualEnterAddressForm'
        },
        'selectDeliveryAddressList': {
            'section': 'kiosk',
            'placeholderClass': 'addressList',
            'templateId': 'deliverySelectAddressListItem',
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
        'selectSaveDeliveryAddressList': {
            'section': 'kiosk',
            'placeholderClass': 'addressList',
            'templateId': 'deliverySelectAddressListItem',
            'defaults': {
                'nickName': '',
                'address': '',
                'listType' : 'getPostcodeAddress'
            },
            'collection': {
                'tagName': 'li'
            }
        },
        'selectPostcodeAddressList': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'selectPostcodeAddressList',
            'defaults': {
                'statusMessageClass': '',
                'statusMessageText': ''
            }
        },
        'findDeliveryAddressForm': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'deliveryFindAddressForm',
            'defaults': {
                'statusMessageClass': '',
                'defaultDelPostcode' : '',
                'statusMessageText': ''
            }
        },
        'renderClosestStoreContent': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'deliveryStoresListing',
            'defaults': {
                'fnFindAnotherStoreBtnText': bundles['spc.chipAndPin.delivery.findAnotherStoreBtnText'] || 'Find a different store',
				'isAllCnCStoreRestricted': false
            }
        },
        'pageModel': {
            'defaults': {
                'contentHeader': 'Your delivery options',
                'footerCopy': '* Excludes bank holidays. Deliveries to stores in Northern Ireland and outlying areas of the UK may take a little longer.'
            }
        }
    };
});
