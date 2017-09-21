/*global define: true */
define([
        
	'domlib',
	'modules/common',
	'modules/breakpoint'
	
], function($, common, breakpoint) {

	var scrollTo = {
			init: function() {
				var self = scrollTo;
				//scrollTo.bindEvents();		
			},
			bindEvents: function() {
				$('.scrollTo').on(self.event, function(e) {					
					self.doScroll($(this));
					return false;
				});
			},
			jumpTo: function(position) {
				if (breakpoint.mobile || breakpoint.hTablet || breakpoint.vTablet) {
					$(document).scrollTop( position );
				}
			},
			doScroll: function($elem) {
				var idToScroll = $elem.data('scrollToId'); 
				if (idToScroll !== '') {
					var $scrollTo = $("#" + idToScroll);
					if ($scrollTo.length) {
						//$.scroll($scrollTo.offset().top, 1500, 'ease-in-out');
						self.jumpTo($scrollTo.offset().top);
					}
				}
			}		
	};
	
	return scrollTo;

	}
);

