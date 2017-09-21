/*global define: true */
define(['domlib', './common', 'modules/common'], function($, scrollTo, common){

	scrollTo.event = 'tap click';

	common.init.push(function(){
		scrollTo.init();
	});

});