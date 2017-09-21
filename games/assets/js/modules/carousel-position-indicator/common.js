/*jslint plusplus: true */
/*global define: true, TescoData: true */
define(['domlib'], function ($) {
    'use strict';

    var carouselPositionIndicator = {
        videoIndicatorInDOM: false,
        galleryIndicatorInDOM: false,
        sSetIndicator: 'genericCarouselPositionIndicator',

        setIndicatorDOMCheck: function () {
            carouselPositionIndicator.galleryIndicatorInDOM = $('.' + carouselPositionIndicator.sSetIndicator + '.gallery').length ? true : false;
            carouselPositionIndicator.videoIndicatorInDOM = $('.' + carouselPositionIndicator.sSetIndicator + '.video').length ? true : false;
        },

        setIndicatorInit: function (indicatorType) {
            var source,
                type,
                count,
                $source;

            carouselPositionIndicator.setIndicatorDOMCheck();
            if (indicatorType === 'video') {
                /*jslint nomen: true*/
                source = window.TescoData.pdp.scene7._s7VideoSet;
                /*jslint nomen: false*/
                type = 'video';
                count = source.length;

                if (count > 1) {
                    if (!carouselPositionIndicator.videoIndicatorInDOM) {
                        carouselPositionIndicator.setIndicatorCreator(type, count);
                        carouselPositionIndicator.videoIndicatorInDOM = true;
                    }
                }
            } else if (indicatorType === 'gallery') {
                $source = $('#product-thumb-carousel ul.carousel-items-container li');
                type = 'gallery';
                count = $source.length;

                if (count > 1) {
                    if (!carouselPositionIndicator.galleryIndicatorInDOM) {
                        carouselPositionIndicator.setIndicatorCreator(type, count);
                        carouselPositionIndicator.galleryIndicatorInDOM = true;
                    }
                }
            }
        },

        setIndicatorCreator: function (type, count) {
            var positionIndicatorObj = '<ul class="' + carouselPositionIndicator.sSetIndicator + ' ' + type + ' dots' + count + '" style="display: none;">',
                i;

            for (i = 0; i < count; i++) {
                positionIndicatorObj += '<li data-index="' + i + '"/>';
            }
            positionIndicatorObj += '</ul>';
            if (type === 'gallery') {
                $('#product-thumb-carousel').prepend(positionIndicatorObj);
                $('.' + carouselPositionIndicator.sSetIndicator + '.gallery').fadeIn('slow');
            } else if (type === 'video') {
                $('#product-thumb-carousel-videos').prepend(positionIndicatorObj);
                $('.' + carouselPositionIndicator.sSetIndicator + '.video').fadeIn('slow');
            }
        },

        setIndicatorReset: function (type) {
            $('.' + carouselPositionIndicator.sSetIndicator + '.' + type + ' li').removeClass().filter('[data-index="0"]').addClass('selected');
        },

        setIndicatorUpdate: function (type, index, direction) {
            var updatedIndex;

            if (direction === 'forward') {
                updatedIndex = parseInt(index, 10) + 1;
            } else if (direction === 'back') {
                updatedIndex = parseInt(index, 10) - 1;
            } else if (direction === 'jump') {
                updatedIndex = index;
            }
            $('ul.' + carouselPositionIndicator.sSetIndicator + '.' + type + ' li').removeClass().filter('[data-index="' + updatedIndex + '"]').addClass('selected');
        },

        init: function () {
            if (TescoData !== 'undefined') {
                carouselPositionIndicator.setIndicatorInit();
            }
        }
    };

    return carouselPositionIndicator;
});