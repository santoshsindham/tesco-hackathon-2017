/*globals define */
define([
    'domlib',
    'modules/common',
    'lib/jquery.countdown'
], function ($, common) {
    'use strict';

    var eventMessaging = {

        checkDate: function checkDate(endDate) {
            return (new Date(endDate).getTime() > 0 ? true : false);
        },

        init: function init(settings) {
            var settingsCopy = settings || {},
                $countdownContainer = settingsCopy.element
                    ? $(settingsCopy.element)
                    : $('.eventMessaging').find('.countdown'),
                timestamp,
                defaults,
                opts;

            $countdownContainer.each(function () {
                timestamp = $(this).data('endtime');
                defaults = {
                    date: +(new Date(timestamp * 1000)), // date in milliseconds
                    render: function (date) {
                        var hours = date.hours > 0 ? date.hours + 'hr ' : '',
                            mins = date.min > 0 ? date.min + 'min ' : '',
                            secs = date.sec > 0 ? date.sec + 'sec' : '',
                            string = '<span>' + hours + mins + secs + '</span>';

                        $(this.el)[0].innerHTML = string;
                    },
                    onEnd: function () {
                        $(this.el).closest('.eventMessaging').hide();
                    }
                };
                opts = $.extend({}, defaults, settingsCopy);

                if (eventMessaging.checkDate(timestamp)) {
                    $(this).countdown({
                        date: opts.date,
                        render: opts.render,
                        onEnd: opts.onEnd
                    });
                }
            });
        }
    };

    common.init.push(function () {
        eventMessaging.init();
    });

    return eventMessaging;
});
