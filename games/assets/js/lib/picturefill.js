/* ! Picturefill - Responsive Images that work today. (and mimic the proposed Picture element with divs). Author: Scott Jehl, Filament Group, 2012 | License: MIT/GPLv2 */
(function (w) {
  // Enable strict mode
  'use strict';

  w.inProgress = false;

  w.picturefill = function (bForceUpdate) {
    var psElements = $('div[data-picture]').get(),
      iPictureFillChunk = psElements.length,
      aPictureFillElements;

    if (psElements.length > 8) {
      iPictureFillChunk = Math.ceil(psElements.length / 4);
    }
    // w.document.getElementsByTagName( "div" );
    // Loop the pictures
    while (psElements.length) {
      aPictureFillElements = psElements.splice(0, iPictureFillChunk);
      (function pictureFillLoop(ps) {
        setTimeout(function pictureFillLoopChunk() {
          for (var i = 0, il = ps.length; i < il; i++) {
            if ((ps[i].getAttribute('data-picture') !== null) && (ps[i].getAttribute('data-pfInit') === null || bForceUpdate)) {
              if (!bForceUpdate) {
                ps[i].setAttribute('data-pfInit', 'true');
              }

              var sources = ps[i].getElementsByTagName('div'),
                matches = [];

              // See if which sources match
              for (var j = 0, jl = sources.length; j < jl; j++) {
                var media = sources[j].getAttribute('data-media');
                // if there's no media specified, OR w.matchMedia is supported
                if (!media || (w.matchMedia && w.matchMedia(media).matches)) {
                  matches.push(sources[j]);
                }
              }

              // Find any existing img element in the picture element
              var picImg = ps[i].getElementsByTagName('img')[0];

              if (matches.length) {
                if (!picImg) {
                  picImg = w.document.createElement('img');
                  picImg.alt = ps[i].getAttribute('data-alt');
                  ps[i].appendChild(picImg);
                }

                var nextElement = matches.pop();
                if (nextElement.getAttribute('class')) {
                  picImg.setAttribute('class', nextElement.getAttribute('class'));
                }
                picImg.src = nextElement.getAttribute('data-src');
              } else if (picImg) {
                ps[i].removeChild(picImg);
              }
            }
          }
          w.inProgress = false;
        }, 20);
      })(aPictureFillElements);
    }
			// Add callback on picturefill
    var pfComplete = function () {
      setTimeout(function () {
        var picturefillEvent = new $.Event('pictureFill.complete');
        $(window).trigger(picturefillEvent);
      }, 125);
    }();
  };

  // Check if element is visible (if x and y pos of element are within the viewport)
  w.inVisibleViewport = function (element) {
    var viewportHeight = 0,
      vScrollBar = window.currentScrollTop || 0,
      yPos = $(element).offset().top;

    if (!window.currentWindowHeight) {
      window.currentWindowHeight = $(window).height();
    }

    viewportHeight = window.currentWindowHeight * 1.5;
    return (yPos < (viewportHeight + vScrollBar));
  };

  // Run on resize, domready and scroll
  $(document).ready(function () {
    w.picturefill();
    $(w).on('breakpointChange', function () {
      w.picturefill(true);
    });
    $(w).on('scroll', function () {
      if (!w.inProgress) {
        w.inProgress = true;
        setTimeout(function () {
          window.currentScrollTop = $(window).scrollTop();
          w.picturefill();
        }, 1000);
      }
    });
  });
}(this));
