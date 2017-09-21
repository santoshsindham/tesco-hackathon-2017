/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require,jQuery,$ */
define(['domlib', 'modules/common'], function ($, common) {
    'use strict';
    var containerId = 'pagination-nav',
        max,
        diff,
        cssTransitionsSupported,
        allow,
        totalPages,
        y,
        h,
        lastInitializedScrollbar,
        staticBasketHeader,
        hideIfDisabled = true,
        forceEnableScroll,
        autoScrollOnce = false,
        navButtonsClicked = false;

    function InlineScrollbar() {
        var self = this;
        self.html = '<div id="' + containerId + '" class="pagination-nav-container"><a href="#" class="pagination-up disabled" data-icon="1"></a><div class="pagination-bar"><span></span></div><a href="#" class="pagination-down" data-icon="2"></a></div>';
        self.$wrapper = null;
        self.$content = null;
        self.$pageNav = null;
        self.$pageNavContainer = null;
        self.$pageBar = null;
        self.$pageUp = null;
        self.$pageDown = null;
        self.$pageMark = null;
        self.eventTransitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';
        self.closeBtnHTML = '<a href="#" class="close"><span class="icon" aria-hidden="true"></span><span class="label">Close overlay and continue shopping</span></a>';
        self.overlayScrollbar = null;
    }

    InlineScrollbar.prototype = {
        constructor: InlineScrollbar,

        init: function init($parentEl, opts) {
            var self = new InlineScrollbar();

            self.step = 0;
            self.steps = [0];
            self.modifier = 0;

            if (opts === null || opts === undefined) {
                self.overlayScrollbar = false;
                opts = {};
            } else if (opts && opts.containerId && opts.containerId !== '') {
                self.overlayScrollbar = false;
                self.html = self.html.replace(containerId, opts.containerId);
                containerId = opts.containerId;
            } else {
                self.overlayScrollbar = true;
            }

            if (self.overlayScrollbar) {
                $parentEl.addClass('scrolling-overlay');
                $parentEl.wrapInner('<div id="lightbox-content"><div class="overlay-wrapper"></div></div>');
                $parentEl.prepend('<div class="overlay-header">' + opts.paginationHeader + self.closeBtnHTML + '</div>');
            } else {
                $parentEl.addClass('inline-scrolling');
                $parentEl.wrapInner('<div class="content-mask"><div class="overlay-wrapper"></div></div>');
            }

            // bind the events for scrolling (checks to see if scrolling is required)
            forceEnableScroll = (opts !== undefined && opts.forceEnable !== undefined) ? opts.forceEnable : true;
            opts.enablePagination = self.setup($parentEl, {
                forceEnable: forceEnableScroll,
                customItems: opts.customItems
            });

            if (self.overlayScrollbar) {
                // if we don't need to scroll the content, set the content wrapper height back to auto
                // so the overlay height matches the content height
                if (!opts.enablePagination) {
                    $parentEl.find('#lightbox-content').css('height', 'auto');
                    return;
                }
            }

            if (opts.autoScrollTo) {
                self.move(false, opts.autoScrollTo);
            }

            if (opts.autoScrollOnce) {
                autoScrollOnce = true;
            }

            lastInitializedScrollbar = self;
        },

        setup: function setup($container, opts) {
            var x, self = this,
                forceEnable = opts.forceEnable,
                customItems = opts.customItems,
                initialStep = 0;

            if (customItems && customItems[0]) {
                for (x = 0; x < customItems.length; x++) {
                    initialStep += customItems[x];
                    self.steps.push(initialStep);
                }
            }

            // check if we actually require scrolling to be enabled
            allow = forceEnable ? true : $container.find('.overlay-wrapper').height() > $container.height();

            if (!allow) {
                $container.addClass('no-fixed-height');
                return false;
            }

            // kiosk basket inject new header
            if ($('.kiosk #wrapper.basket-details').length) {
                staticBasketHeader = '<section class="static-basket-header"><h3 class="section-heading item">Item</h3><h3 class="section-heading quantity">Quantity</h3><h3 class="section-heading price">Price</h3><h3 class="section-heading subtotal">Subtotal</h3><h3 class="section-heading remove">Remove</h3></section>';
                $('.basket-item h3.section-heading').hide();
                $('#basket-primary').prepend(staticBasketHeader);
                $('.overlay-wrapper').css('padding-top', '82px');
            }

            // plp filters amends (pagination on second overlay screen)
            if ($container.hasClass('filter-options')) {
                self.$wrapper = $container.addClass('pagination');

                self.$wrapper.find('ul:eq(0)');
                $container.prepend(self.html);
            } else {
                if (self.overlayScrollbar) {
                    self.$wrapper = $('#lightbox-content', $container);
                } else {
                    self.$wrapper = $('.content-mask', $container);
                }
                self.$content = $('.overlay-wrapper', self.$wrapper);
                $container.append(self.html);
            }

            // get the total number of pages
            totalPages = self.$content.outerHeight() / self.$wrapper.outerHeight();

            // store pagination nav elements
            self.$pageNavContainer = $container.find($('.pagination-nav-container'));
            self.$pageNav = self.$pageNavContainer || $('#' + containerId);
            self.$pageBar = self.$pageNav.find('>.pagination-bar');
            self.$pageUp = self.$pageNav.find('>a.pagination-up');
            self.$pageDown = self.$pageNav.find('>a.pagination-down');
            self.$pageMark = self.$pageBar.find('>span');

            // set the height of the pagination scroll bar
            if (totalPages >= 1) {
                self.$pageMark.css('height', self.$pageBar.outerHeight() / totalPages);
            } else {
                self.$pageMark.css('height', self.$pageBar.outerHeight() * totalPages);
            }

            if (self.$content.outerHeight() <= self.$wrapper.outerHeight()) {
                if (!hideIfDisabled) {
                    self.$pageNav.addClass('disabled');
                } else {
                    self.$pageNav.addClass('hidden');
                }
               // return false;
            }

            // bind click tap events to the up and down buttons
            self.$pageNav.on('click tap', '> a:not(".disabled, .hidden")', function (e) {
                e.preventDefault();
                e.stopPropagation();

                navButtonsClicked = true;
                self.move($(this).hasClass('pagination-up'));
                return false;
            });

            if (self.overlayScrollbar) {
                self.$wrapper.append('<div id="pagination-end" />');
            } else {
                self.$wrapper.append('<div class="pagination-end" />');
            }

            // send true back to confirm that pagination has now been enabled
            return true;
        },

        updateNav: function (y) {
            var self = this;
            max = self.$pageBar.outerHeight() - self.$pageMark.outerHeight();
            if (y <= 0) {
                self.$pageUp.addClass('disabled');
            } else {
                self.$pageUp.removeClass('disabled');
            }
            if (Math.ceil(y) >= max) {
                self.$pageDown.addClass('disabled');
            } else {
                self.$pageDown.removeClass('disabled');
            }
        },

        getMarkerPos: function (y) {
            var self = this;
            max = self.$pageBar.outerHeight() - self.$pageMark.outerHeight();
            diff = self.$content.outerHeight() / self.$pageBar.outerHeight();
            y = Math.abs(y) / diff;
            if (y <= 0) {
                y = 0;
            } else if (y >= max) {
                y = max;
            }
            return y;
        },

        animate: function (y) {
            var self = (!this.$content) ? lastInitializedScrollbar : this;

            cssTransitionsSupported = common.cssTransitionsSupported();
            max = -(self.$content.outerHeight() - self.$wrapper.outerHeight());

            if (y > 0) {
                y = 0;
            } else if (y < max) {
                y = max;
            }
            self.$content.stop();
            self.$pageMark.stop();

            if (autoScrollOnce && !navButtonsClicked) {
                self.$content.css({
                    top: y + 'px'
                });
            } else {
                if (cssTransitionsSupported) {
                    self.$content.css({
                        top: y + 'px',
                        transition: 'top 500ms ease-in-out'
                    });
                } else {
                    self.$content.animate({
                        top: y
                    }, '500');
                }
            }

            y = self.getMarkerPos(y);

            if (autoScrollOnce && !navButtonsClicked) {
                self.$pageMark.css({
                    top: y + 'px'
                });
                self.updateNav(y);
            } else {
                if (cssTransitionsSupported) {
                    self.$pageMark
                        .one(self.eventTransitionEnd, function () {
                            self.updateNav(y);
                        })
                        .css({
                            top: y + 'px',
                            transition: 'top 500ms ease-in-out'
                        });
                } else {
                    self.$pageMark.animate({
                        top: y
                    }, '500', function () {
                        self.updateNav(y);
                    });
                }
            }
            navButtonsClicked = false;
        },

        decorateWithCustomSteps: function decorateWithCustomSteps(position, isUp, scrollTo) {
            var self = this;
            if (self.steps && self.steps[1]) {

                if (isUp) {
                    self.step -= 1;
                    self.step = (self.step <= 0) ? 0 : self.step;
                    self.modifier = (self.step <= 0) ? 0 : self.modifier - 3;
                } else {
                    self.step += 1;
                    self.step = (self.step >= (self.steps.length - 2)) ? self.steps.length - 2 : self.step;
                    self.modifier = (self.step >= (self.steps.length - 2)) ? self.modifier : self.modifier + 3;
                }

                if (scrollTo) {
                    self.step = scrollTo;
                }

                position = self.steps[self.step] + self.modifier;
                position *= -1;
            }
            return position;
        },

        // used by both pagination nav up/down and kiosk swipe events
        move: function (isUp, scrollTo) {
            var self = this;
            if (self.$content.length > 0) {
                y = parseInt(self.$content.css('top').split('px')[0], 10);

                h = totalPages > 1 ? (self.$content.outerHeight() / totalPages) : self.$content.outerHeight();

                if (isNaN(y)) {
                    y = 0;
                }

                if (isUp) {
                    y += h;
                } else {
                    y -= h;
                }

                y = self.decorateWithCustomSteps(y, isUp, scrollTo);

                self.animate(y);
            }
        }
    };

    return InlineScrollbar.prototype;
});