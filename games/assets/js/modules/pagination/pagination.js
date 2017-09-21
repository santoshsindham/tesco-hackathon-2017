/*jslint plusplus: true*/
define('modules/pagination/pagination', [], function () {
    'use strict';

    function Pagination(oCollection) {
        this.oCollection = oCollection;

        var defOpts = {
            sHeaderSelector: ".products-header",
            sPaginationClass: "pagination",
            sPageSelector: ".pagination li",
            sPageClass: "nav-dot",
            sSelectedPageClass: "selected",
            sPageButtonClass: "dot-action"
        };

        this.options = $.extend({}, defOpts, this.oCollection.options.oPaginationOptions);
    }

    Pagination.prototype = {
        constructor: Pagination,

        bindEvents: function bindEvents() {
            var self = this;

            if (self.$paginationElement) {
                self.$paginationElement.on('click', this.options.sPageSelector, self.pageClickHandler.bind(self));
            }
        },

        pageClickHandler: function pageClickHandler(e) {
            var sSelectedPageIndex = $(e.currentTarget).attr("data-index"),
                iSelectedPageIndex = parseInt(sSelectedPageIndex, 10);

            if (iSelectedPageIndex >= 0) {
                this.oCollection.moveToPage(iSelectedPageIndex); // move e.g. carousel (then the after move handler will set the current position indicator)
            }
        },

        init: function init() {
            if (this.oCollection) {
                if (this.iNumberOfPageIndicators === this.oCollection.getNumberOfPages()) {
                    return;
                }

                if (this.$paginationElement) {
                    this.removePageIndicatorsFromDOM();
                }
                this.iNumberOfPageIndicators = this.oCollection.getNumberOfPages();

                this.$paginationElement = this.createPageIndicators();

                if (this.$paginationElement) {
                    this.addPageIndicatorsToDOM();
                    this.updateAttributeForNumberOfPages();
                    this.updateSelectedIndicator();
                    this.bindEvents();
                }
            }
        },

        createPageIndicators: function createPageIndicators() {
            var $newPageIndicator,
                $listOfPageIndicators = null,
                i;

            if (this.iNumberOfPageIndicators > 1) {
                $listOfPageIndicators = $(document.createElement("ol"));
                $listOfPageIndicators.addClass(this.options.sPaginationClass);

                for (i = 0; i < this.iNumberOfPageIndicators; i++) {
                    $newPageIndicator = $('<li class="' + this.options.sPageClass + '" data-index="' + i + '"><button class="' + this.options.sPageButtonClass + '"><span class="screen-reader-text">page ' + i + '</span></button></li>"');

                    $listOfPageIndicators.append($newPageIndicator);
                }
            }
            return $listOfPageIndicators;
        },

        addPageIndicatorsToDOM: function addPageIndicatorsToDOM() {
            if (this.oCollection.$element && this.oCollection.$element.length) {
                this.oCollection.$element.find(this.options.sHeaderSelector).append(this.$paginationElement);
            }
        },

        afterMoveHandler:  function afterMoveHandler() {
            this.updateSelectedIndicator();
        },

        getSelectedPageIndex: function getSelectedPageIndex() {
            return this.oCollection.currentPageIndex();
        },

        updateSelectedIndicator: function updateSelectedIndicator() {
            var iCurrentPageIndex = this.getSelectedPageIndex(),
                allPageIndicators;

            if (this.$paginationElement) {
                allPageIndicators = this.$paginationElement.find(this.options.sPageSelector);

                allPageIndicators.removeClass(this.options.sSelectedPageClass);

                allPageIndicators.filter('[data-index="' + iCurrentPageIndex + '"]').addClass(this.options.sSelectedPageClass);
            }
        },
        removePageIndicatorsFromDOM: function removePageIndicatorsFromDOM() {
            this.$paginationElement.remove();
        },
        updateAttributeForNumberOfPages: function updateAttributeForNumberOfPages() {
            if (this.oCollection.$element) {
                this.oCollection.$element.attr("data-items-count", this.iNumberOfPageIndicators);
            }
        }
    };

    return Pagination;
});