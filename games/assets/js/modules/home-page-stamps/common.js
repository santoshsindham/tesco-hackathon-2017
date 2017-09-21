/*jslint plusplus: true */
/*global define: true, console: true */
define(['domlib', 'modules/common', 'modules/breakpoint'], function ($, common, breakpoint) {

    'use strict';

    var stamps = {
        el: '.homepage-trade-stamp',
        elWidth: 0,
        items: 0,
        activeItem: 0,
        infiniteOffsetWidth: 1152,
        isAnimated: false,
        initialSet: null,

        next: function (e) {

            e.preventDefault();
            e.stopPropagation();
            if (!stamps.isAnimated) {
                stamps.append(true);
            }
            return false;
        },

        previous: function (e) {

            e.preventDefault();
            e.stopPropagation();
            if (!stamps.isAnimated) {
                stamps.prepend(true);
            }
            return false;
        },

        append: function (animate) {

            var el = $(stamps.el + ' li').eq(0),
                clone = el.clone();

            clone.appendTo(stamps.el + ' ul');

            if (animate) {
                stamps.activeItem++;
                stamps.animate(el, true);
            } else {
                el.remove();
            }
        },

        prepend: function (animate) {

            var el = $(stamps.el + ' li').eq(stamps.items - 1),
                clone = el.clone();

            clone.prependTo(stamps.el + ' ul');

            if (animate) {
                stamps.activeItem++;
                stamps.setActiveItem(false);
                stamps.activeItem--;
                stamps.animate(el);
            } else {
                el.remove();
            }
        },

        animate: function (el, append) {

            var ul = $(stamps.el + ' ul');
            stamps.isAnimated = true;

            setTimeout(function () {
                ul.addClass('animate');
                stamps.setActiveItem();

                setTimeout(function () {
                    ul.removeClass('animate');
                    if (append) {
                        stamps.activeItem--;
                        stamps.setActiveItem(false);
                        el.remove();
                        stamps.isAnimated = false;
                    } else {
                        el.remove();
                        stamps.isAnimated = false;
                    }
                }, 600);
            }, 150);
        },

        getWindowCenter: function () {

            var wCenter;

            $('body, html').css({overflow: 'hidden'});
            wCenter = $(window).width() / 2;
            setTimeout(function () {
                $('body, html').css({overflow: ""});
            }, 20);

            wCenter = Math.round(wCenter);

            return wCenter;
        },


        setActiveItem: function (animate) {

            var wCenter = $(window).width() / 2,
                tileOffset = stamps.elWidth / 2,
                compensation = (common.isTouch()) ? 0 : 5,
                activeOffset = stamps.activeItem * (stamps.elWidth + 17),
                left = (wCenter - tileOffset) - activeOffset - 8 - compensation;

            if (common.isModern()) {
                $(stamps.el + ' ul').css({
                    '-webkit-transform': 'translate3d(' + left + 'px,0,0)',
                    '-moz-transform': 'translate3d(' + left + 'px,0,0)',
                    '-ms-transform': 'translate3d(' + left + 'px,0,0)',
                    '-o-transform': 'translate3d(' + left + 'px,0,0)',
                    'transform': 'translate3d(' + left + 'px,0,0)'
                });
            } else {
                if (animate) {
                    $(stamps.el + ' ul').animate({left: left}, 400);
                } else {
                    $(stamps.el + ' ul').css({left: left});
                }
            }
        },

        initPrepend: function () {

            return ($(stamps.el + ' li').eq(0).offset().left > 8) ? false : true;
        },

        reset: function () {

            if (stamps.isCarousel()) {
                $(stamps.el).removeClass('carousel');
                $(stamps.el + ' ul').removeClass('animated');
                stamps.unbindEvents();
                stamps.resetOrder();
                stamps.activeItem = 0;
                stamps.isAnimated = false;

                setTimeout(function () {
                    $(stamps.el + ' ul').attr('style', '');
                }, 50);
                stamps.setHeights();
            }
        },

        resetOrder: function () {

            $(stamps.el + ' ul').html(stamps.initialSet);
        },

        exists: function () {

            return $(stamps.el).length;
        },

        itemsPerPage: function () {

            return Math.floor($(window).width() / stamps.elWidth);
        },

        firstItem: function () {

            return Math.ceil(stamps.itemsPerPage() / 2) - 1;
        },

        isCarousel: function () {

            return $(stamps.el).hasClass('carousel');
        },

        resize: function () {

            var firstItem;

            stamps.elWidth  = $('li', stamps.el).eq(0).width();
            stamps.setActiveItem();
            firstItem = $('ul li', stamps.el).eq(0);

            if (parseInt(firstItem.offset().left, 10) > 8 && stamps.isCarousel()) {
                stamps.activeItem++;
                stamps.prepend();
            }
        },

        bindEvents: function () {

            $(window).on('resize orientationchange', stamps.resize);
            $(stamps.el).on('swipeLeft', stamps.next);
            $(stamps.el).on('swipeRight', stamps.previous);
        },

        unbindEvents: function () {

            $(window).off('resize orientationchange', stamps.resize);
            $(stamps.el).off('swipeLeft', stamps.next);
            $(stamps.el).off('swipeRight', stamps.previous);
        },

        tileClick: function () {

            $(stamps.el + ' li').each(function () {
                var self = this;

                $(self).on('click', function () {
                    var link = $(self).find('a').attr('href');
                    window.location = link;
                    return false;
                });
            });
        },

        setHeights: function () {

            var maxHeight = 0,
                elHeight;

            $(stamps.el + ' li').css('height', 'auto');
            /*jslint unparam: true*/
            $(stamps.el + ' li').each(function (i, e) {
                elHeight = e.offsetHeight;
                if (elHeight > maxHeight) {
                    maxHeight = elHeight;
                }
            });
            /*jslint unparam: false*/
            $(stamps.el + ' li').css('height', maxHeight);
        },

        init: function () {

            if (stamps.exists()) {
                setTimeout(function () {
                    stamps.setHeights();
                }, 100);

                if (!stamps.isCarousel() && (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet)) {

                    if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
                        $(stamps.el).addClass('show-nav');
                        $(stamps.el).find('.nav .next').on('click tap', stamps.next);
                        $(stamps.el).find('.nav .back').on('click tap', stamps.previous);
                    }

                    $(stamps.el).addClass('carousel');
                    stamps.elWidth  = $('li', stamps.el).eq(0).width();
                    stamps.items  = $('li', stamps.el).length;
                    stamps.activeItem = stamps.firstItem();
                    stamps.initialSet = $(stamps.el + ' li');
                    if (stamps.initPrepend()) {
                        stamps.prepend();
                        stamps.activeItem++;
                    }
                    stamps.bindEvents();

                    setTimeout(function () {
                        stamps.elWidth  = $('li', stamps.el).eq(0).width();
                        stamps.setActiveItem();
                    }, 250);
                }
            }
        }

    };

    common.init.push(stamps.tileClick);
    breakpoint.mobileIn.push(stamps.init);
    breakpoint.vTabletIn.push(stamps.init);
    breakpoint.vTabletOut.push(stamps.reset);
    breakpoint.hTabletIn.push(stamps.init);
    breakpoint.hTabletOut.push(stamps.reset);
    breakpoint.desktopIn.push(stamps.init);
    breakpoint.desktopOut.push(stamps.reset);
    breakpoint.largeDesktopIn.push(stamps.init);
    breakpoint.largeDesktopOut.push(stamps.reset);
    breakpoint.kioskIn.push(stamps.init);

    return stamps;
});