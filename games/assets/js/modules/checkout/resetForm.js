define(['domlib', 'modules/custom-dropdown/common'], function($, customDropdown){
	var resetForm = {
		init: function ( $container, $exclusions, resetFieldsFlag ) {
			// .addClass('highlight') // IS THIS NEEDED? IS IT EVER REMOVED?
			if (typeof $exclusions === 'undefined') {
				$exclusions = 'any-text-that-will-never-be-matched';
			}

			$container.find('input[type=text]').not( $exclusions ).each(function(){
				var $input  = $(this);
				var $parent = $(this).parents('.placeholder');

				var value = '';

				if (resetFieldsFlag === false) {
					value = this.value;
				} else if (resetFieldsFlag === true) {
					value = '';
				} else {
					value = this.defaultValue;
				}

				$input.removeClass('valid error').val( value );

				// check if placeholder needs to be set up
				if (!$parent.length && this.defaultValue === "") {
					if ($input.attr('placeholder')) {
						$input.placeholder({ inputWrapper: '<div class="placeholder" />' });
					}
				}
				// the value has been cleared, so make sure the placeholder is visible
				else {
					$parent.find('label').css('display', 'block');
				}
			});

			if (resetFieldsFlag === true || typeof resetFieldsFlag === 'undefined') {
				// reset custom checkboxes
				$container.find('.custom-checkbox').each(function(){
					if (this.checked) {
	//						$(this).removeAttr('checked').parents('.checkbox-wrapper').removeClass('selected');
						$(this).click();
					}
				});

			// reset custom dropdowns
				$container.find('select').not( $exclusions ).each(function(){
					var $select  = $(this);
					var $wrapper = $select.parent().find('.customDropdown');
					var $option  = $select.find('option');

					$option.removeAttr('selected');
					$option.eq(0).attr('selected', 'selected');

					$select[0].selectedIndex = 0;
					$container.find('.current').removeClass('current');
					$container.find('.neighbour-house-no').hide();
					customDropdown.updateControlText( $wrapper, $option.eq(0).text() );

					$wrapper.removeClass('normal-background');
				});

				$container.find('.error').not('input, select').remove();
			}
		}
	};

	return resetForm;
});
