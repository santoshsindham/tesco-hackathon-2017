/*global define: true, document: true */
define([
    'domlib',
    'modules/common',
    'modules/custom-dropdown/common',
    'modules/validation'
], function ($, common, customDropdown, validationExtras) {
    'use strict';
    var selfService = {

        init: function () {

            $(document).on('change', '#priReason', function () {
                var cont_value = this.value;
                if (cont_value) {
                    $.ajax({
                        url: $('#secondaryReasonDiv').data('url'),
                        data: {'ssb_block' : 'rwd-secondary-reason-codes', 'priName' : cont_value },
                        dataType: 'html',
                        success: function (data) {
                            var mydata = $(data);
                            $('div#secondaryReasonDiv').replaceWith(mydata);

                            if (common.isPage('raiseClaim')) {
                                $('#secReason').removeAttr('disabled').removeClass('visually-hidden-select');
                            } else {
                                customDropdown.init($('#secReason'));
                            }
                        }
                    });
                }
            });

            $('.print-page a').on("click tap", common.print);

            //controls character input/counter
            $("div.cancel-orders-details").on('keyup', 'textarea.char-limit', function () {
                var charLength = $(this).val().length,
                    charLimit = $(this).attr('data-limit'),
                    chr_rem = charLimit - $(this).val().length,
                    chr_msg = ' character';

                if (!charLimit) {
                    charLimit = 1000; //default character limit
                }

                if (charLength >= charLimit) {
                    $(this).val($(this).val().substr(0, charLimit));
                }

                if (chr_rem !== 1) {
                    chr_msg += 's';
                }
                chr_msg += ' remaining';

                $("#charTxt").html((charLimit - $(this).val().length) + chr_msg);
            });


            this.orderCancelValidation.init();

        },


        orderCancelValidation: {

            init: function () {

                var $form = $('form.cancel-order-form');

                // enable validation - rules and messages defined in html
                $form.validate({
                    onkeyup: false,
                    focusInvalid: false,
                    onfocusout: function (e) {
                        this.element(e);
                    },
                    errorElement: 'span',
                    errorPlacement: function (error, element) {
                        error.insertAfter(validationExtras.errorPlacementElement(element));
                    },
                    rules: {
                        'primaryReason': {
                            required: true
                        },
                        'secondaryReason': {
                            required: true
                        },
                        'comments': {
                            required: true
                        }
                    },
                    messages: {
                        'primaryReason': {
                            required: "Please select primary reason"
                        },
                        'secondaryReason': {
                            required: "Please select a reason"
                        },
                        'comments': {
                            required: "Please enter comments"
                        }
                    }
                });

                // apply focus fix for android devices
                validationExtras.focusoutFix($form);
            }
        }

    };

    common.init.push(function () {
        selfService.init();
    });

    return selfService;

});