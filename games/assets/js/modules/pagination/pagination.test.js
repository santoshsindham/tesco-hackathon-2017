define(['modules/pagination/pagination'], function (Pagination) {

    'use strict';

    describe('Pagination module', function () {

        var oPagination,
            mock,
            expected;

        beforeEach(function () {
            mock = {
                oCarousel : {
                    options : {
                    },
                    moveToPage: jasmine.createSpy()
                }
            };
        });

        afterEach(function () {
            oPagination = null;
            mock = null;
            expected = null;
        });

        describe('Create the page indicators', function () {

            beforeEach(function () {
                oPagination = new Pagination(mock.oCarousel);
            });

            describe('GIVEN the number of pages is 2', function () {
                it('THEN return a list element with 2 pages', function () {
                    var expectedHTML = '<ol class="pagination"><li class="nav-dot" data-index="0"><button class="dot-action"><span class="screen-reader-text">page 0</span></button></li><li class="nav-dot" data-index="1"><button class="dot-action"><span class="screen-reader-text">page 1</span></button></li></ol>',
                        actualHTML;
                    oPagination.iNumberOfPageIndicators = 2;
                    actualHTML = oPagination.createPageIndicators()[0].outerHTML;
                    expect(actualHTML).toEqual(expectedHTML);
                });
            });

            describe('GIVEN the number of pages is 1', function () {
                it('THEN return null', function () {
                    oPagination.iNumberOfPageIndicators = 1;
                    expect(oPagination.createPageIndicators()).toBeNull();
                });
            });

            describe('GIVEN the number of pages is 0', function () {
                it('THEN return null', function () {
                    oPagination.iNumberOfPageIndicators = 0;
                    expect(oPagination.createPageIndicators()).toBeNull();
                });
            });

            describe('GIVEN the number of pages is -2', function () {
                it('THEN return null', function () {
                    oPagination.iNumberOfPageIndicators = -2;
                    expect(oPagination.createPageIndicators()).toBeNull();
                });
            });
        });

        describe('GIVEN a page indicator has been clicked', function () {
            beforeEach(function () {
                mock.event = {
                    currentTarget: {}
                };
                oPagination = new Pagination(mock.oCarousel);
            });

            describe('WHEN the page indicator has data-index of 0', function () {
                it('THEN move to page is called with expected selected page indicator of 0', function () {
                    spyOn($, "attr").and.returnValue("0");
                    expected = 0;

                    oPagination.pageClickHandler(mock.event);

                    expect(oPagination.oCollection.moveToPage).toHaveBeenCalledWith(expected);
                });
            });
            describe('WHEN the page indicator has data-index of 1', function () {
                it('THEN move to page is called with expected selected page indicator of 1', function () {
                    spyOn($, "attr").and.returnValue("1");
                    expected = 1;

                    oPagination.pageClickHandler(mock.event);

                    expect(oPagination.oCollection.moveToPage).toHaveBeenCalledWith(expected);
                });
            });
            describe('WHEN the page indicator has data-index of -1', function () {
                it('THEN move to page is not called', function () {
                    spyOn($, "attr").and.returnValue("-1");

                    oPagination.pageClickHandler(mock.event);

                    expect(oPagination.oCollection.moveToPage).not.toHaveBeenCalled();
                });
            });
            describe('WHEN the page indicator has data-index of one', function () {
                it('THEN move to page is not called', function () {
                    spyOn($, "attr").and.returnValue("one");

                    oPagination.pageClickHandler(mock.event);

                    expect(oPagination.oCollection.moveToPage).not.toHaveBeenCalled();
                });
            });
        });
        describe('GIVEN init has been called', function () {
            beforeEach(function () {
                oPagination = new Pagination(mock.oCarousel);
                spyOn(Pagination.prototype, "removePageIndicatorsFromDOM");
                spyOn(Pagination.prototype, "createPageIndicators");
                spyOn(Pagination.prototype, "addPageIndicatorsToDOM");
                spyOn(Pagination.prototype, "updateAttributeForNumberOfPages");
                spyOn(Pagination.prototype, "updateSelectedIndicator");
                spyOn(Pagination.prototype, "bindEvents");
            });

            describe('WHEN the number of page indicators equals the number of pages in the collection', function () {
                beforeEach(function () {
                    oPagination.iNumberOfPageIndicators = 2;
                    oPagination.oCollection.getNumberOfPages = jasmine.createSpy().and.returnValue(2);
                });

                it('THEN no other methods are called', function () {
                    oPagination.init();

                    expect(oPagination.removePageIndicatorsFromDOM).not.toHaveBeenCalled();
                    expect(oPagination.createPageIndicators).not.toHaveBeenCalled();
                    expect(oPagination.addPageIndicatorsToDOM).not.toHaveBeenCalled();
                    expect(oPagination.updateAttributeForNumberOfPages).not.toHaveBeenCalled();
                    expect(oPagination.updateSelectedIndicator).not.toHaveBeenCalled();
                    expect(oPagination.bindEvents).not.toHaveBeenCalled();
                });
            });
            describe('WHEN the number of page indicators does not equal the number of pages in the collection', function () {
                beforeEach(function () {
                    oPagination.iNumberOfPageIndicators = 2;
                    oPagination.oCollection.getNumberOfPages = jasmine.createSpy().and.returnValue(3);
                });
                describe('AND there is already a pagination element defined', function () {
                    beforeEach(function () {
                        oPagination.$paginationElement = {};
                    });
                    it('THEN remove from DOM is called', function () {
                        oPagination.init();
                        expect(oPagination.removePageIndicatorsFromDOM).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});