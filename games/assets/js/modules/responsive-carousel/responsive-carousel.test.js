define(['domlib', 'modules/responsive-carousel/responsive-carousel'], function ($, ResCarousel) {
    'use strict';

    describe('Responsive Carousel module -', function () {
        var mock,
            oResponsiveCarouselInstance,
            oResponsiveCarouselInstanceWithSettings,
            expected;

        beforeEach(function () {
            mock = {
                oSettings: {
                    elasticBounceOnEmptySwipe: true
                },
                $carouselElement: $('<div class="newCarousel"/>'),
                $carouselElementAlt: $('<div class="newCarousel"/>'),
                sCarouselClassSelector: 'carousel'
            };
        });

        afterEach(function () {
            oResponsiveCarouselInstance = null;
            oResponsiveCarouselInstanceWithSettings = null;
            expected = null;
        });

        describe('GIVEN that the Responsive Carousel has been instantiated', function () {
            it('THEN it should have been bound to jQuery', function () {
                expect($.fn.carousel).not.toBeUndefined();
            });
        });

        describe('GIVEN that the Responsive Carousel has been called with a jQuery element', function () {
            beforeEach(function () {
                mock.$carouselElement.carousel();
            });

            it('THEN it should be attached to a jQuery element', function () {
                expect(mock.$carouselElement.data(mock.sCarouselClassSelector)).not.toBeUndefined();
                expect(mock.$carouselElement.data(mock.sCarouselClassSelector)).not.toBeNull();
            });
        });

        describe('GIVEN that the Responsive Carousel has no customised options', function () {
            beforeEach(function () {
                mock.$carouselElement.carousel();
                oResponsiveCarouselInstance = mock.$carouselElement.data(mock.sCarouselClassSelector);
            });

            it('THEN the Elastic Bounce feature should be disabled by default', function () {
                expect(oResponsiveCarouselInstance.isElasticBounceEnabled()).toBe(false);
            });

            describe('WHEN the Responsive Carousel has loaded correctly', function () {
                it('THEN it should have scope of the start() method', function () {
                    expect(oResponsiveCarouselInstance.start()).not.toBeNull();
                });
                it('THEN it should have scope of the setup() method', function () {
                    expect(oResponsiveCarouselInstance.setup()).not.toBeNull();
                });
                it('THEN it should have scope of the move() method', function () {
                    expect(oResponsiveCarouselInstance.move()).not.toBeNull();
                });
                it('THEN it should have scope of the animate() method', function () {
                    expect(oResponsiveCarouselInstance.animate()).not.toBeNull();
                });
                it('THEN it should have scope of the reset() method', function () {
                    expect(oResponsiveCarouselInstance.reset()).not.toBeNull();
                });
            });
        });

        describe('GIVEN that the Responsive Carousel has customised options', function () {
            beforeEach(function () {
                mock.$carouselElementAlt.carousel(mock.oSettings);
                oResponsiveCarouselInstanceWithSettings = mock.$carouselElementAlt.data(mock.sCarouselClassSelector);
            });

            describe('WHEN the Elastic Bounce feature is enabled in options', function () {
                it('THEN the Elastic Bounce feature should be enabled', function () {
                    expect(oResponsiveCarouselInstanceWithSettings.isElasticBounceEnabled()).toBe(true);
                });
            });
        });

        describe('Calculate the current page index', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();
            });

            describe('GIVEN the total number of items is 6', function () {
                beforeEach(function () {
                    spyOn(ResCarousel.prototype, "totalItems").and.returnValue(6);
                    spyOn(ResCarousel.prototype, "getNumberOfPages").and.returnValue(3);
                });

                describe('GIVEN the current index is 0 and the number of items per page is 2', function () {
                    it('THEN return the current page index as 0', function () {
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(2);
                        expected = 0;
                        expect(oResponsiveCarouselInstance.currentPageIndex()).toEqual(expected);
                    });
                });

                describe('GIVEN the current index is 0 and the number of items per page is 0', function () {
                    it('THEN return the current page index as 0', function () {
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(0);
                        expected = 0;
                        expect(oResponsiveCarouselInstance.currentPageIndex()).toEqual(expected);
                    });
                });

                describe('GIVEN the current index is 0 and the number of items per page is -2', function () {
                    it('THEN return the current page index as 0', function () {
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(-2);
                        expected = 0;
                        expect(oResponsiveCarouselInstance.currentPageIndex()).toEqual(expected);
                    });
                });

                describe('GIVEN the current index is -2 and the number of items per page is 2', function () {
                    it('THEN return the current page index as 1', function () {
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-2);
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(2);
                        expected = 1;
                        expect(oResponsiveCarouselInstance.currentPageIndex()).toEqual(expected);
                    });
                });

                describe('GIVEN the current index is 2 and the number of items per page is 2', function () {
                    it('THEN return the current page index as 1', function () {
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(2);
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(2);
                        expected = 1;
                        expect(oResponsiveCarouselInstance.currentPageIndex()).toEqual(expected);
                    });
                });

                describe('GIVEN the current index is -2 and the number of items per page is -2', function () {
                    it('THEN return the current page index as 0', function () {
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-2);
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(-2);
                        expected = 0;
                        expect(oResponsiveCarouselInstance.currentPageIndex()).toEqual(expected);
                    });
                });

                describe('GIVEN the current index is -7 and the number of items per page is 2', function () {
                    it('THEN return the current page index as 2', function () {
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-7);
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(2);
                        expected = 2;
                        expect(oResponsiveCarouselInstance.currentPageIndex()).toEqual(expected);
                    });
                });

                describe('GIVEN the current index is 7 and the number of items per page is 2', function () {
                    it('THEN return the current page index as 2', function () {
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(7);
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(2);
                        expected = 2;
                        expect(oResponsiveCarouselInstance.currentPageIndex()).toEqual(expected);
                    });
                });
            });
        });

        describe('Calculate the number of pages', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();
            });
            describe('GIVEN the total number of items and the number of items per page', function () {

                it('THEN return the number of pages', function () {
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(12, 3)).toBe(4);
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(0, 3)).toBe(0);
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(1, 3)).toBe(1);
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(4, 3)).toBe(2);
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(4, 0)).toBe(0);
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(15, 3)).toBe(5);
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(-6, 2)).toBe(0);
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(6, -2)).toBe(0);
                    expect(oResponsiveCarouselInstance.calculateNumberOfPages(-6, -2)).toBe(0);
                });
            });
        });

        describe('GIVEN Moving right', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();

                spyOn(ResCarousel.prototype, "move");
            });

            describe('WHEN elastic bounce is not enabled ', function () {
                beforeEach(function () {
                    spyOn(ResCarousel.prototype, "isElasticBounceEnabled").and.returnValue(false);
                });

                describe('AND continuousLoop is not enabled ', function () {
                    beforeEach(function () {
                        oResponsiveCarouselInstance.options.continuousLoop = false;
                    });

                    describe('AND pagination is enabled ', function () {
                        beforeEach(function () {
                            oResponsiveCarouselInstance.options.bIncludePagination = true;
                        });

                        describe('AND the total items is 3, 3 per page, the current index is 0 ', function () {
                            it('THEN move is called with the expected moveThreshold of 0', function () {
                                spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(3);
                                oResponsiveCarouselInstance.moveBy = 3;
                                expected = 0;

                                oResponsiveCarouselInstance.moveRight();

                                expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                            });
                        });

                        describe('AND that the total items is 4, 3 per page ', function () {
                            beforeEach(function () {
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(4);
                                oResponsiveCarouselInstance.moveBy = 3;
                            });

                            describe('AND the current index is 0 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -3 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-3);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });
                        });

                        describe('AND that the total items is 5, 3 per page ', function () {
                            beforeEach(function () {
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(5);
                                oResponsiveCarouselInstance.moveBy = 3;
                            });

                            describe('AND the current index is 0 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -3 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-3);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });
                        });

                        describe('AND that the total items is 6, 3 per page ', function () {
                            beforeEach(function () {
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(6);
                                oResponsiveCarouselInstance.moveBy = 3;
                            });

                            describe('AND the current index is 0 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -3 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-3);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });
                        });

                        describe('AND that the total items is 7, 3 per page ', function () {
                            beforeEach(function () {
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(7);
                                oResponsiveCarouselInstance.moveBy = 3;
                            });

                            describe('AND the current index is 0 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -3 ', function () {
                                it('THEN move is called with the expected moveThreshold of -6', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-3);
                                    expected = -6;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -6 ', function () {
                                it('THEN move is called with the expected moveThreshold of -6', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-6);
                                    expected = -6;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });
                        });
                    });

                    describe('AND that pagination is NOT enabled ', function () {
                        beforeEach(function () {
                            oResponsiveCarouselInstance.options.bIncludePagination = false;
                        });

                        describe('AND that the total items is 3, 1 page of 3, the current index is 0 ', function () {
                            it('THEN move is called with the expected moveThreshold of 0', function () {
                                spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(3);
                                oResponsiveCarouselInstance.moveBy = 3;
                                expected = 0;

                                oResponsiveCarouselInstance.moveRight();

                                expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                            });
                        });

                        describe('AND that the total items is 4, 3 per page ', function () {
                            beforeEach(function () {
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(4);
                                oResponsiveCarouselInstance.moveBy = 3;
                            });

                            describe('AND the current index is 0 ', function () {
                                it('THEN move is called with the expected moveThreshold of -1', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                    expected = -1;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -3 ', function () {
                                it('THEN move is called with the expected moveThreshold of -1', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-3);
                                    expected = -1;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });
                        });

                        describe('AND that the total items is 5, 3 per page ', function () {
                            beforeEach(function () {
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(5);
                                oResponsiveCarouselInstance.moveBy = 3;
                            });

                            describe('AND the current index is 0 ', function () {
                                it('THEN move is called with the expected moveThreshold of -2', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                    expected = -2;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -2 ', function () {
                                it('THEN move is called with the expected moveThreshold of -2', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-2);
                                    expected = -2;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });
                        });

                        describe('AND that the total items is 6, 3 per page ', function () {
                            beforeEach(function () {
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(6);
                                oResponsiveCarouselInstance.moveBy = 3;
                            });

                            describe('AND the current index is 0 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -3 ', function () {
                                it('THEN move is called with the expected moveThreshold of -3', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-3);
                                    expected = -3;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });
                        });

                        describe('AND that the total items is 7, 3 per page, the current index is 0  ', function () {
                            beforeEach(function () {
                                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(7);
                                oResponsiveCarouselInstance.moveBy = 3;
                            });

                            it('THEN move is called with the expected moveThreshold of -3', function () {
                                spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(0);
                                expected = -3;

                                oResponsiveCarouselInstance.moveRight();

                                expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                            });

                            describe('AND the current index is -3 ', function () {
                                it('THEN move is called with the expected moveThreshold of -4', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-3);
                                    expected = -4;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });

                            describe('AND the current index is -4 ', function () {
                                it('THEN move is called with the expected moveThreshold of -4', function () {
                                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-4);
                                    expected = -4;

                                    oResponsiveCarouselInstance.moveRight();

                                    expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected);
                                });
                            });
                        });
                    });
                });
            });
        });
        describe('GIVEN Moving to first item in page ', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();

                spyOn(ResCarousel.prototype, "move");
            });
            describe('WHEN number of visible items is 3 ', function () {
                beforeEach(function () {
                    spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(3);
                });
                describe('AND current page has index 0 ', function () {
                    beforeEach(function () {
                        spyOn(ResCarousel.prototype, "currentPageIndex").and.returnValue(0);
                    });
                    it('THEN move is called with the expected index of 0', function () {
                        expected = 0;

                        oResponsiveCarouselInstance.moveToFirstItemInPage();

                        expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected, true);
                    });
                });
                describe('AND current page has index 3 ', function () {
                    beforeEach(function () {
                        spyOn(ResCarousel.prototype, "currentPageIndex").and.returnValue(1);
                    });
                    it('THEN move is called with the expected index of -3', function () {
                        expected = -3;

                        oResponsiveCarouselInstance.moveToFirstItemInPage();

                        expect(oResponsiveCarouselInstance.move).toHaveBeenCalledWith(expected, true);
                    });
                });
            });
        });
        describe('GIVEN Hide next and previous (e.g. arrows) if all items are visible in one page ', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();

                oResponsiveCarouselInstance.$prevHandle = TESCO.jasmineHelpers.createMockJqueryElement();
                oResponsiveCarouselInstance.$nextHandle = TESCO.jasmineHelpers.createMockJqueryElement();

                oResponsiveCarouselInstance.options.sHiddenClass = "displayNone";
            });
            describe('WHEN total number of items is 3 ', function () {
                beforeEach(function () {
                    spyOn(ResCarousel.prototype, "totalItems").and.returnValue(3);
                });
                describe('AND the number of visible items is 3 ', function () {
                    beforeEach(function () {
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(3);
                    });
                    it('THEN next and previous elements are hidden', function () {
                        oResponsiveCarouselInstance.hideNextPreviousIfAllItemsVisible();

                        expect(oResponsiveCarouselInstance.$prevHandle.addClass).toHaveBeenCalledWith(oResponsiveCarouselInstance.options.sHiddenClass);
                        expect(oResponsiveCarouselInstance.$nextHandle.addClass).toHaveBeenCalledWith(oResponsiveCarouselInstance.options.sHiddenClass);

                        expect(oResponsiveCarouselInstance.$prevHandle.removeClass).not.toHaveBeenCalled();
                        expect(oResponsiveCarouselInstance.$nextHandle.removeClass).not.toHaveBeenCalled();
                    });
                });
                describe('AND the number of visible items is 4 ', function () {
                    beforeEach(function () {
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(4);
                    });
                    it('THEN next and previous elements are hidden', function () {
                        oResponsiveCarouselInstance.hideNextPreviousIfAllItemsVisible();

                        expect(oResponsiveCarouselInstance.$prevHandle.addClass).toHaveBeenCalledWith(oResponsiveCarouselInstance.options.sHiddenClass);
                        expect(oResponsiveCarouselInstance.$nextHandle.addClass).toHaveBeenCalledWith(oResponsiveCarouselInstance.options.sHiddenClass);

                        expect(oResponsiveCarouselInstance.$prevHandle.removeClass).not.toHaveBeenCalled();
                        expect(oResponsiveCarouselInstance.$nextHandle.removeClass).not.toHaveBeenCalled();
                    });
                });
                describe('AND the number of visible items is 2 ', function () {
                    beforeEach(function () {
                        spyOn(ResCarousel.prototype, "getVisibleItems").and.returnValue(2);
                    });
                    it('THEN next and previous elements are not hidden', function () {
                        oResponsiveCarouselInstance.hideNextPreviousIfAllItemsVisible();

                        expect(oResponsiveCarouselInstance.$prevHandle.removeClass).toHaveBeenCalledWith(oResponsiveCarouselInstance.options.sHiddenClass);
                        expect(oResponsiveCarouselInstance.$nextHandle.removeClass).toHaveBeenCalledWith(oResponsiveCarouselInstance.options.sHiddenClass);

                        expect(oResponsiveCarouselInstance.$prevHandle.addClass).not.toHaveBeenCalled();
                        expect(oResponsiveCarouselInstance.$nextHandle.addClass).not.toHaveBeenCalled();
                    });
                });
            });
        });
        describe('GIVEN Calculating Index To Fit Last Item To Right of Carousel ', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();

                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(12);
            });
            describe('WHEN the number of visible items is not a whole number ', function () {
                describe('AND the decimal part of the number of visible items to 2 dp would round up to an integer ', function () {
                    beforeEach(function () {
                        oResponsiveCarouselInstance.visibleItemsTo2DecimalPlaces = 2.7;
                    });
                    it('THEN calculateIndexToFitLastItemToRightOfCarousel returns the expected value', function () {
                        expected = -9.3;

                        expect(oResponsiveCarouselInstance.calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces()).toEqual(expected);
                    });
                });
                describe('AND the decimal part of the number of visible items to 2 dp would round down to an integer ', function () {
                    beforeEach(function () {
                        oResponsiveCarouselInstance.visibleItemsTo2DecimalPlaces = 2.3;
                    });
                    it('THEN calculateIndexToFitLastItemToRightOfCarousel returns the expected value', function () {
                        expected = -9.7;

                        expect(oResponsiveCarouselInstance.calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces()).toEqual(expected);
                    });
                });
            });
            describe('WHEN number of visible items is a whole number ', function () {
                beforeEach(function () {
                    oResponsiveCarouselInstance.visibleItemsTo2DecimalPlaces = 2;
                });
                it('THEN calculateIndexToFitLastItemToRightOfCarousel returns the expected value', function () {
                    expected = -10;

                    expect(oResponsiveCarouselInstance.calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces()).toEqual(expected);
                });
            });
        });
        describe('GIVEN Calculating Index Of First Item on Last Page ', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();
                spyOn(ResCarousel.prototype, "totalItems").and.returnValue(12);
            });
            describe('WHEN the number of visible items is not a whole number ', function () {
                describe('AND the decimal part of the number of visible items to 3 dp would round up to an integer ', function () {
                    beforeEach(function () {
                        oResponsiveCarouselInstance.visibleItemsTo2DecimalPlaces = 2.7;
                    });

                    it('THEN calculateIndexOfFirstItemInLastPage returns the expected value', function () {
                        expected = -9;

                        expect(oResponsiveCarouselInstance.calculateIndexOfFirstItemInLastPage()).toEqual(expected);
                    });

                });
                describe('AND the decimal part of the number of visible items to 3 dp would round down to an integer ', function () {
                    beforeEach(function () {
                        oResponsiveCarouselInstance.visibleItemsTo2DecimalPlaces = 2.3;
                    });
                    it('THEN calculateIndexOfFirstItemInLastPage returns the expected value', function () {
                        expected = -9;

                        expect(oResponsiveCarouselInstance.calculateIndexOfFirstItemInLastPage()).toEqual(expected);
                    });
                });
            });
            describe('WHEN number of visible items is a whole number ', function () {
                beforeEach(function () {
                    oResponsiveCarouselInstance.visibleItemsTo2DecimalPlaces = 2;
                });
                it('THEN calculateIndexOfFirstItemInLastPage returns the expected value', function () {
                    expected = -10;

                    expect(oResponsiveCarouselInstance.calculateIndexOfFirstItemInLastPage()).toEqual(expected);
                });
            });
        });
        describe('GIVEN Need to determine if is Showing Last Item to Right of Carousel', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();
            });
            describe('WHEN current index (absolute value of) is greater than index of first item on last page ', function () {
                describe('AND current index is a whole number ', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-10);
                        spyOn(ResCarousel.prototype, "calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces").and.returnValue(-9);

                        expect(oResponsiveCarouselInstance.isShowingLastItemToRightOfCarousel()).toEqual(false);
                    });
                });
                describe('AND current index is a not a whole number ', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-9.6);
                        spyOn(ResCarousel.prototype, "calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces").and.returnValue(-9.45);

                        expect(oResponsiveCarouselInstance.isShowingLastItemToRightOfCarousel()).toEqual(false);
                    });
                });
            });
            describe('WHEN current index (absolute value of) is less than index of first item on last page ', function () {
                describe('AND current index is a whole number ', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-8);
                        spyOn(ResCarousel.prototype, "calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces").and.returnValue(-9);

                        expect(oResponsiveCarouselInstance.isShowingLastItemToRightOfCarousel()).toEqual(false);
                    });
                });
                describe('AND current index is not a whole number ', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-9.2);
                        spyOn(ResCarousel.prototype, "calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces").and.returnValue(-9.45);

                        expect(oResponsiveCarouselInstance.isShowingLastItemToRightOfCarousel()).toEqual(false);
                    });
                });
            });
            describe('WHEN current index (absolute value of) equals index of first item on last page ', function () {
                describe('AND current index is a whole number ', function () {
                    it('THEN return true', function () {
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-9);
                        spyOn(ResCarousel.prototype, "calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces").and.returnValue(-9);

                        expect(oResponsiveCarouselInstance.isShowingLastItemToRightOfCarousel()).toEqual(true);
                    });
                });
                describe('AND current index is not a whole number ', function () {
                    it('THEN return true', function () {
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-9.45);
                        spyOn(ResCarousel.prototype, "calculateIndexToFitLastItemToRightOfCarouselTo2DecimalPlaces").and.returnValue(-9.45);

                        expect(oResponsiveCarouselInstance.isShowingLastItemToRightOfCarousel()).toEqual(true);
                    });
                });
            });
        });
        describe('GIVEN Need to determine if is Showing Last Item', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();
            });
            describe('WHEN current index (absolute value of) is greater than index of first item on last page ', function () {
                it('THEN return true', function () {
                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-10);
                    spyOn(ResCarousel.prototype, "calculateIndexOfFirstItemInLastPage").and.returnValue(-9);

                    expect(oResponsiveCarouselInstance.isShowingLastItem()).toEqual(true);
                });
            });
            describe('WHEN current index (absolute value of) is less than index of first item on last page ', function () {
                it('THEN return false', function () {
                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-8);
                    spyOn(ResCarousel.prototype, "calculateIndexOfFirstItemInLastPage").and.returnValue(-9);

                    expect(oResponsiveCarouselInstance.isShowingLastItem()).toEqual(false);
                });
            });
            describe('WHEN current index (absolute value of) equals index of first item on last page ', function () {
                it('THEN return true', function () {
                    spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-9);
                    spyOn(ResCarousel.prototype, "calculateIndexOfFirstItemInLastPage").and.returnValue(-9);

                    expect(oResponsiveCarouselInstance.isShowingLastItem()).toEqual(true);
                });
            });
        });
        describe('GIVEN moving the carousel to the left (e.g. pressing right arrow) would show unwanted whitespace', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();
            });
            describe('WHEN the viewpoint is one of the ones that should not show whitespace to the right of the carousel after the last item ', function () {
                describe('AND the last item is already positioned to the right of the carousel ', function () {
                    it('THEN return true', function () {
                        spyOn(ResCarousel.prototype, "limitWhitespaceAfterLastItemInCurrentBreakpoint").and.returnValue(true);
                        spyOn(ResCarousel.prototype, "isShowingLastItemToRightOfCarousel").and.returnValue(true);

                        expect(oResponsiveCarouselInstance.moveLeftWouldShowUnwantedWhitespace()).toEqual(true);
                    });
                });
                describe('AND the last item is NOT already positioned to the right of the carousel ', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "limitWhitespaceAfterLastItemInCurrentBreakpoint").and.returnValue(true);
                        spyOn(ResCarousel.prototype, "isShowingLastItemToRightOfCarousel").and.returnValue(false);

                        expect(oResponsiveCarouselInstance.moveLeftWouldShowUnwantedWhitespace()).toEqual(false);
                    });
                });
            });
            describe('WHEN the viewpoint is NOT one of the ones that should not show whitespace to the right of the carousel after the last item ', function () {
                describe('AND the last item is already positioned to the right of the carousel ', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "limitWhitespaceAfterLastItemInCurrentBreakpoint").and.returnValue(false);
                        spyOn(ResCarousel.prototype, "isShowingLastItemToRightOfCarousel").and.returnValue(true);

                        expect(oResponsiveCarouselInstance.moveLeftWouldShowUnwantedWhitespace()).toEqual(false);
                    });
                });
                describe('AND the last item is NOT already positioned to the right of the carousel ', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "limitWhitespaceAfterLastItemInCurrentBreakpoint").and.returnValue(false);
                        spyOn(ResCarousel.prototype, "isShowingLastItemToRightOfCarousel").and.returnValue(false);

                        expect(oResponsiveCarouselInstance.moveLeftWouldShowUnwantedWhitespace()).toEqual(false);
                    });
                });
            });
        });
        describe('GIVEN moveToFirstItemInLastPage ', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();
            });
            describe('WHEN moving the carousel to the left (e.g. pressing right arrow) would show unwanted whitespace ', function () {
                describe('AND we are NOT already showing the whole of the first item in the page', function () {
                    it('THEN return true', function () {
                        spyOn(ResCarousel.prototype, "moveLeftWouldShowUnwantedWhitespace").and.returnValue(true);
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-9.453);
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-9);

                        expect(oResponsiveCarouselInstance.moveToFirstItemInLastPage()).toEqual(true);
                    });
                });
                describe('AND we are already showing the whole of the first item in the page', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "moveLeftWouldShowUnwantedWhitespace").and.returnValue(true);
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-9);
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-9);

                        expect(oResponsiveCarouselInstance.moveToFirstItemInLastPage()).toEqual(false);
                    });
                });
            });
            describe('WHEN moving the carousel to the left (e.g. pressing right arrow) would NOT show unwanted whitespace ', function () {
                describe('AND we are not already showing the whole of the first item in the page', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "moveLeftWouldShowUnwantedWhitespace").and.returnValue(false);
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-9.453);
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-9);

                        expect(oResponsiveCarouselInstance.moveToFirstItemInLastPage()).toEqual(false);
                    });
                });
                describe('AND we are already showing the whole of the first item in the page', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "moveLeftWouldShowUnwantedWhitespace").and.returnValue(false);
                        spyOn(ResCarousel.prototype, "currentIndexTo2DecimalPlaces").and.returnValue(-9);
                        spyOn(ResCarousel.prototype, "currentIndex").and.returnValue(-9);

                        expect(oResponsiveCarouselInstance.moveToFirstItemInLastPage()).toEqual(false);
                    });
                });
            });
        });
        describe('GIVEN moveToFirstItemInPageRequired ', function () {
            beforeEach(function () {
                spyOn(ResCarousel.prototype, "start");
                spyOn(ResCarousel.prototype, "setTriggerStates");
                spyOn(ResCarousel.prototype, "setResponsiveEvents");
                oResponsiveCarouselInstance = new ResCarousel();
            });
            describe('WHEN the viewpoint is one of the ones that should not show whitespace to the right of the carousel after the last item ', function () {
                describe('AND we are already showing some of the first item in the page', function () {
                    it('THEN return false', function () {
                        spyOn(ResCarousel.prototype, "limitWhitespaceAfterLastItemInCurrentBreakpoint").and.returnValue(true);
                        spyOn(ResCarousel.prototype, "isShowingLastItem").and.returnValue(true);

                        expect(oResponsiveCarouselInstance.moveToFirstItemInPageRequired()).toEqual(false);
                    });
                });
                describe('AND we are NOT already showing some of the first item in the page', function () {
                    it('THEN return true', function () {
                        spyOn(ResCarousel.prototype, "limitWhitespaceAfterLastItemInCurrentBreakpoint").and.returnValue(true);
                        spyOn(ResCarousel.prototype, "isShowingLastItem").and.returnValue(false);

                        expect(oResponsiveCarouselInstance.moveToFirstItemInPageRequired()).toEqual(true);
                    });
                });
            });
            describe('WHEN the viewpoint is NOT one of the ones that should not show whitespace to the right of the carousel after the last item ', function () {
                describe('AND we are already showing some of the first item in the page', function () {
                    it('THEN return true', function () {
                        spyOn(ResCarousel.prototype, "limitWhitespaceAfterLastItemInCurrentBreakpoint").and.returnValue(false);
                        spyOn(ResCarousel.prototype, "isShowingLastItem").and.returnValue(true);

                        expect(oResponsiveCarouselInstance.moveToFirstItemInPageRequired()).toEqual(true);
                    });
                });
                describe('AND we are NOT already showing some of the first item in the page', function () {
                    it('THEN return true', function () {
                        spyOn(ResCarousel.prototype, "limitWhitespaceAfterLastItemInCurrentBreakpoint").and.returnValue(false);
                        spyOn(ResCarousel.prototype, "isShowingLastItem").and.returnValue(false);

                        expect(oResponsiveCarouselInstance.moveToFirstItemInPageRequired()).toEqual(true);
                    });
                });
            });
        });
    });
});