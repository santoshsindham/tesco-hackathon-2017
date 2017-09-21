/*jslint plusplus: true, nomen: true, regexp: true, indent: 4 */
/*globals define */
define('modules/chip-and-pin/user-detail-form-models', ['modules/chip-and-pin/user-session', 'modules/chip-and-pin/bundles'], function (userSession, bundles) {
    'use strict';

    return {
        'user_details_form': {
            'section': 'kiosk',
            'placeholderClass': 'dialog-content',
            'templateId': 'user_details_form',
            'defaults': {
                'id': 'addUserDetails',
                'titleLabelText': bundles['spc.chipAndPin.userDetails.titleLabelText'],
                'title': 'Title',
                'titleOptions': [{ 'label': 'Title', 'value': '' }, { 'label': 'Mr', 'value': 'Mr' }, { 'label': 'Mrs', 'value': 'Mrs' }, { 'label': 'Ms', 'value': 'Ms' }, { 'label': 'Miss', 'value': 'Miss' }],
                'firstNameLabelText': bundles['spc.chipAndPin.userDetails.firstNameLabelText'],
                'firstName': '',
                'surnameLabelText': bundles['spc.chipAndPin.userDetails.surnameLabelText'],
                'lastName': '',
                'emailLabelText': bundles['spc.chipAndPin.userDetails.emailLabelText'],
                'emailPlaceholderText': bundles['spc.chipAndPin.userDetails.emailPlaceholderText'],
                'email': '',
                'contactNumberLabelText': bundles['spc.chipAndPin.userDetails.contactNumberLabelText'],
                'contactNumberPlaceholderText': bundles['spc.chipAndPin.userDetails.contactNumberPlaceholderText'],
                'contactNumber' : '',
                'dateDay': '',
                'dateMonth': '',
                'dateYear': '',
                'dateFull': '',
                'formName_title': 'reg-title',
                'formName_firstName': 'register-firstname',
                'formName_lastName': 'register-lastname',
                'formName_email': 'register-email',
                'formName_state': '',
                'formName_contactNumber': 'register-phone',
                'formDateFull' : 'register-date-full',
                'formDateDay' : 'register-date-day',
                'formDateMonth' : 'register-date-month',
                'formDateYear' : 'register-date-year',
                'fnContinueButtonClass': 'fnSaveDetailsButton',
                'continueBtnText': bundles['spc.chipAndPin.userDetails.continueBtnText'],
                'ageRestrictionDOBMessage': bundles['spc.chipAndPin.userDetails.ageRestrictionDOBMessage'],
                'isRegisteredUser': userSession.isRegisteredUser,
                'isAgeRestricted': userSession.isAgeRestricted,
                'footerMessage': bundles['spc.chipAndPin.userDetails.footerMessage']
            }
        },
        'pageModel': {
            'defaults': { 'contentHeader': bundles['spc.chipAndPin.userDetails.heading'] }
        }
    };
});