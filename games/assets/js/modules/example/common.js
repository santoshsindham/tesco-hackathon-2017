/*global define: true */
define(['domlib', 'modules/common', 'modules/breakpoint'], function($, common, breakpoint){
	var example = {

		el: '#example',

		init: function(){
			var exists = false;
			example.el = $(example.el);

			if(example.el.length){
				//do other stuff here...
				exists = true;
			}

			return true;
		}

	};

	return example;
});