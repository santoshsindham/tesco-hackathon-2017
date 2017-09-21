define([
    'domlib',
    'modules/breakpoint',
    'modules/validation'
], function ($, breakpoint, validationExtras) {
    'use strict';

    var bfpo = {

        sContainer: 'div.bfpo-container',
        sToggle: 'a.bfpo-toggle',
        sToggleContentClassName: 'bfpo-toggle-content',
        sToggleActiveClassName: 'is-open',
        sStreetNameInput: '#nv-PrimaryStreet',
        bEventsBound: false,
        validation: {
            rules: {
                oEDITABLE_ADDRESSES: {
                    companyname: {
                        checkEditableAddresses: true,
                        validateSpecialInvalidCharacters: true
                    },
                    flatnumber: {
                        checkEditableAddresses: true,
                        validateSpecialInvalidCharacters: true
                    },
                    buildingname: {
                        checkEditableAddresses: true,
                        validateSpecialInvalidCharacters: true
                    }
                },
                oIR_EDITABLE_ADDRESSES: {
                    '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName': {
                        checkEditableAddresses: true
                    },
                    '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber': {
                        checkEditableAddresses: true
                    },
                    '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.buildingNameNumber': {
                        checkEditableAddresses: true
                    }
                },
                oBFPO_ADDRESS: {
                    companyname: {
                        required: true
                    },
                    flatnumber: {
                        required: true
                    },
                    buildingname: {
                        required: false
                    }
                },
                oIR_BFPO_ADDRESS: {
                    '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName': {
                        required: true
                    },
                    '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber': {
                        required: true
                    },
                    '/com/tesco/ecom/util/PCAAddressVO.pCAAddress.buildingNameNumber': {
                        required: false
                    }
                }
            },
            addRules: function (oRules, $context) {
                var item = '';

                for (item in oRules) {
                    if (oRules.hasOwnProperty(item)) {
                        $('input[name="' + item + '"]', $context).rules('add', oRules[item]);
                    }
                }
            },
            removeRules: function (oRules, $context) {
                var item = '';

                for (item in oRules) {
                    if (oRules.hasOwnProperty(item)) {
                        $('input[name="' + item + '"]', $context).rules('remove');
                    }
                }
            }
        },
        sEnableSaveRequiredFields: '[name=companyname], [name=flatnumber]',

        updateValidation: function updateValidation($form) {
            var self = bfpo,
                validator = $form.validate(),
                settings = validator.settings;

            if ($form.data('isBfpoAddress')) {

                if ($form.is('#ir-register1')) {
                    validator.groups['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName'] = '';
                    validator.groups['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber'] = '';
                    validator.groups['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.buildingNameNumber'] = '';
                    self.validation.removeRules(self.validation.rules.oIR_EDITABLE_ADDRESSES, $form);
                    self.validation.addRules(self.validation.rules.oIR_BFPO_ADDRESS, $form);

                    if (!settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName']) {
                        settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName'] = {};
                    }

                    settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName'].required = validationExtras.msg.companyname.required;

                    if (!settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber']) {
                        settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber'] = {};
                    }

                    settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber'].required = validationExtras.msg.flatnumber.required;
                    $form.find('input[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName"], input[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber"]').addClass('required');
                    $form.find('input[name="/com/tesco/ecom/util/PCAAddressVO.pCAAddress.buildingNameNumber"]').removeClass('required');

                } else {
                    validator.groups.companyname = '';
                    validator.groups.flatnumber = '';
                    validator.groups.buildingname = '';
                    self.validation.removeRules(self.validation.rules.oEDITABLE_ADDRESSES, $form);
                    self.validation.addRules(self.validation.rules.oBFPO_ADDRESS, $form);

                    if (!settings.messages.companyname) {
                        settings.messages.companyname = {};
                    }

                    settings.messages.companyname.required = validationExtras.msg.companyname.required;

                    if (!settings.messages.flatnumber) {
                        settings.messages.flatnumber = {};
                    }

                    settings.messages.flatnumber.required = validationExtras.msg.flatnumber.required;

                    $form.find('input[name="buildingname"]').removeClass('highlight required');
                }

            } else {

                if ($form.is('#ir-register1')) {
                    validator.groups['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName'] = 'editableAddressesError';
                    validator.groups['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber'] = 'editableAddressesError';
                    validator.groups['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.buildingNameNumber'] = 'editableAddressesError';
                    self.validation.removeRules(self.validation.rules.oIR_BFPO_ADDRESS, $form);
                    self.validation.addRules(self.validation.rules.oIR_EDITABLE_ADDRESSES, $form);

                    if (settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName'] && settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName'].required) {
                        delete settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.organisationName'].required;
                    }

                    if (settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber'] && settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber'].required) {
                        delete settings.messages['/com/tesco/ecom/util/PCAAddressVO.pCAAddress.subBuildingNumber'].required;
                    }

                } else {
                    validator.groups.companyname = 'editableAddressesError';
                    validator.groups.flatnumber = 'editableAddressesError';
                    validator.groups.buildingname = 'editableAddressesError';
                    self.validation.removeRules(self.validation.rules.oBFPO_ADDRESS, $form);
                    self.validation.addRules(self.validation.rules.oEDITABLE_ADDRESSES, $form);

                    if (settings.messages.companyname && settings.messages.companyname.required) {
                        delete settings.messages.companyname.required;
                    }

                    if (settings.messages.flatnumber && settings.messages.flatnumber.required) {
                        delete settings.messages.flatnumber.required;
                    }
                }
            }

            validator.resetForm();
        },

        open: function open($parent) {
            var self = bfpo;

            if ($parent && $parent.length) {
                $parent.find(self.sContainer).show();
                self.disableStreetNameInput($parent.find(self.sStreetNameInput));
            }
        },

        close: function close($parent) {
            var self = bfpo,
                $container = null;

            if ($parent && $parent.length) {
                $container = $parent.find(self.sContainer);
                $container.hide();

                if (breakpoint.mobile) {
                    $container.toggleClass(self.sToggleActiveClassName, false);
                }

                self.enableStreetNameInput($parent.find(self.sStreetNameInput));
            }
        },

        bindToggle: function bindToggle($parent) {
            var self = bfpo;

            $parent.find(self.sToggle)
                .off('click')
                .on('click', self.toggle);
        },

        toggle: function toggle(event) {
            var self = bfpo,
                $container = event !== undefined ?
                        $(event.target).closest(self.sContainer) :
                        $(self.sContainer);

            $container.toggleClass(self.sToggleActiveClassName);
        },

        bindEvents: function bindEvents() {
            var self = bfpo;

            if (!self.bEventsBound) {
                $(window).on('breakpointChange', function hideBfpoContainer(event) {
                    if (event.oldViewport === 'mobile' || event.newViewport === 'mobile') {
                        self.close($(self.sContainer).parent());
                    }
                });

                self.bEventsBound = true;
            }
        },

        init: function init() {
            var self = bfpo;

            self.bindEvents();
        },

        disableStreetNameInput: function disableStreetNameInput($el) {
            if ($el && $el.length) {
                $el.removeClass('valid')
                    .prop('readonly', true)
                    .on('keydown', function disableBackspaceKey(event) {
                        if (event.which === 8) {
                            event.preventDefault();
                        }
                    });
            }
        },

        enableStreetNameInput: function enableStreetNameInput($el) {
            if ($el && $el.length) {
                $el.prop('readonly', false)
                    .off('keydown');
            }
        }
    };

    return bfpo;
});
