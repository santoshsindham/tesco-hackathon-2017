define(['domlib', './common', 'modules/common'], function($, carousel, common){

	carousel.extend = function(c){

		c.spring = function(direction){
			var self = c, move;
			$('.products', c.target).addClass('fast');
			move = self.calculateDistance() * self.activePanel;
			switch(direction){
				case('next'):
					move += 5;
					break;
				case('back'):
					move -= 5;
					break;
			}
			self.animate(move);
			window.setTimeout(function () {
				move = self.calculateDistance() * self.activePanel;
				self.animate(move);
				$('.products', c.target).removeClass('fast');
			}, 200);
		};

		c.peak = function (e) {};
		c.tab = function(e) {};


		c.bindEvents = function(){
			var event = 'touchstart click';

			//bind events
			$('.product-carousel-nav .next', c.target).on(event, c.next);

			$('.product-carousel-nav .previous', c.target).on(event, c.back);

			$(c.target).on('swipeLeft', c.next);
			$(c.target).on('swipeRight', c.back);

		};

		return c;

	};

	common.init.push(function() {
		carousel.init();
		carousel.initTabs();
	});

	return carousel;
});
