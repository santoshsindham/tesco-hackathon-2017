/*global define: true */
define(['domlib', './common', './common.attach', 'modules/breakpoint', 'modules/common'], function($, streambasket, addToBasket, breakpoint, common){

	addToBasket.closeNotification = function(notification){
		
		addToBasket.notificationVisible = false;
		$('#notificationContainer').find(notification).fadeOut(function () {
			$(this).remove();
		});

		if(breakpoint.mobile || breakpoint.hTablet || breakpoint.vTablet){
			$('#notificationContainer').fadeOut(function () {
				$(this).removeClass('visible').attr('style','');
			});
		}

	};

		common.init.push(streambasket.init);
		common.init.push(addToBasket.init);

});