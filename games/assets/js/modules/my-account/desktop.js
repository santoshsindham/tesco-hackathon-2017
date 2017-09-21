/*global define: true */
define(['domlib', 'modules/common', './common'], function($, common, myAccount){

	
	
	common.init.push(function(){		
		myAccount.init();
	});
	
	return myAccount;

});