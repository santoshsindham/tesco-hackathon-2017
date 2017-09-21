/**
 * Header, Search module
 */
/*globals define,require,window,ADSIZE */
/*jslint plusplus: true, regexp: true, unparam: true */
define(['domlib', 'modules/breakpoint', 'modules/common'], function ($, breakpoint, common) {
    "use strict";
    var dfp = {
        ppid : '',
        getAdSize: function getAdSize(width, adType) {
            var gptClass = "",
                size;
            if (adType === "mpu") {
                if (width < 600) {
                    size = [ADSIZE.MPU_S[0], ADSIZE.MPU_S[1]];
                    gptClass = 'gpt-ad-direct-S';
                } else if (width > 599 && width < 960) {
                    size = [ADSIZE.MPU_M[0], ADSIZE.MPU_M[1]];
                    gptClass = 'gpt-ad-direct-M';
                } else if (width > 959 && width < 1200) {
                    size = [ADSIZE.MPU_L[0], ADSIZE.MPU_L[1]];
                    gptClass = 'gpt-ad-direct-L';
                } else if (width > 1199) {
                    size = [ADSIZE.MPU_LL[0], ADSIZE.MPU_LL[1]];
                    gptClass = 'gpt-ad-direct-LL';
                }
            } else if (adType === "skyscraper") {
                if (width < 600) {
                    size = [ADSIZE.SkyScrapper_S[0], ADSIZE.SkyScrapper_S[1]];
                    gptClass = 'gpt-ad-direct-S';
                } else if (width > 599 && width < 960) {
                    size = [ADSIZE.SkyScrapper_M[0], ADSIZE.SkyScrapper_M[1]];
                    gptClass = 'gpt-ad-direct-M';
                } else if (width > 959 && width < 1200) {
                    size = [ADSIZE.SkyScrapper_L[0], ADSIZE.SkyScrapper_L[1]];
                    gptClass = 'gpt-ad-direct-L';
                } else if (width > 1199) {
                    size = [ADSIZE.SkyScrapper_LL[0], ADSIZE.SkyScrapper_LL[1]];
                    gptClass = 'gpt-ad-direct-LL';
                }
            }
            return {
                'size': size,
                'classname': gptClass
            };
        },

        asyncBlockCallbacks : function asyncBlockCallbacks() {
            var oCallbacks = {};
            oCallbacks.success = function (oResp) {

                if (typeof oResp === "string") {
                    oResp = $.parseJSON(oResp);
                }
                if (oResp.dfpGoogleAdsUUID && dfp.ppid === '') {
                    dfp.ppid = oResp.dfpGoogleAdsUUID;
                }
            };
            return oCallbacks;
        },

        init: function init() {
            var adObj = {},
                adType = "",
                dfbAdunit = {},
                target = {},
                dfpSlots = $(".google-ads-block").find(".adslot").filter(":visible"),
                gptClass = "",
                i = 0,
                pos = '',
                size = [],
                width = window.getScreenWidth(),
                googletag;

            if (!window.dfpData) {
                return;
            }

            if (dfp.ppid === '' && $('#wrapper.order-confirmation').length) {
                dfp.ppid = $('#unique-cust-id').val();
            }
            dfbAdunit = window.dfpData.adunit;
            target = window.dfpData.target;

            if (dfpSlots.length && !window.isKiosk()) {
                //the google ad request
                googletag = window.googletag || {cmd: [] };
                googletag.cmd.push(function () {
                    $(dfpSlots).each(function () {
                        adType = $(this).attr('data-adtype');
                        adObj = dfp.getAdSize(width, adType);
                        size = adObj.size;
                        gptClass = adObj.classname;
                        // Choose MPU ad type, such that same ads are not displayed in these slots
                        pos = 'mpu' + (i + 1);
                        googletag.defineSlot(dfbAdunit, size, $(this).attr('id')).addService(googletag.pubads()).setTargeting('pos', pos);
                        $.each(target, function (index, value) {
                            googletag.pubads().setTargeting(index, value);
                        });

                        googletag.pubads().setTargeting('tppid', dfp.ppid);
                        googletag.pubads().setPublisherProvidedId(dfp.ppid);

                        $(this).parent(".google-ads-block").addClass(gptClass);
                        i++;
                    });

                    //this is the asynchronous setting - ad request doesn't stop page from loading
                    googletag.pubads().enableSingleRequest();
                    googletag.enableServices();

                    $(dfpSlots).each(function () {
                        googletag.display($(this).attr('id'));
                    });

                });
            }
        }
    };

    $(window).load(function () {
        var secondBanner;
        if (window.dfpData === undefined) {
            return;
        }
        if (window.AsyncBlockController.isCachedPage() && !window.AsyncBlockController.hasCompleted()) {
            $(window).on('AsyncBlockControllerComplete', function () {
                dfp.init();
            });
        } else {
            dfp.init();
        }
        if ($('#order-confirmation-ad').length) {
            secondBanner = $("#order-confirmation-ad .adslot:not(:first)").detach();
            $('#order-confirmation-ad .google-ads-block:not(:first)').hide();
            secondBanner.appendTo($('#order-confirmation-ad .google-ads-block').first());
        }
    });

    return dfp;
});
