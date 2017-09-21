define(['modules/product-filters/common'], function (productFilters) {
    'use strict';

    describe('Product filters module', function () {
        var mock;

        describe('Init', function () {
            describe('GIVEN there is a sort-by-list', function () {
                it('THEN A listener is created on the click event of any of the sort by options', function () {
                });
                describe('WHEN common.isTouch returns false', function () {
                    it('THEN A listener is created on the touchstart event of any of the sort by options', function () {
                    });
                });
            });
        });

        describe('GIVEN that a sort-by option has been chosen', function () {
            describe('WHEN the sort-by option is not the currently chosen sort-by option', function () {
                it('THEN it updates the sort-by selection', function () {
                    // expect(mock.sortBy.updateSelection).toHaveBeenCalledWith(mockSelectedNumber);
                });
                it('AND it stores the sort-by selection in the productFilters variable', function () {
                    //expect(mock.productFilters.sortBy).toEqual(mockSelectedNumber);
                });
                describe('AND WHEN there is history.pushState', function () {
                    it('THEN the sort-by form is submitted', function () {
                        // expect(mock.sortByForm.submit).toHaveBeenCalled();
                    });
                    it('AND the sort-by dropdown is closed', function () {
                        // expect(mock.sortBy.closeDropdown).toHaveBeenCalled();
                    });
                    it('AND the data is refreshed', function () {
                        // expect(mock.productFilters.refreshData).toHaveBeenCalled();
                    });
                    it('AND the overlay is hidden', function () {
                        // expect(mock.overlay.hide).toHaveBeenCalled();
                    });
                });
                describe('AND WHEN there is not history.pushState', function () {
                    it('THEN the sort-by form is submitted', function () {
                        // expect(mock.sortByForm.submit).toHaveBeenCalled();
                    });
                    it("AND the sort-by element is given the value of the number of the selected option", function () {
                        // expect(mock.sortBy.val).toHaveBeenCalledWith(mockSelectedNumber);
                    });
                });
            });
            describe('WHEN the sort-by option is the currently chosen sort-by option', function () {
                it('THEN the sort-by dropdown is closed', function () {
                    // expect(mock.sortBy.closeDropdown).toHaveBeenCalled();
                });
            });
        });

        describe("GIVEN that the refresh data function has been called", function () {
            describe("WHEN the event's target element is the sort by form", function () {
                describe("AND the productFilters' sortBy variable is a number", function () {
                    it("THEN sortByval variable equals &sortBy=", function () {
                    });
                });
                describe("AND the productFilters variable is a not number", function () {
                    it("THEN sortByval equals &sortBy={productFilters.sortBy}", function () {
                    });
                });
                describe("AND the overlay is open", function () {
                    it("THEN lastState is set to url", function () {
                        // expect(productFilters.lastState).toEqual(mock.url);
                    });
                });
                it("THEN savedState is set to url", function () {
                    // expect(productFilters.savedState).toEqual(mock.url);
                });
                describe("AND WHEN there is no history.pushState and forceAjax is false", function () {
                    it("THEN window.location is set to url", function () {
                    });
                });
                describe("AND WHEN there is history.pushState or forceAjax is false", function () {
                    it("THEN filter-refresh class is added to the body", function () {
                    });
                    it("AND loadMore get results is called", function () {
                    });
                });
            });
        });
    });
});