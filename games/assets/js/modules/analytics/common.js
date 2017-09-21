/* eslint-disable */
/*globals $,window,document,console,define,require,s,RR */
/*jslint regexp: true, nomen: true */
define('modules/analytics/common', ['modules/common', 'modules/recommenders/common', 'modules/mvc/fn'], function (common, recommenders, fn) {
    'use strict';
    var asyncBlockCallbacks = {},
        triggerAsyncAnalyticsCall = {},
        synchronousAnalyticsHandler = {},
        triggerSynchronousAnalyticsCall = {},
        setRichRelevanceList3Property = {},
        setRichRelevanceStoredData = {},
        checkRichRelevanceDataAvailable = {},
        setAndTriggerRichRelevanceAnalytics = {},
        checkRichRelevancePlacements = {},
        getAnalyticsTimeBucket = null;

    triggerAsyncAnalyticsCall = function triggerAsyncAnalyticsCall() {
        s.t();
        window.pageLoadAnalyticsSuccess = true;
        $(window).trigger('pageLoadAnalyticsSuccess');
    };

    checkRichRelevancePlacements = function checkRichRelevancePlacements() {
        var hasRichRelevancePlacements = false;

        if (window.R3_COMMON !== undefined
                && window.R3_COMMON.placementTypes !== undefined
                && window.R3_COMMON.placementTypes.length > 0) {
            hasRichRelevancePlacements = true;
        }

        return hasRichRelevancePlacements;
    };

    triggerSynchronousAnalyticsCall = function triggerSynchronousAnalyticsCall() {
        if (window.preAnalyticsCall !== undefined) {
            if ($.isFunction(window.preAnalyticsCall)) {
                try {
                    window.preAnalyticsCall();
                } catch (ignore) {
                }
            }
        }
        s.t();
        window.pageLoadAnalyticsSuccess = true;
    };

    setRichRelevanceStoredData = function setRichRelevanceStoredData() {
        var rrDataSelector = 'rrProductClickData_list3',
            rrStoredData = null;

        rrStoredData = fn.getLocalStorageData(rrDataSelector);
        if (rrStoredData !== null) {
            s.list3 = rrStoredData;
            fn.clearLocalStorageData(rrDataSelector);
        }
    };

    setRichRelevanceList3Property = function setRichRelevanceList3Property() {
        var list3 = null,
            delimiter = '|';

        list3 = recommenders.setRichRelevancePageLoadList3Prop();
        if (list3 !== null && list3 !== undefined) {
            if (s.list3 === undefined) {
                s.list3 = list3;
            } else {
                s.list3 += delimiter;
                s.list3 += list3;
            }
        }
    };

    synchronousAnalyticsHandler = function synchronousAnalyticsHandler() {
        if (window.r3 !== undefined && checkRichRelevancePlacements() && (common.isPage('PLP') || common.isPage('PDP'))) {
            setRichRelevanceStoredData();
            $(window).one('richRelevanceAnalyticsCallback', function completeRichRelevancePageLoadAnalytics() {
                setRichRelevanceList3Property();
                triggerSynchronousAnalyticsCall();
            });
        } else {
            triggerSynchronousAnalyticsCall();
        }
    };

    asyncBlockCallbacks = function asyncBlockCallbacks() {
        var oCallbacks = {},
            bRRDataAvailable = false;

        oCallbacks.success = function (oResp) {
            var sEvents = '';

            if (typeof oResp === "string") {
                oResp = $.parseJSON(oResp);
            }
            if (typeof window.preAnalyticsCall === 'function') {
                try {
                    window.preAnalyticsCall();
                } catch (ignore) {}
            }
            if (oResp.Analytics) {
                if (oResp.Analytics.events) {
                    sEvents = s.events;
                }
                $.extend(s, oResp.Analytics);
                if (sEvents !== '') {
                    s.events += ',' + sEvents;
                }
            }

            if (window.r3 !== undefined && checkRichRelevancePlacements() && (common.isPage('PLP') || common.isPage('PDP'))) {
                bRRDataAvailable = checkRichRelevanceDataAvailable();
                if (bRRDataAvailable) {
                    setAndTriggerRichRelevanceAnalytics();
                } else {
                    $(window).one('richRelevanceAnalyticsCallback', function completeAsyncAnalyticsCall() {
                        setAndTriggerRichRelevanceAnalytics();
                    });
                }
            } else {
                triggerAsyncAnalyticsCall();
            }
        };

        return oCallbacks;
    };

    checkRichRelevanceDataAvailable = function checkRichRelevanceDataAvailable() {
        var rrDataAvailable = false;

        if (RR && RR.data && RR.data.JSON && RR.data.JSON.placements) {
            if (RR.data.JSON.placements.length > 0) {
                rrDataAvailable = true;
            }
        }

        return rrDataAvailable;
    };

    setAndTriggerRichRelevanceAnalytics = function setAndTriggerRichRelevanceAnalytics() {
        setRichRelevanceStoredData();
        setRichRelevanceList3Property();
        triggerAsyncAnalyticsCall();
    };

    window.preAnalyticsCall = function preAnalyticsCall() {
        var sKioskStoreId = null,
            sDOMReady = null,
            sWindowLoad = null;
        try {
            if (window.isKiosk()) {
                if (/kiosk.direct.ukroi.tesco.org/gi.test(window.location.href)) {
                    s.account = "tescoukinstoreprod,tescoukmasterprod";
                    s.dynamicAccountList = "tescoukinstoreprod,tescoukmasterprod";
                    s.un = "tescoukinstoreprod,tescoukmasterprod";
                    s.oun = "tescoukinstoreprod,tescoukmasterprod";
                    s.fun = "tescoukinstoreprod,tescoukmasterprod";
                }

                if (typeof common.getKioskStoreId === 'function') {
                    sKioskStoreId = common.getKioskStoreId();
                    if (sKioskStoreId !== '') {
                        s.eVar46 = sKioskStoreId;
                    }
                }
            } else {
                if (/tesco.com/gi.test(window.location.href)) {
                    s.dynamicAccountList = "tescoukdirectprod,tescoukmasterprod=tesco.com";
                }

                if (window.performance !== undefined) {
                    if (window.performance.timing !== undefined) {
                        if (typeof localStorage.getItem === 'function') {
                            sDOMReady = localStorage.getItem("perfDOMReady");
                            sWindowLoad = localStorage.getItem("perfWindowLoad");

                            if (s.events !== 'undefined' && s.events !== '') {
                                s.events = s.events + ",";
                            } else {
                                s.events = '';
                            }

                            if (sDOMReady) {
                                sDOMReady = parseInt(sDOMReady, 10);
                            }

                            if (sWindowLoad) {
                                sWindowLoad = parseInt(sWindowLoad, 10);
                            }

                            if (sDOMReady > 0) {
                                s.events = s.events + "event88=" + sDOMReady;
                            }

                            if (sWindowLoad > 0) {
                                s.events = s.events + ",event89=" + sWindowLoad;
                            }

                            if (sDOMReady > 0 && sWindowLoad > 0) {
                                sDOMReady = getAnalyticsTimeBucket(sDOMReady);
                                sWindowLoad = getAnalyticsTimeBucket(sWindowLoad);
                                s.prop26 = sDOMReady + "|" + sWindowLoad;
                            }
                        }
                    }
                }
            }
        } catch (ignore) {}
    };

    getAnalyticsTimeBucket = function getAnalyticsTimeBucket(sTime) {
        var sBucket = sTime;

        if (sTime > 0 && sTime < 500) {
            sBucket = '00.0 < 00.5';
        } else if (sTime < 1000) {
            sBucket = '00.5 < 01.0';
        } else if (sTime < 2000) {
            sBucket = '01.0 < 02.0';
        } else if (sTime < 3000) {
            sBucket = '02.0 < 03.0';
        } else if (sTime < 4000) {
            sBucket = '03.0 < 04.0';
        } else if (sTime < 5000) {
            sBucket = '04.0 < 05.0';
        } else if (sTime < 7500) {
            sBucket = '05.0 < 07.5';
        } else if (sTime < 10000) {
            sBucket = '07.5 < 10.0';
        } else if (sTime < 15000) {
            sBucket = '10.0 < 15.0';
        } else {
            sBucket = '15+';
        }
        return sBucket;
    };

    $(window).load(function () {
        var tDOMReady,
            tDOMStart,
            tDOMFinish,
            tWindowLoad;

        try {
            if (window.performance !== undefined) {
                if (window.performance.timing !== undefined) {
                    if (typeof localStorage.setItem === 'function') {
                        setTimeout(function () {
                            tDOMStart = window.performance.timing.domContentLoadedEventStart - window.performance.timing.responseEnd;
                            tDOMFinish = window.performance.timing.domComplete - window.performance.timing.domContentLoadedEventEnd;
                            tDOMReady = tDOMFinish + tDOMStart;
                            tWindowLoad = window.performance.timing.loadEventEnd - window.performance.timing.connectEnd;

                            if (window.performance.timing.responseEnd === 0 || window.performance.timing.domContentLoadedEventEnd === 0 || window.performance.timing.connectEnd === 0) {
                                tDOMStart = null;
                                tDOMFinish = null;
                                tDOMReady = null;
                                tWindowLoad = null;
                                return;
                            }

                            localStorage.setItem("perfDOMReady", tDOMReady);
                            localStorage.setItem("perfWindowLoad", tWindowLoad);
                            tDOMStart = null;
                            tDOMFinish = null;
                            tDOMReady = null;
                            tWindowLoad = null;
                        }, 2000);
                    }
                }
            }
        } catch (ignore) {}
    });

    return {
        asyncBlockCallbacks: asyncBlockCallbacks,
        synchronousAnalyticsHandler: synchronousAnalyticsHandler,
        triggerSynchronousAnalyticsCall: triggerSynchronousAnalyticsCall
    };
});
