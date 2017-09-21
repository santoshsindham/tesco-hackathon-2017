/*global window, define*/
/*jslint plusplus:true*/
define([
    'domlib',
    'modules/basic-carousel/common',
    'modules/breakpoint',
    'modules/common'
], function ($, BasicCarousel) {
    'use strict';
    var IndicatorCarousel = function IndicatorCarousel(noOfSlides, elId, carousel) {
        var indicatorCarousel = this;

        indicatorCarousel.carousel = carousel;
        indicatorCarousel.$indicators = $(indicatorCarousel.create(noOfSlides));

        indicatorCarousel.setIndicatorEvents();
        indicatorCarousel.$indicators.find('li:first-child').addClass('active');
        indicatorCarousel.$indicators.appendTo('#' + elId);

        if (window.isTouch()) {
            indicatorCarousel.carousel.$carouselItemsContainer.find('li').on('swipeRight', function () {
                indicatorCarousel.carousel.$btnPrev.trigger('click');
            });
            indicatorCarousel.carousel.$carouselItemsContainer.find('li').on('swipeLeft', function () {
                indicatorCarousel.carousel.$btnNext.trigger('click');
            });
        }
    };

    IndicatorCarousel.prototype = {
        create : function (len) {
            var i,
                items = '<ul class="carousel-indicators">';

            for (i = 0; i < len; i++) {
                items += '<li></li>';
            }

            items += '</ul>';

            return items;
        },
        setActiveIndicator : function (index) {
            this.$indicators.find('li')
                .eq(index).addClass('active')
                .siblings().removeClass('active');
        },
        setIndicatorEvents : function () {
            var indicatorCarousel = this;

            indicatorCarousel.$indicators.on('click', 'li', function () {
                var index = $(this).index();
                indicatorCarousel.carousel.setItem(index);
            });
            indicatorCarousel.$indicators.on('click', 'li', function () {
                indicatorCarousel.setActiveIndicator($(this).index());
            });
            indicatorCarousel.carousel.$btnNext.on('click', function () {
                if (!$(this).hasClass('disabled')) {
                    indicatorCarousel.setActiveIndicator(indicatorCarousel.carousel.activePanel);
                }
            });
            indicatorCarousel.carousel.$btnPrev.on('click', function () {
                if (!$(this).hasClass('disabled')) {
                    indicatorCarousel.setActiveIndicator(indicatorCarousel.carousel.activePanel - 2);
                }
            });

        }
    };

    return {
        create : function init(elId, slides) {
            var carousel, content, noOfSlides;

            content = $.trim(slides);
            noOfSlides = $('<ul></ul>').append(content).find('li').length;
            carousel = new BasicCarousel({
                elementId: elId,
                isHorizontal : true,
                content : content
            });
            // we need to override this method as this method is tightly coupled with scene7 carousels
            carousel.calculatePanels = function (visibleItems) {
                var selectedIndex = 0,
                    updatedPanel;
                this.panelItemCount = 0;
                this.numPanels = 0;
                this.panelWidth = 0;
                this.animateSet(0);
                this.panelItemCount = visibleItems;
                this.numPanels = Math.ceil(this.numItems / this.panelItemCount);
                this.panelWidth = this.itemSize * this.panelItemCount;
                if (this.numPanels < 2) {
                    this.$btnNext.addClass('disabled');
                }

                if ((selectedIndex + 1) > this.panelItemCount) {
                    updatedPanel = Math.ceil(selectedIndex / this.panelItemCount);
                    this.activePanel = updatedPanel;
                    this.animateSet(null, this.activePanel);
                } else {
                    this.activePanel = 1;
                }

                if (selectedIndex < this.panelItemCount) {
                    this.$btnPrev.addClass('disabled');
                }
            };

            return new IndicatorCarousel(noOfSlides, elId, carousel);
        }
    };
});