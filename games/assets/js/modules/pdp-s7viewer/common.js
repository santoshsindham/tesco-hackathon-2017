/*jslint plusplus: true */
/*jslint nomen: true*/
/*global define: true, window: true, serverUrl: true, s7sdk: true, _mediaCollectionUpdated: true, spin_set: true, image_set: true, globalStaticAssetsPath: true, spinViewScrubber: true, swatchSelected: true, _s7VideoSet: true, refEvar22: true, refEvar24: true */
define('modules/pdp-s7viewer/common', ['domlib', 'modules/breakpoint', 'modules/common', 'modules/basic-carousel/common', 'modules/media-player/common', 'modules/tesco.analytics', 'modules/device-specifications/common', 'modules/overlay/common', 'modules/pdp-s7viewer/tabHandler', 'modules/pdp-s7viewer/arrowsHandler'], function ($, breakpoint, common, BasicCarousel, mediaPlayer, analytics, deviceSpecifications, overlay, tabHandler, arrowsHandler) {
    'use strict';

    var sProductCarousel = '#product-carousel',
        sScene7Container = '#pdpScene7Container',
        sOverlay = '#overlay',
        sVirtualPage = '#virtual-page',
        sComponentContainer = '#s7container',
        imageViewerContainerId = 'prodZoomView',
        sSpinViewerContainerId = 'prodSpinView',
        sSpinThumb = '<img class="s7-spin-thumb"/>',
        sPdpMainDetailsContainer = '.main-details',
        sMediaOverlayButton = '#btn-overlay',
        sVideoWrapper = '.videoPosition',
        sImageViewerThumbnailCarousel = '#product-thumb-carousel',
        sMobileImageViewerThumbnailCarousel = '#product-thumb-carousel-gallery',
        sFlashVideoObject = '#s7FlashVideoPlayer',
        sVideoTabButton = '#pdp-product-video',
        sImageTabButton = '#pdp-product-zoom',
        sSpinTabButton = '#pdp-product-spin',
        sZoomViewerCanvas = '#prodZoomView div canvas',
        sReducedFurnitureClass = 'pdp-reduced-furniture',
        $tmpMediaContent = null,
        zoomViewVisible = true,
        videoViewVisible = false,
        spinViewVisible = false,
        spinViewSku = null,
        s7container = null,
        s7params = null,
        spinViewScrubber,
        aImageSet = [],
        iImageSetCount,
        imageSetThumbMarkup,
        sMediaNavigationArrows = '#prodZoomView .btn-s7-step',
        sMobileS7SetIndicator = '.s7setindicator',
        sNextPrevButtonSelector = '.btn-s7-step',
        sZoomViewSelector = '.s7zoomview',
        sMobileS7SetIndicatorImageViewer = '#prodZoomView ' + sMobileS7SetIndicator,
        $imageViewerComponent,

        // classes
        ImageViewer = null,
        SpinViewer = null,
        SetIndicator = null,
        ThumbCarousel = null,
        VideoCarousel = null,
        MediaSet = null,

        // method declarations
        refreshScene7GlobalVars,
        resetMediaUIComponents,
        resizeMediaComponent,
        reinitialiseActiveVideoObjects,
        hideAndShowImageViewer,
        fadeInImageViewer,
        mediaOverlayHandler,
        renderOverlay,
        cleanMediaControls,
        detectCurrentMediaTab,
        hideAllMediaUIComponents,
        pauseCurrentVideo,
        setVideoBusyTimer,
        videoThumbCarousel,
        requestAnimFrame,
        initSpinViewerScrubber,
        spinViewerReady,
        spinViewerHandler,
        showSpinViewerVirtualPage,
        showVideoViewer,
        showSpinViewer,
        showImageViewer,
        productInfoView,
        mediaTabHandler,
        resetImageViewerZoomLevel,
        nextMediaItem,
        prevMediaItem,
        bindMediaComponentEventHandlers,
        doZoomReset,
        setZoomImage,
        delayResize,
        updateSetIndicator,
        initSetIndicator,
        createImageViewerThumbsMarkup,
        initImageViewerThumbs,
        blockZoomedImageViewerSwiping,
        initImageViewer,
        configureScene7Params,
        initScene7Container,
        initScene7MediaSet,
        showOverlayButton,
        isScene7Enabled,
        isImageViewerEnabled,
        isSpinViewerEnabled,
        isVideoEnabled,
        scene7DomReadyCheckTimer,
        scene7DomReadyCheck,
        initScene7Dependencies,
        setScene7ImageMode,
        fallbackToStaticImage,
        syncDesktopAndMobileImagePositions,
        mediaTypeCount,
        init = function init() {
            if (common.isPage('PDP') && isScene7Enabled() && $('#pdpScene7Container').length > 0) {
                try {
                    $(sPdpMainDetailsContainer).addClass('htmlViewer');
                    refreshScene7GlobalVars();
                    resetMediaUIComponents();
                    setScene7ImageMode();
                    initScene7Dependencies();
                    tabHandler.configureMediaTabs(mediaTypeCount());
                } catch (err) {
                    fallbackToStaticImage();
                }
            }
        },
        pdpScene7 = {
            scene7data: null,
            s7ServerUrl: null,
            s7ImageSet: null,
            s7SpinSet: null,
            s7VideoSet: null,
            mobileGalleryInDom: false,
            virtualPageInMotion: false,
            s7ZoomedIn: false,
            s7ZoomTimer: false,
            s7ZoomMouseEnter: null,
            s7ZoomMouseExit: null,
            s7EnterTimeoutDuration: 50,
            s7ExitTimeoutDuration: 200,
            videoVisible: false,
            videoThumbCarouselInDom: false,
            videoBusyTimer: null,
            videoBusyTimerDuration: 350,
            videoBusy: false,
            scene7DomReadyCheckInterval: null,
            scene7ImageMode: 'flyoutViewer',

            getVideoCarousel: function () {
                return VideoCarousel;
            },

            mobileIn: function () {
                if ($(sOverlay).length) {
                    mediaOverlayHandler(detectCurrentMediaTab(), 'hideOverlay');
                    overlay.hide();
                }
                resetImageViewerZoomLevel();
                doZoomReset();
            },

            mobileOut: function () {
                resetImageViewerZoomLevel();
                doZoomReset();
                $(sMobileS7SetIndicatorImageViewer + ', ' + sZoomViewerCanvas + ', ' + sMediaNavigationArrows).css({
                    opacity: '1',
                    display: 'block'
                });
            },

            overrideScene7WindowDetect: function () {
                s7sdk.Window.monitorSize = function () {
                    s7sdk.browser.screensize = s7sdk.browser.detectScreen();
                    if (Math.abs(s7sdk.Window.currentSize.h - s7sdk.browser.screensize.h) > 100) {
                        if (s7sdk.Window.currentSize.w !== s7sdk.browser.screensize.w || s7sdk.Window.currentSize.h !== s7sdk.browser.screensize.h) {
                            s7sdk.Window.currentSize = s7sdk.browser.screensize;
                            s7sdk.Window.sendNotifications();
                        }
                    }
                    if ((new Date()).getTime() > s7sdk.Window.monitorSizeTimeout) {
                        clearInterval(s7sdk.Window.monitorSizeTimer);
                        s7sdk.Window.monitorSizeTimer = null;
                    }
                };
            },
            init: init
        };

    mediaTypeCount = function mediaTypeCount() {
        var iMediaTypeCount = 0;

        if (pdpScene7.scene7data.s7ImageSet.length > 0) {
            iMediaTypeCount += 1;
        }
        if (pdpScene7.scene7data._s7VideoSet.length > 0) {
            iMediaTypeCount += 1;
        }
        if (pdpScene7.scene7data.s7SpinSet.length > 0) {
            iMediaTypeCount += 1;
        }

        return iMediaTypeCount;
    };

    syncDesktopAndMobileImagePositions = function syncDesktopAndMobileImagePositions(index) {
        $(sImageViewerThumbnailCarousel + ' ul li').eq(index).trigger('click');
    };

    refreshScene7GlobalVars = function refreshScene7GlobalVars() {
        pdpScene7.scene7data = window.TescoData.pdp.scene7;
        pdpScene7.s7ServerUrl = window.TescoData.pdp.scene7.s7ServerUrl;
        pdpScene7.s7ImageSet = window.TescoData.pdp.scene7.s7ImageSet;
        pdpScene7.s7SpinSet = window.TescoData.pdp.scene7.s7SpinSet;
        pdpScene7.s7VideoSet = window.TescoData.pdp.scene7._s7VideoSet;
    };

    resetMediaUIComponents = function resetMediaUIComponents() {
        mediaPlayer.$videoViewContainer = VideoCarousel = ThumbCarousel = null;
        if (pdpScene7.videoThumbCarouselInDom) {
            pdpScene7.videoThumbCarouselInDom = false;
        }
        if (_mediaCollectionUpdated.length === 0) {
            $(sVideoTabButton).hide();
        }
        if (pdpScene7.s7SpinSet.length === 0) {
            $(sSpinTabButton).hide();
        }
        $('#s7container, #prodZoomView, #prodZoomView div, #prodZoomView div div, #prodZoomView div div canvas, ' + sMobileImageViewerThumbnailCarousel + ' ul, ' + sMobileImageViewerThumbnailCarousel + ' ul li').removeAttr('style');
    };

    resizeMediaComponent = function resizeMediaComponent(callback) {
        var contWidth = $(sScene7Container).width(),
            deltaWidth = contWidth,
            height = $(sScene7Container).height();

        if (!window.isKiosk()) {
            if (breakpoint.mobile && common.isIOS()) { // Andy - this is a dodgy hack to fix iPhone bug which sets the height of the canvas on orientation change to 480.
                height = height > 400 ? deltaWidth : height;
            }
            s7container.resize(deltaWidth, height);
            if (ImageViewer) {
                $(sZoomViewSelector).css('margin-left', '0');
                ImageViewer.resize(deltaWidth, height);
            }
            if (SpinViewer) {
                SpinViewer.resize(deltaWidth, height);
            }
            if (zoomViewVisible && ThumbCarousel) {
                ThumbCarousel.calculateVisibleItems();
            }
            if (videoViewVisible) {
                if (VideoCarousel) {
                    if ($('span.play-icon').length < 1) {
                        pauseCurrentVideo('createIcon');
                    }
                    $('#prodVideoView .videoContainer').animate({
                        opacity: 1
                    }, 350, function () {
                        $(this).removeAttr('style');
                    });
                    VideoCarousel.calculateVisibleItems();
                }
            }
            $(window).trigger('scene7Resized');
        }
        if (callback !== undefined && callback !== null) {
            callback();
        }
    };

    reinitialiseActiveVideoObjects = function reinitialiseActiveVideoObjects() {
        var flashObj;

        if (VideoCarousel !== null && videoViewVisible) {
            try {
                mediaPlayer.getCurrentVideo().seekBarSlider.resize();
            } catch (e) {
                flashObj = $(sFlashVideoObject).clone(); // if flash video trigger reload to reinitialise ActiveX component
                $(sFlashVideoObject).remove();
                $(sVideoWrapper).append(flashObj);
            }
        }
    };

    hideAndShowImageViewer = function hideAndShowImageViewer() {
        if ($('canvas', $(sProductCarousel)).length) {
            $imageViewerComponent = $('canvas', $(sProductCarousel));
        }
        if ($('#prodZoomView div div img').length) {
            $imageViewerComponent = $('#prodZoomView div div img');
        }
        if ($('.s7flyoutzoomview > div > img').length) {
            $imageViewerComponent = $('.s7flyoutzoomview > div > img').first();
        }
        $imageViewerComponent.hide();
    };

    fadeInImageViewer = function fadeInImageViewer() {
        if (zoomViewVisible) {
            doZoomReset();
            $imageViewerComponent.fadeIn(100);
        }
    };

    mediaOverlayHandler = function mediaOverlayHandler(currentMedia, overlayState) {
        switch (currentMedia) {
        case 'imageViewer':
            hideAndShowImageViewer();
            break;
        case 'spinViewer':
            resizeMediaComponent();
            reinitialiseActiveVideoObjects();
            break;
        case 'videoViewer':
            if (VideoCarousel !== null) {
                if ($('span.play-icon').length < 1) {
                    pauseCurrentVideo('createIcon');
                }
            }
            resizeMediaComponent();
            reinitialiseActiveVideoObjects();
            break;
        }

        if (overlayState === 'showOverlay') {
            cleanMediaControls();
        }
        if (overlayState === 'hideOverlay') {
            $('.details-container:first').after($(sProductCarousel).detach());
            resizeMediaComponent(fadeInImageViewer);
        }
    };

    renderOverlay = function renderOverlay(e) {
        var overlayOptions;

        e.stopImmediatePropagation();
        mediaOverlayHandler(detectCurrentMediaTab(), 'showOverlay');
        $tmpMediaContent = $(sProductCarousel).detach();
        overlayOptions = {
            hideOnOverlayClick: true,
            hideOnEsc: true,
            content: $tmpMediaContent,
            customClass: 'pdpS7Overlay',
            fixedWidth: '',
            isError: false,
            onHideCallback: function () {
                mediaOverlayHandler(detectCurrentMediaTab(), 'hideOverlay');
            },
            defaultBreakPointBehavior: true
        };
        overlay.show(overlayOptions);
        resizeMediaComponent(fadeInImageViewer);
        $(sOverlay).css('height', '100%').addClass('dark');
    };

    cleanMediaControls = function cleanMediaControls() {
        $(sNextPrevButtonSelector + ', .video-controls').removeAttr('style');
    };

    detectCurrentMediaTab = function detectCurrentMediaTab() {
        var sCurrentMediaTab = null;

        if (zoomViewVisible) {
            sCurrentMediaTab = 'imageViewer';
        }
        if (spinViewVisible) {
            sCurrentMediaTab = 'spinViewer';
        }
        if (videoViewVisible) {
            sCurrentMediaTab = 'videoViewer';
        }
        return sCurrentMediaTab;
    };

    hideAllMediaUIComponents = function hideAllMediaUIComponents() {
        $(sProductCarousel).removeClass('zoomVisible');
        $(sProductCarousel).removeClass('videoVisible');
        $(sProductCarousel).removeClass('spinVisible');
        $(sProductCarousel).removeClass('prodInfoVisible');
    };

    pauseCurrentVideo = function pauseCurrentVideo(createIcon) {
        if (VideoCarousel) {
            var $currentVideo = $('.videoContainer video'),
                createPauseIcon;
            if ($currentVideo.length) {
                $('button.play').removeClass('paused');
                if (!$currentVideo[0].paused) {
                    $currentVideo[0].pause();
                    arrowsHandler.showMediaNavigationArrows();
                    if (createIcon) {
                        createPauseIcon = '<span class="pause-icon">Pause video</span>';
                        $(sVideoWrapper).append(createPauseIcon);
                        setTimeout(function () {
                            $('span.pause-icon').addClass('hide-video-icon');
                            setTimeout(function () {
                                $('span.pause-icon').remove();
                            }, 1000);
                        }, 250);
                    }
                }
            }
        }
    };

    setVideoBusyTimer = function setVideoBusyTimer() {
        clearTimeout(pdpScene7.videoBusyTimer);
        pdpScene7.videoBusyTimer = setTimeout(function () {
            pdpScene7.videoBusy = false;
            clearTimeout(pdpScene7.videoBusyTimer);
        }, pdpScene7.videoBusyTimerDuration);
    };

    videoThumbCarousel = function videoThumbCarousel() {
        var videoThumbnails = '',
            i,
            selectedThumb;

        if (videoThumbnails === '') {
            for (i = 0; i < _mediaCollectionUpdated.length; i++) {
                videoThumbnails += '<li class="video-thumb" data-index="' + i + '"><img src="' + globalStaticAssetsPath + 'video/thumb.png" width="40" height="40" alt="Tesco Video" /></li>';
            }
        }
        VideoCarousel = new BasicCarousel({
            elementId: 'product-thumb-carousel-videos',
            isHorizontal: true,
            content: videoThumbnails
        });
        $('#product-thumb-carousel-videos .carousel-slider .carousel-items-container li').on('click', function (event) {
            selectedThumb = $(event.target).closest('li').data('index');
            mediaPlayer.videoUpdate(selectedThumb);
        });
    };

    requestAnimFrame = (function () { // shim with setTimeout fallback
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }());

    initSpinViewerScrubber = function initSpinViewerScrubber() {
        spinViewScrubber = new s7sdk.set.PageScrubber('s7container', s7params, 's7Scrubber');
        spinViewScrubber.setAsset(pdpScene7.s7SpinSet);
        spinViewScrubber.resize($('#pdpScene7Container').width() - 20, 55);
        spinViewScrubber.addEventListener(s7sdk.event.SliderEvent.NOTF_SLIDER_MOVE, function () {
            SpinViewer.setCurrentFrameIndex(spinViewScrubber.getCurrentFrameIndex());
        }, false);
        SpinViewer.addEventListener(s7sdk.event.AssetEvent.ASSET_CHANGED, function () {
            spinViewScrubber.setCurrentFrameIndex(SpinViewer.getCurrentFrameIndex());
        }, false);
    };

    spinViewerReady = function spinViewerReady() {
        var fLength = SpinViewer.getFramesLength(),
            i = 0;

        function spinProduct() {
            if (i < fLength) {
                setTimeout(function () {
                    SpinViewer.setCurrentFrameIndex(i++);
                    requestAnimFrame(spinProduct);
                }, 1000 / 8);
            } else {
                SpinViewer.setCurrentFrameIndex(0);
            }
        }
        requestAnimFrame(spinProduct);
    };

    spinViewerHandler = function spinViewerHandler() {
        showSpinViewer();
        resizeMediaComponent();
        if (breakpoint.mobile) {
            showSpinViewerVirtualPage();
        }
    };

    showSpinViewerVirtualPage = function showSpinViewerVirtualPage() {
        common.virtualPage.show({
            content: $('#' + sSpinViewerContainerId),
            showBack: true,
            showBanner: '<span class="icon" data-icon="g" aria-hidden="true"></span>Drag to rotate 360&deg;<span class="icon" data-icon="r" aria-hidden="true"></span>',
            title: $('h1.page-title').text(),
            beforeRemoval: function () {
                $(sComponentContainer).append($('#' + sSpinViewerContainerId));
                $(sSpinTabButton).removeClass('current');
                $(sImageTabButton).addClass('current').trigger('click');
            }
        });
        $(sVirtualPage).addClass(sReducedFurnitureClass); // add custom class to reduce screen 'furniture' on landscape devices
    };

    showVideoViewer = function showVideoViewer() { // video tab clicked
        pdpScene7.videoVisible = true;
        $(sProductCarousel).addClass('videoVisible');
        if (!pdpScene7.videoThumbCarouselInDom) {
            videoThumbCarousel();
            VideoCarousel.checkArrows();
            pdpScene7.videoThumbCarouselInDom = true;
        } else {
            VideoCarousel.checkArrows();
        }
        mediaPlayer.init();
    };

    showSpinViewer = function showSpinViewer() { // spin viewer tab clicked
        var spinViewContId = "prodSpinView",
            skuIdVal = $('#skuIdVal').val(),
            spinThumbSource;

        $(sProductCarousel).addClass('spinVisible');
        pdpScene7.videoVisible = false;
        if (SpinViewer === null || spinViewSku !== skuIdVal) {
            spinViewSku = skuIdVal;
            spinThumbSource = pdpScene7.s7ServerUrl + "/" + pdpScene7.s7SpinSet + "?wid=50&hei=50";
            SpinViewer = new s7sdk.set.SpinView("s7container", s7params, spinViewContId);
            setTimeout(spinViewerReady, 1350); // there is no event fired when all images are loaded so set timeout to initiate spin rotation
            $(sSpinThumb).attr("src", spinThumbSource).css('visiblity', 'hidden');
            $(sScene7Container).after($(sSpinThumb));
            $(sComponentContainer).append($(sSpinViewerContainerId));
            initSpinViewerScrubber();
        }
    };

    showImageViewer = function showImageViewer() { // image viewer tab clicked
        $(sProductCarousel).addClass('zoomVisible');
        pdpScene7.videoVisible = false;
        ThumbCarousel.checkArrows();
    };

    productInfoView = function productInfoView() {
        $(sProductCarousel).addClass('prodInfoVisible');
    };

    mediaTabHandler = function mediaTabHandler(event) {
        var target = event.currentTarget,
            tabIndex = parseInt($(target).attr('data-tab'), 10),
            $ping = $(sProductCarousel).find('.product-ping'),
            _oWebAnalytics = new analytics.WebMetrics(),
            v = {},
            breadCrumbText = [],
            text;

        tabHandler.setCurrentTabClass(event.currentTarget);
        hideAllMediaUIComponents();
        $('li a', $('#breadcrumb')).each(function () {
            text = $.trim($(this).text());
            breadCrumbText.push(text);
        });

        if (breadCrumbText[1]) {
            v.prop1 = breadCrumbText[1];
        }
        if (breadCrumbText[2]) {
            v.prop2 = breadCrumbText[2];
        }
        if (breadCrumbText[3]) {
            v.prop3 = breadCrumbText[3];
        }

        breadCrumbText.length = 0;

        v.eVar56 = deviceSpecifications.os;
        v.prop23 = deviceSpecifications.os;
        if (refEvar22 !== undefined) {
            v.eVar22 = refEvar22;
        }
        if (refEvar24 !== undefined) {
            v.eVar24 = refEvar24;
        }

        switch (tabIndex) {
        case 0:
            showImageViewer();
            v.prop19 = 'Image Tab';
            v.events = 'event19';
            zoomViewVisible = true;
            videoViewVisible = spinViewVisible = false;
            $(sVideoTabButton).removeClass('triggerRepaint');
            if (VideoCarousel !== null) {
                pauseCurrentVideo();
            }
            if (ThumbCarousel !== null) {
                ThumbCarousel.calculateVisibleItems();
            }
            $ping.show();
            break;
        case 1:
            showVideoViewer();
            v.prop19 = 'Video Tab';
            v.events = 'event19';
            videoViewVisible = true;
            zoomViewVisible = spinViewVisible = false;
            if (VideoCarousel !== null) {
                VideoCarousel.calculateVisibleItems();
                pauseCurrentVideo();
            }
            $ping.hide();
            arrowsHandler.manuallyHideArrows();
            break;
        case 2:
            showSpinViewer();
            v.events = 'prodView,event3,event67';
            spinViewVisible = true;
            zoomViewVisible = videoViewVisible = false;
            $(sVideoTabButton).removeClass('triggerRepaint');
            if (VideoCarousel !== null) {
                pauseCurrentVideo();
            }
            $ping.hide();
            break;
        case 3:
            productInfoView();
            spinViewVisible = zoomViewVisible = videoViewVisible = false;
            $(sVideoTabButton).removeClass('triggerRepaint');
            if (VideoCarousel !== null) {
                pauseCurrentVideo();
            }
            $ping.hide();
            break;
        }
        _oWebAnalytics.submit([v]);
    };

    resetImageViewerZoomLevel = function resetImageViewerZoomLevel() {
        pdpScene7.s7ZoomedIn = false;
    };

    nextMediaItem = function nextMediaItem(event) {
        var currentVideoIndex,
            newVideoIndex;
        event.stopImmediatePropagation();
        if (ThumbCarousel) {
            if (event.type === 'click') {
                if (pdpScene7.videoVisible) {
                    setVideoBusyTimer();
                    if (!pdpScene7.videoBusy) {
                        currentVideoIndex = $(sVideoWrapper).data('index');
                        newVideoIndex = currentVideoIndex + 1;
                        if (newVideoIndex >= 0 && newVideoIndex < pdpScene7.s7VideoSet.length) {
                            mediaPlayer.videoUpdate(newVideoIndex);
                            VideoCarousel.next();
                            pdpScene7.videoBusy = true;
                            setVideoBusyTimer();
                        }
                    }
                } else {
                    ThumbCarousel.next();
                    resetImageViewerZoomLevel();
                }
            } else if (event.type === 'swipeLeft') {
                if (!pdpScene7.s7ZoomedIn) {
                    ThumbCarousel.next();
                    resetImageViewerZoomLevel();
                }
            }
        }
    };

    prevMediaItem = function prevMediaItem(event) {
        var currentVideoIndex,
            newVideoIndex;
        event.stopImmediatePropagation();
        if (ThumbCarousel) {
            if (event.type === 'click') {
                if (pdpScene7.videoVisible) {
                    setVideoBusyTimer();
                    if (!pdpScene7.videoBusy) {
                        currentVideoIndex = $(sVideoWrapper).data('index');
                        newVideoIndex = currentVideoIndex - 1;
                        if (newVideoIndex >= 0 && newVideoIndex < pdpScene7.s7VideoSet.length) {
                            mediaPlayer.videoUpdate(newVideoIndex);
                            VideoCarousel.prev();
                            pdpScene7.videoBusy = true;
                            setVideoBusyTimer();
                        }
                    }
                } else {
                    ThumbCarousel.prev();
                    resetImageViewerZoomLevel();
                }
            } else if (event.type === 'swipeRight') {
                if (!pdpScene7.s7ZoomedIn) {
                    ThumbCarousel.prev();
                    resetImageViewerZoomLevel();
                }
            }
        }
    };

    bindMediaComponentEventHandlers = function bindMediaComponentEventHandlers() {
        $(sProductCarousel).on('click', '.button', $.proxy(mediaTabHandler, this));
        $(sProductCarousel).on('click', sMediaOverlayButton, renderOverlay);
        $(sProductCarousel).on('click', '#pdpScene7Container div.hot-area.next', nextMediaItem);
        $(sProductCarousel).on('click', '#pdpScene7Container div.hot-area.prev', prevMediaItem);
        $(sProductCarousel).on('click', sImageViewerThumbnailCarousel + ' ul li', resetImageViewerZoomLevel);
        if (common.isTouch()) {
            if (breakpoint.mobile) {
                arrowsHandler.showMediaNavigationArrows();
            } else {
                arrowsHandler.mediaNavigationArrowsEventHandler('touch');
            }
        } else {
            arrowsHandler.mediaNavigationArrowsEventHandler('mouse');
        }
    };

    doZoomReset = function doZoomReset(e) {
        try {
            if ($(e.toElement).is('img')) {
                e.preventDefault();
                return false;
            }
        } catch (ignore) {}

        if (ImageViewer && pdpScene7.scene7ImageMode === 'zoomViewer') {
            ImageViewer.zoomReset();
        }
    };

    setZoomImage = function setZoomImage(index) {
        if (ImageViewer) {
            ImageViewer.setItem(aImageSet[index]);
        }
        if (!common.isTouch() && SetIndicator) {
            SetIndicator.setSelectedPage(index);
        }
    };

    delayResize = function delayResize() {
        setTimeout(resizeMediaComponent, 500);
    };

    updateSetIndicator = function updateSetIndicator(event) {
        if (SetIndicator) {
            SetIndicator.setSelectedPage(event.s7event.frame);
        }
        if (common.isTouch()) {
            syncDesktopAndMobileImagePositions(event.s7event.frame);
        }
    };

    initSetIndicator = function initSetIndicator(iImageSetCount) {
        SetIndicator = new s7sdk.SetIndicator(ImageViewer.compId, s7params, 's7setindicator');
        SetIndicator.setNumberOfPages(iImageSetCount);
        SetIndicator.setSelectedPage(0);
    };

    createImageViewerThumbsMarkup = function createImageViewerThumbsMarkup(images) {
        var tmbWidth = 270,
            tmbHeight = 270,
            qStr = '?wid=' + tmbWidth + '&hei=' + tmbHeight,
            i,
            l,
            imgTag,
            src,
            imgArray = [];

        for (i = 0, l = images.length; i < l; i++) {
            src = pdpScene7.s7ServerUrl + '/' + images[i].name + qStr;
            imgTag = '<li data-index="' + i + '" ><img src="' + src + '" /></li>';
            imgArray.push(imgTag);
        }
        return imgArray.join('');
    };

    initImageViewerThumbs = function initImageViewerThumbs(event) {
        aImageSet = event.s7event.asset.items;
        iImageSetCount = aImageSet.length;
        imageSetThumbMarkup = createImageViewerThumbsMarkup(aImageSet);

        ThumbCarousel = new BasicCarousel({
            elementId: 'product-thumb-carousel',
            isHorizontal: true,
            content: imageSetThumbMarkup,
            onItemClick: setZoomImage
        });
        return iImageSetCount;
    };

    blockZoomedImageViewerSwiping = function blockZoomedImageViewerSwiping() {
        var currentZoomEvent;

        ImageViewer.addEventListener(s7sdk.event.UserEvent.NOTF_USER_EVENT, function (event) { // scene7 event listener to catch user zooms on image viewer - if zooming this will stop the user swiping to the next asset until the user has zoomed out
            currentZoomEvent = event.s7event.toString();
            if (currentZoomEvent === 'ZOOM,40' || currentZoomEvent === 'ZOOM,40.01' || currentZoomEvent === 'ZOOM,100.01' || currentZoomEvent === 'ZOOM,100' || currentZoomEvent === 'PAN,' || currentZoomEvent === 'ZOOM,35.01') {
                pdpScene7.s7ZoomedIn = true;
            } else {
                resetImageViewerZoomLevel();
            }
        }, false);
    };

    /**
     *  @param {s7sdk.AssetEvent.NOTF_SET_PARSED} Event dispatched by s7sdk.set.MediaSet when set has finished parsing
     */
    initImageViewer = function initImageViewer(event) {
        iImageSetCount = initImageViewerThumbs(event);

        if (pdpScene7.scene7ImageMode === 'zoomViewer') {
            ImageViewer = new s7sdk.ZoomView("s7container", s7params, imageViewerContainerId);
            blockZoomedImageViewerSwiping();
            if (breakpoint.largeDesktop) {
                $(sZoomViewSelector).css('margin-left', '42.5px'); // one time css override to overcome a margin bug hence no css class
            }
        } else {
            ImageViewer = new s7sdk.FlyoutZoomView("s7container", s7params, imageViewerContainerId);
        }
        ImageViewer.setItem(event.s7event.asset.items[0]);
        ImageViewer.addEventListener(s7sdk.event.AssetEvent.ASSET_CHANGED, updateSetIndicator);
        initSetIndicator(iImageSetCount);
        if (common.isTouch()) {
            arrowsHandler.initMediaNavigationArrows(iImageSetCount);
        }
        ImageViewer.addEventListener(s7sdk.event.AssetEvent.ASSET_CHANGED, function (event) {
            pdpScene7.iCurrentImageAsset = event.s7event.frame;
        }, false);
        if (breakpoint.vTablet || breakpoint.hTablet || breakpoint.mobile) {
            resizeMediaComponent();
        }
    };

    configureScene7Params = function configureScene7Params() {
        var sZoomStepVal;
        pdpScene7.overrideScene7WindowDetect();
        s7params.push('serverurl', pdpScene7.s7ServerUrl);

        if (isImageViewerEnabled()) {
            s7params.push('MediaSet.asset', pdpScene7.s7ImageSet);
            if (pdpScene7.scene7ImageMode === 'zoomViewer') {
                s7params.push('ZoomView.frametransition', 'slide, 0.175');
                sZoomStepVal = breakpoint.mobile === true ? '0.8' : '0.5';
                s7params.push('ZoomView.zoomstep', '0,' + sZoomStepVal);
                s7params.push('ZoomView.iconeffect', '1, 1, 0.3, 5');
                s7params.push('ZoomView.transition', '0.25, 3');
                s7params.push('ZoomView.singleclick', 'none');
                s7params.push('ZoomView.iscommand', 'op_sharpen=1');
                if (window.isKiosk() || !common.cssTransitionsSupported()) {
                    s7params.push('ZoomView.doubleclick', 'none');
                } else {
                    s7params.push('ZoomView.doubleclick', 'zoomReset');
                }
            } else {
                s7params.push('FlyoutZoomView.fill', '#ffffff,1');
                s7params.push('FlyoutZoomView.imagereload', '1,breakpoint,300;600;1200');
                s7params.push('FlyoutZoomView.zoomfactor', '2.3,-1,1');
                s7params.push('FlyoutZoomView.overlay', '0');
                s7params.push('FlyoutZoomView.flyouttransition', 'none,1,0,1,0');
                s7params.push('FlyoutZoomView.highlightmode', 'cursor,1,free');
                s7params.push('FlyoutZoomView.iscommand', 'op_sharpen=1');
            }
        } else {
            fallbackToStaticImage();
            return false;
        }

        if (isSpinViewerEnabled()) {
            $(sPdpMainDetailsContainer).on('click', sSpinTabButton, spinViewerHandler);
            s7params.push('SpinView.asset', pdpScene7.s7SpinSet);
            s7params.push('SpinView.zoomstep', '1,1');
            s7params.push('SpinView.transition', '0.1, 0');
            if (breakpoint.mobile) {
                s7params.push('SpinView.iconeffect', '0');
            }
        }

        if (isVideoEnabled) {
            s7params.push("autoplay", "false");
        }

        initScene7Container();
        initScene7MediaSet();
        bindMediaComponentEventHandlers();
        setTimeout(function () {
            showOverlayButton();
        }, 750);
    };

    initScene7Container = function initScene7Container() {
        s7container = new s7sdk.Container("pdpScene7Container", s7params, "s7container");
        s7container.addEventListener(s7sdk.ResizeEvent.WINDOW_RESIZE, delayResize, false);
    };

    initScene7MediaSet = function initScene7MediaSet() {
        MediaSet = new s7sdk.MediaSet(null, s7params, null);
        MediaSet.addEventListener(s7sdk.AssetEvent.NOTF_SET_PARSED, initImageViewer, false);
    };

    showOverlayButton = function showOverlayButton() {
        $(sMediaOverlayButton).removeAttr('style');
    };

    isScene7Enabled = function isScene7Enabled() {
        var $detectScene7 = $('div.static-product-image').hasClass('scene7-enabled') ? true : false;
        return $detectScene7;
    };

    isImageViewerEnabled = function isImageViewerEnabled() {
        var detectImageViewer = pdpScene7.s7ImageSet !== undefined ? true : false;
        return detectImageViewer;
    };

    isSpinViewerEnabled = function isSpinViewerEnabled() {
        var detectSpinViewer = pdpScene7.s7SpinSet !== undefined ? true : false;
        return detectSpinViewer;
    };

    isVideoEnabled = function isVideoEnabled() {
        var detectVideo = pdpScene7.s7VideoSet.length ? true : false;
        return detectVideo;
    };

    scene7DomReadyCheckTimer = function scene7DomReadyCheckTimer() {
        pdpScene7.scene7DomReadyCheckInterval = setInterval(
            function () {
                scene7DomReadyCheck();
            },
            50
        );
    };

    scene7DomReadyCheck = function scene7DomReadyCheck() {
        var iDOMReadyImageSetCount = pdpScene7.s7ImageSet.split(',').length;

        if ($(sImageViewerThumbnailCarousel + ' ul.carousel-items-container li img').length === iDOMReadyImageSetCount) {
            clearInterval(pdpScene7.scene7DomReadyCheckInterval);
            breakpoint.mobileIn.push(pdpScene7.mobileIn);
            breakpoint.mobileOut.push(pdpScene7.mobileOut);
            if (ThumbCarousel) {
                ThumbCarousel.calculateVisibleItems();
            }
        }
    };

    initScene7Dependencies = function initScene7Dependencies() {
        var scene7LibSelector = pdpScene7.scene7ImageMode === 'zoomViewer' ? 'ZoomView' : 'FlyoutZoomView';

        s7sdk.Util.lib.include('s7sdk.common.Container');
        s7sdk.Util.lib.include('s7sdk.set.PageScrubber');
        s7sdk.Util.lib.include('s7sdk.set.MediaSet');
        s7sdk.Util.lib.include('s7sdk.set.SetIndicator');
        s7sdk.Util.lib.include('s7sdk.set.SpinView');
        s7sdk.Util.lib.include('s7sdk.image.' + scene7LibSelector);
        s7params = new s7sdk.ParameterManager(null, null);
        s7params.addEventListener(s7sdk.Event.SDK_READY, configureScene7Params, false);
        s7params.init();
        scene7DomReadyCheckTimer();
    };

    setScene7ImageMode = function setScene7ImageMode() {
        pdpScene7.scene7ImageMode = common.isTouch() || window.isKiosk() ? 'zoomViewer' : 'flyoutViewer';
    };

    fallbackToStaticImage = function fallbackToStaticImage() {
        if ($(sProductCarousel).length) {
            $(sProductCarousel).remove();
        }
        $('.static-product-image').removeClass('scene7-enabled');
    };

    common.init.push(pdpScene7.init);
    return pdpScene7;
});
/*jslint nomen: false*/
