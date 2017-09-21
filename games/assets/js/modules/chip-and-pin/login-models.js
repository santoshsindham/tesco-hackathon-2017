/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require */
define('modules/chip-and-pin/login-models', ['modules/chip-and-pin/bundles', 'modules/tesco.utils'], function (bundles, utils) {
    'use strict';
    return {
        'pageModel': {
            'defaults': {
                'contentHeader': bundles['spc.chipAndPin.loginTitle'] || 'Scan your Clubcard or type in the number. Not got a Clubcard? Press the button at the bottom of the screen.'
            }
        },
        'loginLayout': {
            'section': 'kiosk',
            'master': 'login',
            'templateId': 'loginLayout',
            'placeholderClass': 'content',
            'defaults': {}
        },
        'loginScanCard': {
            'section': 'kiosk',
            'templateId': 'loginScanCard',
            'placeholderClass': 'scan-card',
            'defaults': {
                'heading': bundles['spc.chipAndPin.scanTitle'] || 'Scan',
                'description': bundles['spc.chipAndPin.login.scanCard'] || 'You can scan a Clubcard with a barcode',
                'optionImageUrl': utils.getImagePath() + 'kiosk_checkout/scan_clubcard.png'
            }
        },
        'loginEnterCard': {
            'section': 'kiosk',
            'templateId': 'loginEnterCard',
            'placeholderClass': 'enter-card',
            'defaults': {
                'heading': bundles['spc.chipAndPin.typeTitle'] || 'Type',
                'description': bundles['spc.chipAndPin.login.typeNumber'] || 'Or you can type any Clubcard number',
                'enterClubcardButton': bundles['spc.chipAndPin.login.enterClubcardButton'] || 'Go',
                'optionImageUrl': utils.getImagePath() + 'kiosk_checkout/type_cards.png',
                'formClubcardNumber': 'login-clubcard-number',
                'formButtonName' : '/atg/userprofiling/ProfileFormHandler.clubcardLogin',
                'loginButtonClass': 'secondary-button clubcard-login'
            }
        },
        'loginAlternatives': {
            'section': 'kiosk',
            'templateId': 'loginAlternatives',
            'placeholderClass': 'login-alternatives',
            'defaults': {
                'skipLoginText': bundles['spc.chipAndPin.login.skipLogin'] || 'Continue without Clubcard'
            }
        },
        'loginOverlayHeader': {
            'section': 'kiosk',
            'templateId': 'loginOverlayHeader',
            'placeholderClass': 'dialog-header',
            'defaults': {
                'heading': bundles['spc.chipAndPin.login.postcode.heading'] || 'Verify the Clubcard to speed up your purchase'
            }
        },
        'loginOverlayContent': {
            'section': 'kiosk',
            'templateId': 'loginOverlayContent',
            'placeholderClass': 'dialog-content',
            'defaults': {
                'clubcardStage': 'clubcard-verification',
                'messageVisibility': '',
                'clubcardPromptMessageText': bundles['spc.chipAndPin.login.postcode.intro'] || 'Enter the postcode registered to the card.',
                'verifyPostcodeButton': bundles['spc.chipAndPin.login.postcode.verifyPostcode'] || 'Go',
                'clubcardPlaceholderText': '',
                'statusMessageClass': '',
                'statusMessageText': ''
            }
        },
        'loginOverlayFooter': {
            'section': 'kiosk',
            'templateId': 'loginOverlayFooter',
            'placeholderClass': 'dialog-footer',
            'defaults': {
                'skipLoginText': bundles['spc.chipAndPin.login.postcode.skipPostcode'] || 'Skip, I don\'t know the postcode'
            }
        }
    };
});