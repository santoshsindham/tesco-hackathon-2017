/*global refEvar22: true, refEvar24: true,console */
/*jslint plusplus: true */
define([
    'domlib',
    'modules/breakpoint',
    'modules/tesco.analytics',
    'modules/device-specifications/common',
    'modules/common',
    'modules/basic-slider/common'
], function ($, breakpoint, analytics, deviceSpecifications, common) {
    'use strict';

    /**
     * Adds custom controls to video palyer - the mark-up is stored in a mustache template
     * param: $container {jquery object} : This should be a <div> containing the rendered mustache template
     */
    function BasicVideoPlayer($container, opts) {
        var oDefaultOptions = {
            createPauseIcon: '<span class="pause-icon">Pause video</span>',
            createPlayIcon: '<span class="play-icon">Play video</span>',
            pauseIcon: 'span.pause-icon',
            playIcon: 'span.play-icon',
            pauseClass: 'paused',
            videoControlsSelector: '.video-controls',
            fadeControls: false,
            bBackToStartOnEnd: false,
            bVideoPlayerV2: false
        };

        this.options = $.extend({}, oDefaultOptions, opts);
        this.$container = $container;
        this.$videoControls = $container.find(this.options.videoControlsSelector);
        this.$playBtn = $container.find('.play');
        this.$muteBtn = $container.find('.mute');
        this.$seekBar = $container.find('.seek-bar');
        this.$fullScreenBtn = $container.find('button.fullScreen');
        this.seekBarSlider = null;
        this.video = $container.find('video')[0];
        this.controlsTimer = null;
        this.prx = {
            togglePlay: $.proxy(this.togglePlay, this),
            startupSequence: $.proxy(this.startupSequence, this),
            toggleMute: $.proxy(this.toggleMute, this),
            seek: $.proxy(this.seek, this),
            updateSeekBar: $.proxy(this.updateSeekBar, this),
            play: $.proxy(this.play, this),
            pause: $.proxy(this.pause, this),
            videoEnded: $.proxy(this.videoEnded, this),
            handleFullscreen: $.proxy(this.handleFullscreen, this),
            setFullscreenData: $.proxy(this.setFullscreenData, this),
            controlsHandler: $.proxy(this.controlsHandler, this)
        };
        this.bVideoControlsEventsBound = false;
        this.bVideoControlTimer = null;
        this.bCursorOverVideo = false;
        this.iMouseMoveTimeout = 1500;
        this.init();
    }

    BasicVideoPlayer.prototype = {

        videoEnded: function () {
            this.$playBtn.removeClass(this.options.pauseClass);

            if (this.options.bBackToStartOnEnd) {
                this.video.currentTime = 0;
                this.pause();
            }

            if (this.options.fadeControls) {
                this.controlsHandler(true);
            }

            this.iconHandler('play', 'create');

            /*jslint nomen: true*/
            var _oWebAnalytics = new analytics.WebMetrics(),
                v = {},
                breadCrumbText = [],
                text;
            /*jslint nomen: false*/

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
            breadCrumbText.length = 0; // empty array.
            v.eVar56 = deviceSpecifications.os;
            v.prop23 = deviceSpecifications.os;
            if (window.refEvar22 !== 'undefined') {
                v.eVar22 = refEvar22;
            }
            if (window.refEvar24 !== 'undefined') {
                v.eVar24 = refEvar24;
            }
            v.prop19 = 'Video Tab';
            v.events = 'event61';
            /*jslint nomen: true*/
            _oWebAnalytics.submit([v]);
            /*jslint nomen: false*/
        },

        updatePlayBtn: function () {
            if (this.video.paused) {
                this.$playBtn.removeClass(this.options.pauseClass);
            } else {
                this.$playBtn.addClass(this.options.pauseClass);
            }
        },

        updateMuteBtn: function () {
            if (this.video.muted) {
                this.$muteBtn.addClass('muted').addClass('icon-mute');
            } else {
                this.$muteBtn.removeClass('muted').removeClass('icon-mute');
            }
        },

        startupSequence: function () {
            if (!this.options.fadeControls) {
                if (!breakpoint.mobile) {
                    this.iconHandler('play', 'create');
                }
            } else {
                if (common.isIphone()) {
                    this.$videoControls.remove();
                } else {
                    if (common.isIOS()) {
                        this.$muteBtn[0].disabled = true;
                    }
                    this.iconHandler('play', 'create');
                }
            }

            if (this.$fullScreenBtn.length > 0) {
                this.initFullScreenSupport();
            }
        },

        skip: function (seconds) {
            this.video.currentTime += seconds;
        },

        iconHandler: function (type, action) {
            var thisGlobal = this,
                pauseIcon = thisGlobal.options.pauseIcon,
                playIcon = thisGlobal.options.playIcon,
                createPauseIcon = thisGlobal.options.createPauseIcon,
                createPlayIcon = thisGlobal.options.createPlayIcon,
                $videoContainer = $('.videoPosition');

            if (type === 'pause') {
                if (action === 'create') {
                    if (!$(pauseIcon).length) {
                        $videoContainer.append(createPauseIcon);
                        window.setTimeout(function () {
                            $(pauseIcon).addClass('hide-video-icon');
                            window.setTimeout(function () {
                                $(pauseIcon).remove();
                                $videoContainer.append(createPlayIcon);
                            }, 600);
                        }, 200);
                    }
                } else if (action === 'destroy') {
                    if ($(pauseIcon).length > 0) {
                        $(pauseIcon).addClass('hide-video-icon');
                        window.setTimeout(function () {
                            $(pauseIcon).remove();
                            $videoContainer.append(createPlayIcon);
                        }, 600);
                    }
                }
            } else if (type === 'play') {
                if (action === 'create') {
                    if (!$(playIcon).length) {
                        $videoContainer.append(createPlayIcon);
                    }
                } else if (action === 'destroy') {
                    if ($(playIcon).length > 0) {
                        $(playIcon).addClass('hide-video-icon');
                        window.setTimeout(function () {
                            $(playIcon).remove();
                        }, 600);
                    }
                }
            }
        },

        togglePlay: function () {
            /*jslint nomen: true*/
            var _oWebAnalytics = new analytics.WebMetrics(),
                v = {},
                breadCrumbText = [],
                text;
            /*jslint nomen: false*/

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
            breadCrumbText.length = 0; // empty array.
            v.eVar56 = deviceSpecifications.os;
            v.prop23 = deviceSpecifications.os;
            if (window.refEvar22 !== 'undefined') {
                v.eVar22 = refEvar22;
            }
            if (window.refEvar24 !== 'undefined') {
                v.eVar24 = refEvar24;
            }
            v.prop19 = 'Video Tab';

            $('#pdp-product-video').toggleClass('triggerRepaint');
            if (this.video.paused) {
                this.iconHandler('play', 'destroy');
                this.video.play();
                this.updatePlayBtn();
                v.events = 'event59';
                if (this.options.fadeControls) {
                    this.controlsHandler(false);
                }
                this.$container.trigger('BasicVideoPlayer.play');
            } else {
                this.video.pause();
                this.iconHandler('pause', 'create');
                this.updatePlayBtn();
                v.events = 'event60';
                if (this.options.fadeControls) {
                    this.controlsHandler(true);
                }
                this.$container.trigger('BasicVideoPlayer.pause');
            }
            /*jslint nomen: true*/
            _oWebAnalytics.submit([v]);
            /*jslint nomen: false*/
        },

        pause: function () {
            this.video.pause();
            this.updatePlayBtn();
        },

        play: function () {
            this.togglePlay();
            this.updatePlayBtn();
        },

        toggleMute: function () {
            this.video.muted = this.video.muted ? false : true;
            this.updateMuteBtn();
        },

        /**
         *  Move to a specified point in the video by percentage
         *  @param {number} Value between 0-100
         */
        seek: function (pct) {
            var time = this.video.duration * (pct / 100);
            this.video.currentTime = time;
        },

        updateSeekBar: function () {
            var value = Math.ceil((100 / this.video.duration) * this.video.currentTime);
            this.seekBarSlider.setPosition(value);
        },

        bindEvents: function () {
            this.$container.on('click', '.play', this.prx.togglePlay);
            this.$container.on('click', this.options.playIcon, this.prx.play);
            this.$container.on('click', 'video', this.prx.togglePlay);
            this.$container.on('click', '.mute', this.prx.toggleMute);
            $(this.video).on('timeupdate', this.prx.updateSeekBar);
            $(this.video).on('ended', this.prx.videoEnded);
            this.$container.on('mediaViewer.play', this.prx.play);
        },

        setFullscreenData: function setFullscreenData(state) {
            this.$container[0].setAttribute('data-fullscreen', !!state);
        },

        isFullScreen: function isFullScreen() {
            return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
        },

        handleFullscreen: function handleFullscreen() {
            if (this.isFullScreen()) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                this.setFullscreenData(false);
                $(window).trigger('exitFullscreen');

            } else {
                if (this.$container[0].requestFullscreen) {
                    this.$container[0].requestFullscreen();
                } else if (this.$container[0].mozRequestFullScreen) {
                    this.$container[0].mozRequestFullScreen();
                } else if (this.$container[0].webkitRequestFullScreen) {
                    this.$container[0].webkitRequestFullScreen();
                } else if (this.$container[0].msRequestFullscreen) {
                    this.$container[0].msRequestFullscreen();
                }
                this.setFullscreenData(true);
                $(window).trigger('requestFullscreen');
            }
        },

        bindFullScreenEvents: function bindFullScreenEvents() {
            var self = this;

            this.$container.on('click', '.fullScreen', this.prx.handleFullscreen);

            $(document).on('fullscreenchange', function () {
                self.prx.setFullscreenData(!!(document.fullScreen || document.fullscreenElement));
            });
            $(document).on('webkitfullscreenchange', function () {
                self.prx.setFullscreenData(!!document.webkitIsFullScreen);

                if (document.webkitIsFullScreen) {
                    $(window).trigger('mastheadSlideUp');
                } else {
                    $(window).trigger('mastheadSlideDown');
                }
            });
            $(document).on('mozfullscreenchange', function () {
                self.prx.setFullscreenData(!!document.mozFullScreen);
            });
            $(document).on('msfullscreenchange', function () {
                self.prx.setFullscreenData(!!document.msFullscreenElement);
            });
        },

        initFullScreenSupport: function initFullScreenSupport() {
            var fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

            if (fullScreenEnabled) {
                this.bindFullScreenEvents();
            } else {
                this.$fullScreenBtn[0].disabled = true;
            }
        },

        controlsHandler: function controlsHandler(bShowControls) {
            this.$videoControls.toggleClass('video-controls-out', !bShowControls);
        },

        videoControlsHandler: function videoControlsHandler() {
            this.bindVideoControlsEvents();
        },

        bindVideoControlsEvents: function bindVideoControlsEvents() {
            var self = this;

            if (!self.bVideoControlsEventsBound) {
                self.$container
                    .on(
                        'mouseenter',
                        self.handleMouseEnterVideo.bind(self)
                    )
                    .on(
                        'mouseleave',
                        self.handleMouseLeaveVideo.bind(self)
                    )
                    .on(
                        'mousemove',
                        self.handleMouseMovementStarted.bind(self)
                    );
                $(window)
                    .on(
                        'cursorMovement.stopped',
                        self.handleMouseMovementStopped.bind(self)
                    );
                self.bVideoControlsEventsBound = true;
            }
        },

        setVideoControlsHidden: function setVideoControlsHidden() {
            var sVideoControlsSelector = this.options.videoControlsSelector;

            if (!$(sVideoControlsSelector).hasClass('video-controls-out')) {
                this.controlsHandler(false);
            }
        },

        setVideoControlsVisible: function setVideoControlsVisible() {
            var sVideoControlsSelector = this.options.videoControlsSelector;

            if ($(sVideoControlsSelector).hasClass('video-controls-out')) {
                this.controlsHandler(true);
            }
        },

        handleMouseEnterVideo: function handleMouseEnterVideo() {
            if (!this.video.paused) {
                window.CursorMovement.startPolling();
                this.bCursorOverVideo = true;
                this.setVideoControlsVisible();
            }
        },

        handleMouseLeaveVideo: function handleMouseLeaveVideo() {
            if (!this.video.paused) {
                this.bCursorOverVideo = false;
                this.bVideoControlTimer = null;
                this.setVideoControlsHidden();
                window.CursorMovement.stopPolling();
            }
        },

        handleMouseMovementStarted: function handleMouseMovementStarted() {
            var self = this;

            if (!this.video.paused && this.bCursorOverVideo) {
                if (this.bVideoControlTimer !== null) {
                    window.clearTimeout(self.bVideoControlTimer);
                    self.bVideoControlTimer = null;
                }
                this.setVideoControlsVisible();
            }
        },

        handleMouseMovementStopped: function handleMouseMovementStopped() {
            var self = this;

            if (!this.video.paused && this.bCursorOverVideo && this.bVideoControlTimer === null) {
                window.CursorMovement.stopPolling();
                this.bVideoControlTimer = window.setTimeout(function () {
                    if (!self.video.paused) {
                        self.setVideoControlsHidden();
                    }
                    self.bVideoControlTimer = null;
                }, self.iMouseMoveTimeout);
            }
        },

        init: function () {
            if (this.video !== undefined) {
                this.video.controls = false;
                this.video.removeAttribute('controls');
                this.$videoControls.show();
            }
            this.startupSequence();
            this.bindEvents();
            this.seekBarSlider = new common.BasicSlider(this.$seekBar, {
                onSlideMove: $.proxy(this.seek, this)
            });

            if (!common.isTouch() && $('body').hasClass('PDP-Version2')) {
                this.videoControlsHandler();
            }
        }
    };

    return BasicVideoPlayer;
});
