/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals define */
define('modules/chip-and-pin/debug-bar-models', function () {
    'use strict';
    return {
        'pageModel': {
            'defaults': {}
        },
        'debugBarLayout': {
            'section': 'kiosk',
            'templateId': 'debugBarLayout',
            'defaults': {
                'kioskCheckoutSection': 'unknown'
            }
        }
    };
});