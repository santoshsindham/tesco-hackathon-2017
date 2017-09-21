/*global define: true */
define(['domlib', 'modules/common', 'modules/breakpoint', './common'], function($, common, breakpoint, example){

	example.touchStuff = function(){
		//do stuff in here for touch devices
	};

	if(example.init()){
		example.touchStuff();
	}

});