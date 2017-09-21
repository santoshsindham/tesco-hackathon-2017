/*global define: true */
define(['domlib', './common', 'modules/common'], function($, saveForLater, common){

	saveForLater.event = 'click';

	common.init.push(function(){
		saveForLater.init();
	});

});