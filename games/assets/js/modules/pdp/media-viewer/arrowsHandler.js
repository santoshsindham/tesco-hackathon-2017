define('modules/pdp/media-viewer/arrowsHandler', [
  'domlib',
  'modules/breakpoint',
  'modules/pdp/media-viewer/config'
], function ($, breakpoint, config) {
  'use strict';

  var arrowsHandler = null,
    _imageViewerThumbArrows = null,
    _bindVideoViewEvents = null,
    _fnArrowVisibilityHandler = null;

  _imageViewerThumbArrows = function imageViewerThumbArrows(oMediaThumbnails, oMedia) {
    var iVisibleThumbnails = 0,
      iThumbnailTotal = 0;

    if (typeof oMediaThumbnails === 'object' && typeof oMedia === 'object') {
      if (oMediaThumbnails.options.vertical) {
        iVisibleThumbnails = 3;
      } else if (breakpoint.kiosk) {
        iVisibleThumbnails = 7;
      } else {
        iVisibleThumbnails = breakpoint.largeDesktop ? 8 : 5;
      }

      iThumbnailTotal = iVisibleThumbnails - 1;

      if (oMedia.getCollectionLength() > 0) {
        if (oMediaThumbnails.options.itemSelector) {
          $(oMediaThumbnails.options.itemSelector).first().addClass('active');
        }
      }

      if (oMedia.getCollectionLength() > iThumbnailTotal) {
        $(oMediaThumbnails.options.nextClass, oMediaThumbnails.$element)
          .parent()
          .removeClass('disabled');
      }
    }
  };

  _bindVideoViewEvents = function bindVideoViewEvents() {
    config.oDomElements.$s7containerPlaceholder
      .off('BasicVideoPlayer.play', config.sDOM_SELECTORS.videoContainer)
      .on('BasicVideoPlayer.play', config.sDOM_SELECTORS.videoContainer, function () {
        _fnArrowVisibilityHandler(false);
      })
      .off('BasicVideoPlayer.pause', config.sDOM_SELECTORS.videoContainer)
      .on('BasicVideoPlayer.pause', config.sDOM_SELECTORS.videoContainer, function () {
        _fnArrowVisibilityHandler(true);
      });

    $('video#s7HTML5VideoPlayer').on('ended', function () {
      _fnArrowVisibilityHandler(true);
    });
  };

  _fnArrowVisibilityHandler = function fnArrowVisibilityHandler(bForceState) {
    if (bForceState) {
      $(config.sDOM_SELECTORS.mvImageViewerCarouselItemPrevNext).show();
    } else {
      $(config.sDOM_SELECTORS.mvImageViewerCarouselItemPrevNext).hide();
    }
  };

  arrowsHandler = {
    imageViewerThumbArrows: _imageViewerThumbArrows,
    bindVideoViewEvents: _bindVideoViewEvents,
    toggleArrowVisibility: _fnArrowVisibilityHandler
  };

  return arrowsHandler;
});
