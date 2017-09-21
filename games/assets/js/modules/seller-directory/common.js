define(['domlib', 'modules/breakpoint', 'modules/common'], function($, breakpoint, common){
	
	var sellerDir = {
		init: function () {
//			console.log('init');
		}
	};
	
	common.init.push(function () {
		if ($('.seller-directory').length){
			common.init.push(sellerDir.init);
		}
	});

	return sellerDir;
});