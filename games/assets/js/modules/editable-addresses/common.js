define([
    'domlib',
    'modules/breakpoint',
    'modules/tesco.utils',
    'modules/validation',
    'modules/tesco.analytics',
    'modules/bfpo/common'
], function ($, breakpoint, utils, validationExtras, analytics, bfpo) {

    function PCA_EditableAddress(obj, $container, enableValidate, callback) {

        var $pcaInput = $container.find('input.postal-code-pca'),
            $editButton = null,
            EDIT_BUTTON_SELECTOR = '.edit-address-button',
            MESSAGE_SELECTOR = '.pcaCapturePlusTable .message',
            MESSAGES = {
                hint: "If you can't find the right address enter the full postcode and select Edit.",
                err: "Sorry, we can't find this postcode. Please enter another postcode."
            },
            KEY = {
                DEL: 46,
                TAB: 9,
                RETURN: 13,
                ESC: 27,
                BACKSPACE: 8
            },

            findDomElements,
            originalContentHeight,
            resetContentHeight,
            isIDevice;

        findDomElements = function findDomElements() {
            $editButton = $container.find(EDIT_BUTTON_SELECTOR);
        };

        resetContentHeight = function resetContentHeight() {
            if (breakpoint.mobile) {
                $('#virtual-page').find(obj.containerSelector).height(originalContentHeight);
            }
        };

        isIDevice = function isIDevice() {
            if (/ip(hone|od)|ipad/i.test(window.navigator.userAgent)) {
                return true;
            }
            return false;
        };

        var enableEditButton = function () {
            $editButton.attr('disabled', false);
            $editButton.removeClass('disabled');
        };

        var disableEditButton = function () {
            $editButton.attr('disabled', true);
            $editButton.addClass('disabled');
        };

        var createMessage = function () {
            //If message element doesn't exist, create it
            if ($container.find(MESSAGE_SELECTOR).length) {
                return;
            }
            $container.find('.pcaCapturePlusTable .pcaAutoCompleteSmall').before('<div class="message"></div>');
        };

        var showMessage = function (showError) {

            createMessage();

            var message = MESSAGES.hint,
                errorClass = 'error-text';

            $container.find(MESSAGE_SELECTOR).removeClass(errorClass);

            if (showError) {
                message = MESSAGES.err;
                $container.find(MESSAGE_SELECTOR).addClass(errorClass);
            }

            $container.find(MESSAGE_SELECTOR).html(message).show();
        };

        var hideMessage = function () {
            $container.find(MESSAGE_SELECTOR).hide();
        };

        var bindEvents = function () {
            var self = obj;

            // If the document is clicked or tapped, hide message...
            $(document).on('click', hideMessage);
            // If user tabs onto nickname field, hide message...
            $container.find('[name=nick-names]').on('focus', function () {
                hideMessage();
            });
            // Slide the extra fields down...
            $container.on('click', EDIT_BUTTON_SELECTOR, function (e) {
                e.preventDefault();
                if ($(this).hasClass('disabled')) {
                    return;
                }
                self.editButtonClicked = true;
                hideMessage();
                if (!$(this).hasClass('edit-add-button')) {
                    $container.find('.pnlResultsSmall .pcaContent div').trigger('click');
                    //set omniture var -  US2571-40
                    var _oWebAnalytics = new analytics.WebMetrics();
                    var v;
                    if ($('.edit-da-block').is(':visible')) {
                        v = [{
                            'eVar65': 'EDA_E1',
                            'events': 'event65'
                        }];
                    } else {
                        v = [{
                            'eVar65': 'EBA_E1',
                            'events': 'event65'
                        }];
                    }
                    _oWebAnalytics.submit(v);
                }
            });
            // Populate PCA field when address is selected...
            $container.on('click', '.pcaContent span.selectedItem', function () {
                var postcode = $(this).text().split(",")[0];
                if (utils.checkPostCodeIsValid(postcode)) {
                    var keyEvent = isIDevice() ? 'keyup' : 'keydown';
                    $pcaInput.val(postcode).trigger(keyEvent);
                }
            });

            // If the add address button hasn't been clicked, return
            // This is to fix the save button being enabled if a valid postcode format has been entered
            $container.on('click', '.save', function (e) {
                if (!self.pcaAddressSelected && !self.typingStarted) {
                    e.preventDefault();
                }
            });

            $container.on('click', '.form-container .cancel', function (e) {
                e.preventDefault();
                self.manualAddressSignUpSlideUp(e);
            });

            $pcaInput.on('focus', self.clearPCAField);
            $pcaInput.on('blur', function () {
                $container.find(obj.elementsToHide).show();
                resetContentHeight();
            });

            if (callback && typeof callback === 'function') {
                callback();
            }

        };
        /*
         * Manually set the character limits as a HTML attribute
         * jQuery validate limit characters is buggy...
         *
         * */
        var setCharacterLimits = function () {
            var charLimits = {
                postal_code_pca: 8,
                nick_names: 20,
                companyname: 60,
                flatnumber: 30,
                buildingname: 60,
                street: 70
            };

            $.each(charLimits, function (key, value) {
                var fieldName = key.replace(/_/gi, '-');
                $container.find('[name=' + fieldName + ']').attr('maxlength', value);
            });

        };

        (function init() {
            findDomElements();
            bindEvents();
            setCharacterLimits();
        }());

        /* Capture+ function calls to handle response from PCA.
         * Capture+ is used in 'Add new address' section in SPC which provides autocomplete functionality and
         * gives list of addresses as a drop-down for the user to select.
         *
         * */
        window.CapturePlusNoResults = function () {

            var self = obj,
                $pcaForm = $pcaInput.parents('form');

            $pcaForm.data('dirty', false);
            //$pcaInput.attr('title',$pcaInput.attr("placeholder")).valid();
            $pcaForm.validate();

            $pcaInput.data('isAddressSelected', false).valid();

            validationExtras.enableSave(
                $pcaInput.parents('form').find('[name=nick-names], .postal-code-pca, ' + self.groupFields),
                $pcaInput.parents('form').find('input.save')
            );

            showMessage(true);
            disableEditButton();
        };

        window.CapturePlusLoaded = function (capObj) {

            var $pcaObj = $pcaInput,
                $pcaSmall = $('.pcaAutoCompleteSmall'),
                $vpContainer = $('#virtual-page').find(obj.containerSelector),
                val,
                keyEvent,
                contentHeight,
                dropdownHeight,
                newHeight = 0;

            originalContentHeight = $vpContainer.height();

            function hide(showErrorMessage) {
                $pcaSmall.css({
                    'opacity': '0'
                });
                if (showErrorMessage) {
                    showMessage(true);
                    return;
                }
                hideMessage();
                resetContentHeight();
            }

            function show() {
                $pcaSmall.css({
                    'opacity': 1
                });
                capObj.enableCapturePlus();
                showMessage();
                $container.find(obj.elementsToHide).hide();

                if (breakpoint.mobile) {
                    contentHeight = $vpContainer.height();
                    dropdownHeight = $vpContainer.find('.pnlAutoCompleteSmall').height() + $vpContainer.find(MESSAGE_SELECTOR).height();
                    newHeight = dropdownHeight + contentHeight;
                    $vpContainer.height(newHeight);
                }
            }

            if (isIDevice()) {
                keyEvent = "keyup paste input";
            } else {
                keyEvent = "keydown paste input";
            }

            $pcaObj.on('focus', function () {
                if (breakpoint.isMobile) {
                    $container.find('span[for="postal-code-pca"]').hide(); // Hide the PCA error message - inteferes with PCA dropdown on mobile devices
                }
            });

            $pcaObj.on(keyEvent, function (e) {
                /* restrict the user from further typing if edit button is enabled */
                if (obj.editButtonEnabled) {
                    var keypressed = e.which;
                    if ((keypressed >= 65 && keypressed <= 122) || (keypressed >= 48 && keypressed <= 64) || (keypressed >= 33 && keypressed <= 47) || (keypressed >= 91 && keypressed <= 96) || (keypressed >= 123 && keypressed <= 255) || (keypressed === 173)) {
                        return false;
                    }
                }
                /* If tab away or enter key, PCA autosuggest */
                if (e.which === KEY.TAB || e.which === KEY.RETURN) {
                    hide();
                    return;
                }
                if (e.type === 'input') { /* to hide the PCA autosuggest when user clicks on 'X' icon in IE 10 browser */
                    setTimeout(function () {
                        val = $pcaObj.val();
                        //console.log("input :: " + val);
                        if (val === '') { /* disable the 'Edit' button when PCA textbox is cleared */
                            disableEditButton();
                            hide();
                            return;
                        }
                    }, 1);
                } else if (e.type === 'keydown' || e.type === 'keyup') {
                    setTimeout(function () {
                        val = $pcaObj.val();
                        if (val === '') { /* disable the 'Edit' button when PCA textbox is cleared */
                            disableEditButton();
                            hide();
                            return;
                        }
                        /* Only allow characters and spaces, if not hide PCA and show error message... */
                        if (!utils.checkForOnlyCharactersAndSpaces(val)) {
                            hide(true);
                            return;
                        }
                        /* don't show the autoauggest until 3 characters are typed */
                        if (val.length < 3) {
                            hide();
                            return;
                        }
                        /* don't show the autosuggest if first 3 characters of postcode don't match the logic mentioned in user stories */
                        if (val.length > 2 && !utils.checkFirstThreeCharactersOfPostCodeIsValid(val)) {
                            hide(true);
                            return;
                        }
                        show();
                        /* If postcode is valid, enable edit button */
                        if (utils.checkPostCodeIsValid(val)) {
                            enableEditButton();
                        } else {
                            disableEditButton();
                        }
                    }, 1);
                } else if (e.type === 'paste') {
                    setTimeout(function () {
                        val = $pcaObj.val();
                        if (utils.checkFirstThreeCharactersOfPostCodeIsValid(val)) {
                            show();
                        }
                    }, 1);
                }
            });

        }; // end window.CapturePlusLoaded

        window.CapturePlusCallback = function (uid, response) {

            var self = obj.validation,
                reqFields = ['Line1', 'Line2', 'City', 'PostalCode', 'BuildingNumber', 'BuildingName', 'Type', 'SubBuilding', 'Organisation', 'Company', 'DoubleDependentLocality', 'DependentLocality', 'PrimaryStreet', 'SecondaryStreet'],
                $pcaForm = $pcaInput.closest('form'),
                buildingName = '',
                buildingNumber = '',
                addressLineOne = '',
                primaryStreet = '',
                secondaryStreet = '',
                doubleDependentlocality = '',
                dependentlocality = '',
                city = '',
                countryCode = '',
                buildingNameNumberStr = '',
                primarySecondaryStreetStr = '',
                localityStr = '',
                localityCityStr = '',
                isBfpoAddress = false;

            obj.pcaAddressSelected = true;

            $.each(response, function () {

                if (this.FieldName === 'PostalCode') { // Manually populate postcode
                    $pcaInput.val(this.FormattedValue);
                } else if (this.FieldName === 'Organisation') { // Manually populate company name
                    $pcaForm.find('[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName"], [name=companyname]').val(this.FormattedValue);
                } else if (this.FieldName === 'SubBuilding') { // Manually populate flat number
                    $pcaForm.find('[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber"], [name=flatnumber]').val(this.FormattedValue);
                } else if (this.FieldName === 'BuildingNumber') { // BuildingNumber
                    buildingNumber = this.FormattedValue;
                } else if (this.FieldName === 'BuildingName') { // BuildingName
                    buildingName = this.FormattedValue;
                } else if (this.FieldName === 'Line1') { //AddressLineOne
                    addressLineOne = this.FormattedValue;
                } else if (this.FieldName === 'PrimaryStreet') { //PrimaryStreet
                    primaryStreet = this.FormattedValue;
                } else if (this.FieldName === 'SecondaryStreet') { //SecondaryStreet
                    secondaryStreet = this.FormattedValue;
                } else if (this.FieldName === 'DoubleDependentLocality') { // Get the double dependent locality
                    doubleDependentlocality = this.FormattedValue;
                } else if (this.FieldName === 'DependentLocality') { // Get the dependent locality
                    dependentLocality = this.FormattedValue;
                } else if (this.FieldName === 'City') { // Get the city
                    city = this.FormattedValue;
                } else if (this.FieldName === 'CountryCode') { // Get the Country Code
                    countryCode = this.FormattedValue;
                }
                //console.log('Field name: ' + this.FieldName + '-------- Value: ' + this.FormattedValue);

            });

            // Building name / number
            if (buildingNumber !== '' && buildingName !== '') {
                buildingNameNumberStr = buildingNumber + ' ' + buildingName;
            } else if (buildingNumber !== '') {
                buildingNameNumberStr = buildingNumber;
            } else if (buildingName !== '') {
                buildingNameNumberStr = buildingName;
            } else {
                buildingNameNumberStr = '';
            }
            if (buildingNameNumberStr.length > 60) {
                buildingNameNumberStr = buildingNameNumberStr.substring(0, 59);
            }
            $container.find('[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.buildingNameNumber"], [name=buildingname]').val(buildingNameNumberStr);


            // Primary and secondary street
            if (secondaryStreet !== '' || primaryStreet !== '') {
                if (secondaryStreet !== '') {
                    // added (+1) in condition as we have not considered "," length as well
                    if ((primaryStreet.length + secondaryStreet.length + 1) > 70) {
                        if (secondaryStreet.length <= 70) {
                            primarySecondaryStreetStr = secondaryStreet;
                        } else {
                            primarySecondaryStreetStr = secondaryStreet.substring(0, 69);
                        }
                    } else {
                        primarySecondaryStreetStr = secondaryStreet + ' ' + primaryStreet;
                    }

                } else if (primaryStreet !== '') {
                    if (primaryStreet.length <= 70) {
                        primarySecondaryStreetStr = primaryStreet;
                    } else {
                        primarySecondaryStreetStr = primaryStreet.substring(0, 70);
                    }
                }
            }
            $container.find('[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.primaryStreet"], [name=street]').val(primarySecondaryStreetStr);

            // Pre-populate city and locality
            if (doubleDependentlocality !== '' || dependentLocality !== '') {
                if (doubleDependentlocality !== '') {
                    // added (+1) in condition as we have not considered "," length as well
                    if ((dependentLocality.length + doubleDependentlocality.length + 1) > 70) {
                        if (doubleDependentlocality.length <= 70) {
                            localityStr = doubleDependentlocality;
                        } else {
                            localityStr = doubleDependentlocality.substring(0, 69);
                        }
                    } else {
                        localityStr = doubleDependentlocality + ' ' + dependentLocality;
                    }

                } else if (dependentLocality !== '') {
                    if (dependentLocality.length <= 70) {
                        localityStr = dependentLocality;
                    } else {
                        localityStr = dependentLocality.substring(0, 70);
                    }
                }
            }
            $container.find('[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.doubleDependentLocality"], [name=locality]').val(localityStr);
            $container.find('[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.city"], [name=city]').val(city);

            if (city !== '' && localityStr !== '') {
                localityCityStr = localityStr + ' <br />' + city;
            } else {
                localityCityStr = (localityStr !== '') ? localityStr : city;
            }

            $container.find('.locality-city').html(localityCityStr);

            isBfpoAddress = localityCityStr && localityCityStr.startsWith('BFPO');

            // If edit button has been clicked, empty the company name, flat number, building name and primary street fields fields
            if (obj.editButtonClicked) {
                $pcaForm.find(obj.groupFields + ", [name='/com/tesco/ecom/util/PCAAddressVO.pCAAddress.primaryStreet'], [name=street]").val('');
                $pcaForm.find(self.groupFields).addClass('required');
            } else {
                $pcaInput.blur();
            }

            hideMessage();

            $pcaForm.data('isBfpoAddress', obj.enableBfpo && isBfpoAddress);

            obj.manualAddressSignUpSlideDown();

            disableEditButton();

            if (!obj.editButtonClicked) {

                if (obj.enableBfpo) {
                    bfpo.updateValidation($pcaForm);
                }

                $pcaInput.parents('form').validate().checkForm();

                if (obj.enableBfpo && isBfpoAddress) {
                    validationExtras.enableSave(
                        $pcaInput.parents('form').find('[name=nick-names], .postal-code-pca, ' + bfpo.sEnableSaveRequiredFields),
                        $pcaInput.parents('form').find('input.save')
                    );
                } else {
                    validationExtras.enableSave(
                        $pcaInput.parents('form').find('[name=nick-names], .postal-code-pca, ' + obj.groupFields),
                        $pcaInput.parents('form').find('input.save')
                    );
                }
            }
        };

    }

    return PCA_EditableAddress;

});
