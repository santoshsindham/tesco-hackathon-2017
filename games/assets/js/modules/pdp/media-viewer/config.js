define('modules/pdp/media-viewer/config', ['domlib'], function ($) {
  'use strict';

  var oConfig = {};

  oConfig.sDOM_SELECTORS = {
    container: '#media-viewer-container',

    mvStaticImage: '.static-product-image',
    mvStaticImageElement: '#scene7-placeholder',

    wrapper: '#media-viewer-wrapper',

    pings: '.media-viewer--pings',
    mvProductPing: 'div.product-ping',

    mvCarouselNav: 'div.media-viewer--carousel-nav',
    mvImageViewerCarouselItemPrevNext: '.btn-s7-carousel',
    mvImageViewerCarouselItemPrev: '.btn-s7-prev:not(.btn-s7-carousel-fade-out)',
    mvImageViewerCarouselItemNext: '.btn-s7-next:not(.btn-s7-carousel-fade-out)',

    mvMain: '#media-viewer--main',
    mv: '#media-viewer',
    mvInner: '#media-viewer-inner',
    s7containerPlaceholder: '#mediaViewerScene7Container',
    s7container: '#s7container',
    mvImageViewerCarousel: '.image-viewer-carousel',
    mvImageViewerCarouselItem: '.image-viewer-carousel li',

    s7containerMask: '#s7container-mask',

    sidebar: '#media-viewer--sidebar',
    mvMediaThumbnails: '.mv-thumbnail-container',
    mvCarousel: '.mv-thumbnail-carousel',
    mvCarouselItem: '.mv-thumbnail-carousel li',
    mvCounter: '#mv-carousel-index',

    mvDots: '.media-viewer-markers',
    mvDotsItem: '.media-viewer-markers li',
    mvMediaDots: '#mv-dotMarker-innerWrapper',

    videoContainer: 'div.videoContainer',
    videoControlsWrapper: '.video-controls',
    currentVideo: '.videoPosition video',
    featureButton: '#fnFeatureButton',

    mvOverlayContent: '#mv-overlay-content',

    zoomIcon: '.icon-zoom',

    templates: {
      thumbnails: '#media-viewer-thumbnails-template',
      imageViewer: '#image-viewer-carousel-template',
      imageViewerDots: '#image-viewer-dots-template',
      playButton: '<div class="btn-feature-media highlight" id="fnFeatureButton"><span class="icon icon-play"></span> View catwalk</div>',
      spinButton: '<div class="btn-feature-media highlight" id="fnFeatureButton"><span class="icon icon-spin"></span> View 360</div>',
      ping: '#product-ping-template',
      staticImageLandscape: '#landscape-static-image-viewer-carousel-template',
      staticImagePortrait: '#portrait-static-image-viewer-carousel-template'
    }
  };

  oConfig.oDomElements = {
    $window: $(window),
    $container: null,
    $wrapper: null,
    $sidebar: null,
    $mv: null,
    $s7containerPlaceholder: null,
    $s7container: null,
    $mvMediaDots: null,
    $pings: null,
    $s7containerMask: null,
    $featureButton: null,
    $mvStaticImageElement: null
  };

  oConfig.oSettings = {
    sOrientation: '',
    oDimensions: {
      portrait: {
        oThumbnails: {
          DEFAULT_WIDTH: 73,
          WIDTH: 73,
          DEFAULT_HEIGHT: 104,
          HEIGHT: 116
        },
        oDots: {
          WIDTH: 10,
          HEIGHT: 10
        },
        oKiosk: {
          MEDIA_VIEWER: {
            WIDTH: 730,
            HEIGHT: 740
          }
        }
      },
      landscape: {
        oThumbnails: {
          DEFAULT_WIDTH: 90,
          WIDTH: 100,
          DEFAULT_HEIGHT: 90,
          HEIGHT: 92
        },
        oDots: {
          WIDTH: 10,
          HEIGHT: 10
        }
      }
    },
    bDisableScene7: window.isKiosk()
  };

  return oConfig;
});
