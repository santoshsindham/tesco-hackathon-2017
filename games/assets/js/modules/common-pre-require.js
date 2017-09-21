var TESCO = window.TESCO || {};

TESCO.common = {
	
	cssTransitionsSupported: function () {
		return $('html').hasClass('csstransitions');
	},

	overlay: {
	
		show: function (overlayContent,transitionClass,callback) {

			// Check if there's an extra transition class to remove when we show the overlay
			if (typeof(transitionClass) === 'undefined') {
				transitionClass = '';
			}

			var isSubsequentOverlay = false;
			
			// Hide any existing overlays; only one on screen at a time!
			if ($('#overlay').length) {
				isSubsequentOverlay = true;
				TESCO.common.overlay.hide($('#overlay'), isSubsequentOverlay);
			}
			
			var overlayElement = $($('#tmplt-overlay').html().replace(/[\n\r\t]/g,'')),
					lightBoxElement = $('#lightbox', overlayElement),
					cssTransitionsSupported = TESCO.common.cssTransitionsSupported();

			$('#lightbox-content', lightBoxElement).html(overlayContent);
			
			$('body').css({
				'height':window.innerHeight,
				'overflow':'hidden'
			});
			
			overlayElement
				.addClass(transitionClass)
				.css({
					'height':window.innerHeight
				})
				.appendTo('body')
				.on('click', '.close', function (e) {
					e.preventDefault();
					e.stopPropagation();
					TESCO.common.overlay.hide(overlayElement);
				});

			var touchEvents = 'touchmove';
			if (navigator.userAgent.match(/Android/i)) {
				touchEvents = touchEvents + ' touchstart';
			}
			$('#overlay-wrapper', overlayElement)
				.height(window.innerHeight)
				.on(touchEvents, function (event) {
					event.preventDefault();
				}, false);

			if (TESCO.bp.mobile) {
				if (lightBoxElement.outerHeight() + parseInt(lightBoxElement.css('margin-top'), 10) < window.innerHeight) {
					lightBoxElement.on('touchmove', function (e) {
						e.preventDefault();
					}, false);
				}
			} else if (TESCO.bp.largeDesktop || TESCO.bp.desktop) {
				lightBoxElement
					.css('width',overlayContent.outerWidth(true) + 2)
					.on('touchmove', function (e) {
						e.preventDefault();
					}, false);
				$('.filter-options ul', lightBoxElement)
					.on('touchmove', function (e) {
						e.stopPropagation();
					});
			}

			if (TESCO.bp.kiosk) {
				// have to position overlay content early otherwise ie briefly shows the overlay content before repositioning
				// TO BE REMOVED: if Tesco go with chrome for kiosk
				if (!cssTransitionsSupported) {
					lightBoxElement.css('top', 0 - lightBoxElement.outerHeight());
				}
			}
			
			// TODO: This is ugly.
			setTimeout(function () {
				if (isSubsequentOverlay) {
					overlayElement.addClass('noTransitions');
					overlayElement.removeClass('hidden');
				} else {
					if (cssTransitionsSupported) {
						overlayElement.removeClass('hidden');
					} else {
						if (TESCO.bp.kiosk) {
							// slide in the lightbox from top of screen for kiosk
							// TO BE REMOVED: if Tesco go with chrome for kiosk
							lightBoxElement.animate({
								top: 0
							}, 500);
							overlayElement.removeClass('hidden');
						} else {
							overlayElement.removeClass('hidden',300);
						}
					}
				}
			}, 1);
			
			if (typeof(callback) === "function") {
				callback(overlayElement);
			}

		},
		
		hide: function (overlayElement,isSubsequentOverlay) {

			var cssTransitionsSupported = TESCO.common.cssTransitionsSupported();

			if (typeof(overlayElement) === 'undefined') {
				overlayElement = $('#overlay').first();
			}
			
			if (TESCO.bp.mobile) {
				$('body')
					.height('auto')
					.css({
						'overflow':'visible'
					});
			}

			$('body').css({
				'height':'auto',
				'overflow':'visible'
			});

			overlayElement.removeClass('subsequent');
			
			if (isSubsequentOverlay) {
				overlayElement.remove();
			} else {
				if (cssTransitionsSupported) {
					overlayElement.on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
							overlayElement.remove();
						});
					setTimeout(function(){
						overlayElement.addClass('hidden');
					}, 100);
				} else {
					overlayElement
						.addClass('hidden',300,function(){
							overlayElement.remove();
						});
				}
			}

		}

	},
	
	// return the joined list item widths
	getListWidth: function ($listElement) {
		var width = 0;
		
		$('li', $listElement).each(function () {
			width += $(this).outerWidth(true);
		});
		
		return width;
	}
};