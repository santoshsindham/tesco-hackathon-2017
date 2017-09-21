/*global define: true */
define(['domlib', './common', 'modules/common'], function($, scrollTo, common){

	scrollTo.event = 'click';

	common.init.push(function(){
		scrollTo.init();
	});

});