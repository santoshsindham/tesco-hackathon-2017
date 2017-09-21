/*global define: true, window: true, localStorage: true*/

/**
 * Searchify
 *
 * Search As You Type.
 * Results include: auto-completed search suggestions and auto-suggested products based on search term.
 *
 * Example usage:
 * new Searchify({searchbox : 'search-input'});
 *
 */

define('modules/searchify/common', ['domlib'], function ($) {

    'use strict';

    function Searchify(opts) {
        this.conf = $.extend({}, this.conf, opts);
    }

    Searchify.prototype = {

        conf: {
            searchbox: 'search-field', //Input (text) for searches.
            url_results: 'https://search.api.tesco.com/sayt', // Endpoint for searches.
            dom_search_results: 'searchify', // Searchify module.
            dom_search_items: 'searchify-autocomplete', // Autocomplete module.
            dom_search_item: 'autocomplete-item', // Autocomplete list item.
            dom_products_items: 'searchify-autosuggest', // Autosuggest products module.
            dom_products_item: 'autosuggest-item', // Autosuggest product list item.
            cache_limit: 200, // Max capacity of entries in cache.
            max_suggestions: 4, // Max number of suggestions in results.
            max_products: 4 // Max number of products in results.
        },

        session: {
            local_storage_supported: false, // Is localStorage supported in the browser?
            criteria: null, // Current user search criteria.
            xhr: null, // XHR request used for searches.
            xhr_result: null, // XHR JSON Result.
            cache: [], // Cache search results.
            results_visible: false // Search results currently showing?
        },

        oSELECTORS: {
            MASTHEADWRAPPER: '#masthead-wrapper',
            SEARCHWRAPPER: '#search-wrapper',
            SEARCHINPUT: '#search-field',
            SEARCHRESULTSWRAPPER: '#search-results-wrapper'
        },

        oCSSCLASSES: {
            SEARCHIFYOPEN: 'searchifyOpen'
        },

        oEVENTS: {
            OPENSEARCHIFYDROPDOWN: 'openSearchifyDropdown',
            CLOSESEARCHIFYDROPDOWN: 'closeSearchifyDropdown'
        },

        init: function init() {

            this.unbindEvents();
            try {
                this.session.local_storage_supported = !!(typeof localStorage.setItem === 'function');
                this.retainSearchTerm();
            } catch (ex) {
                this.session.local_storage_supported = false;
            }
            this.bindEvents();

            if (!window.isKiosk()) {
                this.processAnalytics();
            }
        },

        /**
         * Remove Autosuggest binds.
         * (Autosuggest is loaded first and only needs to work on Kiosk)
         */
        unbindEvents: function unbindEvents() {

            var self = this;

            $('#' + self.conf.searchbox).unbind().off('keyup keyup.autocomplete');
        },

        /**
         * Retain the searched term in the searchbox on search results.
         */
        retainSearchTerm: function retainSearchTerm() {

            var self = this,
                search_term = window.localStorage.getItem('sayt_autosuggest_string_searched');

            if (self.session.local_storage_supported && search_term) {
                window.localStorage.removeItem('sayt_autosuggest_string_searched');
                $('#' + self.conf.searchbox).val(search_term);
            }
        },

        bindEvents: function bindEvents() {

            var self = this;

            /**
             * User input event on searchbox.
             * Up/Down arrows scroll through search results.
             */
            $('#' + self.conf.searchbox).on('keyup', function (e) {
                self.onSearchBoxKeyup(e);
            });

            $(self.oSELECTORS.MASTHEADWRAPPER).on('focus.getSearchifyResultsOnSearchInputFocus', self.oSELECTORS.SEARCHINPUT, function getSearchifyResultsOnSearchInputFocus() {
                if ($.trim($(self.oSELECTORS.SEARCHINPUT).val() !== '')) {
                    self.search();
                }
            });

            /**
             * Search products results click event.
             * Set localstorage for post analytics.
             * Trigger a search submit.
             */
            $(self.oSELECTORS.SEARCHRESULTSWRAPPER).on('click', '#' + self.conf.dom_search_results + ' #' + self.conf.dom_products_items + ' .' + self.conf.dom_products_item + ' .item-link', function (e) {

                self.storeItem('sayt_productsuggest_term', 'SAYT - suggested Product'); // eVar3.
                self.storeItem('sayt_productsuggest_string', $('#' + self.conf.searchbox).val()); // eVar16.
                self.storeItem('sayt_productsuggest_index', 'Suggested Product P' + ($(e.currentTarget).parent('.' + self.conf.dom_products_item).index() + 1)); // eVar40.
            });

            /**
             * Search results suggestions click event.
             * Set localstorage for post analytics.
             * Trigger a search submit.
             */
            $(self.oSELECTORS.SEARCHRESULTSWRAPPER).on('click', '#' + self.conf.dom_search_results + ' #' + self.conf.dom_search_items + ' .' + self.conf.dom_search_item + ' .item-link', function (e) {

                // Track the Autosuggested term click.
                self.storeItem('sayt_autosuggest_term', 'SAYT – suggested Search Term'); // eVar3.
                self.storeItem('sayt_autosuggest_string', $(e.currentTarget).text()); // eVar16.
                self.storeItem('sayt_autosuggest_index', 'Autosuggest Term P' + ($(e.currentTarget).parent('.' + self.conf.dom_search_item).index() + 1)); // eVar40.
                self.storeItem('sayt_autosuggest_string_searched', $(e.currentTarget).text()); // retained search term.

                $('#' + self.conf.searchbox).val($(e.currentTarget).text());
                $('#search-submit').trigger('click');
            });

            /**
             * Hide search results
             */
            $(self.oSELECTORS.MASTHEADWRAPPER).on('searchBarCloseComplete', function () {
                self.removeSearchResults();
            });
        },

        /**
         * User typed in searchbox.
         */
        onSearchBoxKeyup: function onSearchBoxKeyup(e) {

            var self = this,
                key = (window.event) ? e.which : e.keyCode;

            switch (key) {

                /**
                 * (38) Up arrow pressed.
                 * Scroll upwards through search results.
                 */
            case 38:
                e.preventDefault();
                self.NavigateSearchResults('up');
                break;

                /**
                 * (40) Down arrow pressed.
                 * Scroll downwards through search results.
                 */
            case 40:
                e.preventDefault();
                self.NavigateSearchResults('down');
                break;

                /**
                 * Ignore the following keys:
                 * (37/39) Left/Right arrow pressed.
                 * (32) Spacebar.
                 */
            case 37:
            case 39:
            case 32:
                break;

                /**
                 * Search performed.
                 */
            case 13:
                e.preventDefault();
                self.storeItem('sayt_autosuggest_string_searched', $('#' + self.conf.searchbox).val()); // retained search term.
                $('#search-submit').trigger('click');
                break;

                /**
                 * Close the menu if escape is pressed.
                 */
            case 27:
                self.removeSearchResults();
                break;

                /**
                 * Any other key.
                 * Perform a search.
                 */
            default:
                self.search();
                break;
            }
        },

        /**
         * Store an item in browser local storage.
         * Try catch used because private browsing in iOS breaks localStorage.
         */
        storeItem: function storeItem(key, val) {

            if (this.session.local_storage_supported) {
                try {
                    localStorage.setItem(key, val);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        },

        /**
         * Removes the search results from the DOM.
         */
        removeSearchResults: function removeSearchResults() {

            var self = this;

            $(self.oSELECTORS.MASTHEADWRAPPER).removeClass(self.oCSSCLASSES.SEARCHIFYOPEN)
                .data(self.oCSSCLASSES.SEARCHIFYOPEN, false);
            $(self.oSELECTORS.SEARCHWRAPPER).removeClass(self.oCSSCLASSES.SEARCHIFYOPEN)
                .data(self.oCSSCLASSES.SEARCHIFYOPEN, false);

            $('#' + self.conf.dom_search_results).remove();

            self.session.results_visible = false;
        },


        /**
         * Updates the popular results messagaging.
         */
        updatePopularResults: function updatePopularResults() {

            var self = this,
                $popular_results = $('#searchify-popular'),
                content = '<span>Our most popular results matching </span><b>&ldquo;' + $('#' + self.conf.searchbox).val() + '&rdquo;</b>';

            if ($('#' + self.conf.dom_products_items + ' .' + self.conf.dom_products_item).length) {

                if ($popular_results.length) {
                    $popular_results.html(content);
                } else {
                    $('<div id="searchify-popular" class="searchify-popular">' + content + '</div>').insertAfter($('#' + self.conf.dom_search_items));
                }
            } else {
                $('#searchify-popular').remove();
            }
        },

        /**
         * Search for product categories & products based on user's search criteria.
         */
        search: function search(criteria) {

            var self = this,
                i,
                i_len;

            /**
             * Sanatise and validate user search criteria.
             * Do not perform the previous search again.
             */
            self.session.criteria = criteria || self.sanatiseCriteria($('#' + self.conf.searchbox).val());
            if (!self.isCriteriaValid(self.session.criteria)) {
                self.removeSearchResults();
                return;
            }
            if (self.isCriteriaCached(self.session.criteria)) {
                i_len = self.session.cache.length;
                for (i = 0; i < i_len; i += 1) {
                    if (self.session.criteria === self.session.cache[i].criteria) {
                        self.showSearchResults(i);
                        break;
                    }
                }
                return;
            }

            /** Fetch suggestions and associated products then show the results. */
            $.when(self.fetchSuggestions(true))
                .then(function () {
                    self.processSuggestions();
                    $.when(self.fetchProducts())
                        .then(function () {
                            self.processProducts();
                            self.showSearchResults();
                        });
                });

        },

        /**
         * Adds the search results to the DOM.
         */
        showSearchResults: function showSearchResults() {

            var self = this,
                i = self.getIndexByCriteria(),
                suggestions = self.createSearchResultsItems(i);

            if (suggestions.iResults === 0) {
                if ($(self.oSELECTORS.MASTHEADWRAPPER).data(self.oCSSCLASSES.SEARCHIFYOPEN) === true) {
                    $(self.oSELECTORS.MASTHEADWRAPPER).trigger(self.oEVENTS.CLOSESEARCHIFYDROPDOWN);
                    self.removeSearchResults();
                }
            } else {
                self.updateSearchResultsContainerContent(suggestions.sMarkup);
                self.updateSearchResultsProducts(i);
                self.updatePopularResults();

                self.session.results_visible = true;

                if ($(self.oSELECTORS.MASTHEADWRAPPER).data(self.oCSSCLASSES.SEARCHIFYOPEN) !== true) {
                    $(self.oSELECTORS.SEARCHWRAPPER).addClass(self.oCSSCLASSES.SEARCHIFYOPEN)
                        .data(self.oCSSCLASSES.SEARCHIFYOPEN, true);
                    $(self.oSELECTORS.MASTHEADWRAPPER).addClass(self.oCSSCLASSES.SEARCHIFYOPEN)
                        .data(self.oCSSCLASSES.SEARCHIFYOPEN, true)
                        .trigger(self.oEVENTS.OPENSEARCHIFYDROPDOWN);
                }
            }
        },

        /**
         * Adds products from search results.
         */
        updateSearchResultsProducts: function updateSearchResultsProducts(index) {

            var self = this,
                items = '',
                item = '',
                i,
                i_len = self.session.cache[index].products.length,
                product_url;

            for (i = 0; i < i_len; i += 1) {
                product_url = self.session.cache[index].products[i].productUrl + '&icid=spiffy_' + window.escape(self.session.cache[index].suggestions[0].id) + '_' + self.session.cache[index].products[i].id + '_' + self.session.criteria;
                item = '<li class="autosuggest-item"><a class="item-link" href="' + product_url + '">';
                item += '<div class="image-wrapper">';

                if (self.session.cache[index].products[i].g_image) { // Image may not exist, or it may not be base64.
                    if (self.session.cache[index].products[i].g_image.substring(0, 7) === 'http://') {
                        item += '<img src="' + self.session.cache[index].products[i].g_image + '" />';
                    } else {
                        item += '<img src="data:image/jpeg;base64,' + self.session.cache[index].products[i].g_image + '" />';
                    }
                } else {
                    item += '<img src="' + self.conf.url_results + '/searchbar/img/na.jpg" />';
                }
                item += '</div>';
                item += '<div class="item-name">' + self.session.cache[index].products[i].name.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + self.session.criteria + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong class='link-highlight'>$1</strong>") + '</div>';
                item += '</a></li>';
                items += item;

                if (i + 1 === self.conf.max_products) { // Enforce max limit.
                    break;
                }
            }

            if ($('#' + self.conf.dom_products_items).length) { // Create container if not already present in DOM.
                $('#' + self.conf.dom_products_items).html(items);
            } else {
                $('<ul id="' + self.conf.dom_products_items + '" class="' + self.conf.dom_products_items + '">' + items + '</ul>').insertAfter('#' + self.conf.dom_search_items);
            }
        },

        /**
         * Checks whether a specified search criteria exists in the cache.
         */
        isCriteriaCached: function isCriteriaCached(criteria) {

            return this.getIndexByCriteria(criteria) >= 0 ? true : false;
        },

        /**
         * Ensures a user's search criteria is valid to use.
         */
        isCriteriaValid: function isCriteriaValid(criteria) {

            return $.trim(criteria) !== '' ? true : false;
        },

        /**
         * Creates structured URL to use for searching with.
         */
        createSearchURL: function createSearchURL(criteria) {

            var criteria_touse = criteria || this.session.criteria;

            return this.conf.url_results + '/k?v=' + criteria_touse;

        },

        /**
         * Creates structured URL to use for searching products from ID.
         */
        createProductsURLFromID: function createProductsURLFromID(ids) {

            return this.conf.url_results + '/p?v=id:' + ids.join(' OR id:');
        },

        /**
         * Make AJAX request to endpoint to fetch results for user search criteria.
         */
        fetchSuggestions: function fetchSuggestions(force_abort) {

            var self = this,
                defer = $.Deferred();

            if (force_abort && self.session.xhr) {
                self.session.xhr.abort();
            }

            self.session.xhr = $.ajax({
                url: self.createSearchURL(),
                type: 'GET',
                success: function (xhr) {
                    self.session.xhr_result = xhr;
                    defer.resolve();
                },
                dataType: 'jsonp',
                jsonp: 'json.wrf'
            });

            return defer.promise();
        },

        /**
         * Process search results.
         * Gets the product categories and the products.
         */
        processSuggestions: function processSuggestions() {

            var self = this;

            /**
             * Manage cache limit.
             */
            if (self.session.cache.length >= self.conf.cache_limit) {
                self.session.cache = [];
            }

            /**
             * Add search results to the cache.
             */
            self.session.cache.push({
                criteria: self.session.criteria,
                suggestions: self.session.xhr_result,
                products: []
            });

        },

        /**
         * Process products search results.
         */
        processProducts: function processProducts() {

            this.session.cache[this.getIndexByCriteria()].products = this.session.xhr_result;

        },

        /**
         * Create the items for the search results.
         */
        createSearchResultsItems: function createSearchResultsItems(index) {

            var self = this,
                items = '',
                i,
                i_len,
                markup;

            i_len = self.session.cache[index].suggestions.length;

            for (i = 0; i < i_len; i += 1) {
                items += '<li class="' + self.conf.dom_search_item + '"><button class="item-link">' + self.session.cache[index].suggestions[i].id.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + self.session.criteria + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b class='link-highlight'>$1</b>") + '</button></li>';
                if (i + 1 === self.conf.max_suggestions) {
                    break;
                }
            }

            markup = '<ul id="' + self.conf.dom_search_items + '" class="' + self.conf.dom_search_items + '">' + items + '</ul>';

            return {
                sMarkup: markup,
                iResults: i_len
            };

        },

        /**
         * Create the DOM container for search results.
         */
        updateSearchResultsContainerContent: function updateSearchResultsContainerContent(content) {

            var self = this,
                search_container;

            content = content || '';
            if (!$('#' + self.conf.dom_search_results).length) {
                search_container = '<div class="m-' + self.conf.dom_search_results + '" id="' + self.conf.dom_search_results + '">' + content + '</div>';
                $('#search-results-wrapper').append(search_container);
            } else {
                $('#' + self.conf.dom_search_results).html(content);
            }
        },


        /**
         * Gets the products for the top suggestion.
         */
        fetchProducts: function fetchProducts() {

            var self = this,
                defer = $.Deferred(),
                ids = self.session.xhr_result.length ? self.session.xhr_result[0].Products : [];

            self.session.xhr = $.ajax({
                url: self.createProductsURLFromID(ids),
                type: 'GET',
                success: function (xhr) {
                    self.session.xhr_result = xhr;
                    defer.resolve();
                },
                dataType: 'jsonp',
                jsonp: 'json.wrf'
            });

            return defer.promise();
        },

        /**
         * Sanatise user search criteria.
         */
        sanatiseCriteria: function sanatiseCriteria(criteria) {

            return $.trim(criteria.toLowerCase());
        },

        /**
         * Return the index of the specified search criteria in the cache.
         */
        getIndexByCriteria: function getIndexByCriteria(criteria) {

            var self = this,
                i,
                i_len = self.session.cache.length;

            criteria = criteria || self.session.criteria;

            for (i = 0; i < i_len; i += 1) {
                if (self.session.cache[i].criteria === criteria) {
                    return i;
                }
            }

            return -1;
        },

        /**
         * Move upwards/donwards through the search results.
         */
        NavigateSearchResults: function NavigateSearchResults(direction) {

            var self = this,
                $cur_selected;

            if ($('#' + self.conf.dom_search_items + ' .' + self.conf.dom_search_item).length) {

                if (direction === 'up') { // Move up the suggestions 1 by 1.
                    $cur_selected = $('#' + self.conf.dom_search_items + ' .' + self.conf.dom_search_item + '.is-selected').prev();
                    if (!$cur_selected.length) {
                        $cur_selected = $('#' + self.conf.dom_search_items + ' .' + self.conf.dom_search_item).last();
                    }
                    $cur_selected.siblings().removeClass('is-selected');
                    $cur_selected.addClass('is-selected');
                } else if (direction === 'down') { // Move down the suggestions 1 by 1.
                    $cur_selected = $('#' + self.conf.dom_search_items + ' .' + self.conf.dom_search_item + '.is-selected').next();
                    if (!$cur_selected.length) {
                        $cur_selected = $('#' + self.conf.dom_search_items + ' .' + self.conf.dom_search_item).first();
                    }
                    $cur_selected.siblings().removeClass('is-selected');
                    $cur_selected.addClass('is-selected');
                }

                self.updateProductsFromSelection($cur_selected);

            }
        },

        /**
         * Updates the product suggestions based on the selected autosuggest term.
         */
        updateProductsFromSelection: function updateProductsFromSelection($selected_item) {

            var self = this;

            $('#' + self.conf.searchbox).val($selected_item.text()); // Update the searchbox to reflect suggestion selected.
            self.session.criteria = self.sanatiseCriteria($('#' + self.conf.searchbox).val());

            if (self.isCriteriaCached(self.session.criteria)) { // Get the products for the selected search suggestion and ONLY update the products results.
                if (self.session.cache[self.session.criteria] && self.session.cache[self.session.criteria].products.length === 0) {
                    self.session.cache.splice(self.session.cache.indexOf(self.session.cache[self.session.criteria]), 1);
                }
                self.updateSearchResultsProducts(self.getIndexByCriteria());
                self.updatePopularResults();
            } else {
                $.when(self.fetchSuggestions(true))
                    .then(function () {
                        self.processSuggestions();
                        $.when(self.fetchProducts())
                            .then(function () {
                                self.processProducts();
                                self.updateSearchResultsProducts(self.getIndexByCriteria());
                                self.updatePopularResults();
                            });
                    });
            }
        },

        /**
         * Reads previously set analytics and assigns values to eVars.
         * Used in publishing JS.
         */
        processAnalytics: function processAnalytics() {

            var auto_terms = [
                { eVar: 'eVar3', item: 'sayt_autosuggest_term' },
                { eVar: 'eVar16', item: 'sayt_autosuggest_string' },
                { eVar: 'eVar40', item: 'sayt_autosuggest_index' },
                { eVar: 'eVar3', item: 'sayt_productsuggest_term' },
                { eVar: 'eVar16', item: 'sayt_productsuggest_string' },
                { eVar: 'eVar40', item: 'sayt_productsuggest_index' }
            ],
                i,
                i_len,
                storedItem;

            if (window.s && this.session.local_storage_supported) {
                i_len = auto_terms.length;
                for (i = 0; i < i_len; i += 1) {
                    storedItem = localStorage.getItem(auto_terms[i].item);
                    if (storedItem) {
                        window.s[auto_terms[i].eVar] = storedItem;
                        localStorage.removeItem(auto_terms[i].item);
                    }
                }
            }
        }

    };

    return Searchify;

});
