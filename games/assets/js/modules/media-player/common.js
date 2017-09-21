/*jslint nomen: true*/
define([
    'domlib',
    'mustache',
    'modules/common',
    'modules/basic-video-player/common',
    'modules/carousel-position-indicator/common',
    'modules/tesco.analytics',
    'modules/device-specifications/common'
], function ($, mustache, common, BasicVideoPlayer, carouselPositionIndicator, analytics, deviceSpecifications) {
    'use strict';

    var mediaPlayer = {

        videoViewContId: "prodVideoView",
        videoThumbnails: "",
        fadeInSpeed: 500,
        mediaIndex: 0,
        $componentContainer: '#s7container',
        $videoViewContainer: null,
        videoPlayers: [],
        currentIndex: 0,
        oBasicVideoPlayerOpts: {
            createPauseIcon: '<span class="icon icon-pause fnPauseBtn"></span>', // big button
            createPlayIcon: '<span class="icon icon-play fnPlayBtn"></span>', // big button
            pauseIcon: 'span.fnPauseBtn', // big button
            playIcon: 'span.fnPlayBtn', // big button
            pauseClass: 'icon-pause',
            fadeControls: true,
            bBackToStartOnEnd: true,
            bVideoPlayerV2: true
        },
        sErrorTemplate: '<div id="prodVideoView" class="videoView error"><div class="videoContainer"><div class="videoPosition" data-index="{{iIndex}}"><div class="errorVideo"><div class="errorWrap"><span>{{sDescription}}</span></div></div></div></div></div>',
        bMediaViewer: false,

        errorHandler: function (errorType, index) {
            var _oWebAnalytics = new analytics.WebMetrics(),
                v = {},
                breadCrumbText = [],
                oErrorData = {
                    sDescription: errorType,
                    iIndex: index
                },
                sRenderedErrorTemplate = '';

            if (mediaPlayer.bMediaViewer) {
                mediaPlayer.sErrorTemplate = $('#media-viewer-video-error-template')[0].innerHTML;
            }

            sRenderedErrorTemplate = mustache.render(mediaPlayer.sErrorTemplate, oErrorData);

            if (errorType !== '00DUP') {
                if ($('span.ajax-loader').length) {
                    $('span.ajax-loader').remove();
                }
                $('#s7container').append(sRenderedErrorTemplate);

                if (!mediaPlayer.bMediaViewer) {
                    $('.videoPosition').animate({
                        opacity: 1
                    }, mediaPlayer.fadeInSpeed);
                }
            }

            $('li a', $('#breadcrumb')).each(function () {
                var text = $.trim($(this).text());
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
            breadCrumbText.length = 0; // empty array.
            v.eVar56 = deviceSpecifications.os;
            v.prop23 = deviceSpecifications.os;
            if (window.refEvar22 !== undefined) {
                v.eVar22 = window.refEvar22;
            }
            if (window.refEvar24 !== undefined) {
                v.eVar24 = window.refEvar24;
            }
            v.prop19 = 'Video Tab';
            v.events = 'event41';
            v.eVar48 = errorType;
            _oWebAnalytics.submit([v]);
        },

        videoRender: function (playerType, updatedMediaSrc, itemIndex) {

            var templateType = playerType,
                templateId,
                mediaIndex = itemIndex,
                loadingIcon = $('span.ajax-loader'),
                vidOb = {
                    url: updatedMediaSrc,
                    index: mediaIndex,
                    width: 100,
                    flashLocation: window.globalStaticAssetsPath
                },
                htmlTemplate,
                videoPlayerCont,
                fnAppendVideoPlayer = function fnAppendVideoPlayer() {
                    $('#s7container').append(mediaPlayer.$videoViewContainer);
                    if (templateType === 'html5') {
                        if (mediaPlayer.bMediaViewer) {
                            mediaPlayer.videoPlayers.push(new BasicVideoPlayer(mediaPlayer.$videoContainer, mediaPlayer.oBasicVideoPlayerOpts));
                        } else {
                            mediaPlayer.videoPlayers.push(new BasicVideoPlayer(mediaPlayer.$videoContainer));
                        }
                        $('.videoPosition').addClass('html5-player');
                    }

                    if (!mediaPlayer.bMediaViewer) {
                        $('.videoPosition').addClass('fade-in-video');
                    }
                };

            this.currentIndex = mediaIndex;

            if (mediaPlayer.bMediaViewer) {
                if (templateType === 'flash') {
                    templateId = '#flash-video-viewer-template';
                } else if (templateType === 'html5') {
                    templateId = '#html5-video-viewer-template';
                }
            } else {
                if (templateType === 'flash') {
                    templateId = '#flash-video-template';
                } else if (templateType === 'html5') {
                    templateId = '#html5-video-template';
                }
            }

            htmlTemplate = $(templateId).html();
            videoPlayerCont = mustache.render(htmlTemplate, vidOb);
            mediaPlayer.$videoContainer.html(videoPlayerCont);
            mediaPlayer.$videoViewContainer.append(mediaPlayer.$videoContainer);

            if (loadingIcon.length) {
                loadingIcon.fadeOut('normal', function () {
                    loadingIcon.remove();
                    fnAppendVideoPlayer();
                });
            } else {
                fnAppendVideoPlayer();
            }
        },

        videoUpdate: function (index, oVideos) {
            var mediaIndex = index,
                mediaSrc = $('#prodVideoView .videoPosition').attr('data-url'),
                updatedMediaSrc,
                fileType,
                playerType,
                loadingIcon = '<span class="ajax-loader" />';

            if (oVideos) {
                updatedMediaSrc = oVideos.mediaSrc;
                fileType = oVideos.fileType;
                playerType = oVideos.playerType;
            } else {
                updatedMediaSrc = window._mediaCollectionUpdated[mediaIndex].url;
                fileType = window._mediaCollectionUpdated[mediaIndex].fileType;
                playerType = window._mediaCollectionUpdated[mediaIndex].playerType;
            }

            try {
                if (updatedMediaSrc !== undefined) {
                    if (updatedMediaSrc !== mediaSrc) {
                        this.currentIndex = index;
                        $('#prodVideoView').remove();
                        $('#s7container').append(loadingIcon);
                        carouselPositionIndicator.setIndicatorUpdate('video', mediaIndex, 'jump');
                        mediaPlayer.$videoViewContainer = $('<div/>').attr('id', mediaPlayer.videoViewContId).addClass('videoView');
                        mediaPlayer.$videoContainer = $('<div/>').addClass('videoContainer').attr('data-fullscreen', 'false');

                        if (playerType === 'flash') {
                            if (common.isIOS()) {
                                mediaPlayer.errorHandler('Sorry this video format cannot be played on your device', mediaIndex); // video does not support iOS
                            } else {
                                mediaPlayer.videoRender('flash', updatedMediaSrc, mediaIndex);
                            }
                        } else if (playerType === 'html5') {
                            if (common.isLegacyIe() && !mediaPlayer.bMediaViewer) {
                                mediaPlayer.videoRender('flash', updatedMediaSrc, mediaIndex); // old pdpscene7 player pushes flash player in ie8 and ie9
                            } else if (common.isLegacyIe(8) && mediaPlayer.bMediaViewer) {
                                mediaPlayer.videoRender('flash', updatedMediaSrc, mediaIndex); // new pdpscene7 player pushes flash player in ie8
                            } else {
                                if (fileType === 'mp4' && common.isOpera()) {
                                    mediaPlayer.errorHandler('Sorry this video format cannot be played on your device', mediaIndex); // video does not support opera
                                } else {
                                    mediaPlayer.videoRender('html5', updatedMediaSrc, mediaIndex);
                                }
                            }
                        } else {
                            mediaPlayer.errorHandler('Sorry this video format cannot be played on your device', mediaIndex); // logic failed to decode player type
                        }
                    } else {
                        mediaPlayer.errorHandler("00DUP", mediaIndex); // duplicate video
                    }
                } else {
                    mediaPlayer.errorHandler("Sorry this video format cannot be played on your device", mediaIndex); // no video url
                }
            } catch (err) {
                mediaPlayer.errorHandler("Sorry this video cannot be played", mediaIndex); // general error
            }
        },

        init: function () {
            var fileType = window._mediaCollectionUpdated[mediaPlayer.mediaIndex].fileType,
                playerType = window._mediaCollectionUpdated[mediaPlayer.mediaIndex].playerType,
                url = window._mediaCollectionUpdated[mediaPlayer.mediaIndex].url,
                index = 0;

            this.$componentContainer = $(this.$componentContainer);

            if (mediaPlayer.$videoViewContainer === null) {
                carouselPositionIndicator.setIndicatorInit('video');
                carouselPositionIndicator.setIndicatorReset('video');
                mediaPlayer.$videoViewContainer = $('<div/>').attr('id', mediaPlayer.videoViewContId).addClass('videoView');
                mediaPlayer.$videoContainer = $('<div/>').addClass('videoContainer');

                if (playerType === 'flash') {
                    if (common.isIOS()) {
                        mediaPlayer.errorHandler('Sorry this video format cannot be played on your device', index);
                    } else {
                        mediaPlayer.videoRender('flash', url, 0);
                    }
                } else if (playerType === 'html5') {
                    if (common.isLegacyIe()) {
                        mediaPlayer.videoRender('flash', url, 0);
                    } else {
                        if (fileType === 'mp4' && common.isOpera()) {
                            mediaPlayer.errorHandler('Sorry this video format cannot be played on your device', index);
                        } else {
                            mediaPlayer.videoRender('html5', url, 0);
                        }
                    }
                } else {
                    mediaPlayer.errorHandler('Sorry this video format cannot be played on your device', index);
                }

                $(window).resize(function () {
                    $('.videoContainer').css('opacity', '0');
                });
            }
        },

        getCurrentVideo: function getCurrentVideo() {
            return this.videoPlayers[this.currentIndex];
        },
        playCurrentVideo: function playCurrentVideo() {
            mediaPlayer.$videoContainer.trigger('mediaViewer.play');
        },
        pauseCurrentVideo: function pauseCurrentVideo(bCreateIcon) {
            var $currentVideo = $('.videoContainer video');

            if ($currentVideo.length) {
                $('button.play').removeClass(mediaPlayer.oBasicVideoPlayerOpts.pauseClass);
                if (!$currentVideo[0].paused) {
                    $currentVideo[0].pause();
                    if (bCreateIcon) {
                        mediaPlayer.videoPlayers[0].iconHandler('pause', 'create');
                    }
                }
            }
        }
    };

    return mediaPlayer;
});
