
/* eslint-disable */

define(['domlib', 'modules/breakpoint', 'modules/common'], function ($, breakpoint, common) {

    // get the bottom position of the first element in the collection
    $.fn.getBottom = function () {
        return parseInt(this.eq(0).offset().top + this.eq(0).outerHeight(), 10);
    };

    var stickySidebar = {

        // elements required for sticky sidebar functions
        $wrapper: [],
        $primary: [],
        $secondary: [],

        isBlocked: function () {
            var self = stickySidebar;
            return breakpoint.mobile || !self.$secondary.length;
        },

        // stop any running animations (an animation on the secondary
        // could be running from saveForLater.show() function)
        stop: function () {
            var self = stickySidebar;
            if (typeof jQuery !== 'undefined') {
                self.$secondary.stop();
            }
        },

        // reset/clear any of the amended position related css rules
        // important for mobile to ensure the secondary clears correctly
        // when going to a stacked layout
        reset: function () {
            var self = stickySidebar;

            if (breakpoint.mobile || common.isTouch()) {
                self.$secondary.css({
                    position: 'static',
                    bottom: 'auto',
                    right: 'auto',
                    top: 'auto'
                });
            } else {
                self.$secondary.css({
                    position: 'absolute',
                    bottom: 'auto',
                    right: 0,
                    top: 0
                });
            }
        },

        // lock position of the secondary bar so it doesn't move (used
        // when animating into new position)
        lock: function (forceTop) {
            var self = stickySidebar;

            if (self.isBlocked()) {
                return;
            }

            var css = {
                position: 'absolute',
                bottom: 'auto',
                top: 'auto',
                right: 0
            };

            self.stop();

            // check if we're at the bottom, otherwise assume at top
            // or off screen
            // + 1 to compensate for discrepancy when animating
            if (!forceTop && self.$secondary.getBottom() + 1 >= self.$wrapper.getBottom()) {
                css.bottom = 0;
            } else {
                css.top = self.$secondary.offset().top - self.$primary.offset().top;
            }

            self.$secondary.css(css);
        },

        // if the secondary bar is off the screen, animate or snap it
        // back into position
        animate: function () {
            var self = stickySidebar;

            if (self.isBlocked()) {
                return;
            }

            self.lock();

            var primaryY = self.$primary.offset().top;
            var secondaryY = 0;

            // exit if the secondary is already at the top
            if (self.$secondary.offset().top <= primaryY) {
                return;
            }

            var scrollY = $(document).scrollTop();

            // animate to top if the scroll height plus the
            // secondary height does not exceed the base of the
            // wrapper
            if (scrollY + self.$secondary.outerHeight() < self.$wrapper.getBottom()) {
                secondaryY = scrollY - primaryY;
            }

            // snap or animate to bottom
            else {

                // if the secondary exceeds the height of the
                // wrapper, then don't animate - just snap into
                // place
                // snap rather than animate as at this point the
                // seconary wrapper will be overlapping page
                // content
                // + 1 to compensate for discrepancy when
                // animating
                if (self.$secondary.getBottom() + 1 >= self.$wrapper.getBottom()) {
                    self.$secondary.css({
                        bottom: 0,
                        top: 'auto'
                    });

                    return;
                }

                // animate to bottom of the wrapper
                else {
                    secondaryY = self.$wrapper.getBottom() - self.$secondary.outerHeight() - primaryY;
                }

                return;

            }

            self.$secondary.animate({
                top: secondaryY
            }, 500);
        },

        // keep the secondary panel (has basket summary) in view when
        // scrolling
        sticky: function () {
            var self = stickySidebar;

            // on window resize, if the device/viewport is blocked,
            // then reset the sticky sidebar
            // otherwise animate into updated position
            $(window).on('breakpointChange', function handleBreakpointChange(e) {
                if (e.newViewport !== 'mobile') {
                    // Reset height of container and let "handleResize" method resize if the user switches viewport. 
                    self.$wrapper.css('height', 'auto');

                    /*
                    * do not reset on order details page because on order details
                    * page the payment summary column is being given a negative top
                    * position, on resize from mobile to tablet
                    */
                    if (!($('#order-details').length)) {
                        if (self.isBlocked()) {
                            self.reset();
                        }
                    }
                    self.animate();
                    setTimeout(function () {
                        self.handleResize(true);
                    }, 100);
                }
            });

            $(window).scroll(function () {
                self.handleResize();
            });

            if (!breakpoint.mobile) {
                $(window).load(function () {
                    self.handleResize();
                });
            }
        },

        handleResize: function (isViewportChange) {
            var self = stickySidebar,
                $confirmChangesButton = $('#confirm-changes'),
                confirmChangesButtonFactor = $confirmChangesButton.length ? $confirmChangesButton.outerHeight() + parseInt($confirmChangesButton.css('margin-top'), 10) : 0,
                $masthead = $('#masthead-wrapper'),
                $mastheadTop = $masthead.length ? $masthead.offset().top : 0,
                mastheadFactor = $masthead.length ? $masthead.outerHeight() + 20 : 0;

            if (self.isBlocked()) {
                return;
            }

            var scrollY = $(document).scrollTop();
            // default css rules to ensure when resizing viewports the
            // secondary column styles reset styles not needed
            var css = {
                position: 'absolute',
                bottom: 'auto',
                right: 0,
                top: 0
            };

            // stop any running animations
            self.stop();

            // allow scrolling if:
            // - the secondary column is larger than the primary column
            // - the scroll y position exceeds the top of the primary
            // column
            if ((self.$secondary.outerHeight() < self.$wrapper.outerHeight() && scrollY > self.$primary.offset().top) && !isViewportChange) {

                // if the secondary column is at the base of the
                // primary
                // then position the bottom of the secondary to
                // match the base of the primary
                if (self.$wrapper.getBottom() - scrollY < self.$secondary.outerHeight() + confirmChangesButtonFactor) {
                    css.position = 'absolute';
                    css.top = 'auto';
                    css.right = 0;
                    css.bottom = 0;
                } else {
                    // secondary column is not at the base of the
                    // primary
                    // then fix the position to the top of the screen
                    css.position = 'fixed';
                    css.right = self.$wrapper.offset().left;
                    css.top = 0 + mastheadFactor;
                }
            }

            if (self.$secondary.outerHeight() > self.$wrapper.outerHeight()) {
                self.$wrapper.height(self.$secondary.outerHeight());
            }

            self.$secondary.css(css);

        },

        init: function (data) {
            var self = stickySidebar;

            if (!data.$wrapper.length || !data.$primary.length || !data.$secondary.length) {
                return;
            }

            self.$wrapper = data.$wrapper;
            self.$primary = data.$primary;
            self.$secondary = data.$secondary;

            self.sticky();
        }
    };

    return stickySidebar;

});