define(['domlib', './common', 'modules/breakpoint', 'modules/common'],function($, carousel, breakpoint, common){

	carousel.extend = function(c){

		c.peak = function (e) {
			var self = c, move, panels;

			switch (e.type) {
			case('mouseenter'):
				panels = Math.ceil(self.numItems / self.numPanels);
				if ($(e.target).closest('.next').length > 0 && self.activePanel < (panels - 1)) {
					$('.products', self.target).addClass('fast');
					move = (self.calculateDistance() * self.activePanel) + 2.5;
					self.animate(move);
				}
				if ($(e.target).closest('.previous').length > 0 && self.activePanel > 0) {
					$('.products', self.target).addClass('fast');
					move = (self.calculateDistance() * self.activePanel) - 2.5;
					self.animate(move);
				}
				break;

			case('mouseleave'):
				panels = Math.ceil(self.numItems / self.numPanels);
				if ($(e.target).closest('.next').length > 0 && self.activePanel < (panels - 1)) {
					move = self.calculateDistance() * self.activePanel;
					self.animate(move);
				}
				if ($(e.target).closest('.previous').length > 0 && self.activePanel > 0) {
					move = self.calculateDistance() * self.activePanel;
					self.animate(move);
				}
				break;
			}

		};

		c.tab = function (e) {
			var self = c;

			e.preventDefault();
			e.stopPropagation();

			var item = $(e.target),
				product = $(e.target).closest('.products > li'),
				index = product.index(),
				panel = Math.floor(index / self.numPanels),
				move;

			if (self.activePanel !== panel) {
				self.activePanel = panel;
				move = self.calculateDistance() * self.activePanel;
				self.animate(move);
				self.checkNav();
				$(e.target).blur();
				window.setTimeout(function () {
					$(e.target).focus();
				}, 600);
			}

		};

		c.bindEvents = function(){
			var target = c.target;
			//bind events
			$('.product-carousel-nav .next', target).on('click',function (event) {
				c.next(event, $(this));
			});
			$('.product-carousel-nav .previous', target).on('click', function (event) {
				c.back(event, $(this));
			});

			if(!window.isKiosk() && !$(c.target).parent('.main-details').length) {
				$('.product-carousel-nav .next, .product-carousel-nav .previous', target).on('mouseenter mouseleave', c.peak);
			}
			else {
				var isShopBy = $(target).hasClass('shop-by');

				// ensure that the swipes aren't added for the shop by if there's not ensough items
				if (!isShopBy || (isShopBy && $('.product', target).length > 5)) {

					// if its the kiosk shop by carousel, bind swipe events to the product wrapper only as shop by has different carousel design
					var swipeElement = (isShopBy) ? $('.products-wrapper', target) : target;

					common.kioskSwipe('left', swipeElement, function(event){
						event.preventDefault();
						event.type = 'swipeLeft';
						c.next(event, $('.product-carousel-nav .next'));
					});

					common.kioskSwipe('right', swipeElement, function(event){
						event.preventDefault();
						event.type = 'swipeRight';
						c.back(event, $('.product-carousel-nav .previous'));
					});
				}
			}

			$('.product a', target).on('focus', c.tab);
		};

		return c;
	};

	common.init.push(function(){
		carousel.init();
		if (breakpoint.kiosk) {
			carousel.initTabs();
		}
	});

});
