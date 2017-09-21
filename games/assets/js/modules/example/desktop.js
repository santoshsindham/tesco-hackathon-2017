/*global define: true */
define(['domlib', 'modules/common', 'modules/breakpoint', './common'], function($, common, breakpoint, example){

	example.desktopStuff = function(){
		//do stuff in here for non touch devices
	};

	if(example.init()){
		example.desktopStuff();
	}

});