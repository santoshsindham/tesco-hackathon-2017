/*globals define, $, window */
/*jslint plusplus: true*/
/**
 * A small carousel library for the tesco UI
 * @param element
 * @param opts {
 * nextClass: class name for the next anchor
 * prevClass: class name for the previous anchor
 * itemSelector: class name for the items in the carousel, this is used to calculate the number of visible items
 * wrapperClass: in case a specific class is used to wrap the items, this item will be moved
 * }
 * @constructor
 */
define(['modules/breakpoint', 'modules/pagination/pagination'], function (breakpoint, Pagination) {
    'use strict';

    var aCarousels = [],
        resizeCarouselHandler = function resizeCarouselHandler() {
            var i = 0;

            for (i = 0; i < aCarousels.length; i++) {
                aCarousels[i].adjust();
            }
        },
        ResCarousel = function ResCarousel(element, opts) {
            var defOpts = {
                nextClass: ".next",
                prevClass: ".previous",
                itemSelector: ".carousel-item",
                itemSelectorActive: "active",
                wrapperClass: false,
                all: true,
                enablePeep: false,
                peepThreshold: 0.2,
                itemWidth: 0,
                scrollLimit: 0,
                centraliseThumbnails: {
                    enabled: false,
                    clickActionCallback: null
                },
                stopOnLastItem: false,
                enableAutoHideArrows: true,
                continuousLoop: false,
                afterMove: false,
                elasticBounceOnEmptySwipe: false,
                iBounceSpeed: 250,
                wiggleStartupCeremony: false,
                iWiggleAnimationDuration: 1000,
                bIncludePagination: false,
                oPaginationOptions: {},
                sHiddenClass: "displayNone",
                bHideNextPreviousIfAllItemsVisible: false,
                bFitsItemWidthsAndPaddingForNumberOfItemsMinusOne: false,
                vertical: false
            },
                self = this;

            this.options = $.extend({}, defOpts, opts);
            this.$element = element;
            this.disableRightArrow = false;
            this.start();
            this.setTriggerStates();
            //this.setResponsiveEvents();
            this.transitioning = false;
            this.bouncing = false;
            this.iBounceDistance = 0;
            this.iTouchStartXCoords = 0;
            this.iTouchEndXCoords = 0;
            this.bWiggleStartupAnimationHasRun = false;
            if (this.options.bIncludePagination) {
                self.oCarouselPagination = new Pagination(self);
                self.oCarouselPagination.init();
            }
            aCarousels.push(this);
        };

    $(window).on('windowResizeEnd.carouselHandler', resizeCarouselHandler);

    ResCarousel.prototype = {
        setup: function setup(args) {
            var argsCopy = args || {},
                carouselItems = [];

            function addDataAtributes(items) {
                var i = 0;

                for (i = 0; i < items.length; i += 1) {
                    $(items[i]).attr('data-index', i);
                }
            }

            carouselItems = this.$element.find(this.options.itemSelector);

            if (typeof this.options.itemWidth === 'function') {
                this.itemWidth = this.options.itemWidth();
            } else {
                this.itemWidth = this.options.itemWidth !== 0 ? this.options.itemWidth : carouselItems.outerWidth(true);
            }

            this.itemHeight = this.options.itemHeight !== 0 ? this.options.itemHeight : carouselItems.outerHeight(true); // Vertical Req
            this.$itemsWrapper = this.options.wrapperClass ? this.$element.find(this.options.wrapperClass) : $(carouselItems.parent());
            this.setVisibleItems(carouselItems);
            this.totalCarouselItems = carouselItems.length;
            this.supportTransitions = window.Modernizr.csstransforms && window.Modernizr.csstransitions ? true : false;
            this.scrollAmount = argsCopy.calcScroll ? this.calcScroll() : this.scrollAmount !== undefined ? this.scrollAmount : 0;
            this.moveBy = this.options.all ? this.visibileItems : 1;    // should the carousel move all items at once or by just 1

            if (this.options.bIncludePagination) {
                this.setNumberOfPages();
                this.setVisibleItemsTo2DecimalPlaces(carouselItems);
            }

            if (this.options.bHideNextPreviousIfAllItemsVisible) {
                this.hideNextPreviousIfAllItemsVisible();
            }

            addDataAtributes(carouselItems);
        },

        bindEvents: function bindEvents() {
            var selfContext = this,
                oCarouselSelectorReference = selfContext.$element[0] || null;

            this.$element.on("click", this.options.prevClass, function (oEvent) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
                if (!selfContext.$prevHandle.hasClass("disabled")) {
                    selfContext.moveLeft();
                }
            });

            this.$element.on("click", this.options.nextClass, function (oEvent) {
                oEvent.preventDefault();
                oEvent.stopPropagation();
                if (!selfContext.$nextHandle.hasClass("disabled")) {
                    selfContext.moveRight();
                }
            });

            if (this.options.centraliseThumbnails && this.options.centraliseThumbnails.enabled) {
                this.$element.on("click", this.options.itemSelector, function (oEvent, oTriggerData) {
                    oTriggerData = oTriggerData || {};
                    selfContext.centraliseActiveItems($(this));
                    if (!oTriggerData.cancelCallback && selfContext.options.centraliseThumbnails.clickActionCallback && typeof selfContext.options.centraliseThumbnails.clickActionCallback === 'function') {
                        selfContext.options.centraliseThumbnails.clickActionCallback(oEvent);
                    }
                    oEvent.stopPropagation();
                });
            }

            //swipe events
            if (!this.options.vertical) {
                this.$itemsWrapper.on("swipeLeft", this.moveRight.bind(this));
                this.$itemsWrapper.on("swipeRight", this.moveLeft.bind(this));
            }

            if (this.isElasticBounceEnabled() === true) {
                this.$itemsWrapper.on("touchstart", function (event) {
                    selfContext.iTouchStartXCoords = event.originalEvent.touches[0].pageX;
                });
                this.$itemsWrapper.on("touchend", function (event) {
                    selfContext.iTouchEndXCoords = event.originalEvent.changedTouches[0].pageX;
                });
            }

            // transition events
            // register click events on the handles
            this.$itemsWrapper.on("transitionend legacytransitionend", function () {
                selfContext.transitioning = false;
                selfContext.setTriggerStates();
            });
            this.$itemsWrapper.on("transitionstart legacytransitionstart", function () {
                selfContext.transitioning = true;
            });

            //scroll events
            if (selfContext.getWiggleStartupCeremonyEnabled()) {
                $(window).scroll(function () {
                    if (selfContext.bWiggleStartupAnimationHasRun === false) {
                        if (oCarouselSelectorReference !== null && window.inVisibleViewport(oCarouselSelectorReference, true, true) === true) {
                            selfContext.wiggleStartupCeremonyHandler();
                        }
                    }
                });
            }


        },
        add: function addCarouselItem(args) {
            var argsCopy = args || {},
                position = argsCopy.position || 'prepend',
                index = 0,
                callback = argsCopy.callback,
                newItem = argsCopy.item,
                $itemsList = this.$itemsWrapper,
                $output = null,
                $addedItem = null;

            if (position === 'prepend') {
                $itemsList.prepend(newItem);
            } else if (position === 'append') {
                $itemsList.append(newItem);
            } else if (typeof position === 'number') {
                index = position - 1;
                $itemsList.find('[data-index="' + index + '"]').before(newItem);
            } else if (typeof position === 'function') {
                $output = $(position($itemsList));

                if ($output.length) {
                    index = $output.data('index');
                    $output.before(newItem);
                }
            }

            this.adjust();

            if (position === 'prepend') {
                $addedItem = $itemsList.children().first();
            } else if (position === 'append') {
                $addedItem = $itemsList.children().last();
            } else if (typeof position === 'number' || typeof position === 'function') {
                $addedItem = $itemsList.find('[data-index="' + index + '"]');
            }

            if (typeof callback === 'function') {
                callback($addedItem);
            }
        },
        remove: function removeCarouselItem(args) {
            var argsCopy = args || {},
                position = argsCopy.position,
                index = 0,
                callback = argsCopy.callback,
                $itemsList = this.$itemsWrapper,
                $output = null;

            if (position === 'first') {
                $itemsList.children().first().remove();
            } else if (position === 'last') {
                $itemsList.children().last().remove();
            } else if (position === 'all') {
                $itemsList.children().remove();
            } else if (typeof position === 'number') {
                index = position - 1;
                $itemsList.find('[data-index="' + index + '"]').remove();
            } else if (typeof position === 'function') {
                $output = $(position($itemsList));

                if ($output.length) {
                    $output.remove();
                }
            }

            this.adjust();

            if (typeof callback === 'function') {
                callback();
            }
        },
        destroy: function destroyCarousel() {
            var i = 0;

            this.$element.data('carousel', null).off();
            this.$itemsWrapper.attr('style', '').off()[0].innerHTML = '';

            for (i = 0; i < aCarousels.length; i += 1) {
                if (aCarousels[i].$element === this.$element) {
                    aCarousels.splice(i, 1);
                }
            }

        },
        calcScroll: function calcScrollAmount() {
            var isNegative = false,
                scrollAmount = 0;

            if (this.scrollAmount === undefined) {
                return scrollAmount;
            }

            if (this.scrollAmount < 0) {
                isNegative = true;
            }

            if (this.visibileItems === 1) {
                scrollAmount = this.options.vertical ? this.itemHeight : this.itemWidth;
            }

            return isNegative ? -scrollAmount : scrollAmount;
        },
        centraliseActiveItems: function centraliseActiveItems($context) {
            if (!isNaN(this.visibileItems) && !$context.hasClass(this.options.itemSelectorActive)) {
                var iMiddleItem = Math.ceil(this.visibileItems / 2),
                    iClickedItem = $context.index() + 1,
                    iMaxLeftValue = iMiddleItem,
                    iMaxRightValue = this.totalItems() - (iMiddleItem - 1),
                    iMoveBy = iMiddleItem - iClickedItem;

                // WHEN user clicks on an item AND it can move to the centre THEN it should scroll it to the centre
                if (iClickedItem >= iMaxLeftValue && iClickedItem <= iMaxRightValue) {
                    this.move(iMoveBy);
                } else {
                    // OTHERWISE it should scroll the last item into view
                    // if (iClickedItem >= iMiddleItem && iClickedItem <= this.totalItems()) {
                    if (iClickedItem >= iMiddleItem && iClickedItem <= this.totalItems() && iClickedItem >= this.visibileItems) {
                        this.move(-1 * (this.totalItems() - this.visibileItems));
                        // OR the first item into view
                    } else {
                        this.move(0);
                    }
                }

                $(this.options.itemSelector, this.$element).removeClass(this.options.itemSelectorActive);
                $context.addClass(this.options.itemSelectorActive);
            }
        },
        // move the carousel by an x amount, the direction is determined by the sign of the number
        move: function move(by, bCalledFromAdjust) {

            this.scrollAmount = this.options.vertical ? by * this.itemHeight : by * this.itemWidth;

            if (this.options.stopOnLastItem) {
                if (this.options.vertical) {
                    this.disableRightArrow = this.scrollAmount <= (-1 * ((this.totalItems() * this.itemHeight) - (this.visibileItems * this.itemHeight))) ? true : false;
                    if (this.scrollAmount <= (-1 * ((this.totalItems() * this.itemHeight) - ((this.visibileItems - 1) * this.itemHeight)))) {
                        return;
                    }
                } else {
                    this.disableRightArrow = this.scrollAmount <= (-1 * ((this.totalItems() * this.itemWidth) - (this.visibileItems * this.itemWidth))) ? true : false;
                    if (this.scrollAmount <= (-1 * ((this.totalItems() * this.itemWidth) - ((this.visibileItems - 1) * this.itemWidth)))) {
                        return;
                    }
                }
            }

            if (this.options.scrollLimit === 0) {
                this.animate(this.scrollAmount);
            } else {
                if (this.scrollAmount > 0) {
                    this.scrollAmount = 0;
                }

                if (this.options.vertical) {
                    if (this.scrollAmount < (-1 * this.options.scrollLimit * this.itemHeight)) {
                        this.scrollAmount = -1 * this.options.scrollLimit * this.itemHeight;
                    }
                } else {
                    if (this.scrollAmount < (-1 * this.options.scrollLimit * this.itemWidth)) {
                        this.scrollAmount = -1 * this.options.scrollLimit * this.itemWidth;
                    }
                }

                this.animate(this.scrollAmount);
            }

            if (this.options.afterMove && typeof this.options.afterMove === 'function') {
                if (!bCalledFromAdjust) {
                    this.options.afterMove(by);
                }
            }

            if (this.options.bIncludePagination) {
                this.oCarouselPagination.afterMoveHandler();
            }
        },
        animate: function animate(iScrollAmount) {
            var selfContext = this;
            if (selfContext.$itemsWrapper.length > 0) {
                if (selfContext.supportTransitions) {
                    if (selfContext.options.vertical) {
                        selfContext.$itemsWrapper.css({
                            transform: 'translate3d(0, ' + iScrollAmount + 'px, 0)'
                        });
                    } else {
                        selfContext.$itemsWrapper.css({
                            transform: 'translate3d(' + iScrollAmount + 'px, 0, 0)'
                        });
                    }
                } else {
                    selfContext.$itemsWrapper.trigger('legacytransitionstart');

                    if (selfContext.options.vertical) {
                        selfContext.$itemsWrapper.animate({
                            top: iScrollAmount
                        }, 100, function () {
                            selfContext.$itemsWrapper.trigger('legacytransitionend');
                        });
                    } else {
                        selfContext.$itemsWrapper.animate({
                            marginLeft: iScrollAmount
                        }, 100, function () {
                            selfContext.$itemsWrapper.trigger('legacytransitionend');
                        });
                    }
                }
            }
        },
        peep: function peep(by) {
            this.animate(this.scrollAmount + parseInt((by * this.itemWidth), 10));
        },
        /*
         returns the current index of the carousel, i.e how much we have moved.
         The sign on the returned value indicates the direction, e.g -10 means we have move
         ten items to the right
         */
        currentIndex: function currentIndex() {
            return this.options.vertical ? Math.round(this.scrollAmount / this.itemHeight) : Math.round(this.scrollAmount / this.itemWidth);
        },
        start: function start() {
            var selfContext = this;

            // this bit is due to our layout, the active classes goes on the parent of the handle element
            // set these before setup because these are used in setup if e.g. bHideNextPreviousIfAllItemsVisible option is true
            this.$nextHandle = $(this.$element.find(this.options.nextClass).parent());
            this.$prevHandle = $(this.$element.find(this.options.prevClass).parent());

            this.setup();
            this.bindEvents();

            if (this.options.enablePeep) {
                this.$nextHandle.mouseenter(function (evt) {
                    if (!selfContext.transitioning && !selfContext.$nextHandle.hasClass("disabled")) {
                        var li = $($(evt.target).parent()).parent();
                        if (!li.hasClass("disabled")) {
                            selfContext.peep(-selfContext.options.peepThreshold);
                        }
                    }
                });
                this.$prevHandle.mouseenter(function (evt) {
                    if (!selfContext.transitioning && !selfContext.$prevHandle.hasClass("disabled")) {
                        var li = $($(evt.target).parent()).parent();
                        if (!li.hasClass("disabled")) {
                            selfContext.peep(selfContext.options.peepThreshold);
                        }
                    }
                });

                this.$prevHandle.mouseleave(this.adjust.bind(this));
                this.$nextHandle.mouseleave(this.adjust.bind(this));
            }
        },
        /*
         This should be called should in case the width of our carousel item changes, e.g an orientation
         change
         */
        adjust: function adjust(opts) {
            this.setup(opts);

            if (this.options.bIncludePagination) {
                if (this.moveToFirstItemInPageRequired()) {
                    this.moveToFirstItemInPage();
                } else {
                    this.move(this.calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces(), true);
                }
                this.reInitialisePagination();
            } else {
                var cIndex = this.currentIndex(),
                    leftOvers = this.totalItems() - Math.abs(cIndex);

                if (leftOvers < this.visibileItems) {
                    this.move(Math.min(cIndex + 1, 0), true);
                } else {
                    this.move(cIndex, true);
                }
            }

            this.setTriggerStates();
        },
        reset: function reset() {
            this.move(0);
        },
        setTriggerStates: function setTriggerStates() {
            if (this.options.enableAutoHideArrows) {
                this.$prevHandle.toggleClass("disabled", this.canMoveRight() || this.isCarouselFull());
                this.$nextHandle.toggleClass("disabled", this.canMoveLeft() || this.isCarouselFull() || this.disableRightArrow || this.moveLeftWouldShowUnwantedWhitespace());
            }
        },
        canMoveLeft: function canMoveLeft() {
            var cIndex = Math.abs(this.currentIndex()),
                totalItems = this.totalItems();

            if (this.options.scrollLimit > 0) {
                totalItems = this.options.scrollLimit + 1;
            }
            return (cIndex + this.moveBy) >= totalItems;
        },
        isCarouselFull: function isCarouselFull() {
            return this.totalItems() < this.visibileItems;
        },
        canMoveRight: function canMoveRight() {
            return this.currentIndex() === 0;
        },
        setResponsiveEvents: function setResponsiveEvents() {
            var adjustFunc = this.adjust.bind(this);

            $(window).resize(function () {
                setTimeout(adjustFunc, 250);
            });
        },
        moveRight: function moveRight() {
            var totalMoved = Math.abs(this.currentIndex()),
                remaining = this.totalItems() - (totalMoved + this.moveBy),
                moveThreshold,
                iElasticBounceDirection = 1;

            if (this.options.bIncludePagination) {
                moveThreshold = this.calculateMoveThresholdForMoveRightWithPagination(remaining);
            } else {
                moveThreshold = this.currentIndex() - Math.min(this.moveBy, remaining);
            }

            if (this.options.continuousLoop && remaining === 0) {
                moveThreshold = 0;
            }

            this.move(moveThreshold);

            if (this.isElasticBounceEnabled() === true && this.$nextHandle.hasClass('disabled')) {
                this.elasticBounceDistanceHandler();
                this.elasticBounceHandler(iElasticBounceDirection);
            }
        },
        moveLeft: function moveLeft() {
            var moveThreshold = Math.min(this.currentIndex() + this.moveBy, 0),
                iPreviousSlideCurrentIndex = this.currentIndex(),
                iElasticBounceDirection = 0;

            if (this.options.continuousLoop && this.currentIndex() === moveThreshold) {
                moveThreshold = this.totalItems() - 1;
                moveThreshold = -1 * moveThreshold;
            }

            if (this.moveToFirstItemInLastPage()) {
                moveThreshold = this.calculateIndexOfFirstItemInLastPage();
            }

            this.move(moveThreshold);

            if (this.isElasticBounceEnabled() === true && iPreviousSlideCurrentIndex === 0) {
                this.elasticBounceDistanceHandler();
                this.elasticBounceHandler(iElasticBounceDirection);
            }
        },
        totalItems: function totalItems() {
            return this.totalCarouselItems;
        },
        isElasticBounceEnabled: function isElasticBounceEnabled() {
            var bIsElasticBounceEnabled = false;

            if (this.options.elasticBounceOnEmptySwipe === true && this.options.continuousLoop === false && this.supportTransitions) {
                bIsElasticBounceEnabled = true;
            }
            return bIsElasticBounceEnabled;
        },
        elasticBounceHandler: function elasticBounceHandler(iElasticBounceDirection) {
            var selfContext = this,
                iBounceSpeed = selfContext.options.iBounceSpeed || 250;

            if (iElasticBounceDirection === "undefined" || iElasticBounceDirection === undefined) {
                return;
            }
            if (selfContext.$itemsWrapper.length > 0) {
                if (selfContext.getIsCurrentBouncing() === false) {
                    selfContext.setIsCurrentlyBouncing(true);
                    selfContext.elasticBounceOut(iElasticBounceDirection);
                    setTimeout(function elasticBounceReturnBounceHandler() {
                        selfContext.elasticBounceReset();
                        selfContext.setIsCurrentlyBouncing(false);
                    }, iBounceSpeed);
                }
            }
        },
        elasticBounceOut: function elasticBounceOut(iElasticBounceDirection) {
            if (iElasticBounceDirection === "undefined" || iElasticBounceDirection === undefined) {
                return;
            }
            if (iElasticBounceDirection === 1) {
                this.animate((this.scrollAmount - this.getBounceDistance()));
            } else {
                this.animate((this.scrollAmount + this.getBounceDistance()));
            }
        },
        elasticBounceReset: function elasticBounceReset() {
            this.animate(this.scrollAmount);
        },
        setIsCurrentlyBouncing: function setIsCurrentlyBouncing(bCurrentlyBouncing) {
            if (bCurrentlyBouncing !== "undefined" && bCurrentlyBouncing !== undefined) {
                this.bouncing = bCurrentlyBouncing;
            }
        },
        getIsCurrentBouncing: function getIsCurrentBouncing() {
            return this.bouncing;
        },
        elasticBounceDistanceHandler: function elasticBounceDistanceHandler() {
            var iTouchStartXCoords = this.iTouchStartXCoords,
                iTouchEndXCoords = this.iTouchEndXCoords,
                iCarouselWidth = (this.itemWidth * this.moveBy),
                iDistanceTravelled = Math.abs(iTouchStartXCoords - iTouchEndXCoords),
                iBounceDistance = Math.floor((iDistanceTravelled / iCarouselWidth) * 100);

            this.setBounceDistance(iBounceDistance);
        },
        setBounceDistance: function setBounceDistance(iBounceDistance) {
            if (iBounceDistance !== "undefined" && iBounceDistance !== undefined) {
                this.iBounceDistance = iBounceDistance;
            }
        },
        getBounceDistance: function getBounceDistance() {
            return this.iBounceDistance;
        },
        getVisibleItems: function getVisibleItems() {
            return this.visibileItems;
        },
        // calculate each time to avoid value getting out of sync
        currentPageIndex: function currentPageIndex() {
            var iCurrentIndex = this.currentIndex(),
                iItemsPerPage = this.getVisibleItems(),
                iHighestIndexOfItem = this.totalItems() - 1,
                iCurrentPageIndex,
                iHighestIndexOfPage;

            if (Math.abs(iCurrentIndex) > iHighestIndexOfItem) {
                iCurrentIndex = iHighestIndexOfItem;
            }

            if (iItemsPerPage < 1) {
                iCurrentPageIndex = 0;
            } else {
                iCurrentPageIndex = Math.round(Math.abs(iCurrentIndex) / iItemsPerPage);
                iHighestIndexOfPage = this.getNumberOfPages() - 1;
                if (iCurrentPageIndex > iHighestIndexOfPage) {
                    iCurrentPageIndex = iHighestIndexOfPage;
                }
            }

            return iCurrentPageIndex;
        },
        getNumberOfPages: function getNumberOfPages() {
            return this.iNumberOfPages;
        },
        setNumberOfPages: function setNumberOfPages() {
            var iTotalNumberOfItems = this.totalItems(),
                iNumberOfItemsPerPage = this.getVisibleItems();
            this.iNumberOfPages = this.calculateNumberOfPages(iTotalNumberOfItems, iNumberOfItemsPerPage);
        },
        calculateNumberOfPages: function calculateNumberOfPages(iTotalNumberOfItems, iItemsPerPage) {
            var iNumberOfPages = 0;

            if (iItemsPerPage > 0) {
                iNumberOfPages = Math.ceil(iTotalNumberOfItems / iItemsPerPage);
                if (iNumberOfPages < 0) {
                    iNumberOfPages = 0;
                }
            }
            return iNumberOfPages;
        },
        moveToPage: function moveToPage(iSelectedPageIndex) {
            var iCurrentPageIndex = this.currentPageIndex(),
                iNumberOfPagesToMove,
                i,
                j;

            if (iSelectedPageIndex >= 0 && iSelectedPageIndex < this.getNumberOfPages()) {

                iNumberOfPagesToMove = iSelectedPageIndex - iCurrentPageIndex;

                if (iNumberOfPagesToMove < 0) {
                    iNumberOfPagesToMove = Math.abs(iNumberOfPagesToMove);
                    for (i = 0; i < iNumberOfPagesToMove; i++) {
                        this.moveLeft();
                    }
                } else {
                    for (j = 0; j < iNumberOfPagesToMove; j++) {
                        this.moveRight();
                    }
                }
            }
        },
        getWiggleStartupCeremonyEnabled: function getWiggleStartupCeremonyEnabled() {
            var bIsWiggleStartupCeremonyEnabled = false;

            if (this.options.wiggleStartupCeremony === true && this.options.continuousLoop === false && this.supportTransitions) {
                if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
                    bIsWiggleStartupCeremonyEnabled = true;
                }
            }
            return bIsWiggleStartupCeremonyEnabled;
        },
        wiggleStartupCeremonyHandler: function wiggleStartupCeremonyHandler() {
            var selfContext = this,
                iCarouselWidth = (selfContext.itemWidth * selfContext.moveBy),
                iWiggleDistance = Math.floor(iCarouselWidth / 3);

            if (isNaN(iWiggleDistance) === false && iWiggleDistance > 0 && selfContext.bWiggleStartupAnimationHasRun === false && selfContext.iNumberOfPages > 1) {
                selfContext.animate((selfContext.scrollAmount - iWiggleDistance));

                setTimeout(function wiggleStartupCeremonyReturnHandler() {
                    selfContext.elasticBounceReset();
                    selfContext.bWiggleStartupAnimationHasRun = true;
                }, selfContext.options.iWiggleAnimationDuration);
            }
        },
        moveToFirstItemInPage: function moveToFirstItemInPage() {
            var iFirstItemInPage = this.currentPageIndex() * this.getVisibleItems(),
                iIndexOfFirstItemInPage = 0;
            if (iFirstItemInPage !== 0) {
                iIndexOfFirstItemInPage = -iFirstItemInPage;
            }
            this.move(iIndexOfFirstItemInPage, true); // move to item at first index in page
        },
        reInitialisePagination: function reInitialisePagination() {
            this.oCarouselPagination.init();
        },
        hideNextPreviousIfAllItemsVisible: function hideNextPreviousIfAllItemsVisible() {
            if (this.totalItems() <= this.getVisibleItems()) {
                this.$prevHandle.addClass(this.options.sHiddenClass);
                this.$nextHandle.addClass(this.options.sHiddenClass);
            } else {
                this.$prevHandle.removeClass(this.options.sHiddenClass);
                this.$nextHandle.removeClass(this.options.sHiddenClass);
            }
        },
        setVisibleItems: function setVisibleItems(carouselItem) {
            var containerWidth = $(this.$itemsWrapper.parent()).outerWidth(),
                padding,
                unroundedNumberOfVisibleItems,
                containerHeight = $(this.$itemsWrapper.parent()).outerHeight(true);

            if (this.options.bFitsItemWidthsAndPaddingForNumberOfItemsMinusOne) {
                padding = this.itemWidth - carouselItem.width();
                unroundedNumberOfVisibleItems = (containerWidth + padding) / this.itemWidth;
                this.visibileItems = Math.floor(unroundedNumberOfVisibleItems);
            } else {
                if (this.options.vertical) {
                    this.visibileItems = Math.floor(containerHeight / this.itemHeight);
                } else {
                    this.visibileItems = Math.round(containerWidth / this.itemWidth);
                }
            }
        },
        // START - functions to support the design when limitWhitespaceAfterLastItemInCurrentBreakpoint returns true
        // if this returns true the last item should stay to the right of the carousel rather than moving to the left leaving whitespace to the right
        // as per last image of SVP and vTablet design carousel_spec  09/11/2015 attached to GFO-4856
        limitWhitespaceAfterLastItemInCurrentBreakpoint: function limitWhitespaceAfterLastItemInCurrentBreakpoint() {
            if (this.options.oPaginationOptions.breakpointsToAvoidMovingPastLastItem !== undefined) {
                if ((breakpoint.mobile && this.options.oPaginationOptions.breakpointsToAvoidMovingPastLastItem.mobile !== undefined) ||
                        (breakpoint.vTablet && this.options.oPaginationOptions.breakpointsToAvoidMovingPastLastItem.vTablet !== undefined)) {
                    return true;
                }
            }

            return false;
        },
        getWhitespaceToLeaveToRightOfCarousel: function getWhitespaceToLeaveToRightOfCarousel() {
            if (this.limitWhitespaceAfterLastItemInCurrentBreakpoint()) {
                if (breakpoint.mobile) {
                    return this.options.oPaginationOptions.breakpointsToAvoidMovingPastLastItem.mobile.paddingToRightOfCarousel;
                }
                if (breakpoint.vTablet) {
                    return this.options.oPaginationOptions.breakpointsToAvoidMovingPastLastItem.vTablet.paddingToRightOfCarousel;
                }
            }
            return 0;
        },
        getVisibleItemsTo2DecimalPlaces: function getVisibleItemsTo2DecimalPlaces() {
            return this.visibleItemsTo2DecimalPlaces;
        },
        setVisibleItemsTo2DecimalPlaces: function setVisibleItemsTo2DecimalPlaces(carouselItem) {
            var containerWidth = $(this.$itemsWrapper.parent()).outerWidth(),
                padding,
                paddingToRightOfCarousel,
                unroundedNumberOfVisibleItems;

            if (this.options.bFitsItemWidthsAndPaddingForNumberOfItemsMinusOne) {
                paddingToRightOfCarousel = this.getWhitespaceToLeaveToRightOfCarousel();
                padding = this.itemWidth - carouselItem.width();
                unroundedNumberOfVisibleItems = (containerWidth - paddingToRightOfCarousel + padding) / this.itemWidth;

                this.visibleItemsTo2DecimalPlaces = Math.round(unroundedNumberOfVisibleItems * 100) / 100;
            }
        },
        currentIndexTo2DecimalPlaces: function currentIndexTo2DecimalPlaces() {
            return Math.round((this.scrollAmount / this.itemWidth) * 100) / 100;
        },
        moveLeftWouldShowUnwantedWhitespace: function moveLeftWouldShowUnwantedWhitespace() {
            return this.limitWhitespaceAfterLastItemInCurrentBreakpoint() && this.isShowingLastItemToRightOfCarousel();
        },
        moveToFirstItemInLastPage: function moveToFirstItemInLastPage() {
            var bShowingWholeOfFirstItemInPage = (this.currentIndexTo2DecimalPlaces() === this.currentIndex());
            return this.moveLeftWouldShowUnwantedWhitespace() && !bShowingWholeOfFirstItemInPage;
        },
        calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces: function calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces() {
            return Math.round((this.getVisibleItemsTo2DecimalPlaces() - this.totalItems()) * 100) / 100;
        },
        calculateIndexOfFirstItemInLastPage: function calculateIndexOfFirstItemInLastPage() {
            return Math.ceil(this.calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces());
        },
        isShowingLastItemToRightOfCarousel: function isShowingLastItemToRightOfCarousel() {
            var indexOfFirstItemInLastPage = this.calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces();

            if (Math.abs(this.currentIndexTo2DecimalPlaces()) === Math.abs(indexOfFirstItemInLastPage)) {
                return true;
            }
            return false;
        },
        isShowingLastItem: function isShowingLastItem() {
            var iIndexOfFirstItemInLastPage = this.calculateIndexOfFirstItemInLastPage();

            if (Math.abs(this.currentIndex()) >= Math.abs(iIndexOfFirstItemInLastPage)) {
                return true;
            }
            return false;
        },
        moveToFirstItemInPageRequired: function moveToFirstItemInPageRequired() {
            return !(this.limitWhitespaceAfterLastItemInCurrentBreakpoint() && this.isShowingLastItem());
        },
        calculateMoveThresholdForMoveRightWithPagination: function calculateMoveThresholdForMoveRightWithPagination(remaining) {
            var moveThreshold;

            if (this.limitWhitespaceAfterLastItemInCurrentBreakpoint()) {
                if (remaining <= this.moveBy) {
                    moveThreshold = this.calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces();
                } else {
                    moveThreshold = this.currentIndex() - this.moveBy;
                }
            } else {
                if (remaining > 0) {
                    moveThreshold = this.currentIndex() - this.moveBy;
                } else {
                    moveThreshold = this.currentIndex();
                }
            }
            return moveThreshold;
        }
        // END - functions to support the design when limitWhitespaceAfterLastItemInCurrentBreakpoint returns true
    };

    $.fn.carousel = function (opts) {
        return $(this).each(function (index, element) {
            var ele = $(element),
                carousel = new ResCarousel(ele, opts);
            index = index !== undefined || index !== null ? index : "";
            ele.data("carousel", carousel);
        });
    };

    return ResCarousel;
});
