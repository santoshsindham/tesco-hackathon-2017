/*jslint regexp: true, nomen: true */
/*globals window,document,console,define,require,jQuery */
define('modules/settings/constants', function () {
    'use strict';

    var self = {
        URL: {
            GENERIC: {
                TEST_DATA_ENDPOINT: '/stubs/test_data_endpoint.php',
                MVAPI_TEMPLATES_PATH: window.globalStaticTemplatesPath || '/directuiassets/SiteAssets/NonSeasonal/en_GB/js/templates/',
                DUMMY_DATA_ENDPOINT_PATH: '../mvapi/data/',
                DUMMY_DATA_ENDPOINT_FILENAME: '/service.php'
            },
            KIOSK_DATA: '/direct/my/kiosk-checkout.page',
            BASKET: '/direct/basket-details/basket-details.page',
            ORDER_CONFIRMATION: '/direct/my/kiosk-order-confirmation.page'
        },
        CLUBCARD: {
            VERIFY_FAIL: 0,
            VERIFY_HALF: 1,
            VERIFY_FULL: 2
        },
        LOGIN: {
            LOGIN_ANONYMOUS: 0,
            LOGIN_HALF: 1,
            LOGIN_REGISTERED: 2
        }
    };
    return self;

});
