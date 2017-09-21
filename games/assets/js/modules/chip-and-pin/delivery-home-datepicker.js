/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require,jQuery,Zepto */

define('modules/chip-and-pin/delivery-home-datepicker', ['domlib'], function ($) {
    'use strict';

    var STANDALONE = true,
        all = [];

    function clearDatePickers(except) {
        var ii;
        for (ii = 0; ii < all.length; ii = ii + 1) {
            if (all[ii] !== except) {
                all[ii].hide();
            }
        }
    }

    function DatePicker(element, options) {

        this.$el = $(element);
        this.proxy('show').proxy('ahead').proxy('hide').proxy('keyHandler').proxy('selectDate');

        options = $.extend({}, $.fn.datepicker.defaults, options);

        if ((!!options.parse) || (!!options.format) || !this.detectNative()) {
            $.extend(this, options);
            this.$el.data('datepicker', this);
            all.push(this);
            this.init();
        }

    }

    DatePicker.prototype = {

        detectNative: function () {
            if (STANDALONE) {
                return false;
            }
            // Attempt to activate the native datepicker, if there is a known good
            // one. If successful, return true. Note that input type="date"
            // requires that the string be RFC3339, so if the format/parse methods
            // have been overridden, this won't be used.
            if (navigator.userAgent.match(/(iPad|iPhone); CPU(\ iPhone)? OS 5_\d/i)) {
                // jQuery will only change the input type of a detached element.
                var $marker = $('<span>').insertBefore(this.$el);
                this.$el.detach().attr('type', 'date').insertAfter($marker);
                $marker.remove();
                return true;
            }
            return false;
        },
        init: function () {
            var $months = this.nav('months', 1),
            //$years = this.nav('years', 12),
                $nav = $('<div>').addClass('nav').append($months),//.append($years);
                $calendar = $("<div>").addClass('calendar'),
                that = this;

            this.$month = $months.find('.name');
            //this.$year = $years.find('.name');


            // Populate day of week headers, realigned by startOfWeek.
            $.each(this.shortDayNames, function (i) {
                $calendar.append('<div class="dow">' + that.shortDayNames[(i + that.startOfWeek) % 7] + '</div>');
            });

            this.$days = $('<div></div>').addClass('days');
            $calendar.append(this.$days);

            this.$picker = $('<div></div>')
                .on('tap click', function (e) {
                    e.stopPropagation();
                })
                // Use this to prevent accidental text selection.
                .mousedown(function (e) {
                    e.preventDefault();
                })
                .addClass('datepicker')
                .append($nav)
                .append($calendar)
                .insertAfter(this.$el);

            this.$el.data('selected', this.$el.data('first'));

            this.$el.change($.proxy(function () {
                this.selectDate();
            }, this));

            this.selectDate();

            if (STANDALONE) {
                this.$el.hide();
                this.show();
            } else {
                this.$el
                    .focus(this.show)
                    .on('tap click', this.show);
                this.hide();
            }

            //this.shownMonth = 0;
            this.shownDate = '';

            this.update(this.$el.data('first'));
        },
        nav: function (c, months) {
            var $subnav = $('<div>' +
                '<span class="prev button icon disabled" data-icon="g"></span>' +
                '<span class="name"></span>' +
                '<span class="next button icon" data-icon="r"></span>' +
                '</div>').addClass(c);
            $('.prev', $subnav).on('tap click', $.proxy(function () {
                this.ahead(-months, 0, $('.prev'));
                return false;
            }, this));
            $('.next', $subnav).on('tap click', $.proxy(function () {
                this.ahead(months, 0, $('.next'));
                return false;
            }, this));
            return $subnav;

        },
        updateName: function ($area, s) {
            // Update either the month or year field
            $area.html(s);
        },
        selectMonth: function (date) {
            var newMonth = new Date(date.getFullYear(), date.getMonth(), 1),
                rangeStart = this.rangeStart(date),
                rangeEnd = this.rangeEnd(date),
                num_days = this.daysBetween(rangeStart, rangeEnd),
                row = 0,
                ii = 0,
                thisDay,
                formatDay,
                $day,
                today = false,
                contents,
                checkDate = function (value) {
                    if (formatDay === value.date) {
                        $day.addClass('available').attr('charge', value.charge);
                    }
                };

            if (!this.curMonth || !(this.curMonth.getFullYear() === newMonth.getFullYear() && this.curMonth.getMonth() === newMonth.getMonth())) {

                this.curMonth = newMonth;
                this.$days.empty();

                for (ii = 0; ii <= num_days; ii = ii + 1) {
                    thisDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + ii);
                    formatDay = this.format(thisDay);
                    $day = $('<div></div>').attr('date', formatDay);

                    $day.text(thisDay.getDate());

                    if (ii % 7 === 0) {
                        $day.addClass('row-start');
                        row++;
                    }

                    if (ii % 7 === 6) {
                        $day.addClass('row-end');
                    }

                    if (Math.ceil(num_days / 7) === row) {
                        $day.addClass('last-row');
                    }

                    if (thisDay < new Date()) {
                        $day.addClass('past');
                    }

                    if (thisDay.getMonth() !== date.getMonth()) {
                        $day.addClass('overlap');
                        $day.text("");
                    } else {
                        this.available.forEach(checkDate);
                    }

                    this.$days.append($day);
                }

                this.updateName(this.$month, this.monthNames[date.getMonth()] + ' ' + this.curMonth.getFullYear());

                this.$days.find('div').on('tap click', $.proxy(function (e) {
                    var $targ, date1, selectedMonth, selectedYear, d, m, y, prev;

                    $targ = $(e.target);
                    if ($targ.attr("date") === undefined) {
                        return;
                    }
                    date1 = this.parse($targ.attr("date"));
                    selectedMonth = date1.getMonth() + 1;
                    selectedYear = date1.getFullYear();
                    d = new Date();
                    m = d.getMonth() + 1;
                    y = d.getFullYear();
                    prev = $('.datepicker .prev');

                    if ($targ.hasClass('available') && !$targ.hasClass("overlap")) {
                        // The date= attribute is used here to provide relatively fast
                        // selectors for setting certain date cells.
                        this.update($targ.attr("date"), $targ.attr("charge"));

                        this.$days.find('div').removeClass('selected');
                        $targ.addClass('selected');
                        // Don't consider this selection final if we're just going to an
                        // adjacent month

                        prev.removeClass('disabled');
                        if (selectedMonth === m && selectedYear === y) {
                            prev.addClass('disabled');
                        }

                        this.selectDate(this.parse($targ.attr("date")));
                        if (!$targ.hasClass('overlap')) {
                            this.hide();
                        }
                    }

                }, this));

                today = $("[date='" + this.format(new Date()) + "']", this.$days);
                if (today) {
                    contents = today.text();
                    today.addClass('today').html('<span>' + contents + '</span>');
                }

                $('.available[date="' + $(".date").val() + '"]', this.$days).addClass('selected');

            }
        },
        selectDate: function (date, bShouldNotSet) {

            if (date === undefined) {
                if (window.TescoData.ChipAndPin && window.TescoData.ChipAndPin.init.serverDate) {
                    date = this.parse(window.TescoData.ChipAndPin.init.serverDate);
                }
            }

            if (!date) {
                date = new Date(this.$el.data('selected'));
            }


            if (!bShouldNotSet) {
                this.selectedDate = date;
                this.selectedDateStr = this.format(this.selectedDate);
                this.selectMonth(this.selectedDate);
            } else {
                this.shownDate = date;
                this.selectMonth(date);
            }
        },
        update: function (s) {
            this.$el.data('selected', s);
            this.$el.trigger('change');
        },
        show: function (e) {
            if (e) {
                e.stopPropagation();
            }

            // Hide all other datepickers.
            if (!STANDALONE) {
                clearDatePickers(this);
            }

            var offset = this.$el.offset();

            if (!STANDALONE) {
                this.$picker.css({
                    top: offset.top + this.$el.outerHeight() + 2,
                    left: offset.left,
                    position: 'absolute',
                    zIndex: '900',
                    margin: '0 0 18px 0'
                });
            }
            this.$picker.show();

            if (!STANDALONE) {
                $('html').on('keydown', this.keyHandler);
            }
        },
        hide: function () {
            if (!STANDALONE) {
                this.$picker.hide();
            }
            if (!STANDALONE) {
                $('html').off('keydown', this.keyHandler);
            }
        },
        keyHandler: function (e) {

            // Keyboard navigation shortcuts.
            switch (e.keyCode) {
                case 9:
                case 27:
                    // Tab or escape hides the datepicker. In this case, just return
                    // instead of breaking, so that the e doesn't get stopped.
                    this.hide();
                    return;
                case 13:
                    // Enter selects the currently highlighted date.
                    this.update(this.selectedDateStr);
                    this.hide();
                    break;
                case 38:
                    // Arrow up goes to prev week.
                    this.ahead(0, -7);
                    break;
                case 40:
                    // Arrow down goes to next week.
                    this.ahead(0, 7);
                    break;
                case 37:
                    // Arrow left goes to prev day.
                    this.ahead(0, -1);
                    break;
                case 39:
                    // Arrow right goes to next day.
                    this.ahead(0, 1);
                    break;
                default:
                    return;
            }
            e.preventDefault();
        },
        parse: function (s) {
            // Parse a partial RFC 3339 string into a Date.
            var m;
            if (s === undefined) {
                return;
            }
            m = s.match(/^(\d{4,4})-(\d{2,2})-(\d{2,2})$/);
            return m ? new Date(m[1], m[2] - 1, m[3]) : null;
        },
        format: function (date) {
            // Format a Date into a string as specified by RFC 3339.
            var month = (date.getMonth() + 1).toString(),
                dom = date.getDate().toString();
            if (month.length === 1) {
                month = '0' + month;
            }
            if (dom.length === 1) {
                dom = '0' + dom;
            }
            return date.getFullYear() + '-' + month + "-" + dom;
        },
        ahead: function (months, days, obj) {
            var selectedMonth,
                selectedYear,
                d,
                m,
                y,
                prev;

            if (obj && obj.hasClass('disabled')) {

                return days;
            }
            // Move ahead ``months`` months and ``days`` days, both integers, can be
            // negative.

            // only move forward if month and year are => current month and year
            if (this.shownDate === '') {
                this.shownDate = this.selectedDate;
            }

            //if(new Date(this.shownDate).getMonth() + months >= new Date().getMonth() &&
            //new Date(this.shownDate).getYear() >= new Date().getYear()){

            this.selectDate(new Date(this.shownDate.getFullYear(), this.shownDate.getMonth() + months, 1), true);
            //}
            selectedMonth = this.shownDate.getMonth() + 1;
            selectedYear = this.shownDate.getFullYear();
            d = new Date();
            m = d.getMonth() + 1;
            y = d.getFullYear();
            prev = $('.datepicker .prev');
            prev.removeClass('disabled');
            if (selectedMonth === m && selectedYear === y) {
                prev.addClass('disabled');
            }
        },
        proxy: function (meth) {
            // Bind a method so that it always gets the datepicker instance for
            // ``this``. Return ``this`` so chaining calls works.
            this[meth] = $.proxy(this[meth], this);
            return this;
        },
        daysBetween: function (start, end) {
            // Return number of days between ``start`` Date object and ``end``.
            start = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
            end = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
            return (end - start) / 86400000;
        },
        findClosest: function (dow, date, direction) {
            // From a starting date, find the first day ahead of behind it that is
            // a given day of the week.
            var difference = direction * (Math.abs(date.getDay() - dow - (direction * 7)) % 7);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + difference);
        },
        rangeStart: function (date) {
            // Get the first day to show in the current calendar view.
            return this.findClosest(this.startOfWeek,
                new Date(date.getFullYear(), date.getMonth()),
                -1);
        },
        rangeEnd: function (date) {
            // Get the last day to show in the current calendar view.
            return this.findClosest((this.startOfWeek - 1) % 7,
                new Date(date.getFullYear(), date.getMonth() + 1, 0),
                1);
        }
    };

    /* DATEPICKER PLUGIN DEFINITION
     * ============================ */

    if ($('.kiosk').length) {

        $.fn.datepicker = function (options) {
            return this.each(function () {
                return new DatePicker(this, options);
            });
        };

        $(function () {
            if (!STANDALONE) {
                $('html').on('tap click', clearDatePickers);
            }
        });

        $.fn.datepicker.DatePicker = DatePicker;

        $.fn.datepicker.defaults = {
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            shortDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            longDayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            startOfWeek: 1,
            suffix: function (number) {
                var d = number % 10,
                    s = ['st', 'nd', 'rd'];
                return d >= 1 && d <= 3 && (number < 11 || number > 13) ? s[d - 1] : 'th';
            }
        };

    }
});