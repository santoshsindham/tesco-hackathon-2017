/*globals define, window, document */
/*jslint nomen: true */
define('modules/show-more/ShowMore', [
    'domlib',
    'modules/tesco.analytics',
    'modules/breakpoint'
    ], function ($, analytics, breakpoint) {
    'use strict';

    var ShowMore,
        analyticsTrack;

    /**
     * Class that applies expand/collapse functionality with a fadeout to an
     * element
     *
     * @param {object} an object with the properties 'selector' and 'height'
     * 'selector' {string} the id or class of an DOM element to apply the Show
     * More functionality 'height' {int} the default height the Show More should
     * be set to when collapsed
     */
    ShowMore = function (oConfig) {
        this.sShowMoreSelector = oConfig.selector || null;
        this.$showMoreSelector = $(this.sShowMoreSelector);
        this.iDefaultWrapperHeight = oConfig.height || 250;
        this.$showMoreWrapper = null;
        this.$showMoreFooter = null;
        this.$showMoreButton = null;
        this.$showMoreBtnLabel = null;
        this.$fadeMask = null;
        this.isOpen = false;
        this.isInit = false;
        this.iSelectorHeight = null;
        this.iShowMoreWrapperOffsetTop = null;
        this.iWrapperHeight = null;
        this.sShowMoreWrapper = '<div class="show-more-wrapper"></div>';
        this.sShowMoreFooter = '<div class="show-more-footer"><button ' +
            'type="button" class="button secondary centered"><span></span></button></div>';
        this.sShowMoreText = 'Show more';
        this.sShowLessText = 'Show less';
        this.sFadeMask = '<div class="fade-mask"></div>';
        this.hasDOMSubTreeModifiedListener = oConfig.subtreeListener || false;

        if (this.$showMoreSelector && this.$showMoreSelector.length) {
            this.fnSetDataAttr();
            this.bindResizeEvent();

            if (this.hasDOMSubTreeModifiedListener) {
                this.bindDOMSubTreeModified();
            }
        }
    };

    ShowMore.prototype.fnBindEvents = function () {
        var self = this;

        this.$showMoreButton.on('click.showMore', function () {
            self.fnToggleShowMore();
        });

        this.$showMoreWrapper.on(
            'transitionend',
            this.removeOverflowHidden.bind(this)
        );
    };

    ShowMore.prototype.removeOverflowHidden = function ($event) {
        var sourceElement = $event.originalEvent.srcElement
                ? $event.originalEvent.srcElement
                : $event.originalEvent.target;

        if (sourceElement === this.$showMoreWrapper[0]
            && $event.originalEvent.propertyName === 'height'
            && this.isOpen) {
          this.$showMoreWrapper.css('overflow', 'visible');
        }
    };

    ShowMore.prototype.bindDOMSubTreeModified = function () {
        var self = this;

        self.$showMoreSelector
            .on('DOMSubtreeModified.showMore', function () {
              clearTimeout(timer);
              var timer = setTimeout(function() {self.toggleInit();}, 20);
            });
    };

    ShowMore.prototype.bindResizeEvent = function () {
        var self = this;

        $(window)
            .on('resize.showMore', function () {
                self.toggleInit();
            });
    };

    ShowMore.prototype.toggleInit = function () {
        var self = this,
            resizeTimer;

        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
            self.fnCalcSelectorHeight();
            self.fnCalcWrapperHeight();

            if (self.isInit && !self.fnCheckShowMoreHeight()) {
                self.destroy();
                return;
            }

            if (!self.isInit) {
                self.fnInit();
                return;
            }

            if (!self.isOpen) {
                self.fnSetWrapperHeight(self.iWrapperHeight);
            } else {
                self.fnSetWrapperHeight(self.iSelectorHeight);
            }
        }, 200);
    };

    ShowMore.prototype.fnCalcShowMoreWrapperOffsetTop = function () {
        this.iShowMoreWrapperOffsetTop = this.$showMoreWrapper.offset()
            .top;
    };

    ShowMore.prototype.fnCompareShowMoreAndWindowOffsetTop = function () {
        var iWindowOffsetTop = $(window)
            .scrollTop();
        if (this.iShowMoreWrapperOffsetTop < iWindowOffsetTop) {
            return true;
        }
    };

    ShowMore.prototype.fnScrollToTopOfShowMoreWrapper = function () {
        var self = this,
            $masthead = $('#masthead-wrapper'),
            iMastheadHeight = $masthead.data('outerHeight') + 10;

        $('html, body').animate({
            scrollTop: self.iShowMoreWrapperOffsetTop - iMastheadHeight
        }, 200, function () {
            window.setTimeout(function () {
                self.fnSetShowLess();
            }, 100);
        });
    };

    ShowMore.prototype.fnCalcWrapperHeight = function () {
        this.iWrapperHeight = (breakpoint.newViewport === 'largedesktop' ||
            breakpoint.newViewport === 'desktop') ? this.iDefaultWrapperHeight : 350;
    };

    ShowMore.prototype.fnCalcSelectorHeight = function () {
        var i,
            iHeight = 0,
            contents = this.isInit ? this.$showMoreWrapper.children() : this.$showMoreSelector.children(),
            iCount = contents.length;

        for (i = 0; i < iCount; i += 1) {
            if (!$(contents[i]).hasClass('fade-mask') && $(contents[i]).css('display') !== 'none') {
                iHeight += $(contents[i]).outerHeight(true);
            }
        }

        this.iSelectorHeight = iHeight;
    };

    ShowMore.prototype.fnSetWrapperHeight = function (iHeight) {
        var value = iHeight === 'auto' ? 'auto' : iHeight + 'px';

        this.$showMoreWrapper.css({
            height: value
        });
    };

    ShowMore.prototype.fnSetShowMore = function () {
        if (!window.Modernizr.csstransitions) {
            this.$showMoreWrapper.css('overflow', 'visible');
        }
        this.fnSetWrapperHeight(this.iSelectorHeight + 30);
        this.$fadeMask.addClass('hide');
        this.$showMoreBtnLabel.text(this.sShowLessText);
        this.isOpen = true;
    };

    ShowMore.prototype.fnSetShowLess = function () {
        this.$showMoreWrapper.css('overflow', '');
        this.fnSetWrapperHeight(this.iWrapperHeight);
        this.$fadeMask.removeClass('hide');
        this.$showMoreBtnLabel.text(this.sShowMoreText);
        this.isOpen = false;
    };

    ShowMore.prototype.fnToggleShowMore = function () {
        var sSelectorString, sSelectorTrimmed, sShowMoreLabel;

        if (this.isOpen) {
            this.fnCalcShowMoreWrapperOffsetTop();
            if (this.fnCompareShowMoreAndWindowOffsetTop()) {
                this.fnScrollToTopOfShowMoreWrapper();
            } else {
                this.fnSetShowLess();
            }
        } else {
            this.fnSetShowMore();
            sSelectorString = this.$showMoreSelector.selector;
            sSelectorTrimmed = sSelectorString.substring(1).replace(/-/g, " ");
            sShowMoreLabel = this.sShowMoreText;
            analyticsTrack(sSelectorTrimmed, sShowMoreLabel);
        }
    };

    ShowMore.prototype.fnInjectHtmlElements = function () {
        this.$showMoreSelector.wrapInner(this.sShowMoreWrapper);
        this.$showMoreWrapper = this.$showMoreSelector.children();
        this.$showMoreWrapper.after(this.sShowMoreFooter);
        this.$showMoreWrapper.append(this.sFadeMask);
        this.$showMoreFooter = this.$showMoreWrapper.next('.show-more-footer');
        this.$showMoreButton = this.$showMoreFooter.find('button');
        this.$showMoreBtnLabel = this.$showMoreButton.find('span');
        this.$fadeMask = this.$showMoreWrapper.find('.fade-mask');
    };

    ShowMore.prototype.fnCheckShowMoreHeight = function () {
        if ((this.iSelectorHeight * 0.8) >= this.iWrapperHeight) {
            return true;
        }
    };

    ShowMore.prototype.fnSetDataAttr = function () {
        this.$showMoreSelector.data('ShowMore', this);
    };

    ShowMore.prototype.fnInit = function () {
        if (!this.$showMoreSelector || !this.$showMoreSelector.length) {
            return;
        }

        // don't allow nested show/hide
        if (this.$showMoreSelector.parents().hasClass('show-more-wrapper')) {
            return;
        }

        this.fnCalcWrapperHeight();
        this.fnCalcSelectorHeight();

        if (this.fnCheckShowMoreHeight()) {
            this.fnInjectHtmlElements();
            this.fnBindEvents();
            this.fnSetShowLess();
            this.isInit = true;
        }
    };

    ShowMore.prototype.destroy = function (opt_bool) {
        if (opt_bool) {
            this.unbindResizeEvent();
        }
        this.removeHtmlElements();
        this.isInit = false;
    };

    ShowMore.prototype.removeHtmlElements = function () {
        this.$fadeMask.remove();
        this.$showMoreWrapper.contents().unwrap();
        this.$showMoreFooter.remove();
    };

    ShowMore.prototype.unbindResizeEvent = function () {
        $(window).off('resize.showMore');
    };

    analyticsTrack = function analyticsTrack(container, label) {
        // send analytics data on click
        var _oWebAnalytics = new analytics.WebMetrics(),
            v = [{
                'prop19': label,
                'eVar45': label,
                'prop42': 'pdp - ' + container + ' - show more',
                'eVar59': 'pdp - ' + container + ' - show more',
                'events': 'event45'
            }];
        _oWebAnalytics.submit(v);
    };

    return ShowMore;
});
