/*jslint plusplus: true */
/*globals window,document,console,define,require */

define('modules/order-amendments/courier-instruction-change', [
    'domlib',
    'modules/breakpoint',
    'modules/common',
    'modules/tesco.data',
    'modules/custom-dropdown/common',
    'modules/validation',
    'modules/order-amendments/constants',
    'modules/order-amendments/store-change'],
    function ($, breakpoint, common, data, customDropdown, validationExtras, constants, storeChange) {
        'use strict';

        var init,
            initializeAjaxFramework,
            initializeValidation,
            discardChanges,
            LOADER_MARKUP = '<div class="loader">Updating your instruction...</div>',
            COURIER_INSTRUCTION_SELECTOR = '.amendCourierInstruction',
            savedDropdownValue = null,
            savedInputValue = null,
            onChangeCourierInstructionOption,
            initMobile,
            showNeighbourForm,
            initNeighbourForm,
            handleSubmit,
            clearResetMessage,
            $cachedCourierInstructionMarkup = {},
            bEditInProgress = false;

        clearResetMessage = function clearResetMessage() {
            if ($(COURIER_INSTRUCTION_SELECTOR + ' .warningMessage').length > 0) {
                $(COURIER_INSTRUCTION_SELECTOR + ' .warningMessage').remove();
            }
        };

        handleSubmit = function handleSubmit(context) {
            var shippingGroupID = context.closest('.amendDeliveryGroup').attr('id'),
                content = context.parent('#' + shippingGroupID).find('.amendCourierInstruction .content'),
                request = 'saveCourierInstruction',
                url = context.find('form').data('url'),
                DL = new data.DataLayer(),
                myData = context.find('form').serialize();

            context.append($(LOADER_MARKUP));

            DL.get(url, myData, content, data.Handlers.Checkout, request, function success(result) {
                bEditInProgress = true;

                context.find('input.textNeighbourInstruction')[0].defaultValue = context.find('input.textNeighbourInstruction').val();
                context.find('form').validate().resetForm();
                context.find('input.textNeighbourInstruction').removeClass('error');
                content.find('.courierInstruction').html(result.courierInstruction);
                context.trigger(constants.EVENTS.ORDER_DETAILS_AMENDED);
                $cachedCourierInstructionMarkup.currentContent = context.find('.content .currentContent').clone(false);
                $cachedCourierInstructionMarkup.editContent = context.find('.content .editContent').clone(false);
                if (!breakpoint.mobile) {
                    context.removeClass('isActiveAmendSection');
                    content.find('.update-button').trigger("click");
                } else {
                	storeChange.common.enableUnsavedChangesConfirmation();
                    common.virtualPage.close();
                }
            },
            function failure(response) {
                storeChange.common.errorResponseHandler(response.responseText);
            },
            function complete() {
                context.find('.loader').remove();
            });
        };


        onChangeCourierInstructionOption = function onChangeCourierInstructionOption() {
            var context = null;
            if ($(this).closest('.amendCourierInstruction').hasClass('isActiveAmendSection')) {
                context = $(this).closest('.amendCourierInstruction.isActiveAmendSection');

                if (context.find('select.courier-select').val().indexOf('Neighbour') > 0) {
                	context.find('.neighbour-house-no').show();
                    context.find('.amendCourierInstructionForm').find('.form-actions').show();
                    initNeighbourForm(context);
                } else {
                    context.find('.neighbour-house-no').hide();
                    context.find('.amendCourierInstructionForm').find('.form-actions').hide();
                    context.find('input.textNeighbourInstruction').val('').removeClass('valid');
                    handleSubmit(context);
                }
            }
        };

        initMobile = function initMobile() {
            var sCurrentDeliveryGroup = $('.amendCourierInstruction.isActiveAmendSection').closest('.amendDeliveryGroup').attr('id'),
                $detachedContent = $('.amendCourierInstruction.isActiveAmendSection .content').detach();

            common.virtualPage.show({
                content: '<div class="simpleOrderAmend"><div id="order-summary"><div class="checkout"><div class="amendDeliveryGroup" id="' + sCurrentDeliveryGroup + '"><div class="amendSection amendCourierInstruction isActiveAmendSection"></div></div></div></div></div>',
                title: 'Courier instruction',
                showBack: true,
                customClass: 'amendCourierInstruction',
                callbackReady: function () {
                    $('#virtual-page .isActiveAmendSection').append($detachedContent);
                    $('#virtualPageBackBtn').html('<span class="icon" data-icon="g" aria-hidden="true"></span> Cancel');
                    showNeighbourForm($detachedContent);
                },
                beforeRemoval: function () {
                    var $el = $('#virtual-page .amendCourierInstruction.isActiveAmendSection .content'),
                        $extractVirtualPageContent,
                        $activeContentContainer;

                    if (!bEditInProgress) {
                        $el.find('.currentContent').replaceWith($cachedCourierInstructionMarkup.currentContent);
                        $el.find('.editContent').replaceWith($cachedCourierInstructionMarkup.editContent);
                        $el.find('.customDropdown').remove();
                        $el.find('select.courier-select').removeClass('been-customised');
                        $cachedCourierInstructionMarkup = {};
                    }

                    $extractVirtualPageContent = $('#virtual-page .amendCourierInstruction.isActiveAmendSection .content').detach();
                    $activeContentContainer = $('#order-details #' + sCurrentDeliveryGroup + ' .amendCourierInstruction.isActiveAmendSection');
                    $activeContentContainer.append($extractVirtualPageContent);
                    $activeContentContainer.removeClass('isActiveAmendSection');
                    $activeContentContainer.find('.update-button').trigger("click");
                    $detachedContent = null;
                }
            });
        };

        showNeighbourForm = function showNeighbourForm(context) {
            if (savedDropdownValue.indexOf('Neighbour') > 0) {
                context.find('.neighbour-house-no').show();
                context.find('.amendCourierInstructionForm').find('.form-actions').show();
            }
            initNeighbourForm(context); // Initiate after every time form is showed.
        };

        initializeValidation = function initializeValidation(context) {
            if (!context) {
                context = $(COURIER_INSTRUCTION_SELECTOR);
            }

            var $form = context,
                $select = $form.find('select.courier-select'),
                $input = $form.find('input.textNeighbourInstruction'),
                $save = $form.find('input.save');

            $form.validate({
                focusInvalid: false,
                onkeyup: function (elm) {
                    if (this.check(elm)) {
                        $(elm).addClass('valid');
                    } else {
                        $(elm).removeClass('valid');
                    }
                    validationExtras.enableSave($input, $save);
                },
                onfocusout: function (elm) {
                    this.element(elm);
                    validationExtras.enableSave($input, $save);
                },
                errorElement: 'span',
                rules: {
                    'neighbour-no': {
                        required: function () {
                            return $select.val() === 'neighbour';
                        }
                    }
                },
                messages: {
                    'neighbour-no': {
                        required: $input.attr('title')
                    }
                }
            });

            // apply focus fix for android devices
            validationExtras.focusoutFix($form);
            validationExtras.selectChangeFix($form, $input, $save);

            // set up max character limits
            validationExtras.limitCharacters($form.find('[name=neighbour-no]'), 50);

            // check if the save should be enabled
            validationExtras.enableSave($input, $save);
        };

        discardChanges = function discardChanges() {
            var $el = $(this);

            if (!$el.hasClass('amendCourierInstruction')) {
                $el = $el.parent('.amendDeliveryGroup').find('.amendCourierInstruction');
                if ($el.length === 0) {
                    return;
                }
            }

            $el.find('.currentContent').replaceWith($cachedCourierInstructionMarkup.currentContent);
            $el.find('.editContent').replaceWith($cachedCourierInstructionMarkup.editContent);
            $el.find('.customDropdown').remove();
            $el.find('select.courier-select').removeClass('been-customised');
            $cachedCourierInstructionMarkup = {};
        };

        initializeAjaxFramework = function initializeAjaxFramework() {
            data.Global.init({
                'inlineRequests': {'saveCourierInstruction': []},
                'requests': {
                    'saveCourierInstruction': ['courierInstruction']
                },
                'modules': {'courierInstruction': ['div.isActiveAmendSection div.courierInstruction', 'Updating your instruction...', true]},
                'actions': {
                    'saveCourierInstruction': ['/stubs/save-courier-instruction.php']
                }
            });
        };

        initNeighbourForm =  function initNeighbourForm(context) {
        	context.find('.amendCourierInstructionForm').find('.form-actions').find('.save').unbind('click');
        	context.find('.amendCourierInstructionForm').find('.form-actions').find('.save').on('click', function (event) {
                event.preventDefault();
                if (context.find('form').valid()) {
                    if (savedInputValue !== context.find('input.textNeighbourInstruction').val()) {
                        handleSubmit($('.amendCourierInstruction.isActiveAmendSection'));
                    }
                }
            });
        };

        init = function init() {

            initializeAjaxFramework();

            $(COURIER_INSTRUCTION_SELECTOR).on(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_ACTIVE, function (event) {
                var groupID = event.target.offsetParent.id,
                    context = $("#" + groupID + " .amendCourierInstruction"),
                    currentSection = $(this);

                bEditInProgress = false;

                if (currentSection.hasClass('isActiveAmendSection')) {
                    $cachedCourierInstructionMarkup.currentContent = currentSection.find('.content .currentContent').clone(false);
                    $cachedCourierInstructionMarkup.editContent = currentSection.find('.content .editContent').clone(false);
                    savedDropdownValue = currentSection.find('select.courier-select').val();
                    savedInputValue = currentSection.find('input.textNeighbourInstruction')[0].defaultValue;

                    customDropdown.init(currentSection.find('select.courier-select'));
                    initializeValidation(currentSection.find('form'));
                    clearResetMessage();
                }

                if (breakpoint.mobile) {
                	initMobile();
                }
                showNeighbourForm(context);
            });
            $('.amendDeliveryGroup').on(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_DISCARDED, '.isActiveAmendSection', discardChanges);
            $('.amendDeliveryGroup').on('click', '.amendCourierInstruction .warningMessage .close', clearResetMessage);
            $(document).on('change', 'select.courier-select', onChangeCourierInstructionOption);
        };

        return {
            init: init
        };
    });