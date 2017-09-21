define(['domlib'], function ($) {
	var formChanged = {
		trackChanges: function ($form) {
			$('input', $form).change(function () {
				$(this.form).data('changed', true);
			});
		},
		
		isChanged: function ($form) {
			return $form.data('changed');
		}
	};
	
	return formChanged;
});