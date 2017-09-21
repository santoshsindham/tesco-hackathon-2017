/*jslint plusplus: true */
/*globals define */
define('modules/pdp-s7viewer/arrowsHandler', ['domlib', 'modules/breakpoint'], function ($, breakpoint) {
    'use strict';

    var arrowsHandler,
        sScene7Container = '#pdpScene7Container',
        sCurrentVideo = '.videoPosition video',
        sNextPrevButtonSelector = '.btn-s7-step',
        ARROWSFADEINTIME = 50,
        ARROWSFADEOUTTIME = 400,
        sProductCarousel = '#product-carousel',
        mediaNavigationArrowsTimeout = null,
        currentTab,
        showMediaNavigationArrows,
        hideMediaNavigationArrows,
        mediaNavigationArrowsEventHandler,
        detectIfArrowsRequired,
        manuallyHideArrows,
        mediaNavigationArrowsTimeoutCheck,
        initMediaNavigationArrows;

    currentTab = function currentTab(request) {
        var bStatus = $(sProductCarousel).hasClass(request) ? true : false;
        return bStatus;
    };

    showMediaNavigationArrows = function showMediaNavigationArrows() {
        if (currentTab('videoVisible')) {
            $(sNextPrevButtonSelector + ', .video-controls').stop(true).fadeIn(ARROWSFADEINTIME);
        } else {
            $(sNextPrevButtonSelector).stop(true).fadeIn(ARROWSFADEINTIME);
        }
    };

    hideMediaNavigationArrows = function hideMediaNavigationArrows() {
        if (!$('#lightbox').is(':visible')) {
            if (currentTab('videoVisible')) {
                if (!breakpoint.mobile) {
                    $(sNextPrevButtonSelector + '.video-controls').stop(true).fadeOut(ARROWSFADEOUTTIME);
                }
            } else {
                $(sNextPrevButtonSelector).stop(true).fadeOut(ARROWSFADEOUTTIME);
            }
        }
    };

    mediaNavigationArrowsEventHandler = function mediaNavigationArrowsEventHandler(inputType) {
        if (inputType === 'mouse') {
            var mouseEventsTimerHandler = null;
            showMediaNavigationArrows();
            $(sScene7Container).mousemove(function () {
                clearTimeout(mouseEventsTimerHandler);
                mouseEventsTimerHandler = setTimeout(function () {
                    if (!$(sNextPrevButtonSelector).is(":visible")) {
                        showMediaNavigationArrows();
                    }
                    if (currentTab('videoVisible')) {
                        clearTimeout(mediaNavigationArrowsTimeout);
                        if ($(sCurrentVideo).length) {
                            if (!$(sCurrentVideo)[0].paused) {
                                mediaNavigationArrowsTimeoutCheck();
                            }
                        }
                    }
                }, 100);
            });
            $(sScene7Container).mouseleave(function () {
                if (currentTab('videoVisible')) {
                    if ($(sCurrentVideo).length) {
                        if (!$(sCurrentVideo)[0].paused) {
                            hideMediaNavigationArrows();
                        }
                    }
                } else if (currentTab('zoomVisible')) {
                    hideMediaNavigationArrows();
                }
            });
        } else if (inputType === 'touch') {
            showMediaNavigationArrows();
            $(sScene7Container).on('click', '.videoContainer', function () {
                if ($(sCurrentVideo).length) {
                    if ($(sCurrentVideo)[0].paused) {
                        showMediaNavigationArrows();
                    } else {
                        hideMediaNavigationArrows();
                    }
                }
            });
        }
    };

    detectIfArrowsRequired = function detectIfArrowsRequired() {
        var $arrows = $('.hot-area .btn-s7-step');
        return !($arrows.length === $arrows.filter('.disabled').length);
    };

    manuallyHideArrows = function manuallyHideArrows() {
        var $mediaContainer = $('.videoVisible');

        if (!detectIfArrowsRequired()) {
            $mediaContainer.addClass('hideArrows');
        }
    };

    mediaNavigationArrowsTimeoutCheck = function mediaNavigationArrowsTimeoutCheck() {
        mediaNavigationArrowsTimeout = setTimeout(function () {
            hideMediaNavigationArrows();
        }, 4000);
    };

    initMediaNavigationArrows = function initMediaNavigationArrows(iImageSetCount) {
        $(sScene7Container).append('<div class="hot-area prev"><div id="btn-s7-prev" class="btn-s7-step btn-s7-prev disabled"></div></div>').append('<div class="hot-area next"><div id="btn-s7-next" class="btn-s7-step btn-s7-next disabled"></div></div>');
        if (iImageSetCount > 1) {
            $('#btn-s7-next').removeClass('disabled');
        }
    };

    arrowsHandler = {
        mediaNavigationArrowsEventHandler : mediaNavigationArrowsEventHandler,
        mediaNavigationArrowsTimeoutCheck : mediaNavigationArrowsTimeoutCheck,
        hideMediaNavigationArrows : hideMediaNavigationArrows,
        showMediaNavigationArrows : showMediaNavigationArrows,
        manuallyHideArrows : manuallyHideArrows,
        initMediaNavigationArrows : initMediaNavigationArrows
    };

    return arrowsHandler;
});