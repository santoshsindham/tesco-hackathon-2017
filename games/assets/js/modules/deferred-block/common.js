define(['domlib', 'modules/common'], function($, common) {	
	var deferredBlock = {
		init: function(selector) {
			common.initDeferredMethods($(selector));
		}
	};	
	
	return deferredBlock;
});