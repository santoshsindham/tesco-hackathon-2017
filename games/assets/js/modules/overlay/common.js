/**
 * Common Module : Utility/common functions to be used across modules
 */
define(['domlib', 'modules/breakpoint', 'modules/common', 'modules/inline-scrollbar/common'], function ($, breakpoint, common, inlineScrollbar) {

    var overlay = {

        defaultOptions: {
            content: '',
            callback: '',
            fixedWidth: '',
            customClass: '',
            isError: false,
            isSubsequentOverlay: false,
            defaultBreakPointBehavior: true,
            enablePagination: false,
            preserveContent: false,
            paginationHeader: '',
            hideOnOverlayClick: false,
            showCloseButton: true,
            additionalCloseButtonClassNames: '',
            lightboxPosition: null,
            hideOnEsc: false
        },

        eventTransitionEnd: 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',
        closeBtnHTML: '<a href="#" class="close"><span class="icon" aria-hidden="true"></span><span class="label">Close overlay and continue shopping</span></a>',

        pageScroll: {
            wrapper: '#wrapper',
            isEnabled: true,
            scrollTop: 0,

            height: function (isOrientationChange) {
                var self = overlay;
                var boxHeight = $('#lightbox').height();
                var winHeight = window.innerHeight || document.documentElement.clientHeight;
                var wrapper = $(self.pageScroll.wrapper);
                boxHeight = (boxHeight > winHeight) ? boxHeight + 40 : winHeight;

                wrapper.height(boxHeight);

                // reset the scrollTop on orientation change as the original position has changed
                // TODO - look into extending the show options to include the overlay.show() trigger element so
                // the scrolltop can be reset to it's position
                if (isOrientationChange) {
                    self.pageScroll.scrollTop = 0;
                }
            },

            disable: function (gotoTop) {
                var self = overlay;
                var wrapper = $(self.pageScroll.wrapper);
                if (self.pageScroll.isEnabled) {
                    if (gotoTop) {
                        self.pageScroll.scrollTop = $(window).scrollTop();
                        window.scrollTo(0, 1);
                    }

                    self.pageScroll.height();
                    wrapper.addClass('no-scroll');

                    self.pageScroll.isEnabled = false;
                }
            },

            enable: function () {
                var self = overlay;
                var wrapper = $(self.pageScroll.wrapper);
                if (!self.pageScroll.isEnabled) {
                    wrapper
                        .height('auto')
                        .removeClass('no-scroll');
                    
                    if (breakpoint.kiosk && wrapper.hasClass('spi')) {
                        wrapper.removeAttr('style');
                    }
                    
                    $(window).scrollTop(self.pageScroll.scrollTop);

                    self.pageScroll.isEnabled = true;
                }
            },
        },
        pagination: {
            setup: function () {}
        },
        createOverlay: function (opts) {
            $('#overlay').remove();
            var self = overlay;
            var $overlay = $('#overlay');

            // prepare to catch and prevent attempts to scroll the background page on touch devices
            var touchEvents = common.isAndroid() ? 'touchmove touchstart' : 'touchmove';

            // create the overlay if one doesn't already exist
            if (!$overlay.length) {
                $overlay = $('<div id="overlay" class="hidden" />');
            }

            $overlay.css('height', '100%');
            $overlay.appendTo('body');

            return $overlay;
        },

        createLightbox: function (opts) {
            $('#lightbox').remove();
            var self = overlay;
            var $lightbox = $('<div id="lightbox" />').html(opts.content);

            var beforeOverlayHide = function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (opts.preserveContent === true) {
                    var tempStoreContent = opts.content.detach();
                    // This creates a tempary hidden div so that if the user clicks/opens the preserved
                    // content the height can be calculated as it is not display none.
                    if (!$('.tmpPreserveContentContainer').length) {
                        $('body').append('<div class="tmpPreserveContentContainer"></div>');
                    };
                    $('body .tmpPreserveContentContainer').append(tempStoreContent);
                    $('.tmpPreserveContentContainer').hide();
                }

                self.hide();

                if (opts.onHideCallback) {

                    opts.onHideCallback();
                }
            };

            // if a previous lightbox was opened before creating this one, then add the 'subsequent'
            // don't add the 'subsequent' class if it's the kiosk - reason?
            if (opts.isSubsequentOverlay && !breakpoint.kiosk) {
                $lightbox.addClass('subsequent');
            }

            // add any custom classes to the main lightbox wrapper only
            if (opts.customClass) {
                $lightbox.addClass(opts.customClass);
            }

            // update the lightbox to display in an error state
            if (opts.isError) {
                $lightbox.addClass('error-overlay').wrapInner('<div class="generic" />');
            }

            // fixed width lightbox - widths will be set in pixels so if the fixedWidth is not a number then exit
            if (opts.fixedWidth) {
                opts.fixedWidth = parseInt(opts.fixedWidth, 10);

                if (isNaN(opts.fixedWidth)) {
                    return;
                }

                $lightbox.css({
                    width: opts.fixedWidth + 'px',
                    left: '50%',
                    marginLeft: '-' + (opts.fixedWidth / 2) + 'px',
                    marginRight: 0
                });
            }

            // lightbox needs to be added to the dom for the following as we need to obtain dimensions
            $lightbox.appendTo('body');

            // if it's not the kiosk, then don't add the hidden class as the
            // kiosk lightboxes slide in/out from the top of the screen
            if (!breakpoint.kiosk) {
                $lightbox.addClass('hidden');
            }

            // check if the overlay does actually require scrolling as it's content may not exceed the wrapper
            // height, if so, no point adding the pagination controls as they'll do nothing.
            if (opts.enablePagination) {
                inlineScrollbar.init($lightbox, opts);
            }

            // add a close button to the lightbox if one doesn't exist and bind click to close
            // on all '.close' elements (can be multiple close buttons - top right, cancel etc)
            if (opts.showCloseButton && !$lightbox.find('a.close').not('.tooltipPopup a.close').length) {
                $lightbox.prepend(self.closeBtnHTML);
            }

            var event = (common.isTouch()) ? 'tap click' : 'click';

            // click too slow on windows phone
            if (common.isWindowsPhone()) {
                event = 'MSPointerDown';
            }

            $lightbox.on(event, 'a.close', function (e) {
                if ($(this).not('.tooltipPopup a.close').length) {
                    beforeOverlayHide(e);
                }
            });
            if (opts.hideOnOverlayClick === true) {
                $("#overlay").click(beforeOverlayHide);
            }
            if (opts.hideOnEsc === true) {
                document.onkeydown = function(e) {
					if (e.which == 27){
                        beforeOverlayHide(e);
					}
				}
            }

            // enable the default breakpoint behaviours
            if (opts.defaultBreakPointBehavior) {
                if (breakpoint.mobile) {

                    // qc defect 52204 & 52205 fix - this is in place to support as yet undeveloped functionality
                    // (show more button). this is now causing scrolling issues and should be commented out until
                    // that functionality is added
                    /*$lightbox.on('touchmove', function(e) {
                        if ($lightbox.outerHeight() < window.innerHeight) {
                            e.preventDefault();
                        }
                    }, false);*/
                } else if (breakpoint.largeDesktop || breakpoint.desktop) {
                    $lightbox.css({
                        'float': 'none'
                    });
                }
            }

            return $lightbox;
        },

        // update the top position of the lightbox for touch devices as it can shift on orientation change,
        // or when the lightboxPosition option is specified
        position: function ($lightbox, lightboxPosition, isOrientationChange) {
            var self = overlay;
            var delay = isOrientationChange ? 300 : 1;

            // RETEST - timeout may not be needed
            window.setTimeout(function () {
                if (lightboxPosition) {
                    if (typeof lightboxPosition === 'function') {
                        lightboxPosition();
                    } else if (lightboxPosition === 'verticallyCentre') {
                        $lightbox.verticallyCentre();
                    } else if (lightboxPosition === 'verticallyBottom') {
                        $lightbox.addClass('verticallyBottom');
                    }
                } else {
                    $lightbox.css('top', 20);
                }

                // if the orientation has changed, the update the page scroll height as the lightbox dimensions
                // have now changed and reset the scrollTop on orientation change as the original position has changed
                if (isOrientationChange) {
                    self.pageScroll.height(true);
                }
            }, delay);
        },

        show: function (extendOptions) {
            var self = overlay;
            var $overlay = $('#overlay');
            var $lightbox = $('#lightbox');
            var defaults = self.defaultOptions;
            var opts = $.extend({}, defaults, extendOptions);
            var lightboxPosition = opts.lightboxPosition;
            var isMobileDevice = common.isTouch() && !breakpoint.kiosk;

            // if a lightbox is already opened, hide it - can only have one on screen at a time
            // assume that the new one to be opened in the second/sub view for the current lightbox
            opts.isSubsequentOverlay = $lightbox.length;

            // create and add to dom
            $overlay = self.createOverlay(opts);
            $lightbox = self.createLightbox(opts);

            // stop the page from scrolling and set the goToTop flag to true
            self.pageScroll.disable(true);

            var callback = function () {
                if (typeof (opts.callback) === 'function') {
                    opts.callback($lightbox);
                }
            };

            // update the top position of the lightbox for touch devices as it can
            // shift on orientation change, or when the lightboxPosition option is specified
            if (isMobileDevice || lightboxPosition) {
                if (typeof lightboxPosition === 'function') {
                    lightboxPosition = function () {
                        opts.lightboxPosition($lightbox);
                    };
                }
                self.position($lightbox, lightboxPosition);

                // windows phone, no orientationchange event
                if (typeof window.orientation !== 'undefined') {
                    $(window).bind('orientationchange.overlay', function () {
                        self.position($lightbox, lightboxPosition, isMobileDevice);
                    });
                } else {
                    $(window).bind('resize.overlay', function () {
                        self.position($lightbox, lightboxPosition, isMobileDevice);
                    });
                }
            }

            // kiosk slide lightbox in from the top of the screen
            if (breakpoint.kiosk) {
                // store the original height of the lightbox then set height to 0
                var height = $lightbox.outerHeight();

                $lightbox.css('height', 0);

                // remove the hidden class from the overlay to fade in
                $overlay.removeClass('hidden');

                // TO INVESTIGATE - timer used and the css animation doesn't trigger
                window.setTimeout(function () {
                    // add the 'slide-out' class so we can animate the slide in and restore the
                    // original height of the lightbox - 'slide-out' css animation is triggered
                    $lightbox
                        .addClass('slide-out')
                        .css('height', height)
                        .one(self.eventTransitionEnd, function () {
                            // animation done:
                            // * remove the transition end event to stop being retriggered if a css property changes (annoying!!!)
                            // * remove the 'slide-out' class to stop the css animation from being retriggered if the lightbox height changes
                            // * clear the inline style height also as some scripts will update the height of the
                            //   inner content container so the lightbox height will need to auto adjust accordingly
                            $lightbox
                                .off(self.eventTransitionEnd)
                                .removeClass('slide-out')
                                .css('height', '');
                        });
                    callback();
                }, 10);
            } else {

                // TO INVESTIGATE - timer used and the css animation doesn't trigger
                window.setTimeout(function () {

                    // remove the hidden class from elements to do initial fade in
                    $overlay.removeClass('hidden');
                    $lightbox.removeClass('hidden');

                    // apply the transitionend event to the lightbox element, no need to trigger the event on the overlay mask
                    if (common.cssTransitionsSupported()) {
                        $lightbox.one(self.eventTransitionEnd, function () {
                            callback();
                        });
                    }

                    // fallback
                    else {
                        callback();
                    }

                }, 10);
            }
        },

        hide: function ($lightbox, isSubsequentOverlay) {
            var self = overlay;
            var $overlay = $('#overlay');

            // if no lightbox passed, then grab the first one (reason for first?)
            $lightbox = $lightbox || $('#lightbox').first();

            // if it's the kiosk, force the isSubsequentOverlay to be false
            if (breakpoint.kiosk) {
                isSubsequentOverlay = false;
            }

            // only hide the overlay mask if we dont have a subsequent overlay
            var $hide = $lightbox;

            if (!isSubsequentOverlay) {
                $hide = $hide.add($overlay);
            }

            // only remove the defined hide elements and enable page scroll if we dont have a subsequent overlay
            var callback = function () {
                $hide.remove();
                if (!isSubsequentOverlay) {
                    overlay.pageScroll.enable();
                }
            };

            // remove the orientation/resize events to stop firing when the overlay is closed
            if (common.isTouch() && !breakpoint.kiosk) {
                if (typeof window.orientation !== 'undefined') {
                    $(window).unbind('orientationchange.overlay');
                } else {
                    $(window).unbind('resize.overlay');
                }
            }

            // kiosk slide lightbox out to the top of the screen
            if (breakpoint.kiosk) {

                // fade out the overlay
                $overlay.addClass('hidden');

                // set the current height of the overlay so we can slide out
                $lightbox.css('height', $lightbox.outerHeight());

                // TO INVESTIGATE - timer used and the css animation doesn't trigger
                window.setTimeout(function () {
                    // add the 'slide-out' css animation and set the height to 0 to trigger animation of the lightbox
                    $lightbox
                        .addClass('slide-out')
                        .css('height', 0)
                        .one(self.eventTransitionEnd, function () {
                            callback();
                        });
                }, 10);
            } else {
                // TO INVESTIGATE - timer used and the css animation doesn't trigger
                window.setTimeout(function () {
                    // fade out the overlay and lightbox
                    $hide.addClass('hidden');
                    callback();
                }, 300);
            }
            $(document).trigger('kioskModalHidden');
        }
    };

    return overlay;
});