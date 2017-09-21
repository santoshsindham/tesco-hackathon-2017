/*globals define,require,window,console */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/set-page-title/SetPageTitle', function () {
    'use strict';

    function SetPageTitle(oSettings) {
        if (typeof oSettings !== 'object') {
            throw new Error("The parameter passed to the Set Page Title class is not an object.");
        }

        this.sCachedPageTitle;
        this.sCachedNoFiltersPageTitle;
        this.sSetPageTitleEventName = oSettings.sSetPageTitleEventName ? oSettings.sSetPageTitleEventName : 'updatePageTitle';
        this.sResetPageTitleEventName = oSettings.sResetPageTitleEventName ? oSettings.sResetPageTitleEventName : 'resetPageTitle';
        this.sSuffixText = oSettings.sSuffixText ? oSettings.sSuffixText : '- Tesco.com';
        this.sHiddenFilterNameSelector = 'h1.page-title span.last_applied_filter';
        this.bEventsBound = false;
        this.bGlobalFallbackEnabled = this.fnCheckForGlobalFallback();
        this.bOriginalPageTitleCached = false;
        this.bReplaceEntireTitle = oSettings.bReplaceEntireTitle ? oSettings.bReplaceEntireTitle : false;
        this.bAppendBeforeSuffix = oSettings.bAppendBeforeSuffix ? oSettings.bAppendBeforeSuffix : true;
        this.init();
    }

    SetPageTitle.prototype = {
        constructor: SetPageTitle,

        fnBindEventListeners: function fnBindEventListeners() {
            var self = this;

            if (this.bEventsBound === false) {
                $(window).on(this.sSetPageTitleEventName, function(e, oData) {
                    e.stopImmediatePropagation();
                    self.fnUpdatePageTitle(e, oData)
                });

                $(window).on(this.sResetPageTitleEventName, function() {
                    self.fnResetPageTitle();
                })
                this.bEventsBound = true;
            }
        },

        fnCheckForGlobalFallback: function fnCheckForGlobalFallback() {
            if (window.TescoData === undefined) {
                window.TescoData = {};
            }
            if (window.TescoData.plp === undefined) {
                window.TescoData.plp = {};
            }
            return window.TescoData.plp.bGlobalPageTitleFallback ? true : false;
        },

        fnGetPageTitle: function fnGetPageTitle() {
            return document.title;
        },

        fnSetOriginalPageTitle: function fnSetOriginalPageTitle(sCurrentPageTitle) {
            this.sCachedPageTitle = sCurrentPageTitle;
            this.bOriginalPageTitleCached = true;
        },

        fnSetPageTitle: function fnSetPageTitle(oData) {
            var sUpdatedPageTitlePartial,
                sFinalisedPageTitle,
                sCurrentPageTitleWithSuffixRemoved,
                sCurrentPageTitle = this.sCachedPageTitle;

            if (oData === undefined) {
                return;
            }
            sUpdatedPageTitlePartial = oData.sUpdatedPageTitlePartial;

            if (this.bReplaceEntireTitle) {
                sFinalisedPageTitle = sUpdatedPageTitlePartial;
            }
            if (this.bAppendBeforeSuffix) {
                sCurrentPageTitleWithSuffixRemoved = sCurrentPageTitle.replace(this.sSuffixText, '');
                sFinalisedPageTitle = sCurrentPageTitleWithSuffixRemoved + sUpdatedPageTitlePartial + ' ' + this.sSuffixText;
            }
            document.title = sFinalisedPageTitle;
        },

        fnUpdatePageTitle: function fnUpdatePageTitle(e, oData) {
            var sCurrentPageTitle;

            if (e) {
                sCurrentPageTitle = this.fnGetPageTitle();
                if (!this.bOriginalPageTitleCached) {
                    this.fnSetOriginalPageTitle(sCurrentPageTitle);
                }
                this.fnSetPageTitle(oData, sCurrentPageTitle);
            }
        },

        fnResetPageTitle: function fnResetPageTitle() {
            if (this.bOriginalPageTitleCached === true) {
                document.title = this.sCachedPageTitle;
            }
        },

        init: function init() {
            if (!this.bGlobalFallbackEnabled) {
                this.fnBindEventListeners();
            }
        }
    };

    return SetPageTitle;
});