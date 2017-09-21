/*globals define,require,window,console */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/set-canonical-link/SetCanonicalLink', ['modules/common'], function (common) {
    'use strict';

    function SetCanonicalLink(oSettings) {
        if (typeof oSettings !== 'object') {
            throw new Error("The parameter passed to the Set Canonical Link class is not an object.");
        }

        this.sSetCanonicalLinkEventName = oSettings.sSetCanonicalLinkEventName || 'updateCanonicalLink';
        this.bEventsBound = false;
        this.bGlobalFallbackEnabled = this.fnCheckForGlobalFallback();
        this.sCanonicalLinkSelector = 'link[rel=canonical]';
        this.init();
    }

    SetCanonicalLink.prototype = {
        constructor: SetCanonicalLink,

        fnBindEventListeners: function fnBindEventListeners() {
            var self = this;

            if (this.bEventsBound === false) {
                $(window).on(this.sSetCanonicalLinkEventName, function (e) {
                    e.stopImmediatePropagation();
                    self.fnUpdateCanonicalLink();
                });
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
            return window.TescoData.plp.bGlobalCanonicalLinkFallback || false;
        },

        fnGetCurrentCanonicalLink: function fnGetCurrentCanonicalLink() {
            if ($(this.sCanonicalLinkSelector)) {
                return $(this.sCanonicalLinkSelector).attr('href');
            }
        },

        fnGetCurrentURL: function fnGetCurrentURL() {
            return document.URL;
        },

        fnCleanURL: function fnCleanURL(sDirtyURL) {
            var sCleanedURL,
                aParamsToRemove = ['pageViewType', 'clrAll', 'facetSelected', 'imagePreset'];

            if (sDirtyURL === undefined) {
                return;
            }
            sCleanedURL = common.removeSpecificURLParams(sDirtyURL, aParamsToRemove);
            return sCleanedURL;
        },

        fnSetCanonicalLink: function fnSetCanonicalLink(sUpdatedCanonicalLink) {
            if (sUpdatedCanonicalLink === undefined) {
                return;
            }

            if ($(this.sCanonicalLinkSelector).length) {
                $(this.sCanonicalLinkSelector).attr('href', sUpdatedCanonicalLink);
            }
        },

        fnUpdateCanonicalLink: function fnUpdateCanonicalLink() {
            var sUpdatedCanonicalLink = this.fnGetCurrentURL();

            sUpdatedCanonicalLink = this.fnCleanURL(sUpdatedCanonicalLink);
            this.fnSetCanonicalLink(sUpdatedCanonicalLink);
        },

        init: function init() {
            if (!this.bGlobalFallbackEnabled) {
                this.fnBindEventListeners();
            }
        }
    };

    return SetCanonicalLink;
});
