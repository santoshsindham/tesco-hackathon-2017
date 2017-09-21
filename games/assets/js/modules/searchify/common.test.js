define(['modules/searchify/common'], function (Searchify) {

    'use strict';

    describe('Searchify module', function () {
        var mock,
            searchifyInstance,
            defaultConf,
            createSpiesForSearchifyInstance,
            createSearchifyInstance;

        function createSpiesForSearchifyInstance() {
            spyOn($, "extend");
            spyOn(window, "isKiosk").and.returnValue(false);
            spyOn(Searchify.prototype, "unbindEvents");
            spyOn(Searchify.prototype, "bindEvents");
        }

        function createSearchifyInstance(mockOptions) {
            if (mockOptions) {
                searchifyInstance = new Searchify(mockOptions);
            } else {
                createSpiesForSearchifyInstance();
                searchifyInstance = new Searchify();
                searchifyInstance.init();
            }
        }

        function createMockOptions() {
            mock.options = {
                searchbox: TESCO.jasmineHelpers.createMockJqueryElement(),
                url_results: 'https://search.api.tesco.com/sayt',
                dom_search_results: 'mock-searchify',
                dom_search_items: 'mock-searchify-autocomplete',
                dom_products_items: 'mock-searchify-autosuggest',
                dom_search_item: 'mock-autocomplete-item',
                dom_products_item: 'mock-autosuggest-item',
                cache_limit: 200,
                max_suggestions: 4,
                max_products: 4
            };
        }

        beforeEach(function () {

            mock = {};

            defaultConf = {
                searchbox: 'search-field',
                url_results: 'https://search.api.tesco.com/sayt',
                dom_search_results: 'searchify',
                dom_search_items: 'searchify-autocomplete',
                dom_search_item: 'autocomplete-item',
                dom_products_items: 'searchify-autosuggest',
                dom_products_item: 'autosuggest-item',
                cache_limit: 200,
                max_suggestions: 4,
                max_products: 4
            };
        });

        afterEach(function () {
            mock = null;
            searchifyInstance = null;
            defaultConf = null;
        });

        describe('Create a new Searchify instance', function () {

            describe('GIVEN no overrides are passed in', function () {

                beforeEach(function () {
                    searchifyInstance = new Searchify();
                    spyOn(searchifyInstance, "init");
                });

                it('THEN it should create a new Searchify instance with the defaults', function () {
                    searchifyInstance.init();
                    expect(searchifyInstance.conf).toEqual(defaultConf);
                });
            });

            describe('GIVEN overrides are passed in', function () {

                beforeEach(function () {
                    createMockOptions();
                    searchifyInstance = new Searchify(mock.options);
                    spyOn(searchifyInstance, "init");
                });

                it('THEN it should create a new Searchify instance with the overrides', function () {
                    searchifyInstance.init();
                    expect(searchifyInstance.conf).toEqual(mock.options);
                });
            });

            describe('always', function () {

                describe('WHEN not on the kiosk', function () {
                    beforeEach(function () {
                        createSearchifyInstance();
                    });

                    it('THEN it should bind events', function () {
                        expect(searchifyInstance.bindEvents).toHaveBeenCalled();
                    });

                    it('THEN it should unbind events', function () {
                        expect(searchifyInstance.unbindEvents).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('Bind events', function () {

            beforeEach(function () {
                spyOn(window, "isKiosk").and.returnValue(false);
                spyOn(Searchify.prototype, "unbindEvents");
                spyOn($.fn, "on");
                spyOn($.fn, "click");
                spyOn($.fn, "resize");
                searchifyInstance = new Searchify();
            });


            it('Binds the key up event on the searchbox', function () {

            });
            it('Binds the mouse enter event on any of the search results suggested terms', function () {

            });
            it('Binds the mouse leave event on any of the search results suggested terms', function () {

            });
            it('Binds the mouse enter event on any of the search results suggested terms products', function () {

            });
            it('Binds the mouse leave event on any of the search results suggested terms products', function () {

            });
            it('Binds the click event on any of the search results suggested terms', function () {

            });
            it('Binds the click event', function () {

            });
            it('Binds the resize event', function () {

            });
        });

        describe('GIVEN a key is pressed in the search box', function () {

            beforeEach(function () {
                createSearchifyInstance();
                spyOn(Searchify.prototype, "NavigateSearchResults");
                spyOn(Searchify.prototype, "search");
                mock.event = TESCO.jasmineHelpers.createMockEvent();
            });

            describe('WHEN the key is the up arrow', function () {

                beforeEach(function () {
                    mock.event.keyCode = 38;
                    searchifyInstance.onSearchBoxKeyup(mock.event);
                });

                it('THEN navigate up the search results', function () {
                    expect(searchifyInstance.NavigateSearchResults).toHaveBeenCalledWith('up');
                });
            });

            describe('WHEN the key is the down arrow', function () {

                beforeEach(function () {
                    mock.event.keyCode = 40;
                    searchifyInstance.onSearchBoxKeyup(mock.event);
                });

                it('AND navigate up the search results', function () {
                    expect(searchifyInstance.NavigateSearchResults).toHaveBeenCalledWith('down');
                });
            });

            describe('WHEN the key is the left arrow', function () {

                beforeEach(function () {
                    mock.event.keyCode = 37;
                    searchifyInstance.onSearchBoxKeyup(mock.event);
                });

                it('THEN do not call the search function', function () {
                    expect(searchifyInstance.search).not.toHaveBeenCalled();
                });
            });

            describe('WHEN the key is the right arrow', function () {

                beforeEach(function () {
                    mock.event.keyCode = 39;
                    searchifyInstance.onSearchBoxKeyup(mock.event);
                });

                it('THEN do not call the search function', function () {
                    expect(searchifyInstance.search).not.toHaveBeenCalled();
                });
            });

            describe('WHEN the key is the spacebar', function () {

                beforeEach(function () {
                    mock.event.keyCode = 32;
                    searchifyInstance.onSearchBoxKeyup(mock.event);
                });

                it('THEN do not call the search function', function () {
                    expect(searchifyInstance.search).not.toHaveBeenCalled();
                });
            });

            describe('WHEN the key is any other key', function () {

                beforeEach(function () {
                    mock.event.keyCode = 84;
                    searchifyInstance.onSearchBoxKeyup(mock.event);
                });

                it('THEN call the search function', function () {
                    expect(searchifyInstance.search).toHaveBeenCalled();
                });
            });
        });

        describe('GIVEN search has been called', function () {

            beforeEach(function () {
                mock.options = {
                    searchbox: TESCO.jasmineHelpers.createMockJqueryElement()
                };
                mock.options.searchbox.val = jasmine.createSpy();
                spyOn(window, "isKiosk").and.returnValue(false);
                spyOn(Searchify.prototype, "unbindEvents");
                spyOn(Searchify.prototype, "bindEvents");
                createSearchifyInstance(mock.options);

                mock.criteria = "searchTerm";
                spyOn(Searchify.prototype, "sanatiseCriteria").and.returnValue(mock.criteria);
                spyOn(Searchify.prototype, "removeSearchResults");
            });

            describe('WHEN the search criteria is not valid', function () {

                beforeEach(function () {
                    spyOn(Searchify.prototype, "isCriteriaValid").and.returnValue(false);
                    searchifyInstance.search(mock.criteria);
                });

                it('THEN it removes the search results', function () {
                    expect(searchifyInstance.removeSearchResults).toHaveBeenCalled();
                });
            });

            describe('WHEN the search criteria is valid', function () {

                beforeEach(function () {
                    spyOn(Searchify.prototype, "isCriteriaValid").and.returnValue(true);
                    mock.promise = TESCO.jasmineHelpers.createMockJqueryPromise();
                    spyOn($, "when").and.returnValue(mock.promise);
                    spyOn(Searchify.prototype, "fetchSuggestions");
                });

                describe('AND the search criteria is cached', function () {

                    beforeEach(function () {
                        spyOn(Searchify.prototype, "isCriteriaCached").and.returnValue(true);
                        spyOn(Searchify.prototype, "showSearchResults");

                        searchifyInstance.session.criteria = mock.criteria;
                        searchifyInstance.session.cache = [{
                            criteria: mock.criteria
                        }];
                        searchifyInstance.search(mock.criteria);
                    });

                    afterEach(function () {
                        searchifyInstance.session.cache = null;
                        searchifyInstance.session = null;
                    });

                    it('THEN it shows the search results', function () {
                        expect(searchifyInstance.showSearchResults).toHaveBeenCalled();
                    });
                });

                describe('AND the search criteria is not cached', function () {

                    beforeEach(function () {
                        spyOn(Searchify.prototype, "isCriteriaCached").and.returnValue(false);
                        searchifyInstance.search(mock.criteria);
                    });

                    it('THEN it performs a search', function () {
                        expect($.when).toHaveBeenCalled();
                        expect(searchifyInstance.fetchSuggestions).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('GIVEN remove search results has been called', function () {

            beforeEach(function () {
                spyOn(Searchify.prototype, "init");
                searchifyInstance = new Searchify();
                searchifyInstance.session = {
                    results_visible: true
                };
                mock.searchResultsContainer = TESCO.jasmineHelpers.createMockJqueryElement();
                mock.searchResultsContainer.remove = jasmine.createSpy();
                //spyOn($).and.returnValue(mock.searchResultsContainer);
                searchifyInstance.removeSearchResults();
            });

            it('THEN remove from the search results container', function () {
                //expect(mock.searchResultsContainer.remove).toHaveBeenCalled();
            });

            it('THEN set session results visible flag to false', function () {
                expect(searchifyInstance.session.results_visible).toBe(false);
            });
        });

        describe('GIVEN is valid criteria has been called', function () {

            beforeEach(function () {
                createSearchifyInstance();
            });

            describe('WHEN empty string for search term', function () {

                it('THEN is not valid criteria', function () {
                    expect(searchifyInstance.isCriteriaValid('')).toBe(false);
                });
            });

            describe('WHEN not empty string for search term', function () {

                it('THEN is valid criteria', function () {
                    expect(searchifyInstance.isCriteriaValid('a')).toBe(true);
                });
            });
        });

        describe('GIVEN process suggestions has been called', function () {

            beforeEach(function () {
                searchifyInstance = new Searchify();
                spyOn(searchifyInstance, "init");
                mock.expectedSuggestions = {
                    criteria: "test",
                    suggestions: ["suggestion1", "suggestion2", "suggestion3"],
                    products: []
                };
                searchifyInstance.session.cache = [];
                searchifyInstance.session.criteria = mock.expectedSuggestions.criteria;
                searchifyInstance.session.xhr_result = mock.expectedSuggestions.suggestions;
                searchifyInstance.processSuggestions();
            });

            it('THEN stores the returned suggestions in the instance', function () {
                searchifyInstance.init();
                expect(searchifyInstance.session.cache[0]).toEqual(mock.expectedSuggestions);
            });
        });

        describe('GIVEN fetch products has been called', function () {

            beforeEach(function () {
                createMockOptions();
                searchifyInstance = new Searchify(mock.options);
                spyOn(searchifyInstance, "init");
                mock.deferred = TESCO.jasmineHelpers.createMockJqueryDeferred();
                mock.xhr = {
                    abort: jasmine.createSpy()
                }
                mock.expectedSuggestions = {
                    products: []
                };
                spyOn($, "Deferred").and.returnValue(mock.deferred);
                spyOn($, "ajax");
                searchifyInstance.session.xhr_result = [];
                searchifyInstance.session.xhr_result.push({
                    Products: [123, 7890]
                });
                mock.searchProductsRequestURL =
                "https://search.api.tesco.com/sayt/p?v=id:123 OR id:7890";
            });

            it('THEN an AJAX request is made for products to the correct URL', function () {
                searchifyInstance.init();
                searchifyInstance.fetchProducts(true);
            });
        });

        describe('GIVEN process products has been called', function () {

            beforeEach(function () {
                searchifyInstance = new Searchify();
                spyOn(searchifyInstance, "init");
                mock.cachedSearchTerm = {
                    criteria: "test",
                    suggestions: ["suggestion1", "suggestion2", "suggestion3"],
                    products: []
                };
                searchifyInstance.session.xhr_result = [];
                searchifyInstance.session.xhr_result.push({
                    Products: [123, 7890]
                });
                searchifyInstance.session.cache = [];
                searchifyInstance.session.cache.push(mock.cachedSearchTerm);
                searchifyInstance.session.criteria = mock.cachedSearchTerm.criteria;
                searchifyInstance.processProducts();
            });

            it('THEN stores the returned suggestions in the instance', function () {
                searchifyInstance.init();
                expect(searchifyInstance.session.cache[0].products).toEqual(searchifyInstance.session.xhr_result);
            });
        });

        describe('GIVEN sanitise criteria has been called', function () {

            var result;
            beforeEach(function () {
                createSearchifyInstance();
                mock.criteria = " test";
                mock.expectedResult = "test";
                spyOn(jQuery, "trim").and.returnValue("test");
                result = searchifyInstance.sanatiseCriteria(mock.criteria);
            });

            describe('WHEN whitespace string for search term', function () {

                it('THEN return empty string', function () {
                    expect(result).toEqual(mock.expectedResult);
                });
            });
        });

        describe('GIVEN get index by criteria has been called', function () {

            var result;

            beforeEach(function () {
                createSearchifyInstance();
                mock.cachedSearchTerm1 = "jkl";
                mock.cachedSearchTerm2 = "xyz";
                searchifyInstance.session.cache = [];
                searchifyInstance.session.cache.push({
                    criteria: mock.cachedSearchTerm1
                });
                searchifyInstance.session.cache.push({
                    criteria: mock.cachedSearchTerm2
                });
            });

            describe('WHEN search term has not been stored', function () {
                beforeEach(function () {
                    mock.criteria = "abc";
                    mock.expectedResult = -1;
                    result = searchifyInstance.getIndexByCriteria(mock.criteria);
                });
                it('THEN return false', function () {
                    expect(result).toEqual(mock.expectedResult);
                });
            });

            describe('WHEN search term has been stored', function () {

                beforeEach(function () {
                    mock.criteria = "xyz";
                    mock.expectedResult = 1;
                    result = searchifyInstance.getIndexByCriteria(mock.criteria);
                });

                it('THEN return the correct index', function () {
                    expect(result).toEqual(mock.expectedResult);
                });
            });
        });



    });
});
