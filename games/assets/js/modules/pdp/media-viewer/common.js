define('modules/pdp/media-viewer/common', [
  'domlib',
  'modules/mvc/fn',
  'modules/breakpoint',
  'modules/common',
  'modules/media-player/common',
  'modules/pdp/media-viewer/arrowsHandler',
  'modules/pdp/media-viewer/config',
  'modules/media-asset-manager/common',
  'modules/media-matrix/common',
  'mustache',
  'modules/pdp/media-viewer/overlay',
  'modules/pdp/media-viewer/analytics',
  'modules/responsive-carousel/responsive-carousel'
], function (
  $,
  fn,
  breakpoint,
  common,
  mediaPlayer,
  arrowsHandler,
  config,
  MediaAssetManager,
  mediaMatrix,
  mustache,
  mediaViewerOverlay,
  mediaViewerAnalytics
) {
  'use strict';

  var _config = config,
    _mediaPlayer = mediaPlayer,
    sImageViewer = 'prodZoomView',
    sCurrentSkuId = '',
    s7container = null,
    s7params = null,
    spinViewScrubber = null,
    aImageSet = [],
    ImageViewer = null,
    SpinViewer = null,
    MediaSet = null,
    _resizeMediaComponent = null,
    _initScene7PageScrubber = null,
    _initScene7AutoSpinView = null,
    _showSpinViewer = null,
    _setMediaAsset = null,
    _initThumbnailsCarousel = null,
    _initMediaCarousel = null,
    _blockZoomedImageViewerSwiping = null,
    _configureScene7Params = null,
    _initScene7Container = null,
    _initScene7MediaSet = null,
    _initScene7Dependencies = null,
    _setScene7ImageMode = null,
    _fallbackToStaticImage = null,
    _fnDefaultImageSanitisation = null,
    _updateMediaViewerCounter = null,
    _imageViewerAfterMoveHandler = null,
    _thumbnailHandler = null,
    _triggerThumnailCarousel = null,
    oMediaThumbnails = null,
    oImageViewerCarousel = null,
    _zoomViewImageViewerCarouselEvents = null,
    iActiveImage = null,
    iIsZoomedIn = false,
    _createMediaCollection = null,
    oMedia = null,
    iMediaCollectionLength = 0,
    videoViewVisible = false,
    _processMedia = null,
    _bindEvents = null,
    bEventsBound = false,
    _showCustomImage = null,
    _initImageViewerDots = null,
    _dotsClickHandler = null,
    _triggerDotsHandling = null,
    oMediaDots = null,
    _showScene7 = null,
    _setDefaultAsset = null,
    _init = null,
    pdpScene7 = null,
    _fnCacheDOMElements = null,
    _overrideScene7WindowDetect = null,
    _ON_SDK_READY = null,
    _initScene7ParameterManager = null,
    _ON_NOTF_SET_PARSED = null,
    _fnAfterShowOverlay = null,
    _fnAfterCloseOverlay = null,
    _fnSetOrientationMode = null,
    _ON_WINDOW_RESIZE = null,
    _ON_NOTF_SLIDER_MOVE = null,
    _initScene7SpinView = null,
    _initScene7ImageView = null,
    _fnResizeMediaCarouselItems = null,
    _initFeatureMediaButton = null,
    bOverlayIsOpen = false,
    bOverlayResizedToScreenHeight = false,
    spinViewVisible = false,
    iActiveIndex = 0,
    _onBreakpointChange = null,
    _fnUpdatePing = null,
    bKioskResizeExecuted = false,
    _resizeKioskImageViewer = null,
    _ON_ASSET_CHANGED = null,
    _fnMoveCarousel = null,
    iCurrentMediaIndex = 0,
    _fnIsBookProduct = null,
    _fnApplyCMSImageClassToContainer = null,
    _handleMediaViewerUpdate = null,
    _addMediaAsset = null,
    _removeMediaAsset = null,
    featureMediaType = null,
    featureMediaIndex = null,
    scene7AutoSpinEnabled = true,
    scene7AutoIntervalId = null,
    _scene7AutoSpinStop = null,
    _setThumbnailClicked = null,
    _thumbnailClicked = null;

  _overrideScene7WindowDetect = function overrideScene7WindowDetect() {
    s7sdk.Window.monitorSize = function () {
      s7sdk.browser.screensize = s7sdk.browser.detectScreen();
      if (Math.abs(s7sdk.Window.currentSize.h - s7sdk.browser.screensize.h) > 100) {
        if (s7sdk.Window.currentSize.w !== s7sdk.browser.screensize.w
            || s7sdk.Window.currentSize.h !== s7sdk.browser.screensize.h) {
          s7sdk.Window.currentSize = s7sdk.browser.screensize;
          s7sdk.Window.sendNotifications();
        }
      }
      if ((new Date()).getTime() > s7sdk.Window.monitorSizeTimeout) {
        window.clearInterval(s7sdk.Window.monitorSizeTimer);
        s7sdk.Window.monitorSizeTimer = null;
      }
    };
  };

  _showScene7 = function showScene7() {
    if ($(_config.sDOM_SELECTORS.wrapper).length) {
      $(_config.sDOM_SELECTORS.wrapper).show();
    }
    $(_config.sDOM_SELECTORS.mvStaticImage).addClass('scene7-enabled');
  };

  _init = function init(mediaAssets) {
    if ($(_config.sDOM_SELECTORS.container).length
        && $(_config.sDOM_SELECTORS.mvStaticImage).hasClass('scene7-enabled')) {
      _fnCacheDOMElements();

      try {
        if (mediaAssets) {
          if (window.isKiosk()) {
            bKioskResizeExecuted = false;
            oMediaThumbnails = null;
            oImageViewerCarousel = null;
          }

          _fnUpdatePing(
            mediaAssets.pings,
            _config.sDOM_SELECTORS.templates.ping,
            _config.oDomElements.$pings
          );

          if (mediaAssets.defaultImage && mediaAssets.defaultImage.defaultImage) {
            _fnDefaultImageSanitisation(mediaAssets.defaultImage);
          }

          if (mediaAssets.skuMedia && mediaAssets.skuMedia.length && fn.getValue(mediaAssets, 'skuMedia', 0, 'renderSource') !== 'CMS') {
            _processMedia(mediaAssets.skuMedia);
          } else {
            _fallbackToStaticImage();
            return;
          }
        }

        _bindEvents();
        _fnSetOrientationMode();
        mediaMatrix.init();
        _createMediaCollection();

        if (_config.oSettings.bDisableScene7) {
          _initThumbnailsCarousel();
          _initMediaCarousel();
        } else {
          _setScene7ImageMode();
          _initScene7Dependencies();
          _initScene7ParameterManager();
          mediaViewerAnalytics.setOmnitureDefaults();
        }

        _setDefaultAsset();
        _mediaPlayer.bMediaViewer = true;
      } catch (err) {
        _fallbackToStaticImage();
      }
    }
  };

  _fnCacheDOMElements = function fnCacheDOMElements() {
    _config.oDomElements.$container = $(_config.sDOM_SELECTORS.container);
    _config.oDomElements.$wrapper = $(_config.sDOM_SELECTORS.wrapper);
    _config.oDomElements.$sidebar = $(_config.sDOM_SELECTORS.sidebar);
    _config.oDomElements.$mv = $(_config.sDOM_SELECTORS.mv);
    _config.oDomElements.$s7containerPlaceholder = $(_config.sDOM_SELECTORS.s7containerPlaceholder);
    _config.oDomElements.$mvMediaDots = $(_config.sDOM_SELECTORS.mvMediaDots);
    _config.oDomElements.$pings = $(_config.sDOM_SELECTORS.pings);
    _config.oDomElements.$s7containerMask = $(_config.sDOM_SELECTORS.s7containerMask);
    _config.oDomElements.$mvStaticImageElement = $(_config.sDOM_SELECTORS.mvStaticImageElement);
    _config.oDomElements.$zoomIcon = $(_config.sDOM_SELECTORS.zoomIcon);
  };

  _bindEvents = function bindEvents() {
    if (!bEventsBound) {
      $(window)
        .on('MediaViewer.showScene7', _showScene7)
        .on('MediaViewer.showCustomImage', _showCustomImage)
        .on('MediaViewer.triggerResize', _resizeMediaComponent)
        .on('MediaViewer.update', _handleMediaViewerUpdate)
        .on('breakpointChange', _onBreakpointChange)
        .off('exitFullscreen')
        .on('exitFullscreen', function () {
          arrowsHandler.toggleArrowVisibility(true);
        });

      if (!common.isTouch() && !window.isKiosk()) {
        _config.oDomElements.$s7containerPlaceholder.on('click', '#prodZoomView', mediaViewerOverlay.render);
        _config.oDomElements.$zoomIcon.on('click', mediaViewerOverlay.render);
      }

      _config.oDomElements.$container.on('MediaViewer.showOverlay', _fnAfterShowOverlay);
      _config.oDomElements.$container.on('MediaViewer.closeOverlay', _fnAfterCloseOverlay);

      bEventsBound = true;
    }
  };

  _fnSetOrientationMode = function fnSetOrientationMode() {
    _config.oSettings.sOrientation = $('.main-content-wrapper').hasClass('media-viewer--portrait')
        ? 'portrait' : 'landscape';
  };

  _setScene7ImageMode = function setScene7ImageMode() {
    pdpScene7.scene7ImageMode = common.isTouch() || window.isKiosk()
        ? 'zoomViewer' : 'flyoutViewer';
  };

  _setDefaultAsset = function setDefaultAsset(sAssetName) {
    var _sAssetName = sAssetName;

    if (MediaSet) {
      if (_sAssetName === undefined) {
        _sAssetName = pdpScene7.s7ImageSet.split(',')[0];
      }
      MediaSet.setAsset(_sAssetName);
    }
  };

  _fnDefaultImageSanitisation = function fnDefaultImageSanitisation(oDefaultImage) {
    var PRESET_PLACEHOLDER = '[preset]',
      sImageSize = oDefaultImage.renderSource === 'Missing' ? '250x250' : 'Detail',
      sUpdatedImageSrc = null,
      sImageSrc = oDefaultImage.src,
      bMatchResultWithMissingImage = sImageSrc.match(/preset/g);

    if (window.isKiosk()) {
      return;
    }

    if (bMatchResultWithMissingImage) {
      sUpdatedImageSrc = sImageSrc.replace(PRESET_PLACEHOLDER, sImageSize);
    }

    _config.oDomElements.$mvStaticImageElement[0].src = sUpdatedImageSrc || sImageSrc;
  };

  _fnIsBookProduct = function fnIsBookProduct() {
    var bIsBookProduct = false,
      activeSku = window.oAppController && window.oAppController.oPageController
          ? window.oAppController.oPageController.getActiveSku() : {},
      aSkuLinks = activeSku.links,
      i = 0;

    for (; i < aSkuLinks.length; i += 1) {
      if (aSkuLinks[i].type === 'booksSku') {
        bIsBookProduct = true;
      }
    }
    return bIsBookProduct;
  };

  _fnApplyCMSImageClassToContainer = function fnApplyCMSImageClassToContainer() {
    $(_config.sDOM_SELECTORS.mvStaticImage).addClass('cms-static-image');
  };

  _fallbackToStaticImage = function fallbackToStaticImage() {
    if (_fnIsBookProduct()) {
      _fnApplyCMSImageClassToContainer();
    }
    _config.oDomElements.$wrapper.hide();
    $(_config.sDOM_SELECTORS.mvStaticImage).removeClass('scene7-enabled');
  };

  _triggerThumnailCarousel = function triggerThumnailCarousel(iCarouselIndex) {
    var oTriggerData = {
      cancelCallback: true
    };

    if (oMediaThumbnails !== null) {
      $(oMediaThumbnails.options.itemSelector).eq(iCarouselIndex).trigger('click', oTriggerData);
    }
  };

  _triggerDotsHandling = function triggerDotsHandling(iCarouselIndex) {
    var oTriggerData = {
      cancelCallback: true
    };

    if (oMediaDots !== null) {
      $(oMediaDots.options.itemSelector).eq(iCarouselIndex).trigger('click', oTriggerData);
    }
  };

  _imageViewerAfterMoveHandler = function imageViewerAfterMoveHandler(iMoveBy) {
    var iPositiveMoveBy = 0,
      iFrom = 0;

    if (iMoveBy !== undefined) {
      iPositiveMoveBy = Math.abs(iMoveBy);
      iFrom = iPositiveMoveBy + 1;

      _updateMediaViewerCounter(iFrom, oMedia.getCollectionLength());
      _setMediaAsset(iPositiveMoveBy);
      _triggerThumnailCarousel(iPositiveMoveBy);
      _triggerDotsHandling(iPositiveMoveBy);

      iActiveIndex = iPositiveMoveBy;
    }
  };

  _setThumbnailClicked = function setThumbnailClicked(value) {
    _thumbnailClicked = value;
  };

  _thumbnailHandler = function thumbnailHandler(oEvent) {
    var iIndex = 0,
      iMoveBy = 0,
      analyticThumbIndex = 0;

    if (oMediaThumbnails !== null && oEvent !== undefined) {
      iIndex = oEvent.data && oEvent.data.iCurrentIndex
          ? oEvent.data.iCurrentIndex : $(oEvent.currentTarget).index();
      analyticThumbIndex = iIndex + 1;

      mediaViewerAnalytics.analyticsThumbClick(analyticThumbIndex);
      iMoveBy = -1 * iIndex;
      _setThumbnailClicked(true);
      oImageViewerCarousel.move(iMoveBy);
    }
  };

  _dotsClickHandler = function dotsClickHandler(oEvent) {
    var iIndex = 0,
      iMoveBy = 0;

    if (oMediaDots !== null && oEvent !== undefined) {
      iIndex = $(oEvent.currentTarget).index();
      iMoveBy = -1 * iIndex;
      oImageViewerCarousel.move(iMoveBy);
    }
  };

  _initImageViewerDots = function initImageViewerDots() {
    var $mediaDots = $(_config.sDOM_SELECTORS.mvMediaDots),
      sImageViewerDotsMarkup = '';

    if (oMedia.aMediaCollection.length > 1) {
      sImageViewerDotsMarkup = mustache.render(
        $(_config.sDOM_SELECTORS.templates.imageViewerDots).html(), oMedia.aMediaCollection
      );

      $(_config.sDOM_SELECTORS.mvDots, $mediaDots).html(sImageViewerDotsMarkup);

      if (oMediaDots === null) {
        _config.oDomElements.$mvMediaDots.carousel({
          itemSelector: _config.sDOM_SELECTORS.mvDotsItem,
          wrapperClass: _config.sDOM_SELECTORS.mvDots,
          itemWidth: _config.oSettings.oDimensions[_config.oSettings.sOrientation].oDots.WIDTH,
          centraliseThumbnails: {
            enabled: true,
            itemSelectorActive: 'active',
            clickActionCallback: function (oEvent) {
              _dotsClickHandler(oEvent);
              iIsZoomedIn = false;
            }
          },
          stopOnLastItem: true,
          vertical: false,
          enablePeep: false,
          itemHeight: _config.oSettings.oDimensions[_config.oSettings.sOrientation].oDots.HEIGHT
        });
        oMediaDots = $mediaDots.data('carousel');
      } else {
        oMediaDots.reset();
        oMediaDots.adjust();
      }

      if (oMediaDots.options.itemSelector) {
        $(oMediaDots.options.itemSelector).first().addClass('active');
      }
    }
  };

  _initMediaCarousel = function initMediaCarousel(oEvent) {
    var sImageViewerMarkup = '',
      sImageTemplateSelector = _config.oSettings.bDisableScene7
          ? _config.sDOM_SELECTORS.templates.staticImageLandscape
          : _config.sDOM_SELECTORS.templates.imageViewer;

    if (_config.oSettings.sOrientation === 'portrait' && _config.oSettings.bDisableScene7) {
      sImageTemplateSelector = _config.sDOM_SELECTORS.templates.staticImagePortrait;
    }

    aImageSet = _config.oSettings.bDisableScene7
        ? oMedia.aMediaCollection : oEvent.s7event.asset.items;

    sImageViewerMarkup = mustache.render($(sImageTemplateSelector).html(), oMedia.aMediaCollection);

    if (_config.oSettings.bDisableScene7) {
      $(_config.sDOM_SELECTORS.s7containerPlaceholder).html(sImageViewerMarkup);
    } else {
      _config.oDomElements.$s7container.html(sImageViewerMarkup);
    }

    if (oImageViewerCarousel === null) {
      _config.oDomElements.$wrapper.carousel({
        itemSelector: _config.sDOM_SELECTORS.mvImageViewerCarouselItem,
        wrapperClass: _config.sDOM_SELECTORS.mvImageViewerCarousel,
        prevClass: _config.sDOM_SELECTORS.mvImageViewerCarouselItemPrev,
        nextClass: _config.sDOM_SELECTORS.mvImageViewerCarouselItemNext,
        all: false,
        enableAutoHideArrows: false,
        continuousLoop: true,
        setActive: true,
        itemWidth: function calcItemWidth() {
          return _config.oDomElements.$s7containerPlaceholder.outerWidth(true);
        },
        afterMove: function (iMoveBy) {
          _imageViewerAfterMoveHandler(iMoveBy);
          iIsZoomedIn = false;
        }
      });
      oImageViewerCarousel = _config.oDomElements.$wrapper.data('carousel');
    } else {
      oImageViewerCarousel.reset();
      oImageViewerCarousel.adjust();
    }

    _updateMediaViewerCounter(1, oMedia.getCollectionLength());
    if (!_config.oSettings.bDisableScene7) {
      _initScene7ImageView();
    } else {
      arrowsHandler.toggleArrowVisibility(oMedia.aMediaCollection.length > 1);
    }
  };

  _initThumbnailsCarousel = function initThumbnailsCarousel(args) {
    var argsCopy = args || {},
      dimensions = _config.oSettings.oDimensions,
      orientation = _config.oSettings.sOrientation,
      $mediaThumbnails = $(_config.sDOM_SELECTORS.mvMediaThumbnails),
      sRenderedThumbnailsMarkup = '',
      oViewData = {
        aMedia: oMedia.aMediaCollection,
        oImageDimensions: {
          width: dimensions[orientation].oThumbnails.DEFAULT_WIDTH,
          height: dimensions[orientation].oThumbnails.DEFAULT_HEIGHT
        }
      };

    if (typeof argsCopy.filterDataCallback === 'function') {
      oViewData = argsCopy.filterDataCallback(oViewData);
    }

    if (oMedia.aMediaCollection.length > 1) {
      sRenderedThumbnailsMarkup = mustache.render(
        $(_config.sDOM_SELECTORS.templates.thumbnails).html(), oViewData
      );

      $(_config.sDOM_SELECTORS.mvCarousel, $mediaThumbnails).html(sRenderedThumbnailsMarkup);

      if (oMediaThumbnails === null) {
        $mediaThumbnails.carousel({
          itemSelector: _config.sDOM_SELECTORS.mvCarouselItem,
          wrapperClass: _config.sDOM_SELECTORS.mvCarousel,
          itemWidth: dimensions[orientation].oThumbnails.WIDTH,
          centraliseThumbnails: {
            enabled: true,
            itemSelectorActive: 'active',
            clickActionCallback: function (oEvent) {
              _thumbnailHandler(oEvent);
              iIsZoomedIn = false;
            }
          },
          stopOnLastItem: true,
          vertical: orientation === 'portrait',
          enablePeep: false,
          itemHeight: dimensions[orientation].oThumbnails.HEIGHT,
          bHideNextPreviousIfAllItemsVisible: true,
          bSetResponsiveEvents: true
        });
        oMediaThumbnails = $mediaThumbnails.data('carousel');
      } else {
        oMediaThumbnails.reset();
        oMediaThumbnails.adjust();
      }

      arrowsHandler.imageViewerThumbArrows(oMediaThumbnails, oMedia);
    }

    if (typeof argsCopy.addMediaAssetCallback === 'function') {
      argsCopy.addMediaAssetCallback($mediaThumbnails);
    }
  };

  _createMediaCollection = function createMediaCollection() {
    var i = 0,
      j = 0,
      aDecodedMediaCollection = null,
      aDecodedMediaCollectionLength = null,
      mvcPage = fn.getValue(window, 'oAppController', 'oPageController'),
      activeProduct = mvcPage.getActiveProduct(),
      productModel = mvcPage.getModule('model', 'products'),
      isFF = productModel.isFF(activeProduct);

    oMedia = new MediaAssetManager();

    oMedia.addMedia(pdpScene7.s7ImageSet, 'image');

    if (!window.isKiosk()) {
      oMedia.addMedia(pdpScene7.s7SpinSet, 'spin');

      if (!isFF) {
        oMedia.addMedia(pdpScene7.s7VideoSet, 'video', 2);
      } else {
        oMedia.addMedia(pdpScene7.s7VideoSet, 'video');
      }
    }

    iMediaCollectionLength = oMedia.getCollectionLength();

    if (iMediaCollectionLength === 0) {
      throw new Error('MediaAssetManager: no media in collection');
    }

    if (iMediaCollectionLength > 0) {
      aDecodedMediaCollection = mediaMatrix.processMediaCollection(oMedia.aMediaCollection);
      aDecodedMediaCollectionLength = aDecodedMediaCollection.length;

      if (aDecodedMediaCollectionLength > 0) {
        for (i; i < aDecodedMediaCollectionLength; i += 1) {
          if (aDecodedMediaCollection[i].playerType !== null) {
            oMedia.addToCollection(i, 'playerType', aDecodedMediaCollection[i].playerType);
          }
          if (aDecodedMediaCollection[i].fileType !== null) {
            oMedia.addToCollection(i, 'fileType', aDecodedMediaCollection[i].fileType);
          }
        }
      }

      for (j; j < iMediaCollectionLength; j += 1) {
        if (oMedia.getMediaType(j) === 'image') {
          oMedia.addToCollection(j, 'isImage', true);
          oMedia.aMediaCollection[j].mediaSrc = pdpScene7.s7ServerUrl
              + oMedia.aMediaCollection[j].mediaSrc;
        }
        if (oMedia.getMediaType(j) === 'spin') {
          oMedia.addToCollection(j, 'isSpin', true);
          featureMediaType = 'spin';
          featureMediaIndex = j;
        }
        if (oMedia.getMediaType(j) === 'video') {
          oMedia.addToCollection(j, 'isVideo', true);
          featureMediaType = 'video';
          featureMediaIndex = j;
        }
      }
      if (isFF && featureMediaIndex !== null) {
        oMedia.iFeatureMediaIndex = featureMediaIndex;
      }
    }
  };

  _processMedia = function processMedia(aMedia) {
    var i = 0,
      iMediaLength = aMedia.length,
      aImages = [],
      aVideos = [],
      aSpins = [],
      regExpr = /(.*\/\/tesco.scene7.com\/is\/image\/)|(\?\$\[preset]\$)/g;

    for (i; i < iMediaLength; i += 1) {
      if (aMedia[i].mediaType === 'Large') {
        aImages.push(aMedia[i].src.replace(regExpr, ''));
      }
      if (aMedia[i].mediaType === 'Video') {
        aVideos.push(aMedia[i].src);
      }
      if (aMedia[i].mediaType === 'Spinset') {
        aSpins.push(aMedia[i].src.replace(regExpr, ''));
      }
    }

    pdpScene7.s7ImageSet = aImages.toString();
    pdpScene7.s7SpinSet = aSpins.toString();
    pdpScene7.s7VideoSet = aVideos;
  };

  _onBreakpointChange = function onBreakpointChange(oEvent) {
    if (oMediaThumbnails === undefined && (oEvent.newViewport === 'htablet'
        || oEvent.newViewport === 'desktop' || oEvent.newViewport === 'largedesktop')) {
      _initThumbnailsCarousel();
      _triggerThumnailCarousel(iActiveIndex);
    }
  };

  _showCustomImage = function showCustomImage(oEvent) {
    if (oEvent.oData) {
      $(_config.sDOM_SELECTORS.mvStaticImageElement).prop('src', oEvent.oData.src);
      _fallbackToStaticImage();
    }
  };

  _fnAfterCloseOverlay = function fnAfterCloseOverlay() {
    bOverlayIsOpen = false;
    _resizeMediaComponent();

    if (oImageViewerCarousel) {
      oImageViewerCarousel.adjust({
        calcScroll: true
      });
    }

    bOverlayResizedToScreenHeight = false;

    if (oMedia.getMediaType(iCurrentMediaIndex) === 'image') {
      _config.oDomElements.$s7containerMask.hide();
    }
  };

  _fnAfterShowOverlay = function fnAfterShowOverlay() {
    _resizeMediaComponent();

    if (oImageViewerCarousel) {
      oImageViewerCarousel.adjust({
        calcScroll: true
      });
    }

    window.setTimeout(function () {
      $('#mv-overlay-content #s7container').show();
    }, 500);

    if (oMedia.getMediaType(iCurrentMediaIndex) === 'image') {
      _config.oDomElements.$s7containerMask.show();
    }

    bOverlayIsOpen = true;

    if (oMedia.getMediaType(iCurrentMediaIndex) === 'image') {
      if (_config.oSettings.sOrientation === 'landscape') {
        _resizeMediaComponent(undefined, $(window).height());
        bOverlayResizedToScreenHeight = true;
      }
    }
  };

  _ON_ASSET_CHANGED = function ON_ASSET_CHANGED() {
    if (spinViewScrubber) {
      spinViewScrubber.setCurrentFrameIndex(SpinViewer.getCurrentFrameIndex());
      if (scene7AutoSpinEnabled) {
        _initScene7AutoSpinView();
      }
    }
  };

  _ON_NOTF_SLIDER_MOVE = function ON_NOTF_SLIDER_MOVE() {
    SpinViewer.setCurrentFrameIndex(spinViewScrubber.getCurrentFrameIndex());
    iIsZoomedIn = false;
  };

  _ON_NOTF_SET_PARSED = function ON_NOTF_SET_PARSED(event) {
    if (window.isKiosk() || breakpoint.largeDesktop || breakpoint.desktop || breakpoint.hTablet) {
      _initThumbnailsCarousel(event);
    }

    if (!window.isKiosk()) {
      _initImageViewerDots(event);
    }

    _initMediaCarousel(event);

    if (!window.isKiosk()) {
      _initFeatureMediaButton();
    }

    MediaSet.removeEventListener(s7sdk.AssetEvent.NOTF_SET_PARSED, _ON_NOTF_SET_PARSED);
  };

  _ON_WINDOW_RESIZE = function ON_WINDOW_RESIZE() {
    window.setTimeout(_resizeMediaComponent, 500);
  };

  _ON_SDK_READY = function ON_SDK_READY() {
    _config.oDomElements.$wrapper.toggleClass('single-item', iMediaCollectionLength === 1);
    pdpScene7.overrideScene7WindowDetect();
    _configureScene7Params();
    _initScene7Container();
    _initScene7MediaSet();
    arrowsHandler.toggleArrowVisibility(iMediaCollectionLength > 1);
  };

  _initScene7PageScrubber = function initScene7PageScrubber() {
    spinViewScrubber = new s7sdk.set.PageScrubber('s7container', s7params, 's7Scrubber');
    spinViewScrubber.setAsset(pdpScene7.s7SpinSet);
    spinViewScrubber.addEventListener(
      s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE, _ON_NOTF_SLIDER_MOVE, false
    );
  };

  _initScene7SpinView = function initScene7SpinView() {
    SpinViewer = new s7sdk.set.SpinView('s7container', s7params, 'prodSpinView');
    SpinViewer.addEventListener(s7sdk.event.AssetEvent.ASSET_CHANGED, _ON_ASSET_CHANGED, false);
  };

  _initScene7AutoSpinView = function initScene7AutoSpinView() {
    var fLength = SpinViewer.getFramesLength() - 1,
      i = 0;

    scene7AutoSpinEnabled = false;

    if (scene7AutoIntervalId) {
      _scene7AutoSpinStop();
    }

    scene7AutoIntervalId = setInterval(function () {
      if (i === fLength) {
        SpinViewer.setCurrentFrameIndex(0);
        _scene7AutoSpinStop();
        i = 0;
      } else {
        SpinViewer.setCurrentFrameIndex(i += 1);
      }
    }, 150);
    _scene7AutoSpinStop = function scene7AutoSpinStop() {
      clearInterval(scene7AutoIntervalId);
      $('.s7dragbutton').css('left', '0');
    };
    $('.s7dragbutton').one('mousedown', function () {
      _scene7AutoSpinStop();
    });
  };

  _initScene7ImageView = function initScene7ImageView() {
    if (pdpScene7.scene7ImageMode === 'zoomViewer') {
      ImageViewer = new s7sdk.ZoomView('s7container', s7params, sImageViewer);
      _blockZoomedImageViewerSwiping();
      _zoomViewImageViewerCarouselEvents();

      ImageViewer.addEventListener(s7sdk.event.AssetEvent.ASSET_CHANGED, function () {
        if (window.isKiosk()) {
          _resizeKioskImageViewer();
        }
      });
    } else {
      ImageViewer = new s7sdk.FlyoutZoomView('s7container', s7params, sImageViewer);
    }

    ImageViewer.setItem(aImageSet[0]);
    oImageViewerCarousel.$itemsWrapper.addClass('image-viewer-carousel');
    _config.oDomElements.$mv.addClass('zoomVisible');
  };

  _initScene7MediaSet = function initScene7MediaSet() {
    MediaSet = new s7sdk.MediaSet(null, s7params, null);
    MediaSet.addEventListener(s7sdk.AssetEvent.NOTF_SET_PARSED, _ON_NOTF_SET_PARSED, false);
  };

  _initScene7Container = function initScene7Container() {
    s7container = new s7sdk.Container('mediaViewerScene7Container', s7params, 's7container');
    s7container.addEventListener(s7sdk.ResizeEvent.WINDOW_RESIZE, _ON_WINDOW_RESIZE, false);

    _config.oDomElements.$s7container = $(_config.sDOM_SELECTORS.s7container);
  };

  _configureScene7Params = function configureScene7Params() {
    s7params.push('serverurl', pdpScene7.s7ServerUrl);

    if (pdpScene7.s7ImageSet !== undefined) {
      s7params.push('MediaSet.asset', pdpScene7.s7ImageSet);

      if (pdpScene7.scene7ImageMode === 'zoomViewer') {
        s7params.push('ZoomView.zoomstep', '0, 1');
        s7params.push('ZoomView.iconeffect', '1, 1, 0.3, 5');
        s7params.push('ZoomView.transition', '0.25, 3');
        s7params.push('ZoomView.singleclick', 'none');
        s7params.push('ZoomView.swipe', '0');
        if (window.isKiosk() || !common.cssTransitionsSupported()) {
          s7params.push('ZoomView.doubleclick', 'none');
        } else {
          s7params.push('ZoomView.doubleclick', 'zoomReset');
        }
        s7params.push('ZoomView.iscommand', 'op_sharpen=1');
      } else {
        s7params.push('FlyoutZoomView.fill', '#ffffff,1');
        s7params.push('FlyoutZoomView.imagereload', '1,breakpoint,300;600;1200;1790');
        s7params.push('FlyoutZoomView.zoomfactor', '3.0,-1,1');
        s7params.push('FlyoutZoomView.overlay', '0');
        s7params.push('FlyoutZoomView.flyouttransition', 'none,1,0,1,0');
        s7params.push('FlyoutZoomView.highlightmode', 'cursor,1,free');
        s7params.push('FlyoutZoomView.iscommand', 'op_sharpen=1');
        s7params.push('FlyoutZoomView.tip', '4,1,0.3');
      }
    } else {
      _fallbackToStaticImage();
      return;
    }

    if (pdpScene7.s7SpinSet !== undefined) {
      s7params.push('SpinView.asset', pdpScene7.s7SpinSet);
      s7params.push('SpinView.zoomstep', '0,1');
      s7params.push('SpinView.transition', '0.1, 0');
      s7params.push('SpinView.doubleclick', 'none');
      if (breakpoint.mobile) {
        s7params.push('SpinView.iconeffect', '0');
      }
    }
  };

  _initScene7ParameterManager = function initScene7ParameterManager() {
    s7params = new s7sdk.ParameterManager(null, null);
    s7params.addEventListener(s7sdk.Event.SDK_READY, _ON_SDK_READY, false);
    s7params.init();
  };

  _initScene7Dependencies = function initScene7Dependencies() {
    var scene7LibSelector = pdpScene7.scene7ImageMode === 'zoomViewer' ? 'ZoomView' : 'FlyoutZoomView';

    s7sdk.Util.lib.include('s7sdk.common.Container');
    s7sdk.Util.lib.include('s7sdk.set.PageScrubber');
    s7sdk.Util.lib.include('s7sdk.set.MediaSet');
    s7sdk.Util.lib.include('s7sdk.set.SpinView');
    s7sdk.Util.lib.include('s7sdk.image.' + scene7LibSelector);
  };


  _resizeMediaComponent = function resizeMediaComponent(iWidth, iHeight) {
    var iScene7ContainerWidth = iWidth || _config.oDomElements.$s7containerPlaceholder.width(),
      iScene7ContainerHeight = iHeight || _config.oDomElements.$s7containerPlaceholder.height();

    if (iScene7ContainerHeight === 0) {
      iScene7ContainerHeight = $('#prodZoomView').height();
    }

    if (bOverlayIsOpen && _config.oSettings.sOrientation === 'portrait'
        && (videoViewVisible || spinViewVisible)) {
      if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
        iScene7ContainerHeight = $(window).height() - _config.oDomElements.$mvMediaDots.height();
      } else {
        iScene7ContainerHeight = $(window).height();
      }
    }

    if (bOverlayIsOpen && _config.oSettings.sOrientation === 'landscape') {
      iScene7ContainerHeight = $(window).height() - _config.oDomElements.$sidebar.outerHeight();
    }

    if (window.isKiosk() && _config.oSettings.sOrientation === 'portrait') {
      iScene7ContainerWidth = _config.oSettings.oDimensions.portrait.oKiosk.MEDIA_VIEWER.WIDTH;
      iScene7ContainerHeight = _config.oSettings.oDimensions.portrait.oKiosk.MEDIA_VIEWER.HEIGHT;
    }

    s7container.resize(iScene7ContainerWidth, iScene7ContainerHeight);

    if (ImageViewer) {
      ImageViewer.resize(iScene7ContainerWidth, iScene7ContainerHeight);
    }
    if (SpinViewer) {
      SpinViewer.resize(iScene7ContainerWidth, iScene7ContainerHeight);
    }
    if (videoViewVisible) {
      if ($('span.icon-play-lg').length < 1) {
        _mediaPlayer.pauseCurrentVideo(true);
        arrowsHandler.toggleArrowVisibility(true);
      }
    }

    _fnResizeMediaCarouselItems(iScene7ContainerWidth, iScene7ContainerHeight);

    if (oImageViewerCarousel) {
      oImageViewerCarousel.adjust();
    }

    if (oMediaThumbnails) {
      oMediaThumbnails.adjust();
    }
  };

  _fnResizeMediaCarouselItems = function fnResizeMediaCarouselItems(iWidth, iHeight) {
    $(_config.sDOM_SELECTORS.mvImageViewerCarouselItem, _config.oDomElements.$s7container)
      .width(iWidth)
      .height(iHeight);
  };

  _showSpinViewer = function showSpinViewer() {
    var oSku = window.oAppController.oPageController.getActiveSku() || null,
      sSkuId = '';

    if (oSku) {
      sSkuId = oSku.id;
      videoViewVisible = false;
      if (SpinViewer === null || sCurrentSkuId !== sSkuId) {
        sCurrentSkuId = sSkuId;
        _initScene7SpinView();
        _initScene7PageScrubber();
      } else {
        scene7AutoSpinEnabled = true;
        _initScene7AutoSpinView();
      }
    }
  };

  _setMediaAsset = function setMediaAsset(index) {
    var oMediaData = {};

    _mediaPlayer.pauseCurrentVideo();

    if (oMedia.aMediaCollection[index] !== undefined && oMedia.getMediaType(index) !== undefined) {
      iCurrentMediaIndex = index;
      _config.oDomElements.$pings.show();

      switch (oMedia.getMediaType(index)) {
        case 'image':
          videoViewVisible = false;
          spinViewVisible = false;
          if (!_config.oSettings.bDisableScene7) {
            ImageViewer.setItem(aImageSet[oMedia.aMediaCollection[index].mediaSetIndex]);
          }
          _config.oDomElements.$mv.removeClass().addClass('zoomVisible');
          if (bOverlayIsOpen && bOverlayResizedToScreenHeight && _config.oSettings.sOrientation === 'portrait') {
            _resizeMediaComponent();
            bOverlayResizedToScreenHeight = false;
          }

          if (!bOverlayIsOpen) {
            _config.oDomElements.$s7containerMask.hide();
          }
          break;
        case 'video':
          videoViewVisible = true;
          spinViewVisible = false;
          if (bOverlayIsOpen && !bOverlayResizedToScreenHeight) {
            _resizeMediaComponent(undefined, $(window).height());
            bOverlayResizedToScreenHeight = true;
          }
          _config.oDomElements.$mv.removeClass().addClass('videoVisible');
          _config.oDomElements.$pings.hide();
          if (oMedia && oMedia.iFeatureMediaIndex && oMedia.iFeatureMediaIndex === index) {
            _config.oDomElements.$mv.addClass('featureMediaVisible');
          }
          oMediaData = oMedia.getMediaByIndex(index);
          _mediaPlayer.videoUpdate(index, oMediaData);
          _config.oDomElements.$s7containerMask.hide();

          arrowsHandler.bindVideoViewEvents();
          if (_thumbnailClicked) {
            _mediaPlayer.playCurrentVideo();
          }
          break;
        case 'spin':
          videoViewVisible = false;
          spinViewVisible = true;
          _config.oDomElements.$mv.removeClass().addClass('spinVisible');
          if (bOverlayIsOpen && !bOverlayResizedToScreenHeight) {
            _resizeMediaComponent(undefined, $(window).height());
            bOverlayResizedToScreenHeight = true;
          }
          _showSpinViewer();
          _config.oDomElements.$s7containerMask.show();
          break;
        case 'static':
          videoViewVisible = false;
          spinViewVisible = false;
          _config.oDomElements.$mv.removeClass().addClass('staticVisible');
          break;
        default:
          // no default
      }

      if (!_thumbnailClicked && iMediaCollectionLength > 1) {
        arrowsHandler.toggleArrowVisibility(true);
      }
      _setThumbnailClicked(false);
    }
  };

  _updateMediaViewerCounter = function updateMediaViewerCounter(from, to) {
    if (iActiveImage === undefined || from <= to) {
      iActiveImage = from;
      $(_config.sDOM_SELECTORS.mvCounter).addClass('show').text(from + '/' + to);
    }
  };

  _fnMoveCarousel = function fnMoveCarousel(oEvent) {
    if (!iIsZoomedIn) {
      if (oEvent.type === 'swipeLeft') {
        oImageViewerCarousel.moveRight();
      } else {
        oImageViewerCarousel.moveLeft();
      }
    }
  };

  _zoomViewImageViewerCarouselEvents = function zoomViewImageViewerCarouselEvents() {
    var sSelectors = '#' + sImageViewer + ', #prodVideoView';

    _config.oDomElements.$s7containerPlaceholder.on(
      'swipeLeft swipeRight', sSelectors, _fnMoveCarousel
    );
    _config.oDomElements.$s7containerMask.on('swipeLeft swipeRight', _fnMoveCarousel);
  };

  _blockZoomedImageViewerSwiping = function blockZoomedImageViewerSwiping() {
    ImageViewer.addEventListener(s7sdk.event.UserEvent.NOTF_USER_EVENT, function (event) {
      if (event.s7event.trackEvent === 'ZOOM' && !iIsZoomedIn) {
        iIsZoomedIn = true;
      } else if (event.s7event.trackEvent === 'PAN' && iIsZoomedIn) {
        iIsZoomedIn = true;
      } else {
        iIsZoomedIn = false;
      }
    }, false);
  };

  _initFeatureMediaButton = function initFeatureMediaButton() {
    if (oMedia && oMedia.iFeatureMediaIndex) {
      if (_config.oDomElements.$featureButton !== null) {
        _config.oDomElements.$featureButton
          .off('click', _thumbnailHandler)
          .on('click', {
            iCurrentIndex: oMedia.iFeatureMediaIndex
          }, _thumbnailHandler);
      } else {
        if (featureMediaType === 'spin') {
          _config.oDomElements.$sidebar.append(_config.sDOM_SELECTORS.templates.spinButton);
        } else {
          _config.oDomElements.$sidebar.append(_config.sDOM_SELECTORS.templates.playButton);
        }
        _config.oDomElements.$featureButton = $(_config.sDOM_SELECTORS.featureButton);
        _config.oDomElements.$featureButton.on('click', {
          iCurrentIndex: oMedia.iFeatureMediaIndex
        }, _thumbnailHandler);
      }
    } else if ($(_config.sDOM_SELECTORS.featureButton).length > 0) {
      _config.oDomElements.$featureButton.remove();
      _config.oDomElements.$featureButton = null;
    }
  };


  /**
   *
   * @param {Object} ping
   * @param {String} ping.mediaType
   * @param {String} ping.src
   * @param {String} tmplSelector
   * @param {JQueryObject} target
   * @return {String}
   */
  _fnUpdatePing = function fnUpdatePing(ping, tmplSelector, target) {
    var _ping = {},
      _target = target,
      data = {},
      markup = '',
      pageController = window.oAppController.oPageController,
      activeSku = pageController.getActiveSku(),
      skuModel = pageController.getModule('model', 'sku', '_default'),
      template = $(tmplSelector)[0].innerHTML,
      PRESET_PLACEHOLDER = '$[preset]$';

    if (!fn.isArray(ping, { notEmpty: true })) {
      _target[0].innerHTML = '';
      return null;
    }

    if (skuModel.getListings(activeSku).length > 1) {
      _target[0].innerHTML = '';
      return null;
    }

    _ping = ping[0];

    _ping.src = _ping.src
    || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

    data.sViewId = 'product-ping-1234';
    data.sViewClass = 'product-ping';
    data.props = {
      mediaType: _ping.mediaType,
      srcSmall: _ping.src.replace(PRESET_PLACEHOLDER, 'sm'),
      srcLarge: _ping.src.replace(PRESET_PLACEHOLDER, 'lg')
    };

    markup = mustache.render(template, data);
    target.html(markup);

    window.picturefill();
    return markup;
  };


  _resizeKioskImageViewer = function resizeKioskImageViewer() {
    if (!bKioskResizeExecuted) {
      bKioskResizeExecuted = true;
      _resizeMediaComponent();
    }
  };

  _handleMediaViewerUpdate = function handleMediaViewerUpdate(event) {
    var update = event.customData;

    if (update.type === 'add') {
      _addMediaAsset(update);
    } else if (update.type === 'remove') {
      _removeMediaAsset(update);
    }
  };

  _addMediaAsset = function addMediaAsset(args) {
    var _args = args || {},
      items = _args.items || {},
      images = _args.images || {},
      callbacks = _args.callbacks || {},
      timestamp = new Date().getTime(),
      dotClassNames = '';

    if (!items || !images) {
      return;
    }

    if (typeof images.main !== 'string' || typeof _args.mediaType !== 'string') {
      return;
    }

    if (typeof items.main !== 'string' && typeof items.thumb !== 'string') {
      return;
    }

    oMedia.addMedia([images.main], _args.mediaType, _args.position, {
      isStatic: true,
      classNames: _args.classNames,
      timestamp: timestamp
    });

    if (oMedia.getCollectionLength() === 2) {
      _config.oDomElements.$wrapper.removeClass('single-item');
    }

    items.main = $(items.main).attr('data-timestamp', timestamp)[0].outerHTML;

    if (oImageViewerCarousel) {
      oImageViewerCarousel.add({
        position: args.position,
        callback: callbacks.main,
        item: items.main
      });

      if (oImageViewerCarousel.totalCarouselItems > 1) {
        arrowsHandler.toggleArrowVisibility(true);
      }
    }

    items.thumb = $(items.thumb).attr('data-timestamp', timestamp)[0].outerHTML;

    if (oMediaThumbnails) {
      oMediaThumbnails.add({
        position: args.position,
        callback: callbacks.thumb,
        item: items.thumb
      });
      arrowsHandler.imageViewerThumbArrows(oMediaThumbnails, oMedia);
    } else {
      _initThumbnailsCarousel({
        filterDataCallback: function filterDataCallback(viewData) {
          var i = 0,
            viewDataCopy = $.extend({}, viewData),
            media = viewDataCopy.aMedia;

          for (i = 0; i < media.length; i += 1) {
            if (media[i].hasOwnProperty('timestamp') && media[i].timestamp === timestamp) {
              media[i].mediaSrc = images.thumb;
            }
          }

          return viewDataCopy;
        },
        addMediaAssetCallback: function addMediaAssetCallback($mediaThumbnails) {
          var $addedItem = $mediaThumbnails.find('[data-timestamp="' + timestamp + '"]');

          if (typeof callbacks.thumb === 'function' && $addedItem.length > 0) {
            callbacks.thumb($addedItem);
          }
        }
      });
    }

    if (breakpoint.currentViewport === 'kiosk' || breakpoint.currentViewport === 'largedesktop'
        || breakpoint.currentViewport === 'desktop' || breakpoint.currentViewport === 'htablet') {
      $(oMediaThumbnails.options.itemSelector).filter(function () {
        if ($(this).data('timestamp') === timestamp) {
          return $(this);
        }
        return undefined;
      }).trigger('click');
    }

    if (_args.mediaType === 'image' || _args.mediaType === 'static') {
      dotClassNames = 'icon-dual-dot';
    } else if (_args.mediaType === 'video') {
      dotClassNames = 'icon-play';
    } else if (_args.mediaType === 'spin') {
      dotClassNames = 'icon-spin';
    }

    if (oMediaDots) {
      oMediaDots.add({
        position: args.position,
        item: '<li class="icon ' + dotClassNames + ' ' + _args.classNames
            + '" data-timestamp="' + timestamp + '"></li>'
      });
    } else if (breakpoint.currentViewport !== 'kiosk') {
      _initImageViewerDots();
    }

    if (breakpoint.currentViewport === 'vtablet' || breakpoint.currentViewport === 'mobile') {
      $(oMediaDots.options.itemSelector).filter(function () {
        if ($(this).data('timestamp') === timestamp) {
          return $(this);
        }
        return undefined;
      }).trigger('click');
    }
  };

  _removeMediaAsset = function removeMediaAsset(args) {
    var _args = args || {};

    oMedia.removeMedia({
      mediaAsset: _args.mediaAsset
    });

    if (oMedia.getCollectionLength() === 1) {
      _config.oDomElements.$wrapper.addClass('single-item');
    }

    if (oImageViewerCarousel) {
      oImageViewerCarousel.remove({
        position: _args.position
      });

      if (oImageViewerCarousel.totalCarouselItems === 1) {
        arrowsHandler.toggleArrowVisibility(false);
      }
    }

    if (oMediaThumbnails) {
      oMediaThumbnails.remove({
        position: _args.position
      });

      if (breakpoint.currentViewport === 'kiosk' || breakpoint.currentViewport === 'largedesktop'
          || breakpoint.currentViewport === 'desktop' || breakpoint.currentViewport === 'htablet') {
        $(oMediaThumbnails.options.itemSelector).first().trigger('click');
      }

      if (oMediaThumbnails.totalCarouselItems === 1) {
        oMediaThumbnails.destroy();
        oMediaThumbnails = null;
      } else {
        arrowsHandler.imageViewerThumbArrows(oMediaThumbnails, oMedia);
      }
    }

    if (oMediaDots) {
      oMediaDots.remove({
        position: _args.position
      });

      if (breakpoint.currentViewport === 'vtablet' || breakpoint.currentViewport === 'mobile') {
        $(oMediaDots.options.itemSelector).first().trigger('click');
      }

      if (oMediaDots.totalCarouselItems === 1) {
        oMediaDots.destroy();
        oMediaDots = null;
      }
    }
  };

  /***********************************************************************************************
   * Global vars
   */
  pdpScene7 = {
    s7ServerUrl: '//tesco.scene7.com/is/image/',
    s7ImageSet: null,
    s7SpinSet: null,
    s7VideoSet: null,
    s7ZoomMouseEnter: null,
    s7ZoomMouseExit: null,
    scene7ImageMode: 'flyoutViewer',
    overrideScene7WindowDetect: _overrideScene7WindowDetect,
    showScene7: _showScene7,
    init: _init,
    updatePing: _fnUpdatePing
  };


  return pdpScene7;
});
