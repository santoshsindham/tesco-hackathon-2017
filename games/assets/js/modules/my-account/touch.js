/*global define: true */
define(['domlib', 'modules/common', './common'], function($, common, myAccount){

	myAccount.eventName = 'tap click';
	
	common.init.push(function(){		
		myAccount.init();
	});
	
	return myAccount;

});