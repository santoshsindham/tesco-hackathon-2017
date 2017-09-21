/*global window, define: true */
define(['domlib', './common', 'modules/common', 'modules/tesco.utils'], function ($, carousel, common, utils) {
    'use strict';

    /**
     * Handle Tap Events
     * @param  {event} evt
     */
    carousel.tap = function (evt) {

        window.clearTimeout(carousel.sliderTimer);
        carousel.stop();
        evt.preventDefault();

        var target = $(evt.target).closest('li');
        carousel.activeItem = $(target).index();
        carousel.setActiveItem();
    };



    /**
     * Handle touch start event and set initial position of slider widget
     * @param  {event} evt Touch event
     */
    carousel.touchStart = function (evt) {
        carousel.stop();
        evt.preventDefault();

        carousel.sliderTimer = window.setTimeout(function () {
            var initPos;
            if (evt.touches) {
                initPos = evt.touches[0].pageX;

                carousel.posX = initPos - $('li', carousel.buttons).eq(0).offset().left - (carousel.widgetWidth / 2);
                carousel.calculateItem(carousel.posX);

                carousel.element.addClass('touch');
                carousel.widget.css({
                    left: carousel.posX
                });
            }
        }, 80);

    };


    /**
     * Handle touch end event
     * @param  {event} evt Touch event
     */
    carousel.touchEnd = function (evt) {
        window.clearTimeout(carousel.sliderTimer);
        evt.preventDefault();
        carousel.element.removeClass('touch');
    };


    /**
     * Handle touch drag event
     * @param  {event} evt Touch event
     */
    carousel.touchMove = function (evt) {
        var x = carousel.posX,
            offsetX;

        if (evt.touches) {
            offsetX = (evt.touches[0].clientX - x) - $('#carousel-slider').offset().left;
            if ((x + offsetX) < carousel.constraint.start) {
                x = 0;
            } else {
                if ((x + offsetX) > carousel.constraint.end) {
                    x = (carousel.sliderWidth - carousel.widgetWidth);
                } else {
                    x = (x + offsetX) - (carousel.widgetWidth / 2);
                }
            }
            carousel.widget.css({
                left: x
            });
            carousel.calculateItem(x);
        }
    };



    carousel.bindEvents = function () {

        carousel.buttonWidth = 0;

        $('li', carousel.buttons).each(function () {
            carousel.buttonWidth += $(this).width();

            if ($(this).index() !== 0) {
                carousel.buttonWidth += parseInt($(this).css('margin-left'), 10);
            }

            if ($(this).index() !== (carousel.numItems - 1)) {
                carousel.buttonWidth += parseInt($(this).css('margin-right'), 10);
            }
        });


        //set slider vars
        carousel.slider.css({
            width: carousel.buttonWidth,
            'margin-left': -(carousel.buttonWidth / 2)
        });
        carousel.sliderWidth = carousel.buttonWidth;
        carousel.parentPosX = $(carousel.widget).parent().offset().left;
        carousel.posX = $(carousel.widget).offset().left - carousel.parentPosX;
        carousel.sliderParentOffsetX = $(carousel.slider).parent().offset().left;
        carousel.sliderOffsetX = $(carousel.slider).offset().left - carousel.sliderParentOffsetX;
        carousel.widgetWidth = $(carousel.widget).width();
        carousel.constraint.start = carousel.widgetWidth / 2;
        carousel.constraint.end = carousel.sliderWidth - (carousel.widgetWidth / 2);



        /**
         * Bind touch events
         */

        $('#carousel .buttons li')
            .on('touchstart', carousel.touchStart)
            .on('touchend', carousel.touchEnd)
            .on('touchmove', carousel.touchMove)
            .on('tap click', carousel.tap);

        $('.wrapper', carousel.carousel)
            .on('hold', carousel.pause)
            .on('swipeLeft', carousel.swipeLeft)
            .on('swipeRight', carousel.swipeRight)
            .on('touchstart', carousel.handleTouchStart)
            .on('touchend', carousel.handleTouchEnd)
            .on('touchmove', carousel.handleTouchMove);

        $(window)
            .on('dropdownOpenComplete', carousel.pause)
            .on('dropdownCloseComplete', carousel.start);
    };

    carousel.handleTouchStart = function (e) {
        // Take 2 sets of touch points as the user may never trigger the touchmove
        carousel.x1 = e.originalEvent.touches[0].pageX;
        carousel.y1 = e.originalEvent.touches[0].pageY;
        carousel.x2 = e.originalEvent.touches[0].pageX;
        carousel.y2 = e.originalEvent.touches[0].pageY;
    };

    carousel.handleTouchEnd = function (e) {
        if ((Math.abs(carousel.x1 - carousel.x2) < 70) && (Math.abs(carousel.y1 - carousel.y2) < 10)) {
            e.preventDefault();
            if ($(e.target).closest('a').prop('href') !== undefined) {
                window.location.href = $(e.target).closest('a').prop('href');
            } else {
                utils.scrollToElem($('#' + $(e.target).parents('.scrollTo').data('scrolltoid')));
            }
        } else {
            carousel.start();
        }
    };

    carousel.handleTouchMove = function (e) {
        carousel.x2 = e.originalEvent.touches[0].pageX;
        carousel.y2 = e.originalEvent.touches[0].pageY;
    };

    common.init.push(function () {
        if (carousel.init()) {
            carousel.bindEvents();
        }
    });

});