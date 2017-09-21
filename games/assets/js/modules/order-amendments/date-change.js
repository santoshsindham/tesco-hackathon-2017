/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require,pca,loadCapturePlus */

define(['domlib', 'modules/common', 'modules/breakpoint', 'modules/order-amendments/constants'], function ($, common, breakpoint, constants) {
    "use strict";

    var startCalendar,
        calendarContainer,
        intialize,
        ActionableCalendar;

    ActionableCalendar = function (context, onSaved) {
        var self = this;
        this.context = context;
        this.selectedPrice = "";
        this.onSaved = onSaved || $.noop;

        //--- initialize the calender   
        // clear any previously created calendar
        this.context.find("div.datepicker").remove();
        this.initDate();

        this.context.find(".datepicker").datepicker({
            update: function (dateString) {
                var optionSelector;
                if (dateString) {

                    self.selectedDate = dateString.replace(/\//g, "-");
                    optionSelector = "option[value='" + ActionableCalendar.ISODateToServer(self.selectedDate) + "']";

                    // update the price
                    self.selectedPrice = self.context.find(optionSelector).attr("del-price");
                    self.updateSelectedDate(self.selectedDate);
                    if (self.selectedPrice) {
                        self.context.find(".deliveryCharge .info").html("£" + self.selectedPrice);
                    }
                }
            }
        });

        this.context.find("form.deliveryDateForm").on("submit", this.submitChanges.bind(this));
        this.selectFirstDate();
    };

    ActionableCalendar.prototype = {
        selectFirstDate: function () {
            var firstDate = new Date(this.firstDate),
                selector = "div.available[date='" + this.firstDate + "']",
                self = this,
                selectedDate = new Date(this.selectedDate),
                selectFutureDate = function (duration) {
                    setTimeout(function () {
                        self.context.find(selector).trigger("click");
                    }, duration);
                },
                moveCalendar = function (direction) {
                    if (!breakpoint.mobile) {
                        $("div.datepicker ." + direction).click();
                        selectFutureDate(100);
                    } else {
                        setTimeout(function () {
                            $("div.datepicker .next").click();
                            selectFutureDate(300);
                        }, 1200);
                    }
                };

            if (firstDate.getMonth() < selectedDate.getMonth()) {
                moveCalendar("prev");
            } else if (firstDate.getMonth() > selectedDate.getMonth()) {
                moveCalendar("next");
            } else {
                self.context.find(selector).trigger("click");
            }
        },
        updateSelectedDate: function (formattedDate, aContext) {
            var dateString = ActionableCalendar.toLongDate(formattedDate),
                context = aContext || this.context;

            context.find(".dateInfo .info").html(dateString);
        },
        close: function () {
            common.virtualPage.close();
            this.context.find(".update-button").trigger("click");
        },
        revert: function () {
            this.selectFirstDate();
        },
        submitChanges: function (e) {
            var context = this.context,
                form = $(e.target),
                url = form.data('url'),
                formData = context.find(".deliveryDateForm").serialize(),
                busyContainer = context.find(".deliveryDate").addClass("busy"),
                submitButton = context.find("input[type='submit']").attr("disabled", true),
                loaderCanvas = context.find(".loader").show(),
                lightboxIndex = 0,
                overylayIndex = 0,
                self = this,
                iCurrentDeliveryGroup;

            $.post(url, formData).done(function (result) {

                if (result.errorType === undefined) {
                    // only commit the changes to the DOM when server responds successfully
                    ActionableCalendar.commit(self.context, self.selectedDate);
                    context.closest('.amendDeliveryGroup').find('.amendDeliveryDate').removeData('dateChangeIsRequired');
                    self.close();
                    self.onSaved(true);
                    self.context.trigger(constants.EVENTS.ORDER_DETAILS_AMENDED);
                    if (result.amendCourierInstructionContainer !== undefined) {
                        if ($('#virtual-page').length) {
                            iCurrentDeliveryGroup = $('.amendDeliveryGroup .amendDeliveryDate.isActiveAmendSection').closest('.amendDeliveryGroup').attr('id');
                            $('#' + iCurrentDeliveryGroup + ' .amendCourierInstruction').html(result.amendCourierInstructionContainer);
                        } else {
                            context.closest('.amendDeliveryGroup').find('.amendCourierInstruction').html(result.amendCourierInstructionContainer);
                        }
                    }
                } else {
                    $('.simpleOrderAmend').trigger({
                        type: 'showDialog',
                        dialogConfig: {
                        	className: 'dialogWarning',
                            content: result.dialogMessage,
                            buttons: [{
                                className: 'button tertiary-button buttonDefault buttonOK',
                                title: 'OK',
                                callback: function () {
                                    $("#overlay").css("z-index", overylayIndex);
                                    $("#lightbox").css("z-index", lightboxIndex);
                                }
                            }]
                        }
                    });
                    lightboxIndex = $("#lightbox").css("z-index");
                    overylayIndex = $("#overlay").css("z-index");
                    $("#overlay").css("z-index", 1000000);
                    $("#lightbox").css("z-index", 1000001);

                    self.revert();
                }

            }).always(function () {
                // remove all spinners
                loaderCanvas.hide();
                busyContainer.removeClass("busy");
                submitButton.attr("disabled", false);
            });

            e.preventDefault();
            return false;
        },
        initDate: function () {
            var context = this.context;
            this.firstDate = ActionableCalendar.serverToCalendar(context.find('input[name="scheduled-date-selected"]').val());
            context.find('.datepicker').data('first', context.find('select[id^="ship-dates-sg"]').find('option').first().val().split("-").join("/"));
            context.find('.datepicker').data('last', context.find('select[id^="ship-dates-sg"]').find('option').last().val().split("-").join("/"));
        },
        destroy: function () {

            this.context.find("form.deliveryDateForm").off();
        }
    };

    ActionableCalendar.mobileStart = function (context) {
        var calenderContent = context.clone(),
            aCalendar = new ActionableCalendar(calenderContent, function (successful) {
                if (successful) {
                    ActionableCalendar.commit(context, aCalendar.selectedDate);
                }
            });

        context.hide();
        common.virtualPage.show({
            content: calenderContent,
            customClass: 'mobile-datepicker',
            closeSelector: '.mobileCancel',
            title: context.find(".header h3").text(),
            showBack: true,
            callbackReady: function () {
                // when the virtual page opens, the text on the close button is set to Cancel
                $("#virtualPageBackBtn").html('<span class="icon" data-icon="g" aria-hidden="true"></span> Cancel');
            },
            callbackOut: function () {
                aCalendar.updateSelectedDate(aCalendar.selectedDate, $(".amendDeliveryDate"));
                // trigger a click on the cancel button to close the calendar
                // automatically when the virtual page closes
                context.find(".update-button").trigger("click");
                context.show();
                aCalendar.close();
            }
        });

        aCalendar.isMobile = true;

        return aCalendar;
    };

    ActionableCalendar.desktopStart = function (context) {
        return new ActionableCalendar(context);
    };

    ActionableCalendar.toLongDate = function (dateString) {
        var parseDate = new Date(dateString),
            parseConfig = {
                year: 'numeric',
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            };
        // a simple to test for non ISO complain date formats, e.g IE 8
        if (isNaN(parseDate)) {
            return (new Date(ActionableCalendar.ISODateToServer(dateString))).toLocaleDateString("en-GB", parseConfig);
        }
        return parseDate.toLocaleDateString("en-GB", parseConfig);
    };

    //convert from mm-dd-yyyy to yyyy-mm-dd
    ActionableCalendar.serverToCalendar = function (dateString) {
        var splitted = dateString.split("-");
        return splitted[2] + "/" + splitted[0] + "/" + splitted[1];
    };

    //convert from yyyy-mm-dd to mm-dd-yyyy
    ActionableCalendar.ISODateToServer = function (dateString) {
        var splitted = dateString.split("-");
        return splitted[1] + "-" + splitted[2] + "-" + splitted[0];
    };

    ActionableCalendar.commit = function (context, selectedDate) {
        context.find("input[name='scheduled-date-selected']").val(ActionableCalendar.ISODateToServer(selectedDate));
        context.find(".selectedDate").html(ActionableCalendar.toLongDate(selectedDate));
    };

    startCalendar = function () {
        var currentCalendar,
            deliveryContext;

        calendarContainer.on(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_ACTIVE, function (evt, data) {
            evt = evt || null;
            deliveryContext = $("#" + data.groupID + " .amendDeliveryDate");
            if (breakpoint.mobile) {
                currentCalendar = ActionableCalendar.mobileStart(deliveryContext);
            } else {
                currentCalendar = ActionableCalendar.desktopStart(deliveryContext);
            }
        }).on(constants.EVENTS.ORDER_DETAILS_AMENDS_SECTION_DISCARDED, function () {
            currentCalendar.destroy();
        });
    };

    intialize = function () {
        calendarContainer = $(".amendDeliveryDate");
        startCalendar();
    };

    return {
        init: function () {
            setTimeout(intialize, 300);
        }
    };
});