/**
 * Carousel Module : Image carousel
 */
/*jslint plusplus: true*/
/*global define: true, window: true*/
define(['domlib', 'modules/common'], function ($, common) {

    'use strict';

    var carousel = {

        element: null, //Carousel ID
        images: null, //Image container
        slider: null, //Slider container (touch)
        widget: null, //Slider widget (touch)
        buttons: null, //Click buttons (click)

        posX: 0, //initial position offset when using touch start on slider

        buttonWidth: 0, //Width of button container so slider can match
        sliderOffsetX: 0, //slider offset
        sliderWidth: 0, //slider width
        widgetWidth: 0, //slider widget width
        imagesWidth: 0, //Total images width
        liWidth: 0, //width of each LI containing an image

        constraint: {
            start: 0,
            end: 0
        }, //Contraints for slider widget

        numItems: 0, //Number of images/items
        activeItem: 0, //Index of active image/item

        sliderTimer: null, //Slider Timer for timeout of display

        slideshowInterval: 6000, //Slideshow pause between images
        slideshowTimer: null, //Timer for slideshow
        slideshowStopped: false, //Has the slideshow been stopped?
        slideshowTimeout: null, //slidershow timeout triggered when paused before restarting

        imagesOffset: 0, //Offset of image container
        draggingOffset: 0, //ofset to calculate touch position



        /**
         * Calculate item to be set as active when using the touch slider
         * @param  {Int} x X touch position on the slider
         */
        calculateItem: function (x) {
            var spacing = (carousel.constraint.end - carousel.constraint.start) / carousel.numItems,
                ai = Math.floor(x / spacing);

            if (ai >= carousel.numItems) {
                ai = carousel.numItems - 1;
            }

            if (ai < 0) {
                ai = 0;
            }

            if (ai !== carousel.activeItem) {
                carousel.activeItem = ai;
                carousel.setActiveItem();
            }

        },


        /**
         * Set the active item and animate into place using CSS/JS based on browser
         */
        setActiveItem: function () {
            var newPos;

            $('li', carousel.buttons).eq(carousel.activeItem).addClass('active')
                .siblings().removeClass('active');

            //do a modern browser check
            if (common.isModern()) {
                //use 3dtransform for animation

                newPos = ((100 / carousel.numItems) * carousel.activeItem);
                carousel.images.css({
                    '-webkit-transform': 'translate3d(' + -newPos + '%,0,0)',
                    '-moz-transform': 'translate3d(' + -newPos + '%,0,0)',
                    '-ms-transform': 'translate3d(' + -newPos + '%,0,0)',
                    '-o-transform': 'translate3d(' + -newPos + '%,0,0)',
                    'transform': 'translate3d(' + -newPos + '%,0,0)'
                });

            } else {

                //use js for animation
                newPos = 100 * carousel.activeItem;
                carousel.images.animate({
                    'left': -newPos + '%'
                }, 500);
            }
        },

        /**
         * Handle click event for next image button
         * @param  {event} evt Click event
         */
        next: function (evt) {

            if (evt) {
                carousel.stop();
            }

            if (!carousel.images.hasClass('.dragging')) {

                if (carousel.activeItem < (carousel.numItems - 1)) {
                    carousel.activeItem++;
                } else {
                    carousel.activeItem = 0;
                }

                carousel.setActiveItem();
            }
        },

        swipeLeft: function (evt) {
            if (window.isKiosk()) {
                carousel.pause();
            } else {
                carousel.stop();
            }
            if (carousel.activeItem !== (carousel.numItems - 1)) {
                evt.preventDefault();
                carousel.next();
            }
            carousel.setActiveItem();
        },



        swipeRight: function (evt) {
            if (window.isKiosk()) {
                carousel.pause();
            } else {
                carousel.stop();
            }
            if (carousel.activeItem !== 0) {
                evt.preventDefault();
                carousel.previous();
            }
            carousel.setActiveItem();
        },

        /**
         * Handle click event for previous image button
         * @param  {event} evt Click event
         */
        previous: function (evt) {

            if (evt) {
                carousel.stop();
            }

            if (!carousel.images.hasClass('.dragging')) {

                if (carousel.activeItem > 0) {
                    carousel.activeItem--;
                } else {
                    carousel.activeItem = (carousel.numItems - 1);
                }

            }

            carousel.setActiveItem();
        },

        /**
         * Sart slideshow after clearing any residual timers or timeouts
         * @param  {event} evt Event
         */
        start: function (evt) {
            if (evt) {
                evt.preventDefault();
            }

            window.clearInterval(carousel.sliderTimer);
            window.clearInterval(carousel.slideshowTimeout);

            carousel.slideshowTimeout = window.setInterval(function () {
                carousel.next();
            }, carousel.slideshowInterval);
        },


        /**
         * pause slideshow
         * @param  {event} evt Event
         */
        pause: function (evt) {

            if (evt) {
                evt.preventDefault();
            }

            window.clearInterval(carousel.slideshowTimer);
            window.clearTimeout(carousel.slideshowTimeout);
        },


        /**
         * Stop the slideshow and restart after 6 seconds
         * @param  {event} evt Event
         */
        stop: function (evt) {
            if (evt) {
                evt.preventDefault();
            }

            window.clearInterval(carousel.slideshowTimer);
            window.clearTimeout(carousel.slideshowTimeout);

            //pause for 10 seconds after an interaction before starting the slideshow again
            carousel.slideshowTimeout = window.setTimeout(function () {
                carousel.start(null);
            }, 6000);
        },


        generateButtons: function () {
            //generate buttons
            var i = carousel.numItems,
                buttons = '';

            while (i--) {
                buttons += '<li><div class="inner"></div></li>';
            }

            carousel.buttons.html(buttons);
        },


        init: function () {
            carousel.element = $('#carousel');
            if (carousel.element.length) {

                carousel.images = $('#carousel .images');
                carousel.slider = $('#carousel-slider');
                carousel.widget = $('#carousel-slider .widget');
                carousel.buttons = $('#carousel .buttons');

                //set number of images in the carousel
                carousel.numItems = $('li', carousel.images).length;

                //set width of .images
                carousel.images.css({
                    width: (carousel.numItems * 100) + '%'
                });

                //set image width
                carousel.liWidth = (100 / carousel.numItems) + '%';
                $('li', carousel.images).css({
                    width: carousel.liWidth
                });
                $('.wrapper', carousel.element).css({
                    height: 'auto'
                });

                carousel.generateButtons();

                carousel.setActiveItem(); //set the first item
                carousel.start(null); //kick off the slideshow

                return true;
            }
        }

    };

    return carousel;

});