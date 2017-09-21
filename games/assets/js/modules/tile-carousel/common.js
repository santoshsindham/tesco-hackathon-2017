/* eslint-disable */

define([
	'domlib',
	'modules/breakpoint',
	'modules/common',
	'modules/product-tile/common',
	'modules/load-more/common',
	'modules/responsive-carousel/responsive-carousel'
], function($, breakpoint, common, productTile, loadMore){

  	/** @namespace */
	var carousel = {

		carousels: [],
		numPanels: 5,
		oneCol: 2.5,
		listingCarousel: null,
		thumbnails: false,
		bPortraitImagesEnabled: false,
		iKioskPortraitProductTileWidth: 0,
		iKioskPortraitProductTileCount: 5,

		create: function (target) {
			var self = this;

			//variables
			self.target = target;
			self.activePanel = 0;
			self.numItems = $('.products > li', target).not('.feature-tile').not('.loadingBar').length;
			self.swipe = true;
			self.numPanels = 5,
			self.thumbnailPanel = 0;
			self.noOfThumbnailsPerPanel = 0;

			self.next = function (e, button) {
				if (e) {
					e.stopImmediatePropagation();
					e.preventDefault();
				}

				if (button) {
					button.blur();
				}

				//is this carousel or button disabled?
				if (!$('.next', target).hasClass('disabled')) {
					var move,
					//calculate number of panels for current viewport
					panels = Math.ceil(self.numItems / self.numPanels);

					if (self.kioskListing) {
						panels = Math.ceil(carousel.listingCarousel.numItems / self.numPanels);
					}

					//shall we go forward?
					if (self.activePanel < (panels - 1) && !self.thumbnails) {
						$('.products', target).removeClass('fast');
						self.activePanel += 1;
						move = self.calculateDistance() * self.activePanel;

						//if this is kiosk let's add more!
						if (self.kioskListing) {
							if (loadMore.checkKioskLoadMore(carousel)) {
								loadMore.fetchNextPage(carousel);
								move = self.calculateDistance() * self.activePanel;
								self.thumbNav(self.activePanel);
								self.animate(move, true);
								self.updateCurrentNo(target);
								self.activeThumb(self.activePanel);
								self.numItems = self.getNumItems();
							}
						}
						else if (self.isShopBy && window.isKiosk()) {
							self.animate(move, true);
						}
						else {
							self.animate(move);
							self.checkNav();
						}

					} else {
						if(e.type === 'tap' || e.type === 'click' || e.type === 'touchstart'){
							if (self.thumbnails && self.thumbnailPanel !== self.totalThumbnailPanels-1) {
								self.thumbnailPanel += 1;
								self.shiftThumbnails(self.thumbnailPanel, self.noOfThumbnailsPerPanel);
								self.checkThumbNav();
							}
						}else{
							if(e.type === 'swipeLeft' || e.type === 'swipeRight'){
								if (self.activePanel < (panels - 1)) {
									self.activePanel += 1;
									move = self.calculateDistance() * self.activePanel;
									self.thumbNav(self.activePanel);
									self.animate(move);
									self.updateCurrentNo(target);
									self.activeThumb(self.activePanel);

								}
							}
						}
						//self.spring('next');
					}
					if(common.isPage('PDP') && $(target).hasClass('pdp-main-image')) {
						self.updateCurrentNo(target);
					}
				}
				return false;
			};

			self.back = function (e, button) {
				var move;

				if (button) {
					button.blur();
				}
				if (e) {
//						e.stopPropagation();
					e.preventDefault();
				}

				//is this carousel or button disabled?
				if (!$('.previous', target).hasClass('disabled') || self.thumbnails) {

					//shall we go back?
					if (self.activePanel > 0 && !self.thumbnails || (loadMore.lowerPage > 0 && e !== undefined)) {
						$('.products', target).removeClass('fast');
						self.activePanel -= 1;
						if (loadMore.lowerPage > 1) {
							self.activePanel = 1;
							move = self.calculateDistance();
						}
						else {
							move = self.calculateDistance() * self.activePanel;
						}

						//if this is kiosk let's add more!
						if (self.kioskListing) {
							if(loadMore.checkKioskLoadPrev(carousel)){
								loadMore.fetchPrevPage(carousel);
								self.activePanel++; // = Math.ceil(self.getNumItems() / 12) (loadMore.lowerPage * 20)
								move = self.calculateDistance() * self.activePanel;
								self.thumbNav(self.activePanel);
								//self.animate(move, true);
								self.updateCurrentNo(target);
								self.activeThumb(self.activePanel);
							}
							else {

							}
							self.animate(move, true);

						}
						else if (self.isShopBy && window.isKiosk()) {
							self.animate(move, true);
						}
						else {
							self.animate(move);
						}

						self.checkNav();
					}
					else {
						if (self.thumbnails) {
							if (typeof e !== 'undefined') {
								if((e.type === 'tap' || e.type === 'click' || e.type === 'touchstart') && self.thumbnailPanel !== 0){
									self.thumbnailPanel -= 1;
									//self.shiftThumbnails(self.thumbnailPanel);
									//self.checkThumbNav();

									self.shiftThumbnails(self.thumbnailPanel, self.noOfThumbnailsPerPanel);
									self.checkThumbNav();
								}else{
									if((e.type === 'swipeLeft' || e.type === 'swipeRight') && self.activePanel !== 0 ){
										self.activePanel -= 1;
										move = self.calculateDistance() * self.activePanel;
										self.thumbNav(self.activePanel);
										self.animate(move);

										self.activeThumb(self.activePanel);
									}
								}
							}
						}
						//self.spring('back');
					}
					if(common.isPage('PDP') && $(target).hasClass('pdp-main-image')) {
						self.updateCurrentNo(target);
					}
				}
				if (loadMore.lowerPage > 1) {
					self.enablePrevButton();
				}
				return false;
			};

			self.spring = function(){
				//used only in touch... Empty function to stop errors!
			};

			self.getNumItems = function() {
				var count = $('.products > li', target).not('.feature-tile').not('.loadingBar').length;

				if ($(target).hasClass('shop-by') && !breakpoint.mobile) {
					count = $('.products > li .product', target).not('.feature-tile').not('.loadingBar').length;
				}

				return count;
			},

			self.checkNav = function () {
				self.numItems = self.getNumItems();

				var panels = Math.ceil(self.numItems / self.numPanels);
				if (self.activePanel > 0) {
					$('a.previous', target).parent().removeClass('disabled');
				} else {
					$('a.previous', target).parent().addClass('disabled');
				}

				if (self.activePanel < (panels - 1)) {
					$('a.next', target).parent().removeClass('disabled');
				} else {
					$('a.next', target).parent().addClass('disabled');
				}

				if (self.activePanel >= panels) {
					self.back();
				}
			};

			self.checkThumbNav = function () {
				self.numItems = self.getNumItems();

				if (self.thumbnailPanel > 0) {
					$('a.previous', target).parent().removeClass('disabled');
				} else {
					$('a.previous', target).parent().addClass('disabled');
				}

				if (self.thumbnailPanel < (self.totalThumbnailPanels-1)) {
					$('a.next', target).parent().removeClass('disabled');
				} else {
					$('a.next', target).parent().addClass('disabled');
				}

			};

			self.calculateDistance = function () {
				var move = 0, marginWidth, marginOffset, pageWidth, percentage, productWidth, productsWidth, offset;

				if(self.kioskListing){
					var perc = ((1830) / $(window).width()) * 100;
					if (carousel.bPortraitImagesEnabled) {
						var iMoveDistance = carousel.iKioskPortraitProductTileWidth * 5;
						move = iMoveDistance;
					} else {
						move = 1728;
					}
				}else{

					if($(self.target).closest('.product-description').length){
						if(!breakpoint.mobile) {
							move = 100;
						}
						else{
							move = 100 - 7.9;
						}
					}
					else{

						if (self.numItems > 0) {

							var isTablet = breakpoint.vTablet || breakpoint.hTablet;

							if (self.numPanels < 3 || (self.isShopBy && isTablet)) {

								if (breakpoint.mobile){
									//mobile
									switch (self.numPanels) {
										//set margins based on grid! Hard coded due to browser inconsistancies (esp. mobile devices);
									case(1):
										marginWidth = 7.5;
										break;
									case(2):
										marginWidth = (self.isShopBy && breakpoint.mobile) ? 7.7 : 5.1;
										break;
									//tablet shop by brand
									case(4):
										marginWidth = 5;
										break;
									}
								}
								else{
									switch (self.numPanels){
										// For publishing grid layout changes - 1 column carousel /2 column carousel
										case(1):
											//marginWidth = -7.2;
											marginWidth = 7.5;
											break;
										case(2):
											//marginWidth = -3.5;
											marginWidth = (self.isShopBy && breakpoint.mobile) ? 7.7 : 5.1;
											break;
									}
								}
                                //move = 100 - marginWidth;
                                move = 100;

							} else {
								// kiosk shop by
								if (self.isShopBy && window.isKiosk()) {
									var $wrapper  = $('.products-wrapper', self.target),
										numItems  = $('.view-all', self.target).is(':visible') ? 4 : 5,
										itemWidth = $wrapper.outerWidth() / numItems;

									move = itemWidth * numItems;
								}

								// desktop
								else if (self.numPanels < 6) {
									marginWidth = parseFloat($(target).css('padding-left')) * 2;
									percentage  = (marginWidth / $(target).width()) * 100;

									move = 100 + percentage;
                                    move = 100;
								}

								// kiosk!
								else {
									marginWidth = parseFloat($('.product:eq(0)', target).css('padding-left')) * 4;
									marginWidth = marginWidth + parseFloat($('.product:eq(0)', target).css('padding-right'));
									percentage  = (marginWidth / $(target).width()) * 100;

									move = 100 - percentage;
								}
							}
						}
					}
				}

				return move;
			};

			self.animate = function (move, pixels) {
				var unit = pixels ? 'px' : '%';
				var posX = (-move) + unit;
				var $htmlDoc  = $('html');
				var $products = $('.products', self.target);
				// do animation
				if (!common.isAndroid() && Modernizr.csstransforms3d) {
					$products.css({
                        '-webkit-transform': 'translate3D(' + posX +',0,0)',
                           '-moz-transform': 'translate3D(' + posX +',0,0)',
                                'transform': 'translate3D(' + posX +',0,0)'
					});
				}

				// check for transition support as well as transform (ie 9 supports transforms but not transitions)
				else if (!common.isAndroid() && Modernizr.csstransforms && Modernizr.csstransitions) {
					$products.css({
                        '-webkit-transform': 'translateX(' + posX + ')',
                           '-moz-transform': 'translateX(' + posX + ')',
                              'msTransform': 'translateX(' + posX + ')',
                                'transform': 'translateX(' + posX + ')'
					});
				}

				// fallback animation
				else {
					var speed = ($products.hasClass('fast')) ? 150 : 600;
					$products.animate({
						left: posX
					}, speed);
				}

			};

			self.reset = function () {

				self.activePanel = 0;
				self.animate(0);
				self.hasThumbnails();
				self.checkNav();

				// shift the thumbnails back to the top and ensure that only the first has the selected class
				if(self.thumbnails && (breakpoint.desktop || breakpoint.largeDesktop || window.isKiosk())){
					self.thumbnailPanel = 0;
					self.activeThumb(0);
					self.shiftThumbnails(0,0);
					self.activeThumb(self.activePanel);
					self.updateThumbnails();
					self.checkThumbNav();
					self.thumbNav(self.activePanel);

					// update the current x of x images numbering ready for mobile/tablet
				}
				self.updateCurrentNo(self.target);
				if ((breakpoint.kiosk || breakpoint.vTablet || breakpoint.hTablet) && self.numItems > 1) {
					self.displayInfo();
				}
			};

			self.kioskListingLayout = function(animate){
				var containerWidth = 0;

				carousel.iKioskPortraitProductTileWidth = $('.products > li').first().outerWidth(true);
				$('.load-more-tile', target).remove();
				self.numItems = self.getNumItems();

				if (carousel.bPortraitImagesEnabled) {
					containerWidth = (carousel.iKioskPortraitProductTileWidth * Math.ceil(self.numItems));
				} else {
					containerWidth = (1760 * Math.ceil(self.numItems/12));
					$('#listing .products-wrapper').width(containerWidth);
				}

				$('.products',target).width(containerWidth);

				if(animate){
					var move = self.calculateDistance() * self.activePanel;
					self.animate(move, true);
					self.checkNav();
				}

			};

			//do a nav check on load
			self.checkNav();

			self.activeThumb = function(){
				var thumbs = $(target).find('.thumbnails li');
				thumbs.removeClass('selected');
				thumbs.eq(self.activePanel).addClass('selected');
			};

			self.setupThumbnails = function(){
				$(target).find('.thumbnails li a').each(function(){
					var select = (common.isTouch())? 'tap click' : 'click';
					$(this).on(select, function(e) {
						e.preventDefault();
						self.thumbNav($(this).parent('li').index());
						return false;
					});
				});

				$(target).find('.thumbnails li').eq(0).addClass('selected');

				if(self.totalThumbnailPanels === 1) {
					$(target).find('.product-carousel-nav').hide();
				}
				else {
					$(target).find('.product-carousel-nav').show();
				}
			};

			self.setThumbnailListWidthOrHeight = function () {
				var widthOrHeight = 0;
				if (window.isKiosk()) {

					$(target).find('.thumbnails li').each(function () {
						widthOrHeight += $(this).outerWidth(true);
					});
					$(target).find('.thumbnails > ul').width(widthOrHeight);

					if($(target).find('.thumbnails li').length <= 8){
						$(target).find('.thumbnails').css('left', '0').css('width','100%');
					}

				} else {

					$(target).find('.thumbnails li').each(function () {
						widthOrHeight += $(this).outerHeight(true);
					});
					$(target).find('.thumbnails > ul').height(widthOrHeight);

				}
			};

			self.getTotalThumbnailPanels = function () {
				var thumbnailNum = $(target).find('.thumbnails li').length;

				switch (breakpoint.currentViewport) {
					case 'kiosk':
						self.noOfThumbnailsPerPanel = 6;
						break;
					case 'largedesktop':
						if(thumbnailNum > 6){
							self.noOfThumbnailsPerPanel = 5;
						}else{
							self.noOfThumbnailsPerPanel = 6;
						}
						break;
					case 'desktop':
						if(thumbnailNum > 4){
							self.noOfThumbnailsPerPanel = 3;
						}else{
							self.noOfThumbnailsPerPanel = 4;
						}

				}
				self.totalThumbnailPanels =  Math.ceil(thumbnailNum / self.noOfThumbnailsPerPanel);
			};

			self.thumbNav = function(index){
				self.activePanel = index;
				self.activeThumb();
				var move = self.calculateDistance() * self.activePanel;
				self.animate(move);
				self.updateCurrentNo(target);
				self.checkThumbNav();
			};

			self.shiftThumbnails = function (increment, noOfThumbsShown) {
				var unit  = 'px',
					speed = 600,
					translate  = '',
					$thumbWrap = $(target).find('.thumbnails'),
					$thumbList = $('.product-description .product-carousel .thumbnails ul');

				if (common.isModern() && !common.isAndroid()) {
					switch (noOfThumbsShown) {
					case 3:
						translate =  '0,' + (-increment * $thumbWrap.height()) + unit + ', 0';
						break;
					case 5:
						translate =  '0,' + (-increment * $thumbWrap.height()) + unit + ', 0';
						break;
					case 6:
						translate = (-increment * $thumbWrap.width()) + unit + ', 0, 0';
						break;
					case 0:
						translate = '0, 0, 0';
						break;
					}

					$thumbList.css({
                        '-webkit-transform': 'translate3D(' + translate + ')',
                           '-moz-transform': 'translate3D(' + translate + ')',
                                'transform': 'translate3D(' + translate + ')'
					});
				} else {
					speed = $thumbList.hasClass('fast') ? 150 : 600;
					if (noOfThumbsShown === 3 || noOfThumbsShown === 5 || noOfThumbsShown === 0) {
						$thumbList.animate({ marginTop: -increment * $thumbWrap.height() + unit }, speed);
					} else if (noOfThumbsShown === 6) {
						$thumbList.animate({ marginLeft: -increment * $thumbWrap.width() + unit }, speed);
					}
				}

			};

			self.displayTotalNo = function (target) {
				$(target).find('.carousel-info .image-total').html($(target).find('.products li').length);
			};

			self.displayConjunction = function (target) {
				$(target).find('.carousel-info .conjunction').html(' of ');
			};

			self.updateCurrentNo = function (target) {
				setTimeout(function(){
					if (self.numItems > 1) {
						$(target).find('.carousel-info .image-no').text(self.activePanel+1);
					}
				}, 300);
			};

			self.displayInfo = function () {
				self.displayTotalNo(target);
				self.displayConjunction(target);
				self.updateCurrentNo(target);
			};

			self.addImagesText = function () {
				$(target).find('.carousel-info .info-container').append('<span> images</span>');
			};

			self.updateThumbnails = function () {
				self.setThumbnailListWidthOrHeight();
				self.getTotalThumbnailPanels();
				self.setupThumbnails();
			};

			self.hasThumbnails = function(){
				//does this have thumbnails?
				if($(target).find('.thumbnails').length && $(target).find('.thumbnails').is(':visible')){
					self.thumbnails = true;
				}else{
					self.thumbnails = false;
				}
			};

			self.hasThumbnails();

			if ((breakpoint.kiosk || breakpoint.vTablet || breakpoint.hTablet) && self.numItems > 1) {
				self.displayInfo();
				if (breakpoint.vTablet || breakpoint.hTablet) {
					self.addImagesText();
				}
			}

			// Below required for Infinity Browse
			self.moveToProduct = function(elemId) {
				try {
					var self = this,
						leftPos = $('#' + elemId).offset().left,
						theDistance = self.calculateDistance();

					self.activePanel = Math.floor(leftPos / theDistance);
					if (self.activePanel >= 1) {
						move = theDistance * (self.activePanel);
						self.animate(move, true);
						self.thumbnailPanel = self.activePanel;
						self.checkThumbNav();
						self.activeThumb(self.activePanel);
					}
				}
				catch(e) {}
			};

			self.enablePrevButton = function() {
				var self = this;
				$('a.previous', self.target).parent().removeClass('disabled');
			};

		},



		resetAll: function () {
			var i;
			for (i = 0; i < carousel.carousels.length; i++) {
				if (!$(carousel.carousels[i].target).parent().is('#listing')) {
					carousel.carousels[i].reset();
				}
				else {
					carousel.carousels[i].checkNav();
				}
			}
		},

		setNumPanels: function (num) {
			var i;
			for (i = 0; i < carousel.carousels.length; i++) {

				var viewportNum = 'data-itemsperpage-' + breakpoint.currentViewport;
				var $elem = $(carousel.carousels[i].target);

				if($elem.hasClass("tabbed")) {
					//carousel.carousels[i].numPanels = parseInt($(carousel.carousels[i].target).attr(viewportNum), 10);
					carousel.carousels[i].numPanels = Math.floor($elem.width() / $elem.find('.products li').eq(0).width());
				}
				else {
					if ($(carousel.carousels[i].target).hasClass('shop-by')) {
						carousel.carousels[i].numPanels = breakpoint.mobile ? 2 : 4;
					}
					else if ($elem.parent('#listing').length) {
						carousel.carousels[i].numPanels = common.getNumberOfVisibleItemsForKioskListing($elem.parent('#listing'));
					}
					else if($(carousel.carousels[i].target).parent('.main-details').length) {
						carousel.carousels[i].numPanels = 1;
					}
					else {
						carousel.carousels[i].numPanels = num;
					}
				}
				if(carousel.carousels[i].numItems <= carousel.carousels[i].numPanels) {
					if($(carousel.carousels[i].target).hasClass('pdp-main-image')){
						$('.product-carousel-nav','.pdp-main-image').hide();
						return false;
					}
					else{
						$('.product-carousel-nav',carousel.carousels[i].target).hide();
					}
				}
				else {
					if (!breakpoint.mobile) $('.product-carousel-nav',carousel.carousels[i].target).show();
				}
			}

			if(window.isKiosk()){
				$('.product-carousel.tabbed').each(function(index){
					if(index > 0){
						$(this).addClass('hidden');
					}
				});
			}
		},

		createNewCarousel: function(target){
			var c = new carousel.create(target);
			if (carousel.extend) {
			    c = carousel.extend(c);
			    c.bindEvents();
			}
			return c;
		},

		// adjust the position of the former prices so that they sit to the right of the current price
		priceFontSize: function(){
			$('.product-carousel .product').each(function(){
				var $product = $(this),
					$former  = $('.former-prices', this);

				if ($former.children('li').length) {
					var $current = $('.price', this),
						pWidth   = ($product.innerWidth() - parseInt( $product.css('padding-left'), 10 ) - parseInt( $product.css('padding-right'), 10 )),
						fWidth   = $former.outerWidth(),
						value    = $current.text().replace(/[^0-9]/g, '');

					// portrait kiosk images do not use padding so some extra space needs adding to this calculation
					if (carousel.bPortraitImagesEnabled) {
						pWidth = ($product.find('.details-buy-box-container').innerWidth() - parseInt( $product.find('.details-buy-box-container').css('padding-left'), 10 ) - parseInt( $product.find('.details-buy-box-container').css('padding-right'), 10 ));
					}

					// if we're working with a large current price, add the 'smaller' class to reduce it's size
					if (value.length > 5 || ($('.from', $current).length && value > 4)) {
						$current.addClass('smaller');
					}

					// get the remaining width to apply to the former price container
					pWidth = pWidth - $current.outerWidth(true) - 2;

					// if the former price exceeds the remaining width, apply the 'wrapped' class to correct the line height
					if (fWidth > pWidth) {
						$former.addClass('wrapped');
					}

					// assign the remaining width the former price container
					$former.css('width', pWidth);
				}

			});
		},

		init: function ($elem) {

	        $(".product-carousel-nav a").bind("touchstart", function() {
	          if(!$(this).parents('li').hasClass("disabled")) {
	            $(this).addClass("touchactive");
	          }
	        });
	        $(".product-carousel-nav a").bind("touchend", function() {
	          //if(!$(this).parents('li').hasClass("disabled")){
	            $(this).removeClass("touchactive");
	          //}
	        });
			$(".product-carousel-nav a").bind("tap click", function(e) {
				$(".product-carousel-nav a").each(function(){
					$(this).removeClass("touchactive");
				});
				if($('#myOrdersForm').length <= 0){
					e.preventDefault();
				}
			});

			if(window.isKiosk() && $elem === undefined){
	          var tabsReadyTimer = setInterval(function(){tabsReadyCheck()},500); // check dom is ready for tab logic

	          function tabsLogic() {
	            var $tabs = $('#product-carousel-tabs');
	            var $tabsCount = $('li', $tabs).length;

	            if(!$tabsCount){
	              $('.product-carousel.tabbed').each(function(){
	                if($(this).find('.products-header h2').css('display') != 'block'){
	                  $('.product-carousel.tabbed').addClass('hidden');
	                }
	              });
	            }
	            else{
	              var $tabsContent = $tabs.parent().nextAll().filter(':lt('+$tabsCount+')');
	              var $tabbedGrids = $('.product-grid', $tabsContent);

	              if($tabbedGrids.length){
	                $tabbedGrids.each(function () {
	                  $(this).removeClass('product-grid').addClass('product-carousel tabbed');
	                  $(this).find('div.products-header').append('<ul class="product-carousel-nav"><li class="disabled"><a href="#" class="previous"><span class="label">Previous</span><span aria-hidden="true" class="icon"></span></a></li><li><a href="#" class="next"><span class="label">Next</span><span aria-hidden="true" class="icon"></span></a></li></ul>');
	                });
	              }
	            }
	          }

	          function tabsReadyCheck() {
	            if($('#main-content .product-carousel').length >= 3) {
	              clearInterval(tabsReadyTimer);
	              tabsLogic();
	            }
	          }
	        }

	        var exists = false;

            var $carouselElem = $('#listing.product-carousel, .shop-by');
	        if ($elem !== undefined) {
	          $carouselElem = $elem;
	        }

			//if($carouselElem.length && !(window.isKiosk())){			// reverted this back (tfs defect 35857) as it stops carousel rendering in kiosk category pages
			//if($carouselElem.length && !($('#listing').length)){		// caused issue 52377 fix on next line
			if(($carouselElem.length && !window.isKiosk()) || ($carouselElem.length && window.isKiosk() & !$('#listing').length)){ // Not kiosk OR is kiosk page not containing #listing

	          $carouselElem.each(function () {
	            var c = carousel.createNewCarousel(this);

	            c.isShopBy = $(this).hasClass('shop-by');
					// Streamline basket epic - class is added in '/stubs/streamline-basket/rich-rel.php'
					c.isStreamLineBasket = $(this).hasClass('streamline-basket-carousel');

	            if(breakpoint.mobile){
	              c.numPanels = (c.isShopBy) ? 2 : 1;
	            }else{
	              if(breakpoint.vTablet || breakpoint.hTablet){
	                c.numPanels = (c.isShopBy) ? 4 : 2;
	              }else{
	                if(breakpoint.desktop){
	                  c.numPanels = 4;
	                }else{
	                  if(breakpoint.largeDesktop){
									c.numPanels = 5;
	                  }else{
	                    if(breakpoint.kiosk){
	                      c.numPanels = 6;
	                    }
	                  }
	                }
	              }
	            }

	            // toggle the display of the view all link in the kiosk viewport
	            if (c.isShopBy && window.isKiosk()) {
	              if ($('.products li', this).length > 5) {
	                var $wrapper  = $('.products-wrapper', this),
	                  wrapWidth = $wrapper.outerWidth(),
	                  itemWidth = wrapWidth / 5;

	                $wrapper.css('width', wrapWidth - itemWidth);

	                $('.view-all', this).css('display', 'inline-block');
	              }
	            }

	            c.checkNav();

	            carousel.carousels.push(c);
	          });

	          exists = true;
	        }

					// Blocks are lazy loaded on PDP and are generated by property file which needs a generic function to re-initialise the content
			if (common.isPage('PDP')) {
	          common.initDeferredMethods();
	        }

	        if (typeof $elem !== 'undefined') {
	          if ($elem.parent().hasClass('carousel-1')) {
	            $elem.removeClass('hidden');
	          }
	          else {
	            $elem.addClass('hidden');
	          }
	          $elem.parent().hasClass('beenInitialised');
	        }

	        return exists;
	      },

		initTabs: function () {

	          var tabbedCarousels   = $('.product-carousel.tabbed'),
	            hiddenCarousels   = $('.product-carousel.tabbed.hidden'),
	            tabbingInProgress = false;

	          //productTile.Height.init();
	          carousel.priceFontSize();

			hiddenCarousels.hide();

	          var select  = (common.isTouch())? 'tap click' : 'click';

	          var $tabs = $('#product-carousel-tabs a');
	          $tabs.on(select, function (e) {
	            e.preventDefault();
	            e.stopPropagation();

	            tabbedCarousels = $tabs.parents('.row').nextAll('.row').find('.product-carousel.tabbed');

	            var index = $tabs.index(this);

	            var oldSelectedCarousel = tabbedCarousels.not('.hidden').first(),
	              newSelectedCarousel = tabbedCarousels.eq(index);

	            if (tabbingInProgress || tabbedCarousels.index(oldSelectedCarousel) === index) {
	              tabbingInProgress = false;
	              return false;
	            }

	            newSelectedCarousel.show();

	            // Update tab selected state
	            $('#product-carousel-tabs li').removeClass('selected');
	            $(this).parent().addClass('selected');

	            tabbingInProgress = true;

	            tabbedCarousels.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');

	            // added kiosk check as modernizer is returning false for the common.isModern() check with chrome
	            if (window.isKiosk() || (common.isModern() && !common.isAndroid())) {
	              var isRunning = false;
	              oldSelectedCarousel
	                .bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e) {
	                  // stop event from being fired twice
	                  if (isRunning) {
	                    return;
	                  }
	                  isRunning = true;

	                  $(this).hide();

	                  newSelectedCarousel
	                    .show(0, function () {
	                      $(this).removeClass('hidden');
	                      tabbingInProgress = false;
	                    });

	                  productTile.Height.adjust( newSelectedCarousel, productTile.Ellipsis.init, false, false );
	                })
	                .addClass('hidden');
	            } else {
	              oldSelectedCarousel
	                .animate({'top': oldSelectedCarousel.outerHeight(), 'opacity': '0'}, 300, function () {
	                  $(this).hide();
	                  newSelectedCarousel
	                    .show()
	                    .animate({'top': '0', 'opacity': '1'}, 300, function () {
	                      $(this).removeClass('hidden');
	                      tabbingInProgress = false;
	                    });
	                })
	                .addClass('hidden');
	            }

	            tabbingInProgress = false;
	          });
	        },

        getScrollLimit: function getScrollLimit() {
            var currentWindowWidth = window.currentDocumentWidth;
            if (currentWindowWidth < 584) {//SVP
                return 0;
            } else if (currentWindowWidth >= 584 && currentWindowWidth < 944) {//MVP
                return 8;
            } else {
                return 4;//LVP + LLVP
            }
        },

        resetResCarousel: function resetResCarousel() {
            var $carousels = $('.product-carousel-heroic, .product-carousel').not("#listing.product-carousel, .product-carousel.shop-by"),
                oCarousel;

            if ($carousels.length > 0) {
                var scrollLimit = carousel.getScrollLimit();

                $carousels.each(function (){
                    oCarousel = $(this).data('carousel');
                    if (oCarousel) {
                    	if ($(this).hasClass('product-carousel-heroic')) {
	                        oCarousel.options.scrollLimit = scrollLimit;
	                        common.Ellipsis.init($(this).find('.product h3'));
	                    }
	                    oCarousel.reset();
                    }
                });
            }
        },

        initResCarousel: function initResCarousel() {
            var self = this;
            $(".product-carousel").not("#listing.product-carousel, .product-carousel.shop-by").carousel({
                enablePeep:!window.isKiosk(),
                itemSelector: "ul.products > li"
            });

            $(".product-carousel-heroic").carousel({
                itemSelector: "ul.products > li",
                scrollLimit: self.getScrollLimit(),
                enablePeep: false
            });

            common.Ellipsis.init($(".product-carousel-heroic").find('.product h3'));

            breakpoint.mobileIn.push(self.resetResCarousel);
            breakpoint.vTabletIn.push(self.resetResCarousel);
            breakpoint.hTabletIn.push(self.resetResCarousel);
            breakpoint.desktopIn.push(self.resetResCarousel);
            breakpoint.largeDesktopIn.push(self.resetResCarousel);
        }
	};

	//viewport functions
	breakpoint.mobileIn.push(function(){
		carousel.setNumPanels(1);
		carousel.resetAll();
	});
	breakpoint.vTabletIn.push(function(){
		carousel.setNumPanels(2);
		carousel.resetAll();
	});
	breakpoint.hTabletIn.push(function(){
		carousel.setNumPanels(2);
		carousel.resetAll();
	});
	breakpoint.desktopIn.push(function(){
		carousel.setNumPanels(4);
		carousel.resetAll();
	});
	breakpoint.largeDesktopIn.push(function(){
		carousel.setNumPanels(5);
		carousel.resetAll();
	});
	breakpoint.kioskIn.push(function(){
		carousel.setNumPanels(6);
		carousel.resetAll();
	});

	common.init.push(function() {
        carousel.initResCarousel();
    });

	return carousel;

});
