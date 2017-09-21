/* Zepto.touch modified for use with JQuery
 *
 * Zepto/src/touch.js: https://github.com/madrobby/zepto/blob/master/src/touch.js
 * Zepto touch for jQuery: https://gist.github.com/twalling/3920083
 */
(function ($) {
  var touch = {},
    touchTimeout = null,
    tapTimeout = null,
    swipeTimeout = null,
    longTapTimeout = null,
    LONG_TAP_DELAY = 750;


  /**
   *
   * @param {Object} node
   * @return {object}
   */
  function parentIfText(node) {
    return 'tagName' in node ? node : node.parentNode;
  }


  /**
   *
   * @param {Number} x1
   * @param {Number} x2
   * @param {Number} y1
   * @param {Number} y2
   * @return {string}
   */
  function swipeDirection(x1, x2, y1, y2) {
    var xDelta = Math.abs(x1 - x2),
      yDelta = Math.abs(y1 - y2);

    if (xDelta >= yDelta) {
      return x1 - x2 > 0 ? 'Left' : 'Right';
    }

    return y1 - y2 > 0 ? 'Up' : 'Down';
  }


  /**
   *
   * @return {void}
   */
  function longTap() {
    longTapTimeout = null;

    if (touch.last) {
      touch.el.trigger('longTap');
      touch = {};
    }
  }


  /**
   *
   * @return {void}
   */
  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout);
    longTapTimeout = null;
  }


  /**
   *
   * @return {void}
   */
  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout);
    if (tapTimeout) clearTimeout(tapTimeout);
    if (swipeTimeout) clearTimeout(swipeTimeout);
    if (longTapTimeout) clearTimeout(longTapTimeout);
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null;
    touch = {};
  }

  $(document).ready(function () {
    var now = null,
      delta = null;

    if (window.isKiosk() || (window.isTouch() && !navigator.userAgent.match(/MSIE\s/))) {
      if (typeof window.surpressSwipes === 'undefined') {
        $(document.body)
          .bind('touchstart', function (e) {
            now = Date.now();
            delta = now - (touch.last || now);
            touch.el = $(parentIfText(e.originalEvent.touches[0].target));
            if (touchTimeout) clearTimeout(touchTimeout);
            touch.x1 = e.originalEvent.touches[0].pageX;
            touch.y1 = e.originalEvent.touches[0].pageY;
            if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
            touch.last = now;
            longTapTimeout = window.isKiosk() ? setTimeout(longTap, LONG_TAP_DELAY) : null;
          })
          .bind('touchmove', function (e) {
            cancelLongTap();

            touch.x2 = e.originalEvent.touches[0].pageX;
            touch.y2 = e.originalEvent.touches[0].pageY;

            if (Math.abs(touch.x1 - touch.x2) >= 10 && Math.abs(touch.y1 - touch.y2) < 10) {
              e.preventDefault();
            }
          })
          .bind('touchend', function () {
            cancelLongTap();

            if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30)
              || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 300)) {
              swipeTimeout = setTimeout(function () {
                try {
                  touch.el.trigger('swipe');
                  touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
                  touch = {};
                } catch (ex) {
                  touch = {};
                }
              }, 0);
            } else if ('last' in touch && window.isKiosk()) {
              tapTimeout = setTimeout(function () {
                var event = $.Event('tap');

                event.cancelTouch = cancelAll;
                touch.el.trigger(event);

                if (touch.isDoubleTap) {
                  touch.el.trigger('doubleTap');
                  touch = {};
                } else {
                  touchTimeout = setTimeout(function () {
                    touchTimeout = null;
                    touch.el.trigger('singleTap');
                    touch = {};
                  }, 250);
                }
              }, 0);
            }
          })
          .bind('touchcancel', cancelAll);

        $(window).bind('scroll', cancelAll);
      } else {
        $(document.body)
          .bind('touchstart', function (e) {
            now = Date.now();
            delta = now - (touch.last || now);
            touch.el = $(parentIfText(e.touches[0].target));
            if (touchTimeout) clearTimeout(touchTimeout);
            touch.x1 = e.touches[0].pageX;
            touch.y1 = e.touches[0].pageY;
            if (delta > 0 && delta <= 250) touch.isDoubleTap = true;
            touch.last = now;
            longTapTimeout = window.isKiosk() ? setTimeout(longTap, LONG_TAP_DELAY) : null;
          })
          .bind('touchend', function () {})
          .bind('touchcancel', cancelAll);
      }
    }
  });

  if (!window.isKiosk()) {
    ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function (eventName) {
      $.fn[eventName] = function (callback) {
        return this.bind(eventName, callback);
      };
    });
  }
}(jQuery));
