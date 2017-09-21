define([
        'domlib',
        'modules/common',
        'modules/breakpoint',
        'modules/checkout/resetForm',
        'modules/custom-dropdown/common'
], function ($, common, breakpoint, resetForm, customDropdown) {
	var updateDays = {

		init: function () {
			$('.age-restriction').each(function(){
				var $wrapper   = $(this);
				var $selectDay = $wrapper.find('[name=bday-day]');

				$selectDay.data('original-options', $selectDay.find('option').clone() );

				$wrapper.find('[name=bday-month], [name=bday-year]').on('change', function (e) {
					updateDays.setDayDrop( $selectDay, $wrapper.find('[name="bday-month"]'), $wrapper.find('[name="bday-year"]') );
				});
			});
		},

		setDayDrop: function ($daySelect, $monthSelect, $yearSelect) {			
			var day = $daySelect.find('option:selected').val(),
				month = $monthSelect.find('option:selected').val(),
				year = $yearSelect.find('option:selected').val(),
				noOfDays = updateDays.daysInMonth(month, year);
			
			if (month !== '' && year !== '') {
				updateDays.show($daySelect, noOfDays);
			}
		},

		daysInMonth: function (month, year) {
			var dd = new Date(year, month, 0);
			return dd.getDate();
		},

		show: function ($select, noOfDays) {			
			var $control = $select.parent().find("a.control");
			var $dayItems = customDropdown.getWrapper( $control ).find('li').not('.alt-heading');
			var currentValue = $select.val();
			var bDayRemained = false;
			
			if (common.isTouch() && !breakpoint.kiosk) {
				$select.empty();
				$select.data('original-options').each(function(){
					var $elm  = $(this),
						day = parseInt( $elm.val(), 10 );

					if (isNaN(day) || day <= noOfDays) {
						if ($elm.val() === currentValue) {
							$elm.prop('selected', true);
							$control.find('.innerText').text(currentValue);
							bDayRemained = true;
						}
						$select.append( $elm );
					}
				});
				if (!bDayRemained) {
					$control.find('.innerText').text('DD');
				}
			} else {
				$dayItems.each(function () {
					var $elm  = $(this),
						day = parseInt( $elm.find('a').data('value'), 10 );

					if (isNaN(day) || day <= noOfDays) {
						$elm.show();
					} else {
						$elm.hide();
					}
				});
			}
			
			if (currentValue > noOfDays) {
				updateDays.resetDropdown( $select );
			}
		},

		resetDropdown: function ($select) {
			var $control = $select.parent().find("a.control");
			var $wrapper = customDropdown.getWrapper( $control );
			var $option  = $select.find('option');

			$option.removeAttr('selected');
			$option.eq(0).attr('selected', 'selected');

			$select[0].selectedIndex = 0;

			customDropdown.updateControlText( $wrapper, $option.eq(0).text() );
			$select.next().find('.current').removeClass('current');
			$wrapper.find('.sort').eq(0).addClass('current');

			$wrapper.parents('.age-restriction').find('.error').not('input, select').remove();
		}
	};

	return updateDays;
});