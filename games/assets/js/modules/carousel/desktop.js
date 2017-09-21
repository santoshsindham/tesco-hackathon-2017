/*global define: true, window: true*/
define(['domlib', './common', 'modules/common'], function ($, carousel, common) {

    'use strict';

    /**
     * Handle click Events
     * @param  {event} evt
     */
    carousel.click = function (evt) {
        carousel.stop();

        var target = $(evt.target).closest('li');
        carousel.activeItem = $(target).index();
        carousel.setActiveItem();
    };


    /**
     * Toggle navigation buttons when not touch
     * @param  {event} evt Click event
     */
    carousel.toggleNavButtons = function (evt) {
        switch (evt.type) {
        case ('mouseenter'):
            $('.navButton', carousel.element).addClass('show');
            break;

        case ('mouseleave'):
            $('.navButton', carousel.element).removeClass('show');
            break;
        }
    };

    carousel.bindEvents = function () {
        //No Touch (Desktop/Mouse)
        $('li', carousel.buttons).on('click', carousel.click);
        $('.wrapper, .navButton', carousel.element).on('mouseleave mouseenter', carousel.toggleNavButtons);

        $('.navButton.next').on('click', carousel.next);
        $('.navButton.prev').on('click', carousel.previous);

        if (window.isKiosk()) {

            common.kioskSwipe('left', $('.wrapper', carousel.carousel), carousel.swipeLeft);
            common.kioskSwipe('right', $('.wrapper', carousel.carousel), carousel.swipeRight);

        } else {
            carousel.images.on('mouseenter', carousel.pause);
            carousel.images.on('mouseleave', carousel.start);

            $(window)
                .on('dropdownOpenComplete', carousel.pause)
                .on('dropdownCloseComplete', carousel.start);
        }
    };


    common.init.push(function () {
        if (carousel.init()) {
            carousel.bindEvents();
        }
    });

});