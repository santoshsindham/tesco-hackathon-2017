/*global define: true, window: true */
define(['domlib', 'modules/common'], function ($, common) {
    'use strict';
    /**
     *  BasicSlider
     *
     *  Creates a simple HTML based slider control
     */

    function BasicSlider($cont, options) {
        this.$cont = $cont;
        this.$handle = null;
        this.$trail = null;
        this.isMouseDown = false;
        this.handleWidth = 0;
        this.handleCenterOffset = 0;
        this.width = 0;
        this.value = 0; // This value should

        this.settings = {
            onSlideMove: null
        };

        $.extend(this.settings, options);

        this.init();
    }

    BasicSlider.prototype.init = function () {
        this.buildMarkUp();
        this.bindHandlers();
    };

    /**
     *  Recalculate the width when the container is resized
     *
     */
    BasicSlider.prototype.resize = function () {
        this.width = this.$cont.width();
    };

    /**
     *  Make sure the width of the slider is not zero
     *
     */
    BasicSlider.prototype.checkWidth = function () {
        if (this.width <= 0) {
            this.width = this.$cont.width();
        }
    };

    BasicSlider.prototype.buildMarkUp = function () {
        var markUp = '<div class="basic-slider"><div class="basic-slider-trail"></div><div class="basic-slider-handle"></div><div class="basic-slider-track"></div></div>';

        this.$cont.html(markUp);
        this.$slider = $('.basic-slider', this.$cont);
        this.$handle = $('.basic-slider-handle', this.$cont);
        this.$trail = $('.basic-slider-trail', this.$cont);
        this.width = this.$cont.width();
        this.handleWidth = this.$handle.outerWidth();
        this.handleCenterOffset = this.handleWidth / 2;
    };

    BasicSlider.prototype.setPosition = function (leftPercent) {
        this.$handle.css({
            'left': leftPercent + '%'
        });
        this.$trail.width(leftPercent + '%');
        this.value = leftPercent;
    };

    BasicSlider.prototype.calculatePercentageFromOffsetLeft = function (offsetLeft) {
        var percentageWidth = Math.ceil((offsetLeft / this.width) * 100);

        this.setPosition(percentageWidth);

        if (typeof this.settings.onSlideMove === 'function') {
            this.settings.onSlideMove(this.value);
        }
    };

    BasicSlider.prototype.doMouseDrag = function (evt) {
        var relativeLeft,
            handleLeft;

        this.checkWidth();

        if (this.isMouseDown) {
            relativeLeft = evt.pageX - this.$cont.offset().left;
            handleLeft = relativeLeft - this.handleCenterOffset;

            if (relativeLeft <= this.handleCenterOffset) {
                handleLeft = 0;
            }

            if (relativeLeft >= (this.width + this.handleCenterOffset)) {
                handleLeft = this.width;
            }

            this.calculatePercentageFromOffsetLeft(handleLeft);
        }
    };

    BasicSlider.prototype.doCLick = function (evt) {
        var relativeLeft;

        this.checkWidth();

        relativeLeft = evt.pageX - this.$cont.offset().left;

        if (relativeLeft >= 0 && relativeLeft <= this.width) {
            this.calculatePercentageFromOffsetLeft(relativeLeft - this.handleCenterOffset);
        }
    };

    BasicSlider.prototype.doMouseDown = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.isMouseDown = true;
    };

    BasicSlider.prototype.doMouseUp = function () {
        this.isMouseDown = false;
    };

    BasicSlider.prototype.bindHandlers = function () {
        this.$cont.on('mousedown', $.proxy(this.doMouseDown, this));
        this.$cont.on('mouseup', $.proxy(this.doMouseUp, this));
        this.$cont.on('mouseenter', $.proxy(this.doMouseUp, this));
        this.$cont.on('mousemove', $.proxy(this.doMouseDrag, this));
        this.$cont.on('click', '.basic-slider', $.proxy(this.doCLick, this));
        var self = this;
        $(window).resize(function () {
            self.resize();
        });
    };

    common.BasicSlider = BasicSlider;

});