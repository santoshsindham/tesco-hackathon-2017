/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,jQuery */
define('modules/chip-and-pin/login', ['modules/settings/common', 'domlib', 'modules/mvapi/common', 'modules/chip-and-pin/breadcrumb', 'modules/chip-and-pin/login-models', 'modules/chip-and-pin/messages', 'modules/overlay/common', 'modules/ajax/common', 'modules/validation', 'modules/chip-and-pin/atg-data', 'modules/chip-and-pin/kmf-io', 'modules/chip-and-pin/user-session', 'modules/chip-and-pin/bundles', 'modules/chip-and-pin/voucher'], function (SETTINGS, $, mvApi, breadcrumb, mvModels, messages, overlay, ajax, validationExtras, atg, kmfIO, userSession, bundles, voucher) {
    'use strict';

    var self,
        init,
        renderLoginLayout,
        renderLoginContent,
        sendRequest,
        overlayParams,
        bindLoginBtnClicks,
        loginRequestCallback,
        prepareVerifyPostcodeForm,
        bindVerifyPostcodeFormClicks,
        showOverlay,
        loginRequest,
        /*injectPostcodeModalContent,*/
        renderloginOverlayHeader,
        renderloginOverlayContent,
        renderloginOverlayFooter,
        displayClubcardPostcodeModal,
        verifyPostcodeRequest,
        verifyPostcodeRequestCallback,
        setupLoginFormValidation,
        setupPostcodeFormValidation,
        updateModel,
        atgParserCallback,
        postcodeOnHide,
        postcodeOnSuccessNavigateTo,
        postcodeOnSkipNavigateTo,
        postcodeOnCloseNavigateTo,
        postcodeOnSuccessCallback,
        postcodeOnSkipCallback,
        postcodeSkipButtonText,
        postcodeVerifyForVouchersHeader,
        qrCodeIndex;

    updateModel = function updateModel(id, sourceObject) {
        return mvApi.updateModel(id, sourceObject);
    };

    atgParserCallback = function atgParserCallback(id, sourceObject) {
        var params = {
            id: id,
            sourceObject: sourceObject,
            actions: {
                updateModel: mvApi.updateModel,
                navigateTo: mvApi.navigateTo
            }
        };
        ajax.handleAtg(params);
    };

    prepareVerifyPostcodeForm = function prepareVerifyPostcodeForm() {
        var modelChange = {
                'defaults': {
                    'skipLoginText': postcodeSkipButtonText
                }
            };
        mvApi.render('loginOverlayFooter', modelChange);

        messages.remove('.dialog-content');

        bindVerifyPostcodeFormClicks();

        kmfIO.showKeyboard();
        $('#txt-verify-postcode').trigger('focus');
    };

    bindVerifyPostcodeFormClicks = function bindVerifyPostcodeFormClicks() {
        $('#ir-login-postcode').off().submit(function (e) {
            e.preventDefault();

            messages.remove('.dialog-content');

            if ($('#ir-login-postcode').valid()) {
                verifyPostcodeRequest();
            }
        });

        $("#continueWithoutBtn").off().on('click', function () {

            messages.remove('.dialog-content');

            if (postcodeOnSkipNavigateTo) {
                mvApi.navigateTo(postcodeOnSkipNavigateTo, true);
            }

            if (postcodeOnSkipCallback) {
                postcodeOnSkipCallback();
            }
        });

        $('#continueWithoutBtn').on('keydown', function (event) {

            messages.remove('.dialog-content');

            if (event.keyCode === 13) {
                if (postcodeOnSkipNavigateTo) {
                    mvApi.navigateTo(postcodeOnSkipNavigateTo, true);
                }

                if (postcodeOnSkipCallback) {
                    postcodeOnSkipCallback();
                }
            }
        });

        setupPostcodeFormValidation();

    };

    renderloginOverlayHeader = function renderloginOverlayHeader() {
        if (postcodeVerifyForVouchersHeader !== null && postcodeVerifyForVouchersHeader !== undefined) {
            mvApi.render("loginOverlayHeader", { defaults: { heading: postcodeVerifyForVouchersHeader } }, renderloginOverlayContent);
        } else {
            mvApi.render("loginOverlayHeader", renderloginOverlayContent);
        }
    };

    renderloginOverlayContent = function renderloginOverlayContent() {
        mvApi.render("loginOverlayContent", renderloginOverlayFooter);
    };

    renderloginOverlayFooter = function renderloginOverlayFooter() {
        mvApi.render("loginOverlayFooter", prepareVerifyPostcodeForm);
    };

    displayClubcardPostcodeModal = function displayClubcardPostcodeModal(args) {

        postcodeOnSuccessNavigateTo = args.onSuccessNavigateTo || false;
        postcodeOnSkipNavigateTo = args.onSkipNavigateTo || false;
        postcodeOnCloseNavigateTo = args.onCloseNavigateTo || 'login';
        postcodeOnSuccessCallback = args.onSuccessCallback || false;
        postcodeOnSkipCallback = args.onSkipCallback || false;
        postcodeSkipButtonText = args.skipButtonText || bundles['spc.chipAndPin.login.postcode.skipPostcode'];
        postcodeVerifyForVouchersHeader = args.heading || bundles['spc.chipAndPin.login.postcode.heading'];

        if (args.mvApiNavigateTo) {
            mvApi.navigateTo(args.mvApiNavigateTo);
        }

        showOverlay(renderloginOverlayHeader, postcodeVerifyForVouchersHeader);
        mvApi.publish("/chip-and-pin/display", 'loginPostcode');
    };

    showOverlay = function showOverlay(callback) {
        overlayParams = {
            content: '<div class="kiosk-lightbox"></div>',
            hideOnOverlayClick: true,
            onHideCallback: postcodeOnHide,
            callback: function () {
                mvApi.render('overlayLayout', callback);
            }
        };
        overlay.show(overlayParams);
    };

    postcodeOnHide = function postcodeOnHide() {
        if (postcodeOnCloseNavigateTo) {
            mvApi.navigateTo(postcodeOnCloseNavigateTo, true);
        }
    };

    bindLoginBtnClicks = function bindLoginBtnClicks() {
        $('#ir-login-clubcard').unbind().submit(function (e) {
            e.preventDefault();
            e.stopPropagation();

            if ($('#ir-login-clubcard').valid()) {
                loginRequest();
            }
        });

        $('#login-clubcard-number').on('keydown', function (event) {
            if (event.keyCode === 13) {
                if ($('#ir-login-clubcard').valid()) {
                    loginRequest();
                }
            }
        });

        $('#btn-skip-login').on('click', function () {
            var userDetailsModel,
                data = {
                    'id': 'ir-register1'
                };

            userDetailsModel = mvApi.resetModel('user_details_form');

            if (userDetailsModel.atgData) {
                $.extend(data, userDetailsModel.atgData);
            }
            sendRequest(data, function () { self.callbacks.goToUserDetails(true); });
        });
    };

    renderLoginContent = function renderLoginContent() {

        var modelChange,
        	products = window.TescoData.ChipAndPin.checkoutData.products || '';
        
        modelChange = {
            'defaults': {
                'analytics': [{
                    'events': 'scCheckout',
                    'products': products.slice(0, -1)
                }]
            }
        };

        mvApi.render('loginScanCard', modelChange);
        mvApi.render('loginEnterCard', setupLoginFormValidation);
        mvApi.render('loginAlternatives', bindLoginBtnClicks);
    };
    
    renderLoginLayout = function renderLoginLayout() {
        mvApi.render('loginLayout', renderLoginContent);
    };

    sendRequest = function sendRequest(data, callback) {
        ajax.post({
            'url': SETTINGS.ENV === 'buildkit' ? SETTINGS.CONSTANTS.URL.KIOSK_DATA : '/direct/my/kiosk-checkout.page',
            'data': data || {},
            'callbacks': {
                'success': function (data) {
                    data = atg.handleForms(data, atgParserCallback);
                    if(data.userSession !== undefined){
						userSession.setAgeRestriction(data.userSession.ageRestriction);
						document.getElementById("wrapper").setAttribute("data-age-restriction", data.userSession.ageRestriction); 
					}
                    if (callback) {
                        callback(data);
                    }
                }
            }
        });
    };

    loginRequest = function loginRequest(sClubcardNumber) {
        var loginModel,
            $clubcardNum = $('#login-clubcard-number'),
			$attrName = $clubcardNum.attr('name'),
            clubcardNumber = sClubcardNumber || $clubcardNum.val() || '',
            data = {
                'id': 'loginClubcard',
                'clubcardNumber': clubcardNumber
            };

        messages.remove();

        loginModel = updateModel('loginEnterCard', { 'clubcardNumber': clubcardNumber });

        if (loginModel) {
            $.extend(data, loginModel.atgData);
        }

		data[$attrName] = clubcardNumber;
        userSession.canScanClubcard = true;
        sendRequest(data, loginRequestCallback);
    };

    loginRequestCallback = function loginRequestCallback(response) {
        if (response) {
            if (response.userSession) {
                userSession.setAgeRestriction(parseInt(response.userSession.ageRestriction, 10));
            }
            if (response.loginSuccess === SETTINGS.CONSTANTS.CLUBCARD.VERIFY_HALF) {
                userSession.setUserType(SETTINGS.CONSTANTS.LOGIN.LOGIN_HALF);
                $('#login-clubcard-number').val("");
                displayClubcardPostcodeModal({'mvApiNavigateTo': 'login&postcodeModal',
                    'onSuccessNavigateTo': 'delivery',
                    'onSkipNavigateTo': 'login&userDetailsForm',
                    'onCloseNavigateTo': 'login'});
            } else {
                userSession.canScanClubcard = true;
            }
        } else {
            userSession.canScanClubcard = true;
        }
    };

    verifyPostcodeRequest = function verifyPostcodeRequest() {
        var $postcodeInput = $('#txt-verify-postcode'),
            postcode = $postcodeInput.val(),
            loginModel = mvApi.getModel('loginOverlayContent'),
            requestData = {
                'id': 'loginVerifyPostcode',
                'txt-verify-postcode': postcode || '',
                'clubcardNumber': loginModel.clubcardNumber
            };

        if (loginModel.atgData) {
            $.extend(requestData, loginModel.atgData);
        }

        requestData.postCodeNam = postcode;
        requestData['txt-verify-postcode'] = postcode;
        requestData.requestFrom = mvApi.getCurrentSection();
        sendRequest(requestData, verifyPostcodeRequestCallback);
    };

    verifyPostcodeRequestCallback = function verifyPostcodeRequestCallback(response) {
        var updateUserDetailsModel = mvApi.getModel('user_details_form');
        
        bindVerifyPostcodeFormClicks();

        if (response) {
        	//response = (typeof response === 'string') ? JSON.parse(response) : response;
            if (response && response.header && response.header.success === true && response.tenderDetails) {
            	voucher.parseVoucherData(response.tenderDetails.vouchers);
            	voucher.parseAndRenderResponse();
            } else if (response !== null && response !== undefined && response.tenderDetail !== undefined && response.tenderDetails.vouchers.voucherErrorMessage && response.tenderDetails.vouchers.voucherErrorMessage !== undefined) {
                messages.show(response.tenderDetails.vouchers.voucherErrorMessage, 'error', 'dialog-content .message');
            }
            
            if (response.header !== undefined) {
				if (response.header.toSection === "userDetailsForm") {
					userSession.setAgeRestriction(parseInt(response.userSession.ageRestriction, 10));
					userSession.setRegisteredUser(response.userSession.isRegisteredUser);
					//response.isRegisteredUser = userSession.isRegisteredUser();
					mvApi.updateModel('user_details_form', response);
					updateUserDetailsModel.defaults.title = response.defaults.title;
					updateUserDetailsModel.defaults.firstName = response.defaults.firstName;
					updateUserDetailsModel.defaults.lastName = response.defaults.lastName;
					updateUserDetailsModel.defaults.contactNumber = response.defaults.contactNumber;
					mvApi.render('user_details_form');
				}   
			}
			if (response.postcodeVerified !== undefined) {
				if (response.postcodeVerified === SETTINGS.CONSTANTS.CLUBCARD.VERIFY_FULL) {
					userSession.setUserType(SETTINGS.CONSTANTS.LOGIN.LOGIN_REGISTERED);
					userSession.setRegisteredUser(true);

					if (userSession.isAgeRestricted() && postcodeOnSuccessNavigateTo === 'delivery') {
						self.callbacks.goToUserDetails(true);
					} else {
						
						require(['modules/chip-and-pin/delivery-group'], function(deliveryGroup) {
							deliveryGroup.populateDeliveryGroupInformation(response.deliveryGroups);
						});
						
						if (postcodeOnSuccessNavigateTo) {
							mvApi.navigateTo(postcodeOnSuccessNavigateTo, true);
						}

						if (postcodeOnSuccessCallback) {
							postcodeOnSuccessCallback();
						}
					}
				}
			}
			if(response.redirection !== undefined){
				location.href = response.redirection;
			}
        }
    };

    setupLoginFormValidation = function setupLoginFormValidation() {

        validationExtras.customMethods.clubcardFormat();

        $('#ir-login-clubcard').validate({
            ignore: "",
            onkeyup: function (e) {
                if (this.check(e)) {
                    $(e).addClass('valid');
                } else {
                    $(e).removeClass('valid');
                }
            },
            focusInvalid: true,
            onfocusout: function (e) {
                this.element(e);
            },
            errorElement: 'span',
            showErrors: function () {
                this.defaultShowErrors();
                messages.remove();
            },
            errorPlacement: function (error, element) {
                error.insertAfter(validationExtras.errorPlacementElement(element));
            },
            rules : {
                'login-clubcard-number': {
                    required: true,
                    clubcardFormat: true
                }
            },
            messages: {
                'login-clubcard-number': {
                    required: validationExtras.msg.clubcard.requiredKiosk,
                    clubcardFormat: validationExtras.msg.clubcard.inValid
                }
            }
        });

        validationExtras.limitCharacters($('#ir-login-clubcard').find('#login-clubcard-number'), 18);
    };

    setupPostcodeFormValidation = function setupPostcodeFormValidation() {
        validationExtras.customMethods.postcodeUK();

        /*** IMPORTANT - This probably needs to be moved (RD 23-Jul-2014) ***/
        jQuery.validator.addMethod("onlyLetterNumbersSpace", function (value) {
            var regex = new RegExp("^[a-zA-Z0-9 ]+$"),
                key = value;

            if (!regex.test(key)) {
                return false;
            }
            return true;
        });
        /*** END IMPORTANT ***/

        $('#ir-login-postcode').validate({
            debug: true,
            ignore: "",
            onkeyup: function (e) {
                if (this.check(e)) {
                    $(e).addClass('valid');
                } else {
                    $(e).removeClass('valid');
                }
            },
            focusInvalid: true,
            errorElement: 'span',
            showErrors: function () {
                this.defaultShowErrors();
            },
            errorPlacement: function (error, element) {
                error.insertAfter(validationExtras.errorPlacementElement(element));
            },
            rules : {
                'txt-verify-postcode': {
                    required: true,
                    postcodeUK: true,
                    onlyLetterNumbersSpace: true
                }
            },
            messages: {
                'txt-verify-postcode': {
                    required: validationExtras.msg.postcode.required,
                    onlyLetterNumbersSpace: validationExtras.msg.postcodeUK.inValid
                }
            }
        });

        validationExtras.limitCharacters($('#txt-verify-postcode'), 8);
    };

    mvApi.cacheInitialModels(mvModels);

    init = function init() {
        breadcrumb.set(1);
        renderLoginLayout();
        userSession.canScanClubcard = true;
        kmfIO.registerCallback('loginClubcardScan', function (ccNumber) {
            ccNumber = ccNumber.replace(/[^0-9:]/g, '');
            qrCodeIndex = ccNumber.indexOf(':');
            ccNumber = qrCodeIndex !== -1 ? ccNumber.substr(0, qrCodeIndex) : ccNumber;
            $('#login-clubcard-number').val(ccNumber.replace(/^979/, "63400"));
            $('#ir-login-clubcard').submit();
        });
    };

    //Exposing public methods
    self = {
        init: init,
        pageModel: mvModels.pageModel,
        displayClubcardPostcodeModal: displayClubcardPostcodeModal
    };

    return self;
});
