/*globals window,document,console,define,require */
/*jslint plusplus: true, regexp: true, indent: 4 */
define('modules/chip-and-pin/user-session', ['modules/mvapi/common'], function (mvapi) {
    'use strict';
    var bCanScanVoucher = false,
        bCanScanClubcard = false,
        bCanScanEcoupon = false,
        bCanScanGiftcard = false,
        bCanEditEmail = false,
        iAgeRestriction = null,
        bRegisteredUser = false,
        iUserType = 0,
        bCanScanBarcode = true,
        getCurrentSection = function getCurrentSection() {
            return mvapi.getCurrentSection();
        },
        isAgeRestricted = function isAgeRestricted() {
            return iAgeRestriction === null ? false : true;
        },
        setAgeRestriction = function setAgeRestriction(iAge) {
            if (typeof iAge === 'number') {
                iAge = (iAge === 0) ? null : iAge;
                iAgeRestriction = iAge;
            }
        },
        isRegisteredUser = function isRegisteredUser() {
            return bRegisteredUser;
        },
        setRegisteredUser = function setRegisteredUser(isRegistered) {
            bRegisteredUser = isRegistered;
        },
        getUserType = function getUserType() {
            return iUserType;
        },
        setUserType = function setUserType(type) {
            if (type === 0 || type === 1 || type === 2) {
                iUserType = type;
            }
        },
        isCheckout = function isCheckout() {
            var sCurrentSection = mvapi.getCurrentSection();
            return sCurrentSection === 'login' || sCurrentSection === 'delivery' || sCurrentSection === 'review' || sCurrentSection === 'payment';
        };



    return {
        /**
         * @method canScanVoucher
         * @memberof user-session
         * @returns {bool}
         */
        canScanVoucher: bCanScanVoucher,
        /**
         * @method canScanClubcard
         * @memberof user-session
         * @returns {bool}
         */
        canScanClubcard: bCanScanClubcard,
        /**
         * @method canScanEcoupon
         * @memberof user-session
         * @returns {bool}
         */
        canScanEcoupon: bCanScanEcoupon,
        /**
         * @method canScanGiftcard
         * @memberof user-session
         * @returns {bool}
         */
        canScanGiftcard: bCanScanGiftcard,
        /**
         * @method canEditEmail
         * @memberof user-session
         * @returns {bool}
         */
        canEditEmail: bCanEditEmail,
        /**
         * @method getCurrentSection
         * @memberof user-session
         * @returns {string}
         */
        getCurrentSection: getCurrentSection,
        /**
         * @method isAgeRestricted
         * @memberof user-session
         * @returns {bool}
         */
        isAgeRestricted: isAgeRestricted,
        /**
         * @method getAgeRestriction
         * @memberof user-session
         * @returns {number}
         */
        getAgeRestriction: iAgeRestriction,
        /**
         * @method getAgeRestriction
         * @memberof user-session
         * @param {number} iAge - The number value of the minimum age of customer, i.e 16, 18, 21
         * @returns {number}
         */
        setAgeRestriction: setAgeRestriction,
        /**
         * @method isRegisteredUser
         * @memberof user-session
         * @returns {bool}
         */
        isRegisteredUser: isRegisteredUser,
        /**
         * @method setRegisteredUser
         * @memberof user-session
         * @returns {void}
         */
        setRegisteredUser: setRegisteredUser,
        /**
         * @method getUserType
         * @memberof user-session
         * @returns {string}
         * @values  registered, anonymous, mixed , clubcard
         */
        getUserType: getUserType,
        /**
         * @method setUserType
         * @memberof user-session
         * @returns {string}
         * @values  registered, anonymous, mixed , clubcard
         */
        setUserType: setUserType,
        /**
         * @method canScanBarcode
         * @memberof user-session
         * @returns {bool}
         */
        canScanBarcode: bCanScanBarcode,
        /**
         * @method isCheckout
         * @memberof user-session
         * @returns {bool}
         */
        isCheckout: isCheckout
    };
});
