/* ===========================================================
 * bootstrap-datepicker.js v1.3.0
 * http://twitter.github.com/bootstrap/javascript.html#datepicker
 * ===========================================================
 * Copyright 2011 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Contributed by Scott Torborg - github.com/storborg
 * Loosely based on jquery.date_input.js by Jon Leighton, heavily updated and
 * rewritten to match bootstrap javascript approach and add UI features.
 * =========================================================== */


!function ( $ ) { 

	var STANDALONE = true;

	var selector = '[data-datepicker]',
			all = [];

	function clearDatePickers(except) {
		var ii;
		for(ii = 0; ii < all.length; ii++) {
			if(all[ii] != except) {
				all[ii].hide();
			}
		}
	}

	function DatePicker( element, options ) {
		this.$el = $(element);
		this.proxy('show').proxy('ahead').proxy('hide').proxy('keyHandler').proxy('selectDate');

		var options = $.extend({}, $.fn.datepicker.defaults, options );

		if((!!options.parse) || (!!options.format) || !this.detectNative()) {
			$.extend(this, options);
			this.$el.data('datepicker', this);
			all.push(this);
			this.init();
		}
	}

	DatePicker.prototype = {

			detectNative: function(el) {
				if (STANDALONE) return false;
				// Attempt to activate the native datepicker, if there is a known good
				// one. If successful, return true. Note that input type="date"
				// requires that the string be RFC3339, so if the format/parse methods
				// have been overridden, this won't be used.
				if(navigator.userAgent.match(/(iPad|iPhone); CPU(\ iPhone)? OS 5_\d/i)) {
					// jQuery will only change the input type of a detached element.
					var $marker = $('<span>').insertBefore(this.$el);
					this.$el.detach().attr('type', 'date').insertAfter($marker);
					$marker.remove();
					return true;
				}
				return false;
			}

		, init: function() {
				var $months = this.nav('months', 1);
				var $years = this.nav('years', 12);

				var $nav = $('<div>').addClass('nav').append($months);//.append($years);

				this.$month = $months.find('.name');
				this.$year = $years.find('.name');

				$calendar = $("<div>").addClass('calendar');

				// Populate day of week headers, realigned by startOfWeek.
				for (var i = 0; i < this.shortDayNames.length; i++) {
					$calendar.append('<div class="dow">' + this.shortDayNames[(i + this.startOfWeek) % 7] + '</div>');
				};

				this.$days = $('<div></div>').addClass('days');
				$calendar.append(this.$days);

				this.$picker = $('<div></div>')
					.click(function(e) { e.stopPropagation() })
					// Use this to prevent accidental text selection.
					.mousedown(function(e) { e.preventDefault() })
					.addClass('datepicker')
					.append($nav)
					.append($calendar)
					.insertAfter(this.$el);

				this.$el.data('selected', this.$el.data('first'));

				this.$el.change($.proxy(function() { this.selectDate(); }, this));

				this.selectDate();

				if (STANDALONE) {
					this.$el.hide();
					this.show();
				} else {
					this.$el
						.focus(this.show)
						.click(this.show)
					this.hide();
				}

				//this.shownMonth = 0;
				this.shownDate = '';
				
				this.update(this.$el.data('first'));
			}

		, nav: function( c, months ) {
				var $subnav = $('<div>' +
					'<span class="prev button icon" data-icon="g"></span>' +
					'<span class="name"></span>' +
					'<span class="next button icon" data-icon="r"></span>' +
					'</div>').addClass(c);
				$('.prev', $subnav).click($.proxy(function() { this.ahead(-months, 0, $('.prev')); return false; }, this));
				$('.next', $subnav).click($.proxy(function() { this.ahead(months, 0, $('.next')); return false; }, this));
				return $subnav;

		}

		, updateName: function($area, s) {
				// Update either the month or year field
				$area.html(s);
		}

		, selectMonth: function(date) {
				var newMonth = new Date(date.getFullYear(), date.getMonth(), 1);

				if (!this.curMonth || !(this.curMonth.getFullYear() == newMonth.getFullYear() &&
						this.curMonth.getMonth() == newMonth.getMonth())) {

					this.curMonth = newMonth;

					var rangeStart = this.rangeStart(date), rangeEnd = this.rangeEnd(date);
					var num_days = this.daysBetween(rangeStart, rangeEnd);
					this.$days.empty();
					var row = 0;
					
					var parentForm = this.$el.parents('form');
					
					var availableDateSelect = $(parentForm).find('select[id^="ship-dates-sg"]').find('option');	
					
					/*var avaibalbeDates = $(parentForm).find('select[id^="ship-dates-sg"]').find('option')
				      .map(function () { 
				        return new Date($(this).val().replace(/-/g, '/')).toString('yyyy-MM-dd'); // return option value attribute
				      }).toArray(); */
					
					for (var ii = 0; ii <= num_days; ii++) {
						var thisDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + ii);
						var $day = $('<div></div>').attr('date', this.format(thisDay));
						$day.text(thisDay.getDate());

						if(ii % 7 === 0){
							$day.addClass('row-start');
							row++;
						}

						if(ii % 7 === 6){
							$day.addClass('row-end');
						}

						if(Math.ceil(num_days / 7) === row){
							$day.addClass('last-row');
						}

						if(thisDay.getMonth() < date.getMonth()){
							$day.addClass('overlap');
						}

						if(thisDay.getMonth() > date.getMonth()){
							$day.addClass('overlap');
						}

						if (thisDay < new Date()) {
							$day.addClass('past');
						}

						//is this day available
						
						$.each(availableDateSelect, function(index){
							if(thisDay.toString('yyyy-MM-dd') == new Date($(this).val().replace(/-/g, '/')).toString('yyyy-MM-dd')){
								$day.addClass('available').data('delivery-price',$(this).attr('del-price'));
							}
						});
						
						/*var first = this.$el.data('first'),
							last = this.$el.data('last');
						
						
						if(thisDay >= new Date(first) && thisDay <= new Date(last + ' 12:00')){ //add 12 hours to the last day
							$day.addClass('available');
						}*/

						this.$days.append($day);
					}

					this.updateName(this.$month, this.monthNames[date.getMonth()] + ' ' + this.curMonth.getFullYear());
					//this.updateName(this.$year, this.curMonth.getFullYear());

					if(new Date(this.selectedDate).getMonth() === new Date().getMonth() &&
							new Date(this.selectedDate).getYear() === new Date().getYear()){
						
						this.$picker.find('.prev').addClass('disabled');
					}else{
						this.$picker.find('.prev').removeClass('disabled');
					}

					this.$days.find('div').click($.proxy(function(e) {
						var $targ = $(e.target);
						if($targ.hasClass('available')){
							// The date= attribute is used here to provide relatively fast
							// selectors for setting certain date cells.
							if($targ.parents('.collection-details-picker').length){
								this.update($targ.attr("date"), "FREE");
							}
							else{
								this.update($targ.attr("date"), $targ.data("delivery-price"));
							}

							this.$days.find('div').removeClass('selected');
							$targ.addClass('selected');
							// Don't consider this selection final if we're just going to an
							// adjacent month.
							if(!$targ.hasClass('overlap')) {
								this.hide();
							}
						}

					}, this));

					var today = $("[date='" + this.format(new Date()) + "']", this.$days);
					if(today){
						var contents = today.text();
						today.addClass('today').html('<span>'+contents+'</span>');
					}
					if(new Date(this.$el.data('selected')).getMonth() === date.getMonth()){
						$('[date="' + this.$el.data('selected') + '"]', this.$days).addClass('selected');
					}


				}
			}

		, selectDate: function(date, bShouldNotSet) {
				if (typeof(date) === "undefined") {
					date = this.parse(this.$el.val());

				};
				if (!date) date = new Date(this.$el.data('selected'));
				if (!bShouldNotSet) {
					this.selectedDate = date;
					this.selectedDateStr = this.format(this.selectedDate);
					this.selectMonth(this.selectedDate);
				}
				else {
					this.shownDate = date;
					this.selectMonth(date);
				}
			}

		, update: function(s) {
				this.$el.data('selected', s);
				this.$el.trigger('change');
			}

		, show: function(e) {
				e && e.stopPropagation();

				// Hide all other datepickers.
				if (!STANDALONE) clearDatePickers(this);

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

				if (!STANDALONE) $('html').on('keydown', this.keyHandler);
			}

		, hide: function() {
				if (!STANDALONE) this.$picker.hide();
				if (!STANDALONE) $('html').off('keydown', this.keyHandler);
			}

		, keyHandler: function(e) {

				// Keyboard navigation shortcuts.
				switch (e.keyCode)
				{
					case 9: 
					case 27: 
						// Tab or escape hides the datepicker. In this case, just return
						// instead of breaking, so that the e doesn't get stopped.
						this.hide(); return;
					case 13: 
						// Enter selects the currently highlighted date.
						this.update(this.selectedDateStr); this.hide(); break;
					case 38: 
						// Arrow up goes to prev week.
						this.ahead(0, -7); break;
					case 40: 
						// Arrow down goes to next week.
						this.ahead(0, 7); break;
					case 37: 
						// Arrow left goes to prev day.
						this.ahead(0, -1); break;
					case 39: 
						// Arrow right goes to next day.
						this.ahead(0, 1); break;
					default:
						return;
				}
				e.preventDefault();
			}

		, parse: function(s) {
				// Parse a partial RFC 3339 string into a Date.
				var m;
				if ((m = s.match(/^(\d{4,4})-(\d{2,2})-(\d{2,2})$/))) {
					return new Date(m[1], m[2] - 1, m[3]);
				} else {
					return null;
				}
			}

		, format: function(date) {
				// Format a Date into a string as specified by RFC 3339.
				var month = (date.getMonth() + 1).toString(),
						dom = date.getDate().toString();
				if (month.length === 1) {
					month = '0' + month;
				}
				if (dom.length === 1) {
					dom = '0' + dom;
				}
				return date.getFullYear() + '/' + month + "/" + dom;
			}

		, ahead: function(months, days, obj) {
				if(obj && obj.hasClass('disabled')){					
					return false;
				}
				// Move ahead ``months`` months and ``days`` days, both integers, can be
				// negative.
				
				// only move forward if month and year are => current month and year
				if (this.shownDate === '') {
					this.shownDate = this.selectedDate;
				}
				
				//if(new Date(this.shownDate).getMonth() + months >= new Date().getMonth() &&
				//	new Date(this.shownDate).getYear() >= new Date().getYear()){
					
					this.selectDate(new Date(this.shownDate.getFullYear(),
						this.shownDate.getMonth() + months,
						1), true);
				//}
				var selectedMonth = this.shownDate.getMonth()+1;
				var selectedYear = this.shownDate.getFullYear();
				var d = new Date();
				var m = d.getMonth()+1;
				var y = d.getFullYear();
				$('.form-mobile-wrapper .datepicker .prev').removeClass('disabled');			
				if(selectedMonth == m && selectedYear == y){
					$('.form-mobile-wrapper .datepicker .prev').addClass('disabled');
				}
			}

		, proxy: function(meth) {
				// Bind a method so that it always gets the datepicker instance for
				// ``this``. Return ``this`` so chaining calls works.
				this[meth] = $.proxy(this[meth], this);
				return this;
			}

		, daysBetween: function(start, end) {
				// Return number of days between ``start`` Date object and ``end``.
				var start = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
				var end = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
				return (end - start) / 86400000;
			}

		, findClosest: function(dow, date, direction) {
				// From a starting date, find the first day ahead of behind it that is
				// a given day of the week.
				var difference = direction * (Math.abs(date.getDay() - dow - (direction * 7)) % 7);
				return new Date(date.getFullYear(), date.getMonth(), date.getDate() + difference);
			}

		, rangeStart: function(date) {
				// Get the first day to show in the current calendar view.
				return this.findClosest(this.startOfWeek,
					new Date(date.getFullYear(), date.getMonth()),
					-1);
			}

		, rangeEnd: function(date) {
				// Get the last day to show in the current calendar view.
				return this.findClosest((this.startOfWeek - 1) % 7,
					new Date(date.getFullYear(), date.getMonth() + 1, 0),
					1);
			}
	};
	
	/* DATEPICKER PLUGIN DEFINITION
	 * ============================ */

	$.fn.datepicker = function( options ) {
		return this.each(function() { new DatePicker(this, options); });
	};

	$(function() {
		$(selector).datepicker();
		if (!STANDALONE) {
			$('html').click(clearDatePickers);
		}
	});

	$.fn.datepicker.DatePicker = DatePicker;

	$.fn.datepicker.defaults = {
		monthNames: ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"]
	, shortDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	, longDayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	, suffix: function (number) {
            var d = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (d === 1) ? 'st' :
                (d === 2) ? 'nd' :
                (d === 3) ? 'rd' : 'th';
    }
	, startOfWeek: 1
	};
}( window.jQuery || window.ender || window.Zepto);