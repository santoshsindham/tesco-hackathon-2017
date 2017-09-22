//Temporary condition to avoid touch events being fired twice
if(!window.isKiosk()){
//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
if (!navigator.userAgent.match(/MSIE\s/)) {
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout,
    longTapDelay = 750, longTapTimeout

  function parentIfText(node) {
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2) {
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
   // if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  $(document).ready(function(){
    var now, delta
	/***
	****	TESCO customisation - as we we have responsive and non-responsive pages served with the same JS files, we have an issue with touch devices not able to
	****	to scroll horizonatally due to the hook which Zepto attaches to touchstart, touchmove and touchend. Added conditions to override default behaviour which
	****	removes the swipe gestures.
	***/
	if (typeof window.surpressSwipes === 'undefined') {
		$(document.body)
		  .bind('touchstart', function(e){
			now = Date.now()
			delta = now - (touch.last || now)
			touch.el = $(parentIfText(e.touches[0].target))
			touchTimeout && clearTimeout(touchTimeout)
			touch.x1 = e.touches[0].pageX
			touch.y1 = e.touches[0].pageY
			if (delta > 0 && delta <= 250) touch.isDoubleTap = true
			touch.last = now
			//longTapTimeout = setTimeout(longTap, longTapDelay)
		  })
		  .bind('touchmove', function(e){
			//cancelLongTap()
			touch.x2 = e.touches[0].pageX
			touch.y2 = e.touches[0].pageY
			if (Math.abs(touch.x1 - touch.x2) >= 10 && Math.abs(touch.y1 - touch.y2) < 10) {
				e.preventDefault();
			}
		  })
		  .bind('touchend', function(e){
			//cancelLongTap()

			  // swipe
			  if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
				(touch.y2 && Math.abs(touch.y1 - touch.y2) > 300))

			  swipeTimeout = setTimeout(function() {
				try {
				  touch.el.trigger('swipe')
				  touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
				  touch = {}
				}
				catch (ex) {
				  touch = {}
				}
			  }, 0)
			// normal tap
			else if ('last' in touch) {}

		  })
		  .bind('touchcancel', cancelAll)

		$(window).bind('scroll', cancelAll)
	}
	else {
		$(document.body)
		  .bind('touchstart', function(e){
			now = Date.now()
			delta = now - (touch.last || now)
			touch.el = $(parentIfText(e.touches[0].target))
			touchTimeout && clearTimeout(touchTimeout)
			touch.x1 = e.touches[0].pageX
			touch.y1 = e.touches[0].pageY
			if (delta > 0 && delta <= 250) touch.isDoubleTap = true
			touch.last = now
			//longTapTimeout = setTimeout(longTap, longTapDelay)
		  })
		  .bind('touchend', function(e){

		  })
		  .bind('touchcancel', cancelAll);

	}
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
      var $bodyElement = $('body');
      if (!window.isKiosk() && !$bodyElement.hasClass('PDP-Version2')) {
          $.fn[m] = function(callback){ return this.bind(m, callback) }
      }
  })
}
})(Zepto)
}